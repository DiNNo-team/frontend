import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { meQueryKey } from '@/features/account/hooks'
import { restaurantApi } from '@/features/restaurant/api'
import { restaurantQueryKey } from '@/features/restaurant/hooks'
import type { RestaurantProfile } from '@/features/restaurant/types'
import { signupApi } from './api'
import type { SignupRestaurantInput } from './types'

/** Registers the restaurant of the session (POST /restaurants/signup). The 201 is the restaurant in review. */
export function useSignupRestaurant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SignupRestaurantInput) => signupApi.signup(input),
    onSuccess: (created) => {
      queryClient.setQueryData<RestaurantProfile>(restaurantQueryKey, created)
      // Before this call the account had no profile: `/me` now answers its role.
      void queryClient.invalidateQueries({ queryKey: meQueryKey })
    },
  })
}

/** How often the request screen asks its state again (the backup of having no socket for a restaurant in review). */
export const REQUEST_STATUS_REFRESH_MS = 30_000

/**
 * The restaurant of the request screen (same cache as the rest of the app), asked again every 30 s and when the tab
 * comes back, so an approval shows up without reloading.
 */
export function useRequestStatusQuery() {
  return useQuery({ queryKey: restaurantQueryKey, queryFn: () => restaurantApi.get(), refetchInterval: REQUEST_STATUS_REFRESH_MS })
}
