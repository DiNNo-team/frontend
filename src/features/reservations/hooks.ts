import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { restaurantQueryKey } from '@/features/restaurant/hooks'
import { tablesQueryKey } from '@/features/tables/hooks'
import { reservationsApi } from './api'
import type { CheckInResult, RestaurantReservation } from './types'

/** Backup refresh of the panel (CLAUDE.md §12.7): every 30 s, besides the socket. */
export const RESERVATIONS_REFRESH_MS = 30_000

export const restaurantReservationsQueryKey = ['reservations', 'restaurant', 'active'] as const

/** A reservation plus the monotonic instant it arrived (`performance.now()`), to count down without the device clock. */
export interface TimedReservation extends RestaurantReservation {
  receivedAt: number
}

/** The next to expire first (the backend already sorts; a socket event may add one out of place). */
export function byExpiry<T extends Pick<RestaurantReservation, 'expiresAt' | 'id'>>(reservations: T[]): T[] {
  return [...reservations].sort((a, b) => Date.parse(a.expiresAt) - Date.parse(b.expiresAt) || a.id.localeCompare(b.id))
}

/** Tables held by an active DiNNo reservation (CLAUDE.md §12.2): their status cannot be changed by hand. */
export function dinnoTableIds(reservations: Pick<RestaurantReservation, 'tableId' | 'status'>[] | undefined): ReadonlySet<string> {
  return new Set((reservations ?? []).filter((reservation) => reservation.status === 'active').map((reservation) => reservation.tableId))
}

/** Active reservations of the restaurant (never with a code), refreshed every 30 s and on window focus. */
export function useRestaurantReservationsQuery({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: restaurantReservationsQueryKey,
    queryFn: async (): Promise<TimedReservation[]> => {
      const reservations = await reservationsApi.listActive()
      const receivedAt = performance.now()
      return byExpiry(reservations.map((reservation) => ({ ...reservation, receivedAt })))
    },
    refetchInterval: RESERVATIONS_REFRESH_MS,
    staleTime: 0,
    enabled,
  })
}

/** Ids of the tables the board shows as «Reserva DiNNo». Empty while the reservations load or if they fail. */
export function useDinnoTableIds(): ReadonlySet<string> {
  const { data } = useRestaurantReservationsQuery()
  return useMemo(() => dinnoTableIds(data), [data])
}

/** Validates a code. On success the reservation leaves the panel and the table (now Ocupada) and the count are asked again. */
export function useCheckIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => reservationsApi.checkIn(code),
    onSuccess: (result: CheckInResult) => {
      queryClient.setQueryData<TimedReservation[]>(restaurantReservationsQueryKey, (reservations) =>
        reservations?.filter((reservation) => reservation.id !== result.reservationId),
      )
      void queryClient.invalidateQueries({ queryKey: restaurantReservationsQueryKey })
      void queryClient.invalidateQueries({ queryKey: tablesQueryKey })
      void queryClient.invalidateQueries({ queryKey: restaurantQueryKey })
    },
  })
}

/** Monotonic "now" (`performance.now()`) that ticks every second while `active`, for the countdowns. */
export function useMonotonicNow(active: boolean): number {
  const [now, setNow] = useState(() => performance.now())
  useEffect(() => {
    if (!active) return
    const timer = window.setInterval(() => setNow(performance.now()), 1000)
    return () => window.clearInterval(timer)
  }, [active])
  return now
}
