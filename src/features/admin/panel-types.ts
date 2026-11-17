import type { RestaurantCategory } from '@/features/restaurant/types'

// Contract: GET /v1/admin/overview, /billing, /billing/:restaurantId, /activity and /platform/metrics, and the two POSTs
// that mark a month as paid or undo it (docs/admin-panel-contract.md §2 to §5). Only for `platform_admin`.
// Money is COP in whole pesos. Dates are ISO 8601 UTC; months are `AAAA-MM` and days `AAAA-MM-DD`, both in Bogotá time.

export type MonthStatus = 'in_progress' | 'closed'
export type BillingStatus = 'in_progress' | 'pending' | 'paid'

export interface Period {
  from: string
  to: string
  timezone: 'America/Bogota'
}

export interface MonthlyRevenue {
  month: string
  revenueCop: number
  checkIns: number
}

export interface AdminOverview {
  month: string
  monthStatus: MonthStatus
  revenueCop: number
  checkIns: number
  previousMonth: string
  /** 0 → no percentage is shown. */
  previousRevenueCop: number
  /** 12 months, oldest first, ending at `month`, the empty ones too. */
  monthly: MonthlyRevenue[]
  /** All closed months since 2026-01, whatever `month` is. */
  collectedCop: number
  pendingCop: number
  restaurants: { pending: number; approved: number; suspended: number; rejected: number }
  currentFeeCop: number
  serverTime: string
}

export interface PlatformMetrics {
  period: Period
  basis: 'reservations_created_at'
  reservations: { created: number; completed: number; cancelled: number; expired: number; active: number }
  /** `null` when the denominator is 0. */
  rates: { conversion: number | null; noShow: number | null; cancellation: number | null }
  averagePartySize: number | null
  /** Always 24 entries. */
  peakHours: { hour: number; reservations: number }[]
  /** Always 7 (1 = Monday … 7 = Sunday). */
  byDayOfWeek: { dayOfWeek: number; reservations: number }[]
  /** One entry for each day of the period, the empty ones too. */
  byDate: { date: string; reservations: number }[]
  /** Always 168: index = (dayOfWeek − 1) × 24 + hour. */
  byDayHour: { dayOfWeek: number; hour: number; reservations: number }[]
  serverTime: string
}

export interface AdminBillingItem {
  restaurantId: string
  name: string
  approvalStatus: 'approved' | 'suspended'
  checkIns: number
  amountCop: number
  status: BillingStatus
  paidAt: string | null
}

export interface AdminBillingPage {
  month: string
  monthStatus: MonthStatus
  period: Period
  totals: { checkIns: number; amountCop: number; paidCop: number; pendingCop: number }
  items: AdminBillingItem[]
  total: number
  page: number
  pageSize: number
  serverTime: string
}

export interface AdminBillingCheckIn {
  checkInId: string
  checkedInAt: string
  partySize: number
  feeCop: number
}

/** Never carries data of the diner, the table or the reservation. */
export interface AdminBillingDetail {
  restaurant: { id: string; name: string; approvalStatus: string }
  month: string
  period: Period
  status: BillingStatus
  totalCheckIns: number
  /** Always recalculated. */
  amountCop: number
  paidAt: string | null
  /** What was saved when it was marked as paid; `null` when it was not. */
  snapshot: { amountCop: number; checkIns: number } | null
  amountMismatch: boolean
  items: AdminBillingCheckIn[]
  page: number
  pageSize: number
  serverTime: string
}

export interface AdminActivityItem {
  id: string
  name: string
  category: RestaurantCategory | null
  approvalStatus: 'approved' | 'suspended'
  /** The Abierto / Cerrado switch, not the schedule. */
  isOpen: boolean
  /** `null` when the team approved it: show `createdAt`. */
  approvedAt: string | null
  createdAt: string
  checkIns: number
  amountCop: number
  /** The last change in the log of its tables, `null` if there never was one. */
  lastTableActivityAt: string | null
}

export interface AdminActivityPage {
  month: string
  period: Period
  items: AdminActivityItem[]
  total: number
  page: number
  pageSize: number
  serverTime: string
}

export const REASON_LIMITS = { min: 10, max: 300 } as const
