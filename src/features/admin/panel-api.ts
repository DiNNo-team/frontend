import { apiRequest } from '@/lib/api-client'
import type { AdminActivityPage, AdminBillingDetail, AdminBillingPage, AdminOverview, PlatformMetrics } from './panel-types'

/** The administrator's reads and the billing marks (docs/admin-panel-contract.md §2 to §5). */
export interface PanelApi {
  overview: (month: string) => Promise<AdminOverview>
  metrics: (period: { from: string; to: string }) => Promise<PlatformMetrics>
  billing: (month: string, page: number, pageSize: number) => Promise<AdminBillingPage>
  billingDetail: (restaurantId: string, month: string, page: number, pageSize: number) => Promise<AdminBillingDetail>
  /** 409 PERIOD_NOT_CLOSED · NOTHING_TO_BILL · PERIOD_ALREADY_PAID. */
  markPaid: (restaurantId: string, month: string) => Promise<AdminBillingDetail>
  /** 409 PERIOD_NOT_PAID. */
  markPending: (restaurantId: string, month: string) => Promise<AdminBillingDetail>
  activity: (month: string, page: number, pageSize: number) => Promise<AdminActivityPage>
}

const query = (values: Record<string, string | number>) => new URLSearchParams(Object.entries(values).map(([key, value]) => [key, String(value)]))

const httpPanelApi: PanelApi = {
  overview: (month) => apiRequest<AdminOverview>(`/admin/overview?${query({ month })}`),
  metrics: ({ from, to }) => apiRequest<PlatformMetrics>(`/admin/platform/metrics?${query({ from, to })}`),
  billing: (month, page, pageSize) => apiRequest<AdminBillingPage>(`/admin/billing?${query({ month, page, pageSize })}`),
  billingDetail: (restaurantId, month, page, pageSize) =>
    apiRequest<AdminBillingDetail>(`/admin/billing/${encodeURIComponent(restaurantId)}?${query({ month, page, pageSize })}`),
  markPaid: (restaurantId, month) =>
    apiRequest<AdminBillingDetail>(`/admin/billing/${encodeURIComponent(restaurantId)}/${encodeURIComponent(month)}/mark-paid`, { method: 'POST' }),
  markPending: (restaurantId, month) =>
    apiRequest<AdminBillingDetail>(`/admin/billing/${encodeURIComponent(restaurantId)}/${encodeURIComponent(month)}/mark-pending`, { method: 'POST' }),
  activity: (month, page, pageSize) => apiRequest<AdminActivityPage>(`/admin/activity?${query({ month, page, pageSize })}`),
}

// Loaded on demand so production builds never ship the sample data.
const loadMock = () => import('./panel-api.mock').then((module) => module.mockPanelApi)

export const panelApi: PanelApi =
  import.meta.env.VITE_USE_MOCKS === 'true'
    ? {
        overview: async (month) => (await loadMock()).overview(month),
        metrics: async (period) => (await loadMock()).metrics(period),
        billing: async (month, page, pageSize) => (await loadMock()).billing(month, page, pageSize),
        billingDetail: async (id, month, page, pageSize) => (await loadMock()).billingDetail(id, month, page, pageSize),
        markPaid: async (id, month) => (await loadMock()).markPaid(id, month),
        markPending: async (id, month) => (await loadMock()).markPending(id, month),
        activity: async (month, page, pageSize) => (await loadMock()).activity(month, page, pageSize),
      }
    : httpPanelApi
