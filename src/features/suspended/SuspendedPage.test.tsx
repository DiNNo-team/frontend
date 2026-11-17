import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { RestaurantProfile } from '@/features/restaurant/types'
import { renderWithProviders } from '@/test/render'
import SuspendedPage from './SuspendedPage'

const mocks = vi.hoisted(() => ({ getRestaurant: vi.fn() }))
vi.mock('@/features/restaurant/api', () => ({ restaurantApi: { get: () => mocks.getRestaurant() } }))

const restaurant: RestaurantProfile = {
  id: 'r1', name: 'Casa 16', category: 'colombian', address: 'Calle 72', latitude: null, longitude: null, schedules: [],
  activeReservationsCount: 0, approvalStatus: 'suspended', rejectionReason: null, contactPhone: null,
  suspensionReason: 'Prueba interna del panel de administración',
}

function renderPage() {
  const router = createMemoryRouter([{ path: '/suspendido', element: <SuspendedPage /> }], { initialEntries: ['/suspendido'] })
  return renderWithProviders(<RouterProvider router={router} />)
}

beforeEach(() => vi.clearAllMocks())

describe('SuspendedPage', () => {
  it("says why, keeps the check-in and the summary, and offers nothing of the dashboard's other sections", async () => {
    mocks.getRestaurant.mockResolvedValue(restaurant)
    renderPage()
    expect(await screen.findByRole('heading', { level: 1, name: 'Tu restaurante está suspendido' })).toBeInTheDocument()
    expect(screen.getByText('Prueba interna del panel de administración')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Validar código' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver resumen' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'dinnoteam2026@gmail.com' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Agregar mesa|Cerrar restaurante/ })).not.toBeInTheDocument()
  })

  it('shows an error with «Intentar de nuevo» when the account does not load', async () => {
    mocks.getRestaurant.mockRejectedValue(new Error('x'))
    renderPage()
    expect(await screen.findByRole('button', { name: 'Intentar de nuevo' })).toBeInTheDocument()
  })
})
