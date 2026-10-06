import { ApiError, getApiErrorMessage } from '@/lib/api-client'
import { formatTableName, normalizeTableIdentifier } from '@/lib/format'
import { TABLE_LIMITS, type Table } from './types'

export interface TableFormValues {
  identifier: string
  capacity: number
}

export type TableFormErrors = Partial<Record<keyof TableFormValues, string>>

export const TABLE_FORM_MESSAGES = {
  identifierRequired: 'Escribe el identificador de la mesa',
  identifierTooLong: `Usa máximo ${TABLE_LIMITS.identifierMaxLength} caracteres`,
  identifierTaken: (identifier: string) => `Ya tienes una ${formatTableName(identifier)}. Usa otro identificador.`,
  capacityRange: `La capacidad va de ${TABLE_LIMITS.minCapacity} a ${TABLE_LIMITS.maxCapacity} personas`,
  saveFailed: 'No pudimos guardar la mesa. Revisa tu conexión e intenta de nuevo.',
} as const

/**
 * Repeated identifiers are checked against every loaded table, inactive ones included
 * ("4" and "04" collide). `ignoreId` skips the table being edited.
 */
export function validateIdentifier(identifier: string, existing: Table[], ignoreId?: string): string | undefined {
  const trimmed = identifier.trim()
  if (!trimmed) return TABLE_FORM_MESSAGES.identifierRequired
  if (trimmed.length > TABLE_LIMITS.identifierMaxLength) return TABLE_FORM_MESSAGES.identifierTooLong
  const key = normalizeTableIdentifier(trimmed)
  const taken = existing.some((table) => table.id !== ignoreId && normalizeTableIdentifier(table.identifier) === key)
  return taken ? TABLE_FORM_MESSAGES.identifierTaken(trimmed) : undefined
}

export function validateCapacity(capacity: number): string | undefined {
  const valid = Number.isInteger(capacity) && capacity >= TABLE_LIMITS.minCapacity && capacity <= TABLE_LIMITS.maxCapacity
  return valid ? undefined : TABLE_FORM_MESSAGES.capacityRange
}

export function validateTableForm(values: TableFormValues, existing: Table[], ignoreId?: string): TableFormErrors {
  const errors: TableFormErrors = {}
  const identifier = validateIdentifier(values.identifier, existing, ignoreId)
  const capacity = validateCapacity(values.capacity)
  if (identifier) errors.identifier = identifier
  if (capacity) errors.capacity = capacity
  return errors
}

export interface TableSaveFailure {
  fieldErrors: TableFormErrors
  /** Shown as an error Alert inside the dialog, keeping what was typed. */
  formError?: string
}

/** Translates a backend error into field errors or a dialog message. Never shows the raw backend text. */
export function describeTableSaveError(error: unknown, values: TableFormValues): TableSaveFailure {
  if (error instanceof ApiError) {
    // The only 409 of create and edit is a repeated identifier (the backend sends no errorCode for it).
    if (error.status === 409) {
      return { fieldErrors: { identifier: TABLE_FORM_MESSAGES.identifierTaken(values.identifier.trim()) } }
    }
    if (error.status === 400 && error.fieldErrors) {
      const fieldErrors: TableFormErrors = {}
      if (error.fieldErrors.identifier) {
        fieldErrors.identifier = validateIdentifier(values.identifier, []) ?? TABLE_FORM_MESSAGES.identifierTooLong
      }
      if (error.fieldErrors.capacity) fieldErrors.capacity = TABLE_FORM_MESSAGES.capacityRange
      if (Object.keys(fieldErrors).length > 0) return { fieldErrors }
    }
    if (error.status === 401 || error.status === 403) {
      return { fieldErrors: {}, formError: getApiErrorMessage(error) }
    }
  }
  return { fieldErrors: {}, formError: TABLE_FORM_MESSAGES.saveFailed }
}
