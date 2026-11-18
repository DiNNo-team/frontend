import { apiRequest } from '@/lib/api-client'
import type { RestaurantInsights } from './types'

/** Smart report of the restaurant in session (contract in types.ts). The restaurant comes from the session. */
export interface InsightsApi {
  /**
   * `refresh: true` skips the backend cache and generates the report again («Actualizar»). Every call, with or without
   * refresh, counts for the limit of 10 per minute (429 without `errorCode`, never retried on its own).
   */
  getInsights: (options: { refresh: boolean }) => Promise<RestaurantInsights>
}

const httpInsightsApi: InsightsApi = {
  getInsights: ({ refresh }) => apiRequest<RestaurantInsights>(`/restaurants/me/insights${refresh ? '?refresh=true' : ''}`),
}

// Loaded on demand so production builds never ship the sample data.
const loadMock = () => import('./api.mock').then((module) => module.mockInsightsApi)

export const insightsApi: InsightsApi =
  import.meta.env.VITE_USE_MOCKS === 'true'
    ? { getInsights: async (options) => (await loadMock()).getInsights(options) }
    : httpInsightsApi
