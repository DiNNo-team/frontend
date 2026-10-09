import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { restaurantStatusQueryKey } from '@/features/restaurant-status/hooks'
import { tablesQueryKey } from '@/features/tables/hooks'
import { restaurantApi } from './api'
import type { RegisterRestaurantInput, RestaurantProfile } from './types'

export const restaurantQueryKey = ['restaurant'] as const

/**
 * The session's restaurant with its hours (GET /restaurants/me), for /restaurante (Jacobo).
 * Without a restaurant it fails with 403 RESTAURANT_REQUIRED, and the app goes to /onboarding.
 */
export function useRestaurantQuery() {
  return useQuery({ queryKey: restaurantQueryKey, queryFn: () => restaurantApi.get() })
}

/** Registers the session user's restaurant (POST /restaurants). */
export function useRegisterRestaurant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: RegisterRestaurantInput) => restaurantApi.register(input),
    onSuccess: (created) => {
      // The 201 has the same shape as GET /restaurants/me.
      queryClient.setQueryData<RestaurantProfile>(restaurantQueryKey, created)
      // Before the registration, tables and open/closed answered 403 RESTAURANT_REQUIRED: load them again.
      void queryClient.invalidateQueries({ queryKey: tablesQueryKey })
      void queryClient.invalidateQueries({ queryKey: restaurantStatusQueryKey })
    },
  })
}
