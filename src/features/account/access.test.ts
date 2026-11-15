import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api-client'
import type { RestaurantProfile } from '@/features/restaurant/types'
import { ACCESS_HOME, resolveAccess } from './access'
import type { Me, UserRole } from './types'

const me = (role: UserRole): Me => ({ id: 'u1', email: 'a@b.co', displayName: null, role, restaurantId: role === 'restaurant_admin' ? 'r1' : null })
const restaurant = (approvalStatus: RestaurantProfile['approvalStatus']): RestaurantProfile => ({
  id: 'r1', name: 'Casa 72', category: 'colombian', address: 'Calle 72', latitude: null, longitude: null, schedules: [],
  activeReservationsCount: 0, approvalStatus, rejectionReason: null, contactPhone: null,
})
const idle = { isPending: false }
const loading = { isPending: true }

describe('resolveAccess · the table of the account states', () => {
  it('waits while /me loads', () => {
    expect(resolveAccess(loading, idle)).toEqual({ status: 'loading' })
  })

  it.each([
    ['PROFILE_REQUIRED'],
    ['ACCOUNT_NOT_ENABLED'],
  ])('%s means the Firebase account has no profile', (code) => {
    expect(resolveAccess({ ...idle, error: new ApiError({ status: 403, code }) }, idle)).toEqual({ status: 'ready', kind: 'no-profile' })
  })

  it('a 401 of /me is still loading: the session flow acts on it', () => {
    expect(resolveAccess({ ...idle, error: new ApiError({ status: 401 }) }, idle)).toEqual({ status: 'loading' })
  })

  it('a network or server failure of /me is an error the person can retry', () => {
    const error = new ApiError({ status: 0, isNetworkError: true })
    expect(resolveAccess({ ...idle, error }, idle)).toEqual({ status: 'error', error })
  })

  it('platform_admin and diner do not need the restaurant', () => {
    expect(resolveAccess({ ...idle, data: me('platform_admin') }, loading)).toEqual({ status: 'ready', kind: 'admin' })
    expect(resolveAccess({ ...idle, data: me('diner') }, loading)).toEqual({ status: 'ready', kind: 'diner' })
  })

  it('a restaurant account waits for its restaurant, then follows its review state', () => {
    expect(resolveAccess({ ...idle, data: me('restaurant_admin') }, loading)).toEqual({ status: 'loading' })
    for (const state of ['pending', 'rejected', 'approved'] as const) {
      expect(resolveAccess({ ...idle, data: me('restaurant_admin') }, { ...idle, data: restaurant(state) })).toEqual({ status: 'ready', kind: state })
    }
  })

  it('RESTAURANT_REQUIRED sends the account to the registration of its restaurant', () => {
    const error = new ApiError({ status: 403, code: 'RESTAURANT_REQUIRED' })
    expect(resolveAccess({ ...idle, data: me('restaurant_admin') }, { ...idle, error })).toEqual({ status: 'ready', kind: 'restaurant-required' })
  })

  it('data in hand wins over a later failure of the same query', () => {
    const failed = { ...idle, data: restaurant('pending'), error: new ApiError({ status: 0, isNetworkError: true }) }
    expect(resolveAccess({ ...idle, data: me('restaurant_admin') }, failed)).toEqual({ status: 'ready', kind: 'pending' })
  })

  it('any other failure of the restaurant is an error, not a guess', () => {
    const error = new ApiError({ status: 500 })
    expect(resolveAccess({ ...idle, data: me('restaurant_admin') }, { ...idle, error })).toEqual({ status: 'error', error })
  })

  it('only some states have a route of their own', () => {
    expect(ACCESS_HOME.approved).toBe('/mesas')
    expect(ACCESS_HOME['restaurant-required']).toBe('/onboarding')
  })
})
