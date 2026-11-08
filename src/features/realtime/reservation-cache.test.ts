import { describe, expect, it } from 'vitest'
import type { TimedReservation } from '@/features/reservations/hooks'
import type { RestaurantReservation } from '@/features/reservations/types'
import { addReservation, removeReservation } from './reservation-cache'

function reservation(id: string, expiresAt: string): RestaurantReservation {
  return { id, status: 'active', partySize: 2, dinerName: null, tableId: `t-${id}`, tableIdentifier: id, createdAt: expiresAt, expiresAt, serverTime: expiresAt }
}
const timed = (id: string, expiresAt: string): TimedReservation => ({ ...reservation(id, expiresAt), receivedAt: 0 })

describe('addReservation', () => {
  it('adds a new row in expiry order', () => {
    const list = [timed('a', '2026-11-08T17:10:00Z'), timed('c', '2026-11-08T17:30:00Z')]
    expect(addReservation(list, reservation('b', '2026-11-08T17:20:00Z'), 5)?.map((item) => item.id)).toEqual(['a', 'b', 'c'])
  })

  it('never duplicates a row the 30 s refresh already brought', () => {
    const list = [timed('a', '2026-11-08T17:10:00Z')]
    expect(addReservation(list, reservation('a', '2026-11-08T17:10:00Z'), 5)).toBe(list)
  })

  it('leaves an unloaded list alone (the first load brings it)', () => {
    expect(addReservation(undefined, reservation('a', '2026-11-08T17:10:00Z'), 5)).toBeUndefined()
  })
})

describe('removeReservation', () => {
  it('removes the row, and a missing one changes nothing', () => {
    const list = [timed('a', '2026-11-08T17:10:00Z'), timed('b', '2026-11-08T17:20:00Z')]
    expect(removeReservation(list, 'a')?.map((item) => item.id)).toEqual(['b'])
    expect(removeReservation(list, 'zzz')).toBe(list)
  })
})
