import { apiRequest } from '@/lib/api-client'
import type { CheckInResult, RestaurantReservation } from './types'

/** Reservations of the restaurant in session (contract in types.ts). The restaurant comes from the session. */
export interface ReservationsApi {
  /** GET /restaurants/me/reservations (status `active` by default), the next to expire first. */
  listActive: () => Promise<RestaurantReservation[]>
  /** POST /restaurants/me/check-ins with the normalized code. */
  checkIn: (code: string) => Promise<CheckInResult>
}

const httpReservationsApi: ReservationsApi = {
  listActive: () => apiRequest<RestaurantReservation[]>('/restaurants/me/reservations'),
  checkIn: (code) => apiRequest<CheckInResult>('/restaurants/me/check-ins', { method: 'POST', body: { code } }),
}

// Loaded on demand so production builds (VITE_USE_MOCKS unset) never ship the sample data.
const loadMock = () => import('./api.mock').then((module) => module.mockReservationsApi)

const lazyMockReservationsApi: ReservationsApi = {
  listActive: async () => (await loadMock()).listActive(),
  checkIn: async (code) => (await loadMock()).checkIn(code),
}

/** `VITE_USE_MOCKS=true` switches to the in-memory mock; both follow the same contract. */
export const reservationsApi: ReservationsApi = import.meta.env.VITE_USE_MOCKS === 'true' ? lazyMockReservationsApi : httpReservationsApi
