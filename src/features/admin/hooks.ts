import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from './api'
import type { AdminListParams, AdminRestaurantDetail } from './types'

export const adminQueryKey = ['admin'] as const
export const adminRestaurantsQueryKey = (params: AdminListParams) => [...adminQueryKey, 'restaurants', params.status, params.page, params.pageSize] as const
export const adminRestaurantQueryKey = (id: string) => [...adminQueryKey, 'restaurant', id] as const
export const adminPendingCountQueryKey = [...adminQueryKey, 'pending-count'] as const

/** A page of the list, keeping the previous one on screen while the next loads. */
export function useAdminRestaurantsQuery(params: AdminListParams) {
  return useQuery({
    queryKey: adminRestaurantsQueryKey(params),
    queryFn: () => adminApi.list(params),
    placeholderData: keepPreviousData,
    // A request that arrives while the panel is open shows up without reloading (backup of the missing socket event).
    refetchInterval: params.status === 'pending' ? 60_000 : false,
  })
}

export function useAdminRestaurantQuery(id: string | null) {
  return useQuery({
    queryKey: adminRestaurantQueryKey(id ?? ''),
    queryFn: () => adminApi.get(id ?? ''),
    enabled: id !== null,
  })
}

/** How many requests wait (the badge of the navigation): the total of a one-row page. */
export function usePendingRestaurantsCount() {
  return useQuery({
    queryKey: adminPendingCountQueryKey,
    queryFn: async () => (await adminApi.list({ status: 'pending', page: 1, pageSize: 1 })).total,
    refetchInterval: 60_000,
  })
}

/** Both decisions: the detail comes back from the server, so lists and the badge are asked again. */
function useReviewMutation(call: (id: string, reason?: string) => Promise<AdminRestaurantDetail>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => call(id, reason),
    onSuccess: (detail) => {
      queryClient.setQueryData(adminRestaurantQueryKey(detail.id), detail)
      void queryClient.invalidateQueries({ queryKey: adminQueryKey })
    },
    // 409 RESTAURANT_NOT_PENDING: somebody else reviewed it; show what it is now.
    onError: () => void queryClient.invalidateQueries({ queryKey: adminQueryKey }),
  })
}

export function useApproveRestaurant() {
  return useReviewMutation((id) => adminApi.approve(id))
}

export function useRejectRestaurant() {
  return useReviewMutation((id, reason) => adminApi.reject(id, reason ?? ''))
}
