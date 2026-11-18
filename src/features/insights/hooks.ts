import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { insightsApi } from './api'

export const insightsQueryKey = ['insights'] as const

/**
 * Every GET counts for the limit of 10 per minute and may cost a call to the model when the backend cache expired, so the
 * report stays fresh 5 minutes and is not asked again when the tab comes back.
 */
export const INSIGHTS_STALE_TIME_MS = 5 * 60_000

export function useInsightsQuery() {
  return useQuery({
    queryKey: insightsQueryKey,
    queryFn: () => insightsApi.getInsights({ refresh: false }),
    staleTime: INSIGHTS_STALE_TIME_MS,
    refetchOnWindowFocus: false,
  })
}

/**
 * «Actualizar»: generates the report again (`refresh=true`) and puts it in the cache. Until it answers (up to ~20 s if the
 * model is slow) the screen keeps showing the report it had; if it fails (429, network), that report stays as it was.
 */
export function useRefreshInsights() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => insightsApi.getInsights({ refresh: true }),
    onSuccess: (report) => queryClient.setQueryData(insightsQueryKey, report),
  })
}
