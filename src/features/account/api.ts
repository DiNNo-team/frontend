import { apiRequest } from '@/lib/api-client'
import type { Me } from './types'

/** Who the session is. The role and, for a restaurant, its review state decide where the web sends the person. */
export interface AccountApi {
  /** GET /me: 403 PROFILE_REQUIRED when the Firebase account has no profile yet. */
  getMe: () => Promise<Me>
}

const httpAccountApi: AccountApi = {
  getMe: () => apiRequest<Me>('/me'),
}

// Loaded on demand so production builds (VITE_USE_MOCKS unset) never ship the sample data.
const loadMock = () => import('./api.mock').then((module) => module.mockAccountApi)

/** `VITE_USE_MOCKS=true` answers from the sample account; both follow the same contract. */
export const accountApi: AccountApi =
  import.meta.env.VITE_USE_MOCKS === 'true' ? { getMe: async () => (await loadMock()).getMe() } : httpAccountApi
