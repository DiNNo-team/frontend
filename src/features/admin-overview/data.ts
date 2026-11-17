import { formatHour, WEEKDAY_NAMES } from '@/features/summary/format'
import { daysInMonth, weekdayOf } from '../admin/month'
import type { AdminBillingItem, AdminBillingPage, AdminOverview, BillingStatus, MonthStatus, PlatformMetrics } from '../admin/panel-types'

// Pure transformations of the administrator's summary: they turn the API's answers into what each block draws.

export interface MonthView {
  month: string
  status: MonthStatus
  revenueCop: number
  checkIns: number
  previousMonth: string
  /** `null` when the month before is not in the answer, `0` when it had no income: either way no percentage is shown. */
  previousRevenueCop: number | null
}

/**
 * The figures of the chosen month out of the overview of the current one (its `monthly` carries twelve months), so that
 * changing the month asks for nothing. An overview asked for that very month is read as it is.
 */
export function monthView(overview: AdminOverview, month: string, current: string): MonthView {
  if (overview.month === month) {
    return {
      month,
      status: overview.monthStatus,
      revenueCop: overview.revenueCop,
      checkIns: overview.checkIns,
      previousMonth: overview.previousMonth,
      previousRevenueCop: overview.previousRevenueCop,
    }
  }
  const index = overview.monthly.findIndex((entry) => entry.month === month)
  const entry = overview.monthly[index]
  return {
    month,
    status: month === current ? 'in_progress' : 'closed',
    revenueCop: entry?.revenueCop ?? 0,
    checkIns: entry?.checkIns ?? 0,
    previousMonth: overview.monthly[index - 1]?.month ?? '',
    previousRevenueCop: overview.monthly[index - 1]?.revenueCop ?? null,
  }
}

export interface WeekdayStat {
  dayOfWeek: number
  name: string
  total: number
  /** Total ÷ how many times that weekday appears in the period. */
  average: number
}

/** The weekdays from the busiest to the quietest (a tie keeps Monday-first order), with their average per day. */
export function weekdayStats(metrics: Pick<PlatformMetrics, 'byDayOfWeek' | 'byDate'>): WeekdayStat[] {
  const times = new Map<number, number>()
  for (const { date } of metrics.byDate) times.set(weekdayOf(date), (times.get(weekdayOf(date)) ?? 0) + 1)
  return metrics.byDayOfWeek
    .map(({ dayOfWeek, reservations }) => ({
      dayOfWeek,
      name: WEEKDAY_NAMES[dayOfWeek - 1],
      total: reservations,
      average: times.get(dayOfWeek) ? reservations / (times.get(dayOfWeek) as number) : 0,
    }))
    .sort((a, b) => b.total - a.total || a.dayOfWeek - b.dayOfWeek)
}

export type DayKind = 'best' | 'above' | 'below' | 'future'

export interface DayBar {
  date: string
  day: number
  reservations: number
  kind: DayKind
}

export interface DailySeries {
  bars: DayBar[]
  /** Reservations per day over the days that already happened. */
  average: number
  best: DayBar | null
}

/**
 * One bar per day of the month: the best day (only one), the days above the average, the ones below it, and the days that
 * have not come yet in the month in progress (empty, dotted). With no reservations at all there is no best day.
 */
export function dailySeries(byDate: PlatformMetrics['byDate'], month: string): DailySeries {
  const known = new Map(byDate.map((entry) => [entry.date, entry.reservations]))
  const lastKnown = byDate.length > 0 ? byDate[byDate.length - 1].date : `${month}-00`
  const total = byDate.reduce((sum, entry) => sum + entry.reservations, 0)
  const average = byDate.length > 0 ? total / byDate.length : 0
  const max = byDate.reduce((top, entry) => Math.max(top, entry.reservations), 0)
  const bestDate = max > 0 ? byDate.find((entry) => entry.reservations === max)?.date : undefined
  const bars: DayBar[] = Array.from({ length: daysInMonth(month) }, (_, position) => {
    const day = position + 1
    const date = `${month}-${String(day).padStart(2, '0')}`
    if (date > lastKnown || !known.has(date)) return { date, day, reservations: 0, kind: 'future' as const }
    const reservations = known.get(date) as number
    if (date === bestDate) return { date, day, reservations, kind: 'best' as const }
    return { date, day, reservations, kind: reservations > average ? ('above' as const) : ('below' as const) }
  })
  return { bars, average, best: bars.find((bar) => bar.kind === 'best') ?? null }
}

