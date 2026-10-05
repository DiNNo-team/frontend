import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api-client'
import { describeTableSaveError, validateCapacity, validateIdentifier, validateTableForm } from './table-form'
import type { Table } from './types'

const table = (id: string, identifier: string, isActive = true): Table => ({
  id,
  identifier,
  capacity: 4,
  status: 'available',
  isActive,
  updatedAt: '',
})
const EXISTING = [table('a', '04'), table('b', 'T1'), table('c', '06', false)]

describe('table form validation', () => {
  it('requires the identifier and limits it to 10 characters', () => {
    expect(validateIdentifier('  ', EXISTING)).toBe('Escribe el identificador de la mesa')
    expect(validateIdentifier('12345678901', EXISTING)).toBe('Usa máximo 10 caracteres')
    expect(validateIdentifier('1234567890', EXISTING)).toBeUndefined()
  })

  it('catches repeated identifiers, including inactive tables and leading zeros', () => {
    expect(validateIdentifier('4', EXISTING)).toBe('Ya tienes una Mesa 04. Usa otro identificador.')
    expect(validateIdentifier(' t1 ', EXISTING)).toBe('Ya tienes una Mesa t1. Usa otro identificador.')
    expect(validateIdentifier('6', EXISTING)).toBe('Ya tienes una Mesa 06. Usa otro identificador.')
    expect(validateIdentifier('07', EXISTING)).toBeUndefined()
  })

  it('ignores the table being edited', () => {
    expect(validateIdentifier('04', EXISTING, 'a')).toBeUndefined()
  })

  it('keeps capacity between 1 and 20', () => {
    expect(validateCapacity(0)).toBe('La capacidad va de 1 a 20 personas')
    expect(validateCapacity(21)).toBe('La capacidad va de 1 a 20 personas')
    expect(validateCapacity(2.5)).toBe('La capacidad va de 1 a 20 personas')
    expect(validateCapacity(20)).toBeUndefined()
    expect(validateTableForm({ identifier: '', capacity: 0 }, EXISTING)).toEqual({
      identifier: 'Escribe el identificador de la mesa',
      capacity: 'La capacidad va de 1 a 20 personas',
    })
  })
})

describe('describeTableSaveError', () => {
  const values = { identifier: '04', capacity: 4 }

  it('turns 409 TABLE_IDENTIFIER_TAKEN into the identifier error', () => {
    expect(describeTableSaveError(new ApiError({ status: 409, code: 'TABLE_IDENTIFIER_TAKEN' }), values)).toEqual({
      fieldErrors: { identifier: 'Ya tienes una Mesa 04. Usa otro identificador.' },
    })
  })

  it('maps 400 field errors without showing backend text', () => {
    const failure = describeTableSaveError(new ApiError({ status: 400, fieldErrors: { capacity: 'max 20' } }), values)
    expect(failure.fieldErrors.capacity).toBe('La capacidad va de 1 a 20 personas')
  })

  it('network and server errors keep the form and show the save message', () => {
    expect(describeTableSaveError(new ApiError({ status: 0, isNetworkError: true }), values).formError).toBe(
      'No pudimos guardar la mesa. Revisa tu conexión e intenta de nuevo.',
    )
    expect(describeTableSaveError(new ApiError({ status: 500, message: 'boom' }), values).formError).toBe(
      'No pudimos guardar la mesa. Revisa tu conexión e intenta de nuevo.',
    )
    expect(describeTableSaveError(new ApiError({ status: 401 }), values).formError).toBe('Tu sesión terminó. Inicia sesión de nuevo.')
  })
})
