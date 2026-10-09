import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import type { User } from 'firebase/auth'
import { renderWithProviders } from '@/test/render'
import { AuthContext, type AuthContextValue, type AuthEvent } from '@/features/auth/auth-context'
import { routes } from './router'

vi.mock('@/features/restaurant-status/components/RestaurantStatusBanner', () => ({ RestaurantStatusBanner: () => null }))
vi.mock('@/features/restaurant-status/components/RestaurantStatusControl', () => ({ RestaurantStatusControl: () => null }))

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  reenviarVerificacion: vi.fn(),
  refrescarSesion: vi.fn(),
  clearAuthEvent: vi.fn(),
}))

const AUTH_USER = {
  uid: 'restaurant-owner',
  displayName: 'Casa 72',
  email: 'admin@casa72.co',
} as User

interface AuthState {
  user: User | null
  loading: boolean
  emailVerified: boolean
  authEvent: AuthEvent | null
  emailVerificationRetried: boolean
}

const SIGNED_OUT: AuthState = {
  user: null,
  loading: false,
  emailVerified: false,
  authEvent: null,
  emailVerificationRetried: false,
}
const SIGNED_IN: AuthState = { ...SIGNED_OUT, user: AUTH_USER, emailVerified: true }

function MockAuthProvider({ initialState, children }: { initialState: AuthState; children: ReactNode }) {
  const [state, setState] = useState(initialState)
  const signIn = useCallback(async (email: string, password: string) => {
    await mocks.signIn(email, password)
    setState({ ...SIGNED_IN, user: AUTH_USER })
  }, [])
  const signOut = useCallback(async () => {
    await mocks.signOut()
    setState(SIGNED_OUT)
  }, [])
  const reenviarVerificacion = useCallback(async () => {
    await mocks.reenviarVerificacion()
  }, [])
  const refrescarSesion = useCallback(async () => {
    await mocks.refrescarSesion()
    setState((current) => ({ ...current, authEvent: null, emailVerificationRetried: true }))
  }, [])
  const clearAuthEvent = useCallback(() => {
    mocks.clearAuthEvent()
    setState((current) => ({ ...current, authEvent: null }))
  }, [])
  const value = useMemo<AuthContextValue>(
    () => ({ ...state, signIn, signOut, clearAuthEvent, reenviarVerificacion, refrescarSesion }),
    [state, signIn, signOut, clearAuthEvent, reenviarVerificacion, refrescarSesion],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function renderAt(path: string, authState = SIGNED_OUT) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const renderResult = renderWithProviders(
    <MockAuthProvider initialState={authState}>
      <RouterProvider router={router} />
    </MockAuthProvider>,
  )
  return { router, ...renderResult }
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.signIn.mockResolvedValue(undefined)
  mocks.signOut.mockResolvedValue(undefined)
  mocks.reenviarVerificacion.mockResolvedValue(undefined)
  mocks.refrescarSesion.mockResolvedValue(undefined)
})

