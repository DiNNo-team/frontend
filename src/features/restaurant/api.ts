import { apiRequest } from '@/lib/api-client'
import type { GeocodeResult, RegisterRestaurantInput, RegisterScheduleInput, RestaurantCategory, RestaurantProfile } from './types'

/** Body of PATCH /restaurants/me: only what changed. Coordinates go both or neither and cannot be removed. */
export interface UpdateRestaurantInput {
  name?: string
  category?: RestaurantCategory
  address?: string
  latitude?: number
  longitude?: number
  schedules?: RegisterScheduleInput[]
}

/** Restaurant endpoints (contract in types.ts). The restaurant always comes from the session, never from here. */
export interface RestaurantApi {
  get: () => Promise<RestaurantProfile>
  register: (input: RegisterRestaurantInput) => Promise<RestaurantProfile>
  update: (input: UpdateRestaurantInput) => Promise<RestaurantProfile>
  /** GET /geocode: 404 ADDRESS_NOT_FOUND or 503 GEOCODING_UNAVAILABLE when there is no point to show. */
  geocode: (address: string) => Promise<GeocodeResult>
}

const httpRestaurantApi: RestaurantApi = {
  get: () => apiRequest<RestaurantProfile>('/restaurants/me'),
  geocode: (address) => apiRequest<GeocodeResult>(`/geocode?${new URLSearchParams({ address: address.trim() })}`),
  register: (input) => apiRequest<RestaurantProfile>('/restaurants', { method: 'POST', body: input }),
  update: (input) => {
    if (Object.keys(input).length === 0) throw new Error('Restaurant update requires at least one field')
    return apiRequest<RestaurantProfile>('/restaurants/me', { method: 'PATCH', body: input })
  },
}

// With VITE_USE_MOCKS=true, GET and PATCH /restaurants/me answer from a sample restaurant (loaded on demand, so
// production builds never ship it); registration and geocoding keep calling the backend.
const loadMock = () => import('./api.mock').then((module) => module.mockRestaurantApi)

export const restaurantApi: RestaurantApi =
  import.meta.env.VITE_USE_MOCKS === 'true'
    ? {
        ...httpRestaurantApi,
        get: async () => (await loadMock()).get(),
        update: async (input) => (await loadMock()).update(input),
      }
    : httpRestaurantApi
