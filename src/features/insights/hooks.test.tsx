import { afterEach, describe, expect, it } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Providers } from '@/app/providers'
import { ApiError } from '@/lib/api-client'
import { createTestQueryClient } from '@/test/render'
import { useInsightsQuery, useRefreshInsights } from './hooks'

function setup() {
  const queryClient = createTestQueryClient()
  const wrapper = ({ children }: { children: ReactNode }) => <Providers queryClient={queryClient}>{children}</Providers>
  return renderHook(() => ({ report: useInsightsQuery(), refresh: useRefreshInsights() }), { wrapper })
}

const useUrl = (search: string) => window.history.replaceState(null, '', `/informe${search}`)

// VITE_USE_MOCKS=true in tests: the sample report answers.
describe('insights hooks', () => {
  afterEach(() => useUrl(''))

  it('loads the report from the cache side (an older generatedAt)', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.report.isSuccess).toBe(true))
    expect(result.current.report.data?.metrics.daily).toHaveLength(7)
    expect(Date.parse(result.current.report.data?.generatedAt ?? '')).toBeLessThan(Date.now() - 60_000)
  })

  it('«Actualizar» puts the new report in the cache, without clearing the one on screen meanwhile', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.report.isSuccess).toBe(true))
    const before = result.current.report.data
    act(() => result.current.refresh.mutate())
    expect(result.current.report.data).toBe(before)
    await waitFor(() => expect(result.current.refresh.isSuccess).toBe(true))
    expect(result.current.report.data?.generatedAt).not.toBe(before?.generatedAt)
  })

  it('a 429 on «Actualizar» keeps the report it had and is not retried', async () => {
    useUrl('?mockRateLimit')
    const { result } = setup()
    await waitFor(() => expect(result.current.report.isSuccess).toBe(true))
    const before = result.current.report.data
    act(() => result.current.refresh.mutate())
    await waitFor(() => expect(result.current.refresh.isError).toBe(true))
    expect((result.current.refresh.error as ApiError).status).toBe(429)
    expect(result.current.refresh.failureCount).toBe(1)
    expect(result.current.report.data).toBe(before)
  })

  it('a 429 on the first load is an error of the query, not retried', async () => {
    useUrl('?mockRateLimit=all')
    const { result } = setup()
    await waitFor(() => expect(result.current.report.isError).toBe(true))
    expect((result.current.report.error as ApiError).status).toBe(429)
    expect(result.current.report.failureCount).toBe(1)
  })

  it('follows the scenario of the URL', async () => {
    useUrl('?mockInsights=insufficient')
    const { result } = setup()
    await waitFor(() => expect(result.current.report.isSuccess).toBe(true))
    expect(result.current.report.data?.dataSufficiency).toBe('insufficient')
  })
})
