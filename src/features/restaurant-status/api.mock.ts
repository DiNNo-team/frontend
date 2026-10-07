import { ApiError } from '@/lib/api-client'
import type { RestaurantStatusApi } from './api'

// In-memory stand-in for the open/closed backend while it is not deployed. Same contract.
// Start closed: ?mockClosed · force errors: ?mockError=restaurant-status-load or ?mockError=restaurant-status-save
// (comma-separated, shared with the tables mock) · slower responses: ?mockLatency=3000

export type MockRestaurantStatusOperation = 'restaurant-status-load' | 'restaurant-status-save'

function urlParams(): URLSearchParams {
  return typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search)
}

let isOpen = !urlParams().has('mockClosed')
let latencyMs = Number(urlParams().get('mockLatency') ?? 400)
const forcedFailures = new Set<MockRestaurantStatusOperation>()

/** Test and dev controls. */
export const mockRestaurantStatusControl = {
  reset(next = true) {
    isOpen = next
    forcedFailures.clear()
  },
  setLatency(ms: number) {
    latencyMs = ms
  },
  failOn(operation: MockRestaurantStatusOperation) {
    forcedFailures.add(operation)
  },
  clearFailures() {
    forcedFailures.clear()
  },
  isOpen(): boolean {
    return isOpen
  },
}

async function simulate(operation: MockRestaurantStatusOperation) {
  if (latencyMs > 0) await new Promise((resolve) => setTimeout(resolve, latencyMs))
  const fromUrl = urlParams().get('mockError')?.split(',') ?? []
  if (forcedFailures.has(operation) || fromUrl.includes(operation)) {
    throw new ApiError({ status: 0, isNetworkError: true, message: `Mock network error on ${operation}` })
  }
}

export const mockRestaurantStatusApi: RestaurantStatusApi = {
  async get() {
    await simulate('restaurant-status-load')
    return { isOpen }
  },
  async update(next) {
    await simulate('restaurant-status-save')
    // Like the backend: the same value is a valid no-op.
    isOpen = next
    return { isOpen }
  },
}
