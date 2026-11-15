import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { summaryApi } from './api'
import type { PeriodRange } from './types'

export const summaryQueryKey = (period: PeriodRange) => ['summary', period.from, period.to] as const
export const billingQueryKey = (period: PeriodRange, page: number, pageSize: number) => ['billing', period.from, period.to, page, pageSize] as const

/** Revalidated when the tab comes back (the global default), so a check-in made meanwhile shows up. */
export function useSummaryQuery(period: PeriodRange | null) {
  return useQuery({
    queryKey: summaryQueryKey(period ?? { from: '', to: '' }),
    queryFn: () => summaryApi.getSummary(period as PeriodRange),
    enabled: period !== null,
    placeholderData: keepPreviousData,
  })
}

export function useBillingQuery(period: PeriodRange | null, page: number, pageSize: number) {
  return useQuery({
    queryKey: billingQueryKey(period ?? { from: '', to: '' }, page, pageSize),
    queryFn: () => summaryApi.getBilling(period as PeriodRange, page, pageSize),
    enabled: period !== null,
    placeholderData: keepPreviousData,
  })
}
