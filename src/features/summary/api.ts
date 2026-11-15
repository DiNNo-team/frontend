import { apiRequest } from '@/lib/api-client'
import type { BillingStatement, PeriodRange, RestaurantSummary } from './types'

/** Reports of the restaurant in session (contract in types.ts). The restaurant comes from the session. */
export interface SummaryApi {
  /** 400 (no `errorCode`) if the period is longer than 366 days, ends in the future or starts after it ends. */
  getSummary: (period: PeriodRange) => Promise<RestaurantSummary>
  getBilling: (period: PeriodRange, page: number, pageSize: number) => Promise<BillingStatement>
}

const httpSummaryApi: SummaryApi = {
  getSummary: ({ from, to }) => apiRequest<RestaurantSummary>(`/restaurants/me/summary?${new URLSearchParams({ from, to })}`),
  getBilling: ({ from, to }, page, pageSize) =>
    apiRequest<BillingStatement>(
      `/restaurants/me/billing/check-ins?${new URLSearchParams({ from, to, page: String(page), pageSize: String(pageSize) })}`,
    ),
}

// Loaded on demand so production builds never ship the sample data.
const loadMock = () => import('./api.mock').then((module) => module.mockSummaryApi)

export const summaryApi: SummaryApi =
  import.meta.env.VITE_USE_MOCKS === 'true'
    ? {
        getSummary: async (period) => (await loadMock()).getSummary(period),
        getBilling: async (period, page, pageSize) => (await loadMock()).getBilling(period, page, pageSize),
      }
    : httpSummaryApi
