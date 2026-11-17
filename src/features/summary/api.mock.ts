import { mockFailIfAsked, mockParams, mockWait } from '@/lib/mock-env'
import type { SummaryApi } from './api'
import { bogotaToday } from './period'
import type { BillingItem, BillingStatement, PaymentMonth, PaymentStatus, PeriodRange, RestaurantSummary, SummaryDay } from './types'

// Stand-in for the reports with VITE_USE_MOCKS=true. The numbers follow the design (docs/design/restaurant-summary): the same
// days, check-ins and tables, repeated month after month, so any period shows something and the summary, the calendar and the
// list of check-ins agree with each other. Controls by URL, as in dev:
//   ?mockEmpty              a period without anything
//   ?mockPrevious=zero      the stretch before has nothing to compare with
//   ?mockPayment=pending|paid|in_progress   state of the previous month (and of the period's month when it is closed)
//   ?mockError=summary-load or billing-load · ?mockLatency=3000 (shared)

async function simulate(operation: 'summary-load' | 'billing-load') {
  await mockWait(500)
  mockFailIfAsked(operation)
}

const FEE = 2000
const DAY_MS = 86_400_000
const RESERVATIONS_BY_DAY = [0, 1, 0, 2, 0, 1, 3, 4, 0, 3, 2, 0, 0, 0, 1, 1, 0]
/** The check-ins of the design, by day of the month: time, table and people. Other days repeat a generic one. */
const CHECK_INS_BY_DAY: Record<number, [string, string, number][]> = {
  8: [['11:56', '04', 2], ['15:47', '04', 2]],
  10: [['22:42', '01', 2], ['22:54', '01', 2]],
  11: [['19:46', '01', 2]],
  16: [['21:09', '03', 3]],
  22: [['13:10', '02', 2]],
  25: [['12:30', '04', 4], ['20:15', '01', 2]],
  28: [['19:05', '03', 3]],
}
const MONTHLY_GUESTS = [0, 2, 5, 7, 11]
const PEAK_HOURS = [
  { hour: 19, reservations: 6 },
  { hour: 22, reservations: 3 },
  { hour: 15, reservations: 2 },
]
const BY_DAY_OF_WEEK = [6, 3, 2, 0, 0, 0, 7]
const HEAT_CELLS: [number, number, number][] = [
  [1, 19, 3], [1, 22, 2], [1, 15, 1], [2, 19, 2], [2, 13, 1], [3, 22, 1], [3, 15, 1], [7, 19, 1], [7, 12, 2], [7, 20, 2], [7, 13, 1], [7, 22, 1],
]

const parse = (day: string) => Date.parse(`${day}T00:00:00Z`)
const format = (ms: number) => new Date(ms).toISOString().slice(0, 10)

function period(range: PeriodRange) {
  return { from: range.from, to: range.to, timezone: 'America/Bogota' as const }
}

function datesOf({ from, to }: PeriodRange): string[] {
  const dates: string[] = []
  for (let ms = parse(from); ms <= parse(to); ms += DAY_MS) dates.push(format(ms))
  return dates
}

/** The check-ins of a day, the most recent first would be for the list; here in the order they happened. */
function checkInsOn(date: string): BillingItem[] {
  return (CHECK_INS_BY_DAY[Number(date.slice(8))] ?? []).map(([time, table, party], index) => ({
    checkInId: `mock-check-in-${date}-${index + 1}`,
    reservationId: `mock-reservation-${date}-${index + 1}`,
    checkedInAt: new Date(`${date}T${time}:00-05:00`).toISOString(),
    partySize: party,
    tableIdentifier: table,
    feeCop: FEE,
  }))
}

function dayOf(date: string, empty: boolean): SummaryDay {
  const created = empty ? 0 : RESERVATIONS_BY_DAY[(Number(date.slice(8)) - 1) % RESERVATIONS_BY_DAY.length]
  const checkIns = empty ? [] : checkInsOn(date)
  const rest = Math.max(0, created - checkIns.length)
  const expired = Number(date.slice(8)) % 7 === 3 ? Math.min(1, rest) : 0
  return {
    date,
    reservationsCreated: created,
    checkIns: checkIns.length,
    guests: checkIns.reduce((sum, item) => sum + item.partySize, 0),
    cancelled: rest - expired,
    expired,
  }
}

/** The same stretch before: the same days of the month before when it starts on day 1, otherwise the days just before. */
function previousStretch({ from, to }: PeriodRange): PeriodRange {
  const start = new Date(parse(from))
  if (from.endsWith('-01') && from.slice(0, 7) === to.slice(0, 7)) {
    const previous = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - 1, 1))
    const last = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 0)).getUTCDate()
    return { from: format(previous.getTime()), to: format(previous.getTime() + (Math.min(Number(to.slice(8)), last) - 1) * DAY_MS) }
  }
  const length = (parse(to) - parse(from)) / DAY_MS + 1
  return { from: format(parse(from) - length * DAY_MS), to: format(parse(from) - DAY_MS) }
}

