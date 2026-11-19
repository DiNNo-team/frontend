// Contract: GET /v1/restaurants/me/summary and /billing/check-ins (CLAUDE.md §12.12 and docs/restaurant-summary-contract.md),
// for an approved restaurant (a suspended one reads them too).
// Days are Bogotá days (`YYYY-MM-DD`), the range is inclusive. They never carry diner data.

export interface ReportPeriod {
  from: string
  to: string
  timezone: 'America/Bogota'
}

/** `null` rates: the denominator is 0 (the screen says «Sin datos», never 0 or NaN). */
export interface SummaryRates {
  /** completed / created. */
  conversion: number | null
  /** expired / (completed + expired). */
  noShow: number | null
  /** cancelled / created. */
  cancellation: number | null
}

/** Billing state of a month (the same states the administrator sees as «Cobrado»; here it reads «Pagado»). */
export type PaymentStatus = 'in_progress' | 'pending' | 'paid'

export interface PaymentMonth {
  /** `YYYY-MM`, Bogotá. */
  month: string
  status: PaymentStatus
  checkIns: number
  /** Of the whole month (up to today if it is in progress); the stored value when paid. */
  amountCop: number
}

/** The same stretch of the previous period (1–17 Nov against 1–17 Oct). */
export interface PreviousComparable {
  period: ReportPeriod
  reservationsCreated: number
  checkIns: number
  guests: number
  amountCop: number
}

/** One day of the period (zeros included). Reservations count on the day they were created, check-ins on their own day. */
export interface SummaryDay {
  /** `YYYY-MM-DD`, Bogotá. */
  date: string
  reservationsCreated: number
  checkIns: number
  guests: number
  cancelled: number
  expired: number
}

export interface SummaryMonth {
  month: string
  guests: number
  checkIns: number
  /** `true` for the month in progress. */
  inProgress: boolean
}

export interface RestaurantSummary {
  period: ReportPeriod
  /** Check-ins made in the period; `amountCop` is the sum of what each one kept. `currentFeePerGuestCop` is today's fee per guest (informative; each check-in kept its own total). `guests`: people of those check-ins. */
  billing: { checkIns: number; amountCop: number; currentFeePerGuestCop: number; guests: number }
  previousComparable: PreviousComparable
  /** One entry per day of the period, oldest first, zeros included. */
  byDate: SummaryDay[]
  /** Always 168 cells: index = (dayOfWeek - 1) × 24 + hour. */
  byDayHour: { dayOfWeek: number; hour: number; reservations: number }[]
  /** The 6 months that end at the month of `period.to`, oldest first. */
  monthly: SummaryMonth[]
  /** `period`: the month of `to`, only when the range fits in one month; `previousMonth`: the one before it (`null` before 2026-01). */
  payment: { period: PaymentMonth | null; previousMonth: PaymentMonth | null }
  /** Reservations CREATED in the period, by their current state. */
  reservations: { created: number; completed: number; cancelled: number; expired: number; active: number }
  rates: SummaryRates
  /** 2 decimals; `null` with no reservations. */
  averagePartySize: number | null
  /** The 3 hours (0 to 23, Bogotá) with most reservations created, highest first. Empty with none. */
  peakHours: { hour: number; reservations: number }[]
  /** Always 7 entries, 1 = Monday … 7 = Sunday. */
  byDayOfWeek: { dayOfWeek: number; reservations: number }[]
  serverTime: string
}

export interface BillingItem {
  checkInId: string
  reservationId: string
  /** ISO 8601 UTC. */
  checkedInAt: string
  partySize: number
  tableIdentifier: string
  /** The total charged for this check-in (people × the per-guest fee of the day; older ones kept a flat amount). */
  feeCop: number
}

export interface BillingStatement {
  period: ReportPeriod
  /** Of the whole period, not of the page. */
  totalCheckIns: number
  amountCop: number
  items: BillingItem[]
  page: number
  pageSize: number
  serverTime: string
}

export interface PeriodRange {
  from: string
  to: string
}

export const BILLING_PAGE_SIZE = 50
