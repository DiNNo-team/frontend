// Contract: GET /v1/restaurants/me/summary and /billing/check-ins (CLAUDE.md §12.12), only for an approved restaurant.
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

export interface RestaurantSummary {
  period: ReportPeriod
  /** Check-ins made in the period; `currentFeeCop` is today's fee (each check-in kept its own). */
  billing: { checkIns: number; amountCop: number; currentFeeCop: number }
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
