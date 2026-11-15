import { useMutation, useQueryClient } from '@tanstack/react-query'
import { meQueryKey } from '@/features/account/hooks'
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
