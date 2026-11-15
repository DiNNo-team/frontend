import type { ApprovalStatus, RestaurantCategory, RestaurantSchedule } from '@/features/restaurant/types'

// Contract: GET/POST /v1/admin/restaurants* (CLAUDE.md §12.12), only for `platform_admin`. Dates are ISO 8601 UTC.

export type ReviewStatus = ApprovalStatus

/** A row of the list. `ownerEmail` is only for the administrator. */
export interface AdminRestaurantItem {
  id: string
  name: string
  category: RestaurantCategory | null
  address: string | null
  contactPhone: string | null
  approvalStatus: ReviewStatus
  /** When the request was sent or sent again. */
  submittedAt: string
  /** The last review, or `null` if it was never reviewed. */
  reviewedAt: string | null
  ownerEmail: string | null
}

export interface AdminRestaurantDetail extends AdminRestaurantItem {
  latitude: number | null
  longitude: number | null
  schedules: RestaurantSchedule[]
  /** Only while `rejected`. */
  rejectionReason: string | null
  reviewedByEmail: string | null
  createdAt: string
}

export interface AdminRestaurantPage {
  items: AdminRestaurantItem[]
  total: number
  page: number
  pageSize: number
}

export interface AdminListParams {
  status: ReviewStatus
  page: number
  pageSize: number
}

export const REJECTION_REASON_LIMITS = { min: 10, max: 300 } as const
