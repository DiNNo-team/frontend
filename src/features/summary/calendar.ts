import { daysInMonth, monthName, shiftMonth } from '../admin/month'
import type { PeriodRange, PreviousComparable, SummaryDay } from './types'

// Pure transformations of the restaurant's summary: they turn the API's answer into what each block draws.

export const CALENDAR_LEVELS = 5

/** `'2026-11'` of each month the period touches, oldest first. */
export function monthsOfPeriod({ from, to }: PeriodRange): string[] {
  const months: string[] = []
  for (let month = from.slice(0, 7); month <= to.slice(0, 7); month = shiftMonth(month, 1)) months.push(month)
  return months
}

/** 0 = Monday … 6 = Sunday, the calendar's column of a day (the week starts on Monday). */
export function weekdayColumn(date: string): number {
  const [year, month, day] = date.split('-').map(Number)
  return (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7
}

/**
 * `data`: a day of the period that already happened; `future`: after today (dotted, not selectable); `outside`: before or after
 * the chosen period but already happened (shown quiet, not selectable).
 */
export type CalendarDayKind = 'data' | 'future' | 'outside'

export interface CalendarDay {
  date: string
  day: number
  kind: CalendarDayKind
  reservations: number
  checkIns: number
  guests: number
  cancelledOrExpired: number
  /** 0 = no reservations; 1 to 5 from the fewest to the most of the period (six tones in all). */
  level: number
}

export interface CalendarMonth {
  month: string
  /** Empty cells before day 1, so that day 1 lands on its weekday (Monday first). */
  leadingBlanks: number
  days: CalendarDay[]
}

/** The most reservations created in one day of the period: the busiest day sets the darkest tone. */
export function busiestDay(byDate: SummaryDay[]): number {
  return byDate.reduce((top, day) => Math.max(top, day.reservationsCreated), 0)
}

export function levelOf(reservations: number, max: number): number {
  if (reservations <= 0 || max <= 0) return 0
  return Math.min(CALENDAR_LEVELS, Math.max(1, Math.ceil((reservations / max) * CALENDAR_LEVELS)))
}

/** One month of the calendar: every day of the month, told apart as data, future or outside the period. */
export function buildMonth(month: string, byDate: SummaryDay[], period: PeriodRange, today: string): CalendarMonth {
  const known = new Map(byDate.map((entry) => [entry.date, entry]))
  const max = busiestDay(byDate)
  const days = Array.from({ length: daysInMonth(month) }, (_, position): CalendarDay => {
    const day = position + 1
    const date = `${month}-${String(day).padStart(2, '0')}`
    const entry = known.get(date)
    const kind: CalendarDayKind = date > today ? 'future' : date < period.from || date > period.to ? 'outside' : 'data'
    return {
      date,
      day,
      kind,
      reservations: entry?.reservationsCreated ?? 0,
      checkIns: entry?.checkIns ?? 0,
      guests: entry?.guests ?? 0,
      cancelledOrExpired: (entry?.cancelled ?? 0) + (entry?.expired ?? 0),
      level: kind === 'data' ? levelOf(entry?.reservationsCreated ?? 0, max) : 0,
    }
  })
  return { month, leadingBlanks: weekdayColumn(`${month}-01`), days }
}

/**
 * The day selected when the screen opens: today if it is in the period, otherwise the last day that has reservations or
 * check-ins, otherwise the last day of the period.
 */
export function defaultDay(byDate: SummaryDay[], today: string): string | null {
  if (byDate.length === 0) return null
  if (byDate.some((entry) => entry.date === today)) return today
  const withData = [...byDate].reverse().find((entry) => entry.reservationsCreated > 0 || entry.checkIns > 0)
  return (withData ?? byDate[byDate.length - 1]).date
}

/** The month shown first: the one of the selected day. */
export function monthOfDay(date: string): string {
  return date.slice(0, 7)
}

/** `+44` for 13 against 9, `-20` for 8 against 10; `null` when there is nothing to compare with (the previous is 0). */
export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

/** What each guest cost: the amount ÷ the guests. `null` with no guests (the screen does not show it). */
export function costPerGuest(amountCop: number, guests: number): number | null {
  return guests > 0 ? Math.round(amountCop / guests) : null
}

/** «octubre (mismo tramo)» when both periods are the same days of two months; otherwise «el periodo anterior». */
export function describeComparable(period: PeriodRange, previous: PreviousComparable['period']): string {
  const sameStretch =
    period.from.endsWith('-01') &&
    previous.from.endsWith('-01') &&
    period.from.slice(0, 7) === period.to.slice(0, 7) &&
    previous.from.slice(0, 7) === previous.to.slice(0, 7)
  return sameStretch ? `${monthName(previous.from.slice(0, 7))} (mismo tramo)` : 'el periodo anterior'
}

/** The last day of a period's month in words for «Cierre del periodo»: «30 nov». */
export function closingDay(month: string): string {
  const short = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic']
  return `${daysInMonth(month)} ${short[Number(month.slice(5, 7)) - 1]}`
}

export interface ReservationShare {
  arrived: number
  notArrived: number
  cancelled: number
  /** What is still waiting for its hour: not part of the bar. */
  active: number
}

/** The three parts of «Estado de las reservas»: arrived, did not arrive (expired) and cancelled. */
export function reservationShare(reservations: { completed: number; expired: number; cancelled: number; active: number }): ReservationShare {
  return { arrived: reservations.completed, notArrived: reservations.expired, cancelled: reservations.cancelled, active: reservations.active }
}

/** The share of `part` over `created`, as a whole percent; `null` with no reservations. */
export function sharePercent(part: number, created: number): number | null {
  return created > 0 ? Math.round((part / created) * 100) : null
}

/** The three busiest hours, busiest first, a tie by the earlier hour. Never more than three, never an hour without reservations. */
export function topHours(peakHours: { hour: number; reservations: number }[]): { hour: number; reservations: number }[] {
  return peakHours
    .filter((entry) => entry.reservations > 0)
    .sort((a, b) => b.reservations - a.reservations || a.hour - b.hour)
    .slice(0, 3)
}

/** Value of the day: the check-ins of the day add up the fee each one kept. */
export function dayValue(items: { feeCop: number }[]): number {
  return items.reduce((sum, item) => sum + item.feeCop, 0)
}
