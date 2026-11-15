import { ApiError, RESTAURANT_REQUIRED_CODE } from '@/lib/api-client'
import type { Me } from './types'
import type { RestaurantProfile } from '@/features/restaurant/types'

/**
 * Where an account stands (CLAUDE.md §10 and §12.12). The role comes from GET /me and, for a restaurant, its review
 * state from GET /restaurants/me. One table decides every screen the person may open.
 */
export type AccessKind =
  | 'no-profile' // Firebase account without a profile: goes to the public registration
  | 'diner' // App-only account
  | 'admin' // DiNNo administrator
  | 'restaurant-required' // Restaurant account enabled by the team, still without a restaurant: /onboarding
  | 'pending' // Restaurant under review
  | 'rejected' // Restaurant not approved: sees the reason and can correct and resend
  | 'approved' // Operates

export type Access =
  | { status: 'loading' }
  | { status: 'error'; error: unknown }
  | { status: 'ready'; kind: AccessKind }

interface QuerySnapshot<T> {
  data?: T
  error?: unknown
  isPending: boolean
}

const NO_PROFILE_CODES = new Set(['PROFILE_REQUIRED', 'ACCOUNT_NOT_ENABLED'])

/** A server answer by code. Data already in hand wins over a later failure (a poll that fails does not unseat the screen). */
function hasCode(error: unknown, codes: ReadonlySet<string> | string): boolean {
  if (!(error instanceof ApiError) || error.code === undefined) return false
  return typeof codes === 'string' ? error.code === codes : codes.has(error.code)
}

function restaurantAccess(restaurant: QuerySnapshot<RestaurantProfile>): Access {
  if (restaurant.data) return { status: 'ready', kind: restaurant.data.approvalStatus }
  if (restaurant.isPending) return { status: 'loading' }
  if (hasCode(restaurant.error, RESTAURANT_REQUIRED_CODE)) return { status: 'ready', kind: 'restaurant-required' }
  return { status: 'error', error: restaurant.error }
}

/** Pure: the account's state from the two queries. `restaurant` is only read for a restaurant account. */
export function resolveAccess(me: QuerySnapshot<Me>, restaurant: QuerySnapshot<RestaurantProfile>): Access {
  if (me.data) {
    if (me.data.role === 'platform_admin') return { status: 'ready', kind: 'admin' }
    if (me.data.role === 'diner') return { status: 'ready', kind: 'diner' }
    return restaurantAccess(restaurant)
  }
  if (me.isPending) return { status: 'loading' }
  if (hasCode(me.error, NO_PROFILE_CODES)) return { status: 'ready', kind: 'no-profile' }
  // 401 (session ended, email not verified): the session flow acts on it; meanwhile this is still "loading".
  if (me.error instanceof ApiError && me.error.status === 401) return { status: 'loading' }
  return { status: 'error', error: me.error }
}

/** Where each state lives. `null`: there is no route for it, so the guard shows the account screen where it stands. */
export const ACCESS_HOME: Record<AccessKind, string | null> = {
  'no-profile': null,
  diner: null,
  admin: null,
  'restaurant-required': '/onboarding',
  pending: null,
  rejected: null,
  approved: '/mesas',
}
