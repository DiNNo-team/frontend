import { apiRequest } from '@/lib/api-client'
import type { RestaurantProfile } from '@/features/restaurant/types'
import type { SignupRestaurantInput } from './types'

export interface SignupApi {
  /** 201 with the restaurant in review. 409: already registered. 403 DINER_ACCOUNT / ADMIN_ACCOUNT: not a restaurant account. */
  signup: (input: SignupRestaurantInput) => Promise<RestaurantProfile>
}

const httpSignupApi: SignupApi = {
  signup: (input) => apiRequest<RestaurantProfile>('/restaurants/signup', { method: 'POST', body: input }),
}

// Loaded on demand so production builds never ship the sample data.
const loadMock = () => import('./api.mock').then((module) => module.mockSignupApi)

export const signupApi: SignupApi =
  import.meta.env.VITE_USE_MOCKS === 'true' ? { signup: async (input) => (await loadMock()).signup(input) } : httpSignupApi
