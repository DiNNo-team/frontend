import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Providers } from '@/app/providers'
import { restaurantReservationsQueryKey, type TimedReservation } from '@/features/reservations/hooks'
import { tablesQueryKey } from '@/features/tables/hooks'
import type { Table } from '@/features/tables/types'
import { setAuthTokenProvider } from '@/lib/api-client'
import { createTestQueryClient } from '@/test/render'
import { createdSockets, lastSocket } from '@/test/fake-socket'
import { liveConnection } from './connection'
import { useRestaurantRealtime } from './use-restaurant-realtime'

const ROW: TimedReservation = {
  id: 'r1',
  status: 'active',
  partySize: 2,
  dinerName: null,
  tableId: 't4',
  tableIdentifier: '04',
  createdAt: '2026-11-08T17:00:00Z',
  expiresAt: '2026-11-08T17:15:00Z',
  serverTime: '2026-11-08T17:00:00Z',
  receivedAt: 0,
}

/** `null` = no restaurant. */
function setup(restaurantId: string | null = 'rest-1', rows: TimedReservation[] = []) {
  const queryClient = createTestQueryClient()
  queryClient.setQueryData(restaurantReservationsQueryKey, rows)
  queryClient.setQueryData<Table[]>(tablesQueryKey, [
    { id: 't7', identifier: '07', capacity: 2, status: 'reserved', isActive: true, planX: null, planY: null, planShape: null },
  ])
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
  const wrapper = ({ children }: { children: ReactNode }) => <Providers queryClient={queryClient}>{children}</Providers>
  const hook = renderHook(({ id }) => useRestaurantRealtime(id), { wrapper, initialProps: { id: restaurantId ?? undefined } as { id: string | undefined } })
  const rows$ = () => queryClient.getQueryData<TimedReservation[]>(restaurantReservationsQueryKey) ?? []
  const invalidated = (key: readonly unknown[]) => invalidate.mock.calls.some(([filters]) => JSON.stringify(filters?.queryKey) === JSON.stringify(key))
  return { ...hook, queryClient, invalidate, rows: rows$, invalidated }
}

beforeEach(() => {
  setAuthTokenProvider(async () => 'token-123')
})
afterEach(() => {
  setAuthTokenProvider(null)
  liveConnection.reset()
})

describe('useRestaurantRealtime (§12.7)', () => {
  it('stays disconnected without a restaurant (signed out, none registered yet, sample data)', () => {
    setup(null)
    expect(createdSockets()).toBe(0)
  })

  it('connects to the backend origin over WebSocket, with a fresh token on every handshake', async () => {
    setup()
    const socket = lastSocket()!
    expect(socket.url).toBe('http://localhost:3000')
    expect(socket.options.transports).toEqual(['websocket'])
    expect(socket.connectCalls).toBe(1)
    const auth = socket.options.auth as (send: (data: object) => void) => void
    const sent = await new Promise((resolve) => auth(resolve))
    expect(sent).toEqual({ token: 'token-123' })
  })

  it('reservation.created adds the row once and notices it', async () => {
    const { rows } = setup()
    const socket = lastSocket()!
    act(() => socket.acceptConnection())
    const { receivedAt: _receivedAt, ...payload } = ROW
    act(() => socket.serverEmit('reservation.created', payload))
    act(() => socket.serverEmit('reservation.created', payload))
    expect(rows().map((row) => row.id)).toEqual(['r1'])
    expect(await screen.findByText('Nueva reserva · Mesa 04 · 2 personas')).toBeInTheDocument()
    act(() => socket.serverEmit('reservation.created', { nope: true }))
    expect(rows()).toHaveLength(1)
  })

  it('reservation.expired removes the row, says which table, and asks the tables again', async () => {
    const { rows, invalidated } = setup('rest-1', [ROW])
    const socket = lastSocket()!
    act(() => socket.acceptConnection())
    act(() => socket.serverEmit('reservation.expired', { reservationId: 'r1', status: 'expired', tableId: 't4', at: 'x' }))
    expect(rows()).toEqual([])
    expect(await screen.findByText('Se venció la reserva de Mesa 04. La mesa ya se liberó.')).toBeInTheDocument()
    await vi.waitFor(() => expect(invalidated(tablesQueryKey)).toBe(true))
  })

  it('a cancellation of a row not loaded yet still names the table from the tables', async () => {
    setup()
    const socket = lastSocket()!
    act(() => socket.serverEmit('reservation.cancelled', { reservationId: 'zz', status: 'cancelled', tableId: 't7', at: 'x' }))
    expect(await screen.findByText('El comensal canceló la reserva de Mesa 07.')).toBeInTheDocument()
  })

  it('a check-in made on this device (row already gone) shows no second notice', () => {
    setup()
    const socket = lastSocket()!
    act(() => socket.serverEmit('reservation.checked_in', { reservationId: 'r1', status: 'completed', tableId: 't4', at: 'x' }))
    expect(screen.queryByRole('status', { name: /Check-in/ })).toBeNull()
    expect(screen.queryByText(/Check-in confirmado/)).toBeNull()
  })

  it('table.status_changed asks the tables again (debounced)', async () => {
    const { invalidated } = setup()
    const socket = lastSocket()!
    act(() => socket.serverEmit('table.status_changed', { tableId: 't7', previousStatus: 'available', status: 'inactive', source: 'manual' }))
    await vi.waitFor(() => expect(invalidated(tablesQueryKey)).toBe(true))
  })

  it('after a cut: «Reconectando…», and back online everything is asked again', () => {
    const { invalidated } = setup()
    const socket = lastSocket()!
    act(() => socket.acceptConnection())
    expect(invalidated(restaurantReservationsQueryKey)).toBe(false)
    act(() => socket.dropConnection())
    act(() => socket.acceptConnection())
    expect(invalidated(restaurantReservationsQueryKey)).toBe(true)
    expect(invalidated(tablesQueryKey)).toBe(true)
  })

  it('SERVER_ERROR retries by itself after 5 s; a session code does not retry', () => {
    vi.useFakeTimers()
    setup()
    const socket = lastSocket()!
    act(() => socket.rejectConnection('SERVER_ERROR'))
    expect(socket.connectCalls).toBe(1)
    act(() => vi.advanceTimersByTime(5_000))
    expect(socket.connectCalls).toBe(2)
    act(() => socket.rejectConnection('UNAUTHORIZED'))
    act(() => vi.advanceTimersByTime(60_000))
    expect(socket.connectCalls).toBe(2)
  })

  it('disconnects on unmount (sign out) and reconnects for another restaurant (rooms are fixed on connect)', () => {
    const { rerender, unmount } = setup('rest-1')
    const first = lastSocket()!
    rerender({ id: 'rest-2' })
    expect(first.active).toBe(false)
    const second = lastSocket()!
    expect(second).not.toBe(first)
    unmount()
    expect(second.active).toBe(false)
  })
})