// The grid itself is shared with the restaurant's summary (features/summary/heat.ts).
export { HEAT_HOURS, HEAT_LEVELS, heatGrid, heatIndex, type HeatCell } from '../summary/heat'

/** One phrase for the pulse: lunch and dinner when the busiest hours are those, otherwise the busiest hour. */
export function pulseSummary(peakHours: PlatformMetrics['peakHours']): string | null {
  const busiest = [...peakHours].filter((entry) => entry.reservations > 0).sort((a, b) => b.reservations - a.reservations || a.hour - b.hour)
  if (busiest.length === 0) return null
  const top = busiest.slice(0, 4).map((entry) => entry.hour)
  const lunch = top.some((hour) => hour >= 11 && hour <= 14)
  const dinner = top.some((hour) => hour >= 18 && hour <= 21)
  return lunch && dinner ? 'Almuerzo y cena, como se espera' : `Más movimiento hacia las ${formatHour(busiest[0].hour)}`
}

export interface RestaurantRow {
  restaurantId: string
  name: string
  checkIns: number
  amountCop: number
  status: BillingStatus
  suspended: boolean
}

export interface TopRestaurants {
  rows: RestaurantRow[]
  /** What is left after the top: «Otros N restaurantes». `null` when everything fits. */
  others: { count: number; checkIns: number; amountCop: number; status: BillingStatus } | null
}

function rowOf(item: AdminBillingItem): RestaurantRow {
  return {
    restaurantId: item.restaurantId,
    name: item.name,
    checkIns: item.checkIns,
    amountCop: item.amountCop,
    status: item.status,
    suspended: item.approvalStatus === 'suspended',
  }
}

/** The five restaurants with most income in the month, and the rest summed into one line. */
export function topRestaurants(billing: Pick<AdminBillingPage, 'items' | 'total'>, limit = 5): TopRestaurants {
  const rows = billing.items.slice(0, limit).map(rowOf)
  const rest = billing.items.slice(limit)
  const count = Math.max(billing.total - limit, rest.length)
  if (count <= 0) return { rows, others: null }
  const status: BillingStatus = rest.some((item) => item.status === 'pending')
    ? 'pending'
    : rest.some((item) => item.status === 'in_progress')
      ? 'in_progress'
      : 'paid'
  return {
    rows,
    others: { count, checkIns: rest.reduce((sum, item) => sum + item.checkIns, 0), amountCop: rest.reduce((sum, item) => sum + item.amountCop, 0), status },
  }
}

/** The check-ins of one restaurant in each month, for its sparkline (a month still loading or without the restaurant counts 0). */
export function sparklineValues(restaurantId: string, months: string[], billingByMonth: Map<string, AdminBillingPage | undefined>): number[] {
  return months.map((month) => billingByMonth.get(month)?.items.find((item) => item.restaurantId === restaurantId)?.checkIns ?? 0)
}

/** Restaurants that still owe a closed month: how many are different, for «Pendiente de meses cerrados». */
export function restaurantsWithPending(billingByMonth: Map<string, AdminBillingPage | undefined>): number {
  const ids = new Set<string>()
  for (const page of billingByMonth.values()) {
    for (const item of page?.items ?? []) if (item.status === 'pending' && item.amountCop > 0) ids.add(item.restaurantId)
  }
  return ids.size
}
