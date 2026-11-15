import { ApiError } from '@/lib/api-client'
import { mockFailIfAsked, mockParams, mockWait } from '@/lib/mock-env'
import type { AccountApi } from './api'
import type { Me, UserRole } from './types'

// Stand-in for GET /me with VITE_USE_MOCKS=true. Who the session is: ?mockRole=admin | diner | none (no profile);
// without it, a restaurant. The restaurant's review state is in the restaurant mock (?mockApproval=pending | rejected).
// Error: ?mockError=me-load · slower: ?mockLatency=3000 (shared).

const ROLES: Record<string, UserRole> = { admin: 'platform_admin', diner: 'diner' }

export const mockAccountApi: Pick<AccountApi, 'getMe'> = {
  async getMe(): Promise<Me> {
    await mockWait(300)
    mockFailIfAsked('me-load')
    const mockRole = mockParams().get('mockRole')
    if (mockRole === 'none') throw new ApiError({ status: 403, code: 'PROFILE_REQUIRED' })
    const role = ROLES[mockRole ?? ''] ?? 'restaurant_admin'
    return {
      id: 'mock-user',
      email: role === 'platform_admin' ? 'admin@dinno.test' : 'admin@casa72.co',
      displayName: null,
      role,
      restaurantId: role === 'restaurant_admin' ? 'mock-restaurant' : null,
    }
  },
}
