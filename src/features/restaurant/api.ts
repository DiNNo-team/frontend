import { apiRequest } from '@/lib/api-client'
import type { RegisterRestaurantInput, RegisterScheduleInput, RestaurantCategory, RestaurantProfile } from './types'

export interface UpdateRestaurantInput {
  name?: string
  category?: RestaurantCategory
  address?: string
  schedules?: RegisterScheduleInput[]
}

/** Restaurant endpoints (contract in types.ts). The restaurant always comes from the session, never from here. */
export interface RestaurantApi {
  get: () => Promise<RestaurantProfile>
  register: (input: RegisterRestaurantInput) => Promise<RestaurantProfile>
  update: (input: UpdateRestaurantInput) => Promise<RestaurantProfile>
}

export const restaurantApi: RestaurantApi = {
  get: () => apiRequest<RestaurantProfile>('/restaurants/me'),
  register: (input) => apiRequest<RestaurantProfile>('/restaurants', { method: 'POST', body: input }),
  update: (input) => {
    if (Object.keys(input).length === 0) throw new Error('Restaurant update requires at least one field')
    return apiRequest<RestaurantProfile>('/restaurants/me', { method: 'PATCH', body: input })
  },
}
