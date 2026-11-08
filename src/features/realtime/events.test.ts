import { describe, expect, it } from 'vitest'
import { isReservationClosedEvent, isRestaurantReservation, isTableStatusChangedEvent } from './events'

const reservation = {
  id: 'r1',
  status: 'active',
  partySize: 2,
  dinerName: null,
  tableId: 't1',
  tableIdentifier: '04',
  createdAt: '2026-11-08T17:00:00Z',
  expiresAt: '2026-11-08T17:15:00Z',
  serverTime: '2026-11-08T17:00:00Z',
}

describe('socket payload guards (§12.8)', () => {
  it('accepts a RestaurantReservation and rejects anything malformed', () => {
    expect(isRestaurantReservation(reservation)).toBe(true)
    expect(isRestaurantReservation({ ...reservation, status: 'weird' })).toBe(false)
    expect(isRestaurantReservation({ ...reservation, tableId: undefined })).toBe(false)
    expect(isRestaurantReservation(null)).toBe(false)
  })

  it('accepts the closing events only with a final status', () => {
    expect(isReservationClosedEvent({ reservationId: 'r1', status: 'expired', tableId: 't1', at: 'x' })).toBe(true)
    expect(isReservationClosedEvent({ reservationId: 'r1', status: 'active', tableId: 't1', at: 'x' })).toBe(false)
  })

  it('accepts table.status_changed with inactive and a known source', () => {
    expect(isTableStatusChangedEvent({ tableId: 't1', previousStatus: 'available', status: 'inactive', source: 'manual' })).toBe(true)
    expect(isTableStatusChangedEvent({ tableId: 't1', previousStatus: 'available', status: 'reserved', source: 'robot' })).toBe(false)
  })
})
