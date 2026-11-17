import { apiRequest } from '@/lib/api-client'
import type { AdminListParams, AdminRestaurantDetail, AdminRestaurantPage } from './types'

/** Review of restaurants by the DiNNo administrator. */
export interface AdminApi {
  /** Pending first-come order, approved and rejected by last review; the backend sorts. */
  list: (params: AdminListParams) => Promise<AdminRestaurantPage>
  /** 404 RESTAURANT_NOT_FOUND. */
  get: (id: string) => Promise<AdminRestaurantDetail>
  /** Only from `pending`: 409 RESTAURANT_NOT_PENDING if somebody else already reviewed it. */
  approve: (id: string) => Promise<AdminRestaurantDetail>
  /** `reason`: 10 to 300 characters once trimmed. */
  reject: (id: string, reason: string) => Promise<AdminRestaurantDetail>
  /** Only from `approved`: 409 RESTAURANT_NOT_APPROVED. `reason`: 10 to 300 characters once trimmed; the restaurant sees it. */
  suspend: (id: string, reason: string) => Promise<AdminRestaurantDetail>
  /** Only from `suspended`: 409 RESTAURANT_NOT_SUSPENDED. */
  reactivate: (id: string) => Promise<AdminRestaurantDetail>
}

const httpAdminApi: AdminApi = {
  list: ({ status, page, pageSize }) =>
    apiRequest<AdminRestaurantPage>(`/admin/restaurants?${new URLSearchParams({ status, page: String(page), pageSize: String(pageSize) })}`),
  get: (id) => apiRequest<AdminRestaurantDetail>(`/admin/restaurants/${encodeURIComponent(id)}`),
  approve: (id) => apiRequest<AdminRestaurantDetail>(`/admin/restaurants/${encodeURIComponent(id)}/approve`, { method: 'POST' }),
  reject: (id, reason) =>
    apiRequest<AdminRestaurantDetail>(`/admin/restaurants/${encodeURIComponent(id)}/reject`, { method: 'POST', body: { reason: reason.trim() } }),
  suspend: (id, reason) =>
    apiRequest<AdminRestaurantDetail>(`/admin/restaurants/${encodeURIComponent(id)}/suspend`, { method: 'POST', body: { reason: reason.trim() } }),
  reactivate: (id) => apiRequest<AdminRestaurantDetail>(`/admin/restaurants/${encodeURIComponent(id)}/reactivate`, { method: 'POST' }),
}

// Loaded on demand so production builds never ship the sample data.
const loadMock = () => import('./api.mock').then((module) => module.mockAdminApi)

export const adminApi: AdminApi =
  import.meta.env.VITE_USE_MOCKS === 'true'
    ? {
        list: async (params) => (await loadMock()).list(params),
        get: async (id) => (await loadMock()).get(id),
        approve: async (id) => (await loadMock()).approve(id),
        reject: async (id, reason) => (await loadMock()).reject(id, reason),
        suspend: async (id, reason) => (await loadMock()).suspend(id, reason),
        reactivate: async (id) => (await loadMock()).reactivate(id),
      }
    : httpAdminApi
