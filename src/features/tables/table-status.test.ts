import { describe, expect, it } from 'vitest'
import { countTables, getTableDisplayStatus, TABLE_STATUS_OPTIONS, toTableDisplayStatus } from './table-status'

describe('table-status', () => {
  it('an inactive table is "inactive" whatever its last status', () => {
    expect(getTableDisplayStatus({ status: 'occupied', isActive: false })).toBe('inactive')
    expect(getTableDisplayStatus({ status: 'reserved', isActive: true })).toBe('reserved')
  })

  it('maps API codes in any case, including inactive for the activity log', () => {
    expect(toTableDisplayStatus('available')).toBe('available')
    expect(toTableDisplayStatus('OCCUPIED')).toBe('occupied')
    expect(toTableDisplayStatus('inactive')).toBe('inactive')
    expect(toTableDisplayStatus('limited')).toBeUndefined()
  })

  it('the status control offers Disponible · Reservada · Ocupada, never Inactiva', () => {
    expect(TABLE_STATUS_OPTIONS.map((option) => option.label)).toEqual(['Disponible', 'Reservada', 'Ocupada'])
  })

  it('counts inactive tables apart', () => {
    const base = { id: 'x', identifier: '1', capacity: 2 }
    expect(
      countTables([
        { ...base, status: 'available', isActive: true },
        { ...base, status: 'available', isActive: false },
        { ...base, status: 'occupied', isActive: true },
      ]),
    ).toEqual({ available: 1, reserved: 0, occupied: 1, inactive: 1 })
  })
})
