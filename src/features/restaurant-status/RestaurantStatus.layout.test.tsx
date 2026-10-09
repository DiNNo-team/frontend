import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import type { User } from 'firebase/auth'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { DashboardLayout } from '@/app/layouts'
import { AuthContext, type AuthContextValue } from '@/features/auth/auth-context'
import { mockTablesControl } from '@/features/tables/api.mock'
import { renderWithProviders } from '@/test/render'
import { mockRestaurantStatusControl } from './api.mock'

// Async factories: the layout imports both APIs while the mocks are still loading.
vi.mock('./api', async () => ({ restaurantStatusApi: (await import('./api.mock')).mockRestaurantStatusApi }))
vi.mock('@/features/tables/api', async () => ({ tablesApi: (await import('@/features/tables/api.mock')).mockTablesApi }))

// Signed-in session as the AuthProvider exposes it (Firebase replaced by a fixed value).
const SESSION: AuthContextValue = {
  user: { uid: 'restaurant-owner', displayName: 'Casa 72', email: 'admin@casa72.co' } as User,
  loading: false,
  emailVerified: true,
  authEvent: null,
  clearAuthEvent: vi.fn(),
  emailVerificationRetried: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
  reenviarVerificacion: vi.fn(),
  refrescarSesion: vi.fn(),
}

beforeEach(() => {
  mockRestaurantStatusControl.reset()
  mockRestaurantStatusControl.setLatency(0)
  mockTablesControl.reset()
  mockTablesControl.setLatency(0)
})

// The real DashboardLayout (Jacobo's session wiring) with the real statusSlot and banner.
function renderDashboard() {
  const router = createMemoryRouter(
    [{ element: <DashboardLayout />, children: [{ path: '/mesas', element: <p>Contenido</p> }] }],
    { initialEntries: ['/mesas'] },
  )
  return renderWithProviders(
    <AuthContext.Provider value={SESSION}>
      <RouterProvider router={router} />
    </AuthContext.Provider>,
  )
}

describe('RestaurantStatus inside the DashboardLayout with a session', () => {
  it('shows the switch in the topbar next to the session restaurant name', async () => {
    renderDashboard()
    const topbar = screen.getByRole('banner')
    expect(within(topbar).getByText('Casa 72')).toBeInTheDocument()
    expect(await within(topbar).findByRole('switch', { name: 'Estado del restaurante Abierto' })).toBeChecked()
  })

  it('closing from the topbar shows the closed banner above the content', async () => {
    mockTablesControl.reset([])
    const { user } = renderDashboard()
    await user.click(await screen.findByRole('switch', { name: /Estado del restaurante/ }))

    const main = screen.getByRole('main')
    expect(await within(main).findByText('Tu restaurante está cerrado. Los comensales no lo ven en DiNNo.')).toBeInTheDocument()
    expect(within(main).getByText('Contenido')).toBeInTheDocument()
  })
})
