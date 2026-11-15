import { useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ACCESS_CHANGED_EVENT } from '@/lib/api-client'
import { useAuth } from '@/features/auth/auth-context'
import { restaurantQueryKey, useRestaurantQuery } from '@/features/restaurant/hooks'
import { resolveAccess, type Access } from './access'
import { meQueryKey, useMeQuery } from './hooks'

/**
 * The state of the signed-in account: role (GET /me) and, for a restaurant, its review state (GET /restaurants/me,
 * the query the dashboard already shares). A 403 of any other call that says the state changed (pending, rejected,
 * administrator) makes both be asked again. `retry` asks for them again after a load error.
 */
export function useAccess(): Access & { retry: () => void } {
  const { user, authEvent } = useAuth()
  const queryClient = useQueryClient()
  const ready = Boolean(user) && authEvent !== 'email-not-verified'
  const me = useMeQuery({ enabled: ready })
  const restaurant = useRestaurantQuery({ enabled: ready && me.data?.role === 'restaurant_admin' })

  useEffect(() => {
    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: meQueryKey })
      void queryClient.invalidateQueries({ queryKey: restaurantQueryKey })
    }
    window.addEventListener(ACCESS_CHANGED_EVENT, refresh)
    return () => window.removeEventListener(ACCESS_CHANGED_EVENT, refresh)
  }, [queryClient])

  const { refetch: refetchMe } = me
  const { refetch: refetchRestaurant } = restaurant
  const retry = useCallback(() => {
    void refetchMe()
    void refetchRestaurant()
  }, [refetchMe, refetchRestaurant])

  return { ...resolveAccess(me, restaurant), retry }
}
