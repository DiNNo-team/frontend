import { byExpiry, type TimedReservation } from '@/features/reservations/hooks'
import type { RestaurantReservation } from '@/features/reservations/types'

// Pure updates of the panel list from socket events. The list may already have the row (the 30 s refresh got there
// first) or may not have it yet: both are fine.

/** `reservation.created`: adds the row once, keeping the next to expire first. A repeated event changes nothing. */
export function addReservation(list: TimedReservation[] | undefined, reservation: RestaurantReservation, receivedAt: number): TimedReservation[] | undefined {
  if (!list) return list
  if (reservation.status !== 'active' || list.some((item) => item.id === reservation.id)) return list
  return byExpiry([...list, { ...reservation, receivedAt }])
}

/** `reservation.cancelled` · `.expired` · `.checked_in`: the row leaves the panel (a missing row changes nothing). */
export function removeReservation(list: TimedReservation[] | undefined, reservationId: string): TimedReservation[] | undefined {
  if (!list || !list.some((item) => item.id === reservationId)) return list
  return list.filter((item) => item.id !== reservationId)
}
