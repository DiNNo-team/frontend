// Provisional contract with the backend (Elizabeth). A contract change touches only this file and api.ts.

/** Operational status kept by the backend; an inactive table keeps its last one. */
export type TableStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED'

export interface Table {
  id: string
  /** As typed by the restaurant: "04", "T1". Display it with `formatTableName`. */
  identifier: string
  /** 1–20 people. */
  capacity: number
  status: TableStatus
  isActive: boolean
  /** ISO 8601. */
  updatedAt: string
}

export interface CreateTableInput {
  identifier: string
  capacity: number
}

export type UpdateTableInput = Partial<CreateTableInput>

/** Error codes the backend sends in `{ statusCode, code, message, fields? }`. */
export type TableErrorCode =
  | 'TABLE_IDENTIFIER_TAKEN'
  | 'TABLE_INACTIVE'
  | 'TABLE_ALREADY_INACTIVE'
  | 'TABLE_ALREADY_ACTIVE'
  | 'TABLE_NOT_FOUND'
  | 'VALIDATION_ERROR'

/** Limits shared by the form and the mock. Identifier max length pending confirmation with Elizabeth. */
export const TABLE_LIMITS = {
  identifierMaxLength: 10,
  minCapacity: 1,
  maxCapacity: 20,
} as const
