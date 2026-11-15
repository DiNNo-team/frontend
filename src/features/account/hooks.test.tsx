import { describe, expect, it } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Providers } from '@/app/providers'
import { createTestQueryClient } from '@/test/render'
import { useMeQuery } from './hooks'

const wrapper = ({ children }: { children: ReactNode }) => <Providers queryClient={createTestQueryClient()}>{children}</Providers>

describe('useMeQuery', () => {
  it('answers the role of the session (sample restaurant account with VITE_USE_MOCKS=true)', async () => {
    const { result } = renderHook(() => useMeQuery(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ role: 'restaurant_admin', restaurantId: 'mock-restaurant' })
  })

  it('does not ask until the session is ready', () => {
    const { result } = renderHook(() => useMeQuery({ enabled: false }), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })
})
