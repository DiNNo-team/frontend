// Sprint 3 contract with the backend (Elizabeth): CLAUDE.md §12.8, the same in the three repos. A contract change
// touches only this file and the feature's api.ts. The web NEVER receives nor shows a reservation code: these types
// have no `code` on purpose (§12.6), so do not add one.

/** `active` → `cancelled` | `expired` | `completed`, never back (§12.1). */
export type ReservationStatus = 'active' | 'cancelled' | 'expired' | 'completed'

/** One row of GET /v1/restaurants/me/reservations and the payload of `reservation.created`. No code, ever. */
export interface RestaurantReservation {
  id: string
  status: ReservationStatus
  /** 1–20 people. */
  partySize: number
  /** `null` when the diner has no public name: show «Comensal» (`dinerNameOf`). */
  dinerName: string | null
  tableId: string
  /** As typed by the restaurant ("04", "Mesa 4"). Display it with `formatTableName`. */
  tableIdentifier: string
  /** ISO 8601 UTC. */
  createdAt: string
  expiresAt: string
  /** Server clock when it answered: the countdown is `expiresAt − serverTime`, never the browser clock alone. */
  serverTime: string
}

/** 200 of POST /v1/restaurants/me/check-ins. */
export interface CheckInResult {
  reservationId: string
  tableIdentifier: string
  partySize: number
  dinerName: string | null
  /** ISO 8601 UTC. */
  checkedInAt: string
}

/** `reservation.cancelled` · `reservation.expired` · `reservation.checked_in` (room `restaurant:{id}`). */
export interface ReservationClosedEvent {
  reservationId: string
  status: Exclude<ReservationStatus, 'active'>
  tableId: string
  /** ISO 8601 UTC. */
  at: string
}

/** Origin of a table change in the table log and in `table.status_changed` (§12.3). */
export type TableChangeSource = 'manual' | 'reservation' | 'system'

/** `table.status_changed` (room `restaurant:{id}`): one per new table-log row. Statuses may be `inactive`. */
export interface TableStatusChangedEvent {
  tableId: string
  previousStatus: string
  status: string
  source: TableChangeSource
}
