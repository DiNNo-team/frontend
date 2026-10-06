// Provisional contract with the backend (Elizabeth). A contract change touches only this file and api.ts.

/** Operational status kept by the backend (same values as the `tables.status` column); an inactive table keeps its last one. */
export type TableStatus = 'available' | 'reserved' | 'occupied'

export interface Table {
  id: string
  /** As typed by the restaurant: "04", "T1". Display it with `formatTableName`. */
  identifier: string
  /** 1–20 people. */
  capacity: number
  status: TableStatus
  isActive: boolean
}

export interface CreateTableInput {
  identifier: string
  capacity: number
}

export type UpdateTableInput = Partial<CreateTableInput>

// Errors: `{ statusCode, message, error, errorCode? }` (NestJS default). Each tables route has a single
// reason per status, so the front branches on the HTTP status: 409 on create/edit = repeated identifier,
// on status change = inactive table, on deactivate/reactivate = already in that state; 404 = not found
// (or another restaurant's table). `message` is never shown: the UI uses the manual's texts.

/** Limits shared by the form and the mock. The column allows 50 characters; the UI keeps 10 (pending confirmation with Elizabeth). */
export const TABLE_LIMITS = {
  identifierMaxLength: 10,
  minCapacity: 1,
  maxCapacity: 20,
} as const
