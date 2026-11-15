import { ApiError } from './api-client'

// Shared controls of the sample-data mocks (VITE_USE_MOCKS=true), read from the URL like the older mocks:
// ?mockLatency=3000 (slower) and ?mockError=<operation>[,<operation>]. Under test the default latency is 0.

export function mockParams(): URLSearchParams {
  return typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search)
}

/** Waits like the network would; `?mockLatency=` wins over the default. */
export async function mockWait(defaultMs: number): Promise<void> {
  const fromUrl = mockParams().get('mockLatency')
  const ms = fromUrl === null ? (import.meta.env.MODE === 'test' ? 0 : defaultMs) : Number(fromUrl)
  if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms))
}

/** Fails like a dropped connection when `?mockError=` names the operation. */
export function mockFailIfAsked(operation: string): void {
  if (mockParams().get('mockError')?.split(',').includes(operation)) {
    throw new ApiError({ status: 0, isNetworkError: true, message: `Mock network error on ${operation}` })
  }
}
