import { apiRequest } from '@/lib/api-client'
import type { RegisterRestaurantInput, RestaurantProfile } from './types'

/** Restaurant endpoints (contract in types.ts). The restaurant always comes from the session, never from here. */
export interface RestaurantApi {
  register: (input: RegisterRestaurantInput) => Promise<RestaurantProfile>
}

export const restaurantApi: RestaurantApi = {
  register: (input) => apiRequest<RestaurantProfile>('/restaurants', { method: 'POST', body: input }),
}