describe('authentication routes', () => {
  it('redirects signed-out visitors to login and returns to the original internal route after sign-in', async () => {
    const { router, user } = renderAt('/bitacora?period=week')
    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect(router.state.location.state).toEqual({ from: '/bitacora?period=week' })

    await user.type(screen.getByLabelText('Correo'), 'admin@casa72.co')
    await user.type(screen.getByLabelText('Contraseña'), 'secreta')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/bitacora'))
    expect(router.state.location.search).toBe('?period=week')
    expect(mocks.signIn).toHaveBeenCalledWith('admin@casa72.co', 'secreta')
  })

  it('sends an authenticated visitor away from login to the safe return route', async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: [{ pathname: '/login', state: { from: '/bitacora?period=week' } }],
    })
    renderWithProviders(
      <MockAuthProvider initialState={SIGNED_IN}>
        <RouterProvider router={router} />
      </MockAuthProvider>,
    )

    await waitFor(() => expect(router.state.location.pathname).toBe('/bitacora'))
    expect(router.state.location.search).toBe('?period=week')
  })

  it('rejects an external return destination and falls back to the dashboard', async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: [{ pathname: '/login', state: { from: '//outside.example/path' } }],
    })
    renderWithProviders(
      <MockAuthProvider initialState={SIGNED_IN}>
        <RouterProvider router={router} />
      </MockAuthProvider>,
    )

    await waitFor(() => expect(router.state.location.pathname).toBe('/mesas'))
  })

  it('does not redirect while Firebase is resolving the initial session', async () => {
    renderAt('/mesas', { ...SIGNED_OUT, loading: true })

    expect(await screen.findByRole('status')).toHaveTextContent('Comprobando tu sesión')
    expect(screen.queryByRole('heading', { name: 'Inicia sesión' })).not.toBeInTheDocument()
  })

  it('allows an unverified Firebase user into the dashboard until the backend emits its event', async () => {
    renderAt('/restaurante', { ...SIGNED_IN, emailVerified: false })

    expect(await screen.findByRole('heading', { name: 'Restaurante' })).toBeInTheDocument()
    expect(screen.queryByText('Verifica tu correo para continuar.')).not.toBeInTheDocument()
    expect(mocks.signOut).not.toHaveBeenCalled()
  })

  it('shows the backend verification screen with the exact message and all three actions', async () => {
    renderAt('/restaurante', { ...SIGNED_IN, authEvent: 'email-not-verified' })

    expect(await screen.findByRole('heading', { name: 'Verifica tu correo para continuar.' })).toBeInTheDocument()
    expect(screen.getByText(/Revisa tu bandeja de entrada y la carpeta de spam/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reenviar correo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ya lo verifiqué' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Restaurante' })).not.toBeInTheDocument()
  })

  it('resends the verification email once and disables the action while sending', async () => {
    let resolveResend!: () => void
    mocks.reenviarVerificacion.mockReturnValue(new Promise<void>((resolve) => {
      resolveResend = resolve
    }))
    const { user } = renderAt('/restaurante', { ...SIGNED_IN, authEvent: 'email-not-verified' })
    const resendButton = await screen.findByRole('button', { name: 'Reenviar correo' })

    await user.click(resendButton)
    expect(mocks.reenviarVerificacion).toHaveBeenCalledTimes(1)
    expect(resendButton).toBeDisabled()

    await act(async () => resolveResend())
    expect(await screen.findByText(/Correo de verificación enviado/)).toBeInTheDocument()
  })

  it.each([
    ['auth/too-many-requests', 'Hay demasiados intentos. Espera un momento e inténtalo de nuevo.'],
    ['auth/network-request-failed', 'No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.'],
  ])('shows a useful message when resend fails with %s', async (code, message) => {
    mocks.reenviarVerificacion.mockRejectedValue({ code })
    const { user } = renderAt('/restaurante', { ...SIGNED_IN, authEvent: 'email-not-verified' })
    await user.click(await screen.findByRole('button', { name: 'Reenviar correo' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(message)
    expect(screen.getByRole('alert')).not.toHaveTextContent(code)
  })

  it('refreshes the Firebase session and clears the backend verification event', async () => {
    const { user } = renderAt('/restaurante', { ...SIGNED_IN, authEvent: 'email-not-verified' })
    await user.click(await screen.findByRole('button', { name: 'Ya lo verifiqué' }))

    await waitFor(() => expect(mocks.refrescarSesion).toHaveBeenCalledTimes(1))
    expect(await screen.findByRole('heading', { name: 'Restaurante' })).toBeInTheDocument()
    expect(screen.queryByText('Verifica tu correo para continuar.')).not.toBeInTheDocument()
  })

  it('shows the retry Alert when the backend re-emits the event after a refresh attempt', async () => {
    renderAt('/restaurante', { ...SIGNED_IN, authEvent: 'email-not-verified', emailVerificationRetried: true })

    expect(await screen.findByRole('status')).toHaveTextContent('Todavía no vemos tu correo verificado.')
  })

  it('signs out from the verification screen and returns to login', async () => {
    const { router, user } = renderAt('/restaurante', { ...SIGNED_IN, authEvent: 'email-not-verified' })
    await user.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
    expect(mocks.signOut).toHaveBeenCalledTimes(1)
  })

  it('routes RESTAURANT_REQUIRED to onboarding without requiring restaurant data there', async () => {
    const { router } = renderAt('/mesas', { ...SIGNED_IN, authEvent: 'restaurant-required' })

    expect(await screen.findByRole('heading', { name: 'Configura tu restaurante' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/onboarding')
    expect(mocks.signOut).not.toHaveBeenCalled()
  })

  it('announces an expired session once, signs out, and redirects to login', async () => {
    const { router } = renderAt('/mesas', { ...SIGNED_IN, authEvent: 'session-expired' })

    expect(await screen.findByText('Tu sesión terminó. Inicia sesión de nuevo.')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect(mocks.signOut).toHaveBeenCalledTimes(1)
  })

  it('closes the authenticated session from the AppShell user menu', async () => {
    const { router, user } = renderAt('/mesas', SIGNED_IN)
    const userMenuButton = await screen.findByRole('button', { name: /Casa 72/ })
    await user.click(userMenuButton)
    await user.click(await screen.findByRole('menuitem', { name: 'Cerrar sesión' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
    expect(mocks.signOut).toHaveBeenCalledTimes(1)
  })
})