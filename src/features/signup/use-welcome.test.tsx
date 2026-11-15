import { beforeEach, describe, expect, it } from 'vitest'
import { renderHook, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Providers } from '@/app/providers'
import type { RestaurantProfile } from '@/features/restaurant/types'
import { createTestQueryClient } from '@/test/render'
import { markAwaitingApproval, takeAwaitingApproval, useWelcomeAfterApproval } from './use-welcome'

const wrapper = ({ children }: { children: ReactNode }) => <Providers queryClient={createTestQueryClient()}>{children}</Providers>
const restaurant = (approvalStatus: RestaurantProfile['approvalStatus']): RestaurantProfile => ({
  id: 'r1', name: 'Casa 72', category: null, address: null, latitude: null, longitude: null, schedules: [],
  activeReservationsCount: 0, approvalStatus, rejectionReason: null, contactPhone: null,
})

beforeEach(() => window.localStorage.clear())

describe('welcome after the approval', () => {
  it('a mark is taken once', () => {
    markAwaitingApproval('r1')
    expect(takeAwaitingApproval('r1')).toBe(true)
    expect(takeAwaitingApproval('r1')).toBe(false)
  })

  it('welcomes once when the dashboard sees the restaurant approved after waiting', async () => {
    markAwaitingApproval('r1')
    const { rerender } = renderHook(({ value }) => useWelcomeAfterApproval(value), { wrapper, initialProps: { value: restaurant('approved') } })
    expect(await screen.findByText('Tu restaurante fue aprobado. Bienvenido a DiNNo.')).toBeInTheDocument()
    rerender({ value: restaurant('approved') })
    expect(screen.getAllByText('Tu restaurante fue aprobado. Bienvenido a DiNNo.')).toHaveLength(1)
    expect(window.localStorage.getItem('dinno:awaiting-approval:r1')).toBeNull()
  })

  it('says nothing to a restaurant that never waited, or that is not approved', () => {
    renderHook(() => useWelcomeAfterApproval(restaurant('approved')), { wrapper })
    renderHook(() => useWelcomeAfterApproval(restaurant('pending')), { wrapper })
    expect(screen.queryByText('Tu restaurante fue aprobado. Bienvenido a DiNNo.')).not.toBeInTheDocument()
  })
})
