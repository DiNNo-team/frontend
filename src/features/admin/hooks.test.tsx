import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Providers } from '@/app/providers'
import { createTestQueryClient } from '@/test/render'
import { mockAdminControl } from './api.mock'
import { useAdminRestaurantQuery, useAdminRestaurantsQuery, useApproveRestaurant, usePendingRestaurantsCount, useRejectRestaurant } from './hooks'

function setup() {
  const queryClient = createTestQueryClient()
  const wrapper = ({ children }: { children: ReactNode }) => <Providers queryClient={queryClient}>{children}</Providers>
  return { wrapper, queryClient }
}

beforeEach(() => mockAdminControl.reset())

// VITE_USE_MOCKS=true in tests: the sample requests answer (4 pending, 2 approved, 1 rejected).
describe('admin hooks', () => {
  it('lists the pending requests oldest first and pages them', async () => {
    const { wrapper } = setup()
    const { result } = renderHook(() => useAdminRestaurantsQuery({ status: 'pending', page: 1, pageSize: 3 }), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.total).toBe(4)
    expect(result.current.data?.items.map((item) => item.name)).toEqual(['Casa Tamarindo', 'Trattoria Nonna Pía', 'Taquería La Esquina'])
  })

  it('counts the pending requests for the badge', async () => {
    const { wrapper } = setup()
    const { result } = renderHook(() => usePendingRestaurantsCount(), { wrapper })
    await waitFor(() => expect(result.current.data).toBe(4))
  })

  it('loads one request, and does not ask without an id', async () => {
    const { wrapper } = setup()
    const idle = renderHook(() => useAdminRestaurantQuery(null), { wrapper })
    expect(idle.result.current.fetchStatus).toBe('idle')
    const { result } = renderHook(() => useAdminRestaurantQuery('mock-pending-1'), { wrapper })
    await waitFor(() => expect(result.current.data?.name).toBe('Casa Tamarindo'))
    expect(result.current.data?.schedules.length).toBeGreaterThan(0)
  })

  it('approving moves the request out of the pending list', async () => {
    const { wrapper } = setup()
    const approve = renderHook(() => useApproveRestaurant(), { wrapper })
    await act(async () => {
      await approve.result.current.mutateAsync({ id: 'mock-pending-1' })
    })
    const { result } = renderHook(() => useAdminRestaurantsQuery({ status: 'approved', page: 1, pageSize: 20 }), { wrapper })
    await waitFor(() => expect(result.current.data?.total).toBe(3))
    expect(result.current.data?.items[0].name).toBe('Casa Tamarindo')
  })

  it('rejecting keeps the trimmed reason, and a second review is a 409 RESTAURANT_NOT_PENDING', async () => {
    const { wrapper } = setup()
    const reject = renderHook(() => useRejectRestaurant(), { wrapper })
    let detail
    await act(async () => {
      detail = await reject.result.current.mutateAsync({ id: 'mock-pending-2', reason: '  Teléfono sin respuesta, revísalo.  ' })
    })
    expect(detail).toMatchObject({ approvalStatus: 'rejected', rejectionReason: 'Teléfono sin respuesta, revísalo.' })
    await act(async () => {
      await expect(reject.result.current.mutateAsync({ id: 'mock-pending-2', reason: 'Otro motivo válido.' })).rejects.toMatchObject({
        status: 409,
        code: 'RESTAURANT_NOT_PENDING',
      })
    })
  })
})
