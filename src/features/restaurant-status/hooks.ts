import { useIsMutating, useMutation, useMutationState, useQuery, useQueryClient, type MutationState } from '@tanstack/react-query'
import { restaurantStatusApi } from './api'
import type { RestaurantStatus } from './types'

export const restaurantStatusQueryKey = ['restaurant-status'] as const
export const restaurantStatusMutationKey = ['restaurant-status', 'update'] as const

export interface StatusChangeVariables {
  isOpen: boolean
  /**
   * Where the change started. A change confirmed in the dialog shows its error inside the dialog;
   * the others (switch, "Abrir ahora", "Deshacer") show it in the banner above the content.
   */
  source: 'inline' | 'dialog'
}

/** Open/closed status of the session's restaurant. Shared by the topbar switch and the banner. */
export function useRestaurantStatusQuery() {
  return useQuery({ queryKey: restaurantStatusQueryKey, queryFn: () => restaurantStatusApi.get() })
}

/**
 * Persists open/closed. Optimistic: the switch and the banner change at once, and go back to the
 * previous value if the backend fails. The UI blocks new changes while one is saving.
 */
export function useUpdateRestaurantStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: restaurantStatusMutationKey,
    mutationFn: ({ isOpen }: StatusChangeVariables) => restaurantStatusApi.update(isOpen),
    onMutate: async ({ isOpen }) => {
      await queryClient.cancelQueries({ queryKey: restaurantStatusQueryKey })
      const previous = queryClient.getQueryData<RestaurantStatus>(restaurantStatusQueryKey)
      queryClient.setQueryData<RestaurantStatus>(restaurantStatusQueryKey, { isOpen })
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(restaurantStatusQueryKey, context.previous)
      void queryClient.invalidateQueries({ queryKey: restaurantStatusQueryKey })
    },
    onSuccess: (saved) => queryClient.setQueryData(restaurantStatusQueryKey, saved),
  })
}

/** `true` while any open/closed change is saving, wherever it started (switch, banner or toast). */
export function useIsSavingRestaurantStatus(): boolean {
  return useIsMutating({ mutationKey: restaurantStatusMutationKey }) > 0
}

type StatusChangeState = MutationState<RestaurantStatus, Error, StatusChangeVariables>

/**
 * State of the newest open/closed change, read from the mutation cache. Lets the banner show the
 * error of a change started in the topbar without a context of its own.
 */
export function useLatestRestaurantStatusChange(): StatusChangeState | undefined {
  const states = useMutationState({
    filters: { mutationKey: restaurantStatusMutationKey },
    select: (mutation) => mutation.state as StatusChangeState,
  })
  return states.at(-1)
}
