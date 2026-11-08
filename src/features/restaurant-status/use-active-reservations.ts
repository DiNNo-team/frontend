import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { restaurantApi } from '@/features/restaurant/api'
import { restaurantQueryKey } from '@/features/restaurant/hooks'

/**
 * Counts the DiNNo reservations in course right before closing (CLAUDE.md §12.2): `activeReservationsCount` of
 * GET /v1/restaurants/me, asked again so the number is current. A table Reservada by hand is not a reservation, so the
 * tables are not counted. Resolves `null` when it cannot be read, so the caller asks for confirmation to be safe.
 */
export function useCountActiveReservations(): () => Promise<number | null> {
  const queryClient = useQueryClient()
  return useCallback(async () => {
    try {
      const restaurant = await queryClient.fetchQuery({ queryKey: restaurantQueryKey, queryFn: () => restaurantApi.get(), staleTime: 0 })
      return typeof restaurant.activeReservationsCount === 'number' ? restaurant.activeReservationsCount : null
    } catch {
      // Unknown count: confirming anyway is the safe side (the dialog explains what closing does).
      return null
    }
  }, [queryClient])
}
