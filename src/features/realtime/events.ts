import type { ReservationClosedEvent, ReservationStatus, RestaurantReservation, TableStatusChangedEvent } from '@/features/reservations/types'

// Events of the restaurant room `restaurant:{id}` (CLAUDE.md §12.7 and §12.8). The server assigns the room on connect;
// the client only listens. Payloads are checked before use: a malformed event is ignored, never trusted.

export const RESERVATION_CREATED = 'reservation.created'
export const RESERVATION_CANCELLED = 'reservation.cancelled'
export const RESERVATION_EXPIRED = 'reservation.expired'
export const RESERVATION_CHECKED_IN = 'reservation.checked_in'
export const TABLE_STATUS_CHANGED = 'table.status_changed'

export const RESERVATION_CLOSED_EVENTS = [RESERVATION_CANCELLED, RESERVATION_EXPIRED, RESERVATION_CHECKED_IN] as const

/** `connect_error.message` codes (§10 "Tiempo real"). Only SERVER_ERROR deserves new tries from the client. */
export const SERVER_ERROR = 'SERVER_ERROR'

const STATUSES: readonly ReservationStatus[] = ['active', 'cancelled', 'expired', 'completed']
const SOURCES = ['manual', 'reservation', 'system'] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

const isString = (value: unknown): value is string => typeof value === 'string' && value.length > 0

export function isRestaurantReservation(value: unknown): value is RestaurantReservation {
  return (
    isRecord(value) &&
    isString(value.id) &&
    STATUSES.includes(value.status as ReservationStatus) &&
    typeof value.partySize === 'number' &&
    (value.dinerName === null || typeof value.dinerName === 'string') &&
    isString(value.tableId) &&
    typeof value.tableIdentifier === 'string' &&
    isString(value.expiresAt) &&
    isString(value.serverTime)
  )
}

export function isReservationClosedEvent(value: unknown): value is ReservationClosedEvent {
  return (
    isRecord(value) &&
    isString(value.reservationId) &&
    ['cancelled', 'expired', 'completed'].includes(value.status as string) &&
    isString(value.tableId)
  )
}

export function isTableStatusChangedEvent(value: unknown): value is TableStatusChangedEvent {
  return (
    isRecord(value) &&
    isString(value.tableId) &&
    isString(value.status) &&
    SOURCES.includes(value.source as (typeof SOURCES)[number])
  )
}
