import { describe, expect, it } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Providers } from '@/app/providers'
import { createTestQueryClient } from '@/test/render'
import { BILLING_PAGE_SIZE } from './types'
import { useBillingQuery, useSummaryQuery } from './hooks'

const wrapper = ({ children }: { children: ReactNode }) => <Providers queryClient={createTestQueryClient()}>{children}</Providers>
const PERIOD = { from: '2026-11-01', to: '2026-11-15' }

// VITE_USE_MOCKS=true in tests: the sample reports answer.
describe('summary hooks', () => {
  it('useSummaryQuery asks for the period and returns the summary', async () => {
    const { result } = renderHook(() => useSummaryQuery(PERIOD), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.period).toEqual({ ...PERIOD, timezone: 'America/Bogota' })
    expect(result.current.data?.billing).toEqual({ checkIns: 12, amountCop: 24000, currentFeeCop: 2000 })
    expect(result.current.data?.byDayOfWeek).toHaveLength(7)
  })

  it('does not ask while there is no valid period', () => {
    const { result } = renderHook(() => useSummaryQuery(null), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('useBillingQuery pages the check-ins and keeps the totals of the whole period', async () => {
    const { result, rerender } = renderHook(({ page }) => useBillingQuery(PERIOD, page, 5), { wrapper, initialProps: { page: 1 } })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items).toHaveLength(5)
    expect(result.current.data?.totalCheckIns).toBe(12)
    expect(result.current.data?.amountCop).toBe(24000)
    rerender({ page: 3 })
    await waitFor(() => expect(result.current.data?.page).toBe(3))
    expect(result.current.data?.items).toHaveLength(2)
    expect(BILLING_PAGE_SIZE).toBe(50)
  })
})
