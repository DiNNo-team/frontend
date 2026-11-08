import { mockTablesControl } from '@/features/tables/api.mock'
import { ApiError } from '@/lib/api-client'
import type { ReservationsApi } from './api'
import type { CheckInResult, RestaurantReservation } from './types'

// In-memory stand-in for the restaurant's reservations (CLAUDE.md §12.8) with VITE_USE_MOCKS=true. Same contract.
// Reservations on tables of the tables mock: /mesas?mockDinno=03,08 (both mocks read it). Codes: K7M4QX (first) and
// P3R8TW (second). Forced check-in results: VENC9D (expired), USAD4S (already used), CANC3X (cancelled); any other → 404.
// Errors: ?mockError=reservations-list or check-in · slower: ?mockLatency=3000 (shared with tables).
// The codes live only here, to simulate the backend: the web never receives one.

export type MockReservationsOperation = 'reservations-list' | 'check-in'

interface MockReservation extends RestaurantReservation {
  code: string
}

export interface MockReservationSeed {
  tableId: string
  tableIdentifier: string
  partySize: number
  dinerName: string | null
  minutesLeft: number
  code: string
}

const CODES = ['K7M4QX', 'P3R8TW', 'H9N2VC']
const NAMES = ['Laura', null, 'Andrés']

function urlParams(): URLSearchParams {
  return typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search)
}

function toReservation(seed: MockReservationSeed, index: number): MockReservation {
  const now = Date.now()
  return {
    id: `mock-reservation-${index + 1}`,
    status: 'active',
    partySize: seed.partySize,
    dinerName: seed.dinerName,
    tableId: seed.tableId,
    tableIdentifier: seed.tableIdentifier,
    createdAt: new Date(now - 60_000).toISOString(),
    expiresAt: new Date(now + seed.minutesLeft * 60_000).toISOString(),
    serverTime: new Date(now).toISOString(),
    code: seed.code,
  }
}

function seedFromUrl(): MockReservationSeed[] {
  const identifiers = urlParams().get('mockDinno')?.split(',').filter(Boolean) ?? []
  const tables = mockTablesControl.snapshot().filter((table) => identifiers.includes(table.identifier))
  return tables.map((table, index) => ({
    tableId: table.id,
    tableIdentifier: table.identifier,
    partySize: Math.min(2, table.capacity),
    dinerName: NAMES[index % NAMES.length],
    minutesLeft: 12 - index * 5,
    code: CODES[index % CODES.length],
  }))
}

let reservations: MockReservation[] = seedFromUrl().map(toReservation)
let latencyMs = Number(urlParams().get('mockLatency') ?? 400)
const forcedFailures = new Set<MockReservationsOperation>()

/** Test and dev controls. `reset` also marks those tables as held in the tables mock (409 on manual changes). */
export const mockReservationsControl = {
  reset(seeds: MockReservationSeed[] = []) {
    reservations = seeds.map(toReservation)
    forcedFailures.clear()
    mockTablesControl.setDinnoReservations(Object.fromEntries(seeds.map((seed) => [seed.tableId, seed.partySize])))
  },
  setLatency(ms: number) {
    latencyMs = ms
  },
  failOn(operation: MockReservationsOperation) {
    forcedFailures.add(operation)
  },
  clearFailures() {
    forcedFailures.clear()
  },
}

async function simulate(operation: MockReservationsOperation) {
  if (latencyMs > 0) await new Promise((resolve) => setTimeout(resolve, latencyMs))
  const fromUrl = urlParams().get('mockError')?.split(',') ?? []
  if (forcedFailures.has(operation) || fromUrl.includes(operation)) {
    throw new ApiError({ status: 0, isNetworkError: true, message: `Mock network error on ${operation}` })
  }
}

function fail(status: number, code: string, message: string): never {
  throw new ApiError({ status, code, message })
}

function withoutCode({ code: _code, ...reservation }: MockReservation): RestaurantReservation {
  return { ...reservation, serverTime: new Date().toISOString() }
}

export const mockReservationsApi: ReservationsApi = {
  async listActive() {
    await simulate('reservations-list')
    const now = Date.now()
    // Like the backend: expired ones are expired on read and leave the list; the next to expire first.
    reservations = reservations.filter((reservation) => Date.parse(reservation.expiresAt) > now)
    return [...reservations].sort((a, b) => Date.parse(a.expiresAt) - Date.parse(b.expiresAt)).map(withoutCode)
  },
  async checkIn(code) {
    await simulate('check-in')
    if (code === 'VENC9D') fail(409, 'RESERVATION_EXPIRED', 'Esta reserva se venció a las 12:41. La mesa ya se liberó.')
    if (code === 'USAD4S') fail(409, 'RESERVATION_ALREADY_USED', 'Este código ya se usó a las 12:35.')
    if (code === 'CANC3X') fail(409, 'RESERVATION_CANCELLED', 'La reserva fue cancelada por el comensal.')
    const reservation = reservations.find((item) => item.code === code && Date.parse(item.expiresAt) > Date.now())
    if (!reservation) fail(404, 'RESERVATION_CODE_NOT_FOUND', 'No encontramos una reserva con ese código en tu restaurante.')
    reservations = reservations.filter((item) => item.id !== reservation.id)
    mockTablesControl.markCheckedIn(reservation.tableId)
    const result: CheckInResult = {
      reservationId: reservation.id,
      tableIdentifier: reservation.tableIdentifier,
      partySize: reservation.partySize,
      dinerName: reservation.dinerName,
      checkedInAt: new Date().toISOString(),
    }
    return result
  },
}
