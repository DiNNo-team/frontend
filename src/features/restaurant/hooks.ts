import { useMutation, useQueryClient } from '@tanstack/react-query'
import { restaurantStatusQueryKey } from '@/features/restaurant-status/hooks'
import { tablesQueryKey } from '@/features/tables/hooks'
import { restaurantApi } from './api'
import type { RegisterRestaurantInput } from './types'

/** Registers the session user's restaurant (POST /restaurants). */
export function useRegisterRestaurant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: RegisterRestaurantInput) => restaurantApi.register(input),
    onSuccess: () => {
      // Before the registration, tables and open/closed answered 403 RESTAURANT_REQUIRED: load them again.
      void queryClient.invalidateQueries({ queryKey: tablesQueryKey })
      void queryClient.invalidateQueries({ queryKey: restaurantStatusQueryKey })
    },
  })
}
