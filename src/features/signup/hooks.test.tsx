import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Providers } from '@/app/providers'
import { restaurantQueryKey } from '@/features/restaurant/hooks'
import type { RestaurantProfile } from '@/features/restaurant/types'
import { createTestQueryClient } from '@/test/render'
import { useSignupRestaurant } from './hooks'

describe('useSignupRestaurant', () => {
  it('registers the restaurant in review, normalizes the phone and fills the restaurant cache', async () => {
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: ReactNode }) => <Providers queryClient={queryClient}>{children}</Providers>
    const { result } = renderHook(() => useSignupRestaurant(), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({
        name: 'Casa Tamarindo',
        category: 'colombian',
        address: 'Carrera 7 # 72-41, Bogotá',
        schedules: [{ dayOfWeek: 1, isOpen24h: true }],
        contactPhone: '+57 300 123 4567',
      })
    })
    expect(queryClient.getQueryData<RestaurantProfile>(restaurantQueryKey)).toMatchObject({
      name: 'Casa Tamarindo',
      approvalStatus: 'pending',
      contactPhone: '+573001234567',
    })
  })
})