function shiftMonth(month: string, delta: number): string {
  const total = Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7)) - 1 + delta
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`
}

function paymentStatus(fallback: PaymentStatus): PaymentStatus {
  const asked = mockParams().get('mockPayment')
  return asked === 'pending' || asked === 'paid' || asked === 'in_progress' ? asked : fallback
}

export const mockSummaryApi: SummaryApi = {
  async getSummary(range): Promise<RestaurantSummary> {
    await simulate('summary-load')
    const empty = mockParams().has('mockEmpty')
    const days = datesOf(range).map((date) => dayOf(date, empty))
    const sum = (key: 'reservationsCreated' | 'checkIns' | 'guests' | 'cancelled' | 'expired') => days.reduce((total, day) => total + day[key], 0)
    const created = sum('reservationsCreated')
    const completed = sum('checkIns')
    const expired = sum('expired')
    const cancelled = sum('cancelled')
    const before = previousStretch(range)
    // The stretch before, as in the design (15 reservations, 4 check-ins, 9 guests), or nothing with ?mockPrevious=zero.
    const noPrevious = empty || mockParams().get('mockPrevious') === 'zero'
    const previousCheckIns = noPrevious ? 0 : 4
    const currentMonth = bogotaToday().slice(0, 7)
    const lastMonth = range.to.slice(0, 7)
    const monthStatus = (month: string): PaymentStatus => (month >= currentMonth ? 'in_progress' : paymentStatus('paid'))
    const paymentOf = (month: string, checkIns: number): PaymentMonth => ({ month, status: monthStatus(month), checkIns, amountCop: checkIns * FEE })
    const previousMonth = shiftMonth(lastMonth, -1)
    const previousMonthCheckIns = empty ? 0 : 4
    return {
      period: period(range),
      billing: { checkIns: completed, amountCop: completed * FEE, currentFeeCop: FEE, guests: sum('guests') },
      previousComparable: {
        period: { ...before, timezone: 'America/Bogota' },
        reservationsCreated: noPrevious ? 0 : 15,
        checkIns: previousCheckIns,
        guests: noPrevious ? 0 : 9,
        amountCop: previousCheckIns * FEE,
      },
      reservations: { created, completed, cancelled, expired, active: 0 },
      rates: {
        conversion: created > 0 ? Math.round((completed / created) * 10_000) / 10_000 : null,
        noShow: completed + expired > 0 ? Math.round((expired / (completed + expired)) * 10_000) / 10_000 : null,
        cancellation: created > 0 ? Math.round((cancelled / created) * 10_000) / 10_000 : null,
      },
      averagePartySize: created > 0 ? 2.44 : null,
      peakHours: empty ? [] : PEAK_HOURS,
      byDayOfWeek: BY_DAY_OF_WEEK.map((reservations, index) => ({ dayOfWeek: index + 1, reservations: empty ? 0 : reservations })),
      byDate: days,
      byDayHour: Array.from({ length: 168 }, (_, index) => {
        const dayOfWeek = Math.floor(index / 24) + 1
        const hour = index % 24
        const cell = HEAT_CELLS.find(([day, at]) => day === dayOfWeek && at === hour)
        return { dayOfWeek, hour, reservations: empty ? 0 : (cell?.[2] ?? 0) }
      }),
      monthly: [...MONTHLY_GUESTS, sum('guests')].map((guests, index, all) => ({
        month: shiftMonth(lastMonth, index - all.length + 1),
        guests: empty ? 0 : guests,
        checkIns: empty ? 0 : Math.ceil(guests / 2),
        inProgress: shiftMonth(lastMonth, index - all.length + 1) === currentMonth,
      })),
      payment: {
        period: range.from.slice(0, 7) === lastMonth && lastMonth >= '2026-01' ? paymentOf(lastMonth, completed) : null,
        previousMonth: previousMonth >= '2026-01' ? paymentOf(previousMonth, previousMonthCheckIns) : null,
      },
      serverTime: new Date().toISOString(),
    }
  },
  async getBilling(range, page, pageSize): Promise<BillingStatement> {
    await simulate('billing-load')
    const all = mockParams().has('mockEmpty')
      ? []
      : datesOf(range)
          .flatMap(checkInsOn)
          .sort((a, b) => b.checkedInAt.localeCompare(a.checkedInAt))
    const start = (page - 1) * pageSize
    return {
      period: period(range),
      totalCheckIns: all.length,
      amountCop: all.length * FEE,
      items: all.slice(start, start + pageSize),
      page,
      pageSize,
      serverTime: new Date().toISOString(),
    }
  },
}
