import { keepPreviousData, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { bogotaMonthOf } from './month'
import { panelApi } from './panel-api'
import type { AdminBillingPage } from './panel-types'

/** Root of the heavy reads of the administrator. Reviewing a request (`['admin', …]`) does not touch them. */
export const adminPanelQueryKey = ['admin-panel'] as const
export const overviewQueryKey = (month: string) => [...adminPanelQueryKey, 'overview', month] as const
export const metricsQueryKey = (from: string, to: string) => [...adminPanelQueryKey, 'metrics', from, to] as const
export const billingQueryKey = (month: string, page: number, pageSize: number) => [...adminPanelQueryKey, 'billing', month, page, pageSize] as const
export const billingDetailQueryKey = (id: string, month: string, page: number, pageSize: number) =>
  [...adminPanelQueryKey, 'billing-detail', id, month, page, pageSize] as const
export const activityQueryKey = (month: string, page: number, pageSize: number) => [...adminPanelQueryKey, 'activity', month, page, pageSize] as const

/**
 * Five reads share 30 requests a minute per account (§12.14): they are kept fresh for five minutes, not asked again when the
 * tab returns, and never retried on their own (a 429 or a slow start of the server must not multiply the requests).
 */
const HEAVY_READ = { staleTime: 5 * 60_000, refetchOnWindowFocus: false, retry: false } as const

/** How many restaurants one billing page holds when the screen needs the whole month (the summary's top and sparklines). */
export const WHOLE_MONTH_PAGE_SIZE = 100

/** The overview is asked once, for the current month: its `monthly` has twelve months, enough to show any recent one. */
export function useAdminOverviewQuery(month: string) {
  const current = bogotaMonthOf()
  const base = useQuery({ queryKey: overviewQueryKey(current), queryFn: () => panelApi.overview(current), ...HEAVY_READ })
  const covered = month === current || Boolean(base.data?.monthly.some((entry) => entry.month === month))
  // A month older than the twelve the current one carries is the only reason for a second request.
  const own = useQuery({
    queryKey: overviewQueryKey(month),
    queryFn: () => panelApi.overview(month),
    enabled: base.isSuccess && !covered,
    ...HEAVY_READ,
  })
  return covered ? base : own
}

export function useAdminMetricsQuery(period: { from: string; to: string }) {
  return useQuery({
    queryKey: metricsQueryKey(period.from, period.to),
    queryFn: () => panelApi.metrics(period),
    placeholderData: keepPreviousData,
    ...HEAVY_READ,
  })
}

export function useAdminBillingQuery(month: string, page: number, pageSize: number) {
  return useQuery({
    queryKey: billingQueryKey(month, page, pageSize),
    queryFn: () => panelApi.billing(month, page, pageSize),
    placeholderData: keepPreviousData,
    ...HEAVY_READ,
  })
}

/** The billing of several months at once, each cached by itself: changing the chosen month asks for nothing already seen. */
export function useAdminBillingMonthsQueries(months: string[]) {
  const results = useQueries({
    queries: months.map((month) => ({
      queryKey: billingQueryKey(month, 1, WHOLE_MONTH_PAGE_SIZE),
      queryFn: () => panelApi.billing(month, 1, WHOLE_MONTH_PAGE_SIZE),
      ...HEAVY_READ,
    })),
  })
  return {
    /** The pages already loaded, by month (a month still loading or failed is `undefined`). */
    pages: new Map<string, AdminBillingPage | undefined>(months.map((month, index) => [month, results[index].data])),
    /** Each month's own query, for the block that waits for one of them. */
    queries: new Map(months.map((month, index) => [month, results[index]])),
  }
}

export function useAdminBillingDetailQuery(id: string, month: string, page: number, pageSize: number) {
  return useQuery({
    queryKey: billingDetailQueryKey(id, month, page, pageSize),
    queryFn: () => panelApi.billingDetail(id, month, page, pageSize),
    placeholderData: keepPreviousData,
    ...HEAVY_READ,
  })
}

export function useAdminActivityQuery(month: string, page: number, pageSize: number) {
  return useQuery({
    queryKey: activityQueryKey(month, page, pageSize),
    queryFn: () => panelApi.activity(month, page, pageSize),
    placeholderData: keepPreviousData,
    ...HEAVY_READ,
  })
}

/** Marking a month as paid or undoing it: the detail comes back; every list and total that showed it is asked again. */
function useBillingMark(call: (id: string, month: string) => Promise<unknown>) {
  const queryClient = useQueryClient()
  const refresh = (id: string, month: string) => {
    void queryClient.invalidateQueries({ queryKey: [...adminPanelQueryKey, 'billing-detail', id, month] })
    void queryClient.invalidateQueries({ queryKey: [...adminPanelQueryKey, 'billing', month] })
    void queryClient.invalidateQueries({ queryKey: [...adminPanelQueryKey, 'overview'] })
    void queryClient.invalidateQueries({ queryKey: [...adminPanelQueryKey, 'billing'] })
  }
  return useMutation({
    mutationFn: ({ id, month }: { id: string; month: string }) => call(id, month),
    onSuccess: (_detail, { id, month }) => refresh(id, month),
    // A 409 means the month is not what the screen thought: ask the detail again so it shows what it is now.
    onError: (_error, { id, month }) => refresh(id, month),
  })
}

export function useMarkMonthPaid() {
  return useBillingMark((id, month) => panelApi.markPaid(id, month))
}

export function useMarkMonthPending() {
  return useBillingMark((id, month) => panelApi.markPending(id, month))
}

