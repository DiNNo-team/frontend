import { apiRequest } from '@/lib/api-client'
import type { RestaurantStatus } from './types'

/** Open/closed endpoints (contract in types.ts). The restaurant always comes from the session, never from here. */
export interface RestaurantStatusApi {
  get: () => Promise<RestaurantStatus>
  update: (isOpen: boolean) => Promise<RestaurantStatus>
}

const httpRestaurantStatusApi: RestaurantStatusApi = {
  get: () => apiRequest<RestaurantStatus>('/restaurants/me/status'),
  update: (isOpen) => apiRequest<RestaurantStatus>('/restaurants/me/status', { method: 'PATCH', body: { isOpen } }),
}

// Loaded on demand so production builds (VITE_USE_MOCKS unset) never ship the sample data.
const loadMock = () => import('./api.mock').then((module) => module.mockRestaurantStatusApi)

const lazyMockRestaurantStatusApi: RestaurantStatusApi = {
  get: async () => (await loadMock()).get(),
  update: async (isOpen) => (await loadMock()).update(isOpen),
}

/** `VITE_USE_MOCKS=true` switches to the in-memory mock; both follow the same contract. */
export const restaurantStatusApi: RestaurantStatusApi =
  import.meta.env.VITE_USE_MOCKS === 'true' ? lazyMockRestaurantStatusApi : httpRestaurantStatusApi
