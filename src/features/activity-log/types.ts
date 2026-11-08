import type { TableChangeSource } from '@/features/reservations/types'

// Contract with the backend (Sergio, PBI 9; `source` since Sprint 3, CLAUDE.md §12.3): GET /table-logs?tableId=<uuid optional> → TableLog[],
// newest first, 200 rows at most, no pagination. A tableId of another restaurant (or unknown) → [].
// Errors: 401 without session, 403 RESTAURANT_REQUIRED or by role, 400 if tableId is not a uuid.
// A contract change touches only this file and api.ts. `message` is never shown: the UI uses the manual's texts.

export interface TableLog {
  id: string
  tableId: string
  /** Current identifier of the table, as typed by the restaurant ("04", "T1"). Display it with `formatTableName`. */
  tableIdentifier: string
  /** 'available' | 'reserved' | 'occupied' | 'inactive'. Map it with `toTableDisplayStatus` for the chips. */
  previousStatus: string
  newStatus: string
  /** ISO date-time (UTC). Display it with `formatDateTime`. */
  changedAt: string
  /**
   * Email of the restaurant admin who made the change. `null` for automatic changes (`system`) and for a diner's
   * (`reservation`): a diner's email never reaches the restaurant. Display the author with `logAuthor`, never this alone.
   */
  userEmail: string | null
  /** `manual` (the admin) · `reservation` (a diner's reservation, or the admin's check-in) · `system` (expiry). */
  source: TableChangeSource
}

/** Rows the backend returns at most (no pagination in Sprint 1). */
export const TABLE_LOGS_LIMIT = 200
