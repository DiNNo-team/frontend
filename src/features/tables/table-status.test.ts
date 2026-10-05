import { describe, expect, it } from 'vitest'
import { countTables, getTableDisplayStatus, TABLE_STATUS_OPTIONS, toTableDisplayStatus } from './table-status'

describe('table-status', () => {
  it('an inactive table is "inactive" whatever its last status', () => {
    expect(getTableDisplayStatus({ status: 'OCCUPIED', isActive: false })).toBe('inactive')
    expect(getTableDisplayStatus({ status: 'RESERVED', isActive: true })).toBe('reserved')
  })

  it('maps API codes, including INACTIVE for the activity log', () => {
    expect(toTableDisplayStatus('AVAILABLE')).toBe('available')
    expect(toTableDisplayStatus('occupied')).toBe('occupied')
    expect(toTableDisplayStatus('INACTIVE')).toBe('inactive')
    expect(toTableDisplayStatus('LIMITED')).toBeUndefined()
  })

  it('the status control offers Disponible · Reservada · Ocupada, never Inactiva', () => {
    expect(TABLE_STATUS_OPTIONS.map((option) => option.label)).toEqual(['Disponible', 'Reservada', 'Ocupada'])
  })

  it('counts inactive tables apart', () => {
    const base = { id: 'x', identifier: '1', capacity: 2, updatedAt: '' }
    expect(
      countTables([
        { ...base, status: 'AVAILABLE', isActive: true },
        { ...base, status: 'AVAILABLE', isActive: false },
        { ...base, status: 'OCCUPIED', isActive: true },
      ]),
    ).toEqual({ available: 1, reserved: 0, occupied: 1, inactive: 1 })
  })
})
