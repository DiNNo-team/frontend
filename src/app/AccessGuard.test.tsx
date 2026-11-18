import { useMemo, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { User } from 'firebase/auth'
import { ApiError } from '@/lib/api-client'
import { AuthContext, type AuthContextValue, type AuthEvent } from '@/features/auth/auth-context'
import type { Me, UserRole } from '@/features/account/types'
import type { RestaurantProfile } from '@/features/restaurant/types'
import { renderWithProviders } from '@/test/render'
import { AccessGuard } from './AccessGuard'

const mocks = vi.hoisted(() => ({ getMe: vi.fn(), getRestaurant: vi.fn(), signOut: vi.fn() }))
vi.mock('@/features/account/api', () => ({ accountApi: { getMe: () => mocks.getMe() } }))
vi.mock('@/features/restaurant/api', () => ({ restaurantApi: { get: () => mocks.getRestaurant() } }))

const me = (role: UserRole): Me => ({ id: 'u1', email: 'a@b.co', displayName: null, role, restaurantId: null })
const restaurant = (approvalStatus: RestaurantProfile['approvalStatus']): RestaurantProfile => ({
  id: 'r1', name: 'Casa 72', category: 'colombian', address: 'Calle 72', latitude: null, longitude: null, schedules: [],
  activeReservationsCount: 0, approvalStatus, rejectionReason: null, contactPhone: null,
})

function Auth({ authEvent, children }: { authEvent: AuthEvent | null; children: ReactNode }) {
  const value = useMemo<AuthContextValue>(
    () => ({
      user: { uid: 'u1', email: 'a@b.co' } as User, loading: false, emailVerified: true, authEvent, accountEvent: null,
      emailVerificationRetried: false, clearAuthEvent: () => undefined, clearAccountEvent: () => undefined,
      signIn: async () => undefined, signUp: async () => undefined, signInWithGoogle: async () => true, sendPasswordReset: async () => undefined,
      signOut: mocks.signOut, reenviarVerificacion: async () => undefined, refrescarSesion: async () => undefined,
    }),
    [authEvent],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function renderGuarded(allow: Parameters<typeof AccessGuard>[0]['allow'], authEvent: AuthEvent | null = null) {
  const router = createMemoryRouter(
    [
      { element: <AccessGuard allow={allow} />, children: [{ path: '/aqui', element: <p>Contenido protegido</p> }] },
      { path: '/mesas', element: <p>Pantalla de mesas</p> },
      { path: '/onboarding', element: <p>Pantalla de registro</p> },
      { path: '/solicitud', element: <p>Pantalla de solicitud</p> },
      { path: '/registro', element: <p>Pantalla de inscripción</p> },
      { path: '/admin', element: <p>Panel de administración</p> },
      { path: '/suspendido', element: <p>Pantalla de suspendido</p> },
    ],
    { initialEntries: ['/aqui'] },
  )
  renderWithProviders(
    <Auth authEvent={authEvent}>
      <RouterProvider router={router} />
    </Auth>,
  )
  return router
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.signOut.mockResolvedValue(undefined)
})

describe('AccessGuard', () => {
  it('shows the session skeleton while it asks who the account is, with no flash of content', async () => {
    mocks.getMe.mockReturnValue(new Promise(() => undefined))
    renderGuarded(['approved'])
    expect(await screen.findByRole('status')).toHaveTextContent('Comprobando tu sesión')
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  it('lets an approved restaurant through', async () => {
    mocks.getMe.mockResolvedValue(me('restaurant_admin'))
    mocks.getRestaurant.mockResolvedValue(restaurant('approved'))
    renderGuarded(['approved'])
    expect(await screen.findByText('Contenido protegido')).toBeInTheDocument()
  })

  it('sends an approved restaurant away from the pages of the registration to the tables', async () => {
    mocks.getMe.mockResolvedValue(me('restaurant_admin'))
    mocks.getRestaurant.mockResolvedValue(restaurant('approved'))
    const router = renderGuarded(['restaurant-required'])
    await waitFor(() => expect(router.state.location.pathname).toBe('/mesas'))
  })

  it('sends an account without restaurant to the registration of its restaurant', async () => {
    mocks.getMe.mockResolvedValue(me('restaurant_admin'))
    mocks.getRestaurant.mockRejectedValue(new ApiError({ status: 403, code: 'RESTAURANT_REQUIRED' }))
    const router = renderGuarded(['approved'])
    await waitFor(() => expect(router.state.location.pathname).toBe('/onboarding'))
  })

  it.each(['pending', 'rejected'] as const)('sends a restaurant that is %s to its request, not to the dashboard', async (state) => {
    mocks.getMe.mockResolvedValue(me('restaurant_admin'))
    mocks.getRestaurant.mockResolvedValue(restaurant(state))
    const router = renderGuarded(['approved'])
    await waitFor(() => expect(router.state.location.pathname).toBe('/solicitud'))
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  it('sends a suspended restaurant to its own screen, from the tables or from anywhere else it cannot use', async () => {
    mocks.getMe.mockResolvedValue(me('restaurant_admin'))
    mocks.getRestaurant.mockResolvedValue(restaurant('suspended'))
    const router = renderGuarded(['approved'])
    await waitFor(() => expect(router.state.location.pathname).toBe('/suspendido'))
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  it('lets a suspended restaurant into the pages it keeps (summary, its account screen)', async () => {
    mocks.getMe.mockResolvedValue(me('restaurant_admin'))
    mocks.getRestaurant.mockResolvedValue(restaurant('suspended'))
    renderGuarded(['approved', 'suspended'])
    expect(await screen.findByText('Contenido protegido')).toBeInTheDocument()
  })

  it('sends an approved restaurant away from the suspended screen to its tables', async () => {
    mocks.getMe.mockResolvedValue(me('restaurant_admin'))
    mocks.getRestaurant.mockResolvedValue(restaurant('approved'))
    const router = renderGuarded(['suspended'])
    await waitFor(() => expect(router.state.location.pathname).toBe('/mesas'))
  })

  it('lets a pending or rejected restaurant into the request screen, and sends an approved one to its tables', async () => {
    mocks.getMe.mockResolvedValue(me('restaurant_admin'))
    mocks.getRestaurant.mockResolvedValue(restaurant('rejected'))
    renderGuarded(['pending', 'rejected'])
    expect(await screen.findByText('Contenido protegido')).toBeInTheDocument()
  })

  it('sends an approved restaurant that opens the request screen to its tables', async () => {
    mocks.getMe.mockResolvedValue(me('restaurant_admin'))
    mocks.getRestaurant.mockResolvedValue(restaurant('approved'))
    const router = renderGuarded(['pending', 'rejected'])
    await waitFor(() => expect(router.state.location.pathname).toBe('/mesas'))
  })

  it('keeps the administrator out of the restaurant pages and takes it to its panel', async () => {
    mocks.getMe.mockResolvedValue(me('platform_admin'))
    const router = renderGuarded(['approved'])
    await waitFor(() => expect(router.state.location.pathname).toBe('/admin'))
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  it('lets the administrator into the panel, and sends a restaurant that is not one away from it', async () => {
    mocks.getMe.mockResolvedValue(me('platform_admin'))
    renderGuarded(['admin'])
    expect(await screen.findByText('Contenido protegido')).toBeInTheDocument()
  })

  it('an approved restaurant that opens the administrator panel goes to its tables', async () => {
    mocks.getMe.mockResolvedValue(me('restaurant_admin'))
    mocks.getRestaurant.mockResolvedValue(restaurant('approved'))
    const router = renderGuarded(['admin'])
    await waitFor(() => expect(router.state.location.pathname).toBe('/mesas'))
  })

  it('shows the diner account screen with only the sign out action', async () => {
    mocks.getMe.mockResolvedValue(me('diner'))
    renderGuarded(['approved'])
    expect(await screen.findByText('Esta es una cuenta de comensal. Para buscar mesa, usa la app DiNNo.')).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })

  it('sends an account without a profile to the public registration', async () => {
    mocks.getMe.mockRejectedValue(new ApiError({ status: 403, code: 'PROFILE_REQUIRED' }))
    const router = renderGuarded(['approved'])
    await waitFor(() => expect(router.state.location.pathname).toBe('/registro'))
  })

  it('shows a clear error with a retry when the account cannot be checked, and retries', async () => {
    mocks.getMe.mockRejectedValueOnce(new ApiError({ status: 0, isNetworkError: true })).mockResolvedValue(me('restaurant_admin'))
    mocks.getRestaurant.mockResolvedValue(restaurant('approved'))
    const { user } = renderWithProviders(
      <Auth authEvent={null}>
        <RouterProvider
          router={createMemoryRouter([{ element: <AccessGuard allow={['approved']} />, children: [{ path: '/aqui', element: <p>Contenido protegido</p> }] }], {
            initialEntries: ['/aqui'],
          })}
        />
      </Auth>,
    )
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos comprobar tu cuenta. Revisa tu conexión e intenta de nuevo.')
    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
    expect(await screen.findByText('Contenido protegido')).toBeInTheDocument()
  })

  it('shows the email verification screen before asking anything', async () => {
    renderGuarded(['approved'], 'email-not-verified')
    expect(await screen.findByRole('heading', { name: 'Verifica tu correo para continuar.' })).toBeInTheDocument()
    expect(mocks.getMe).not.toHaveBeenCalled()
  })
})
