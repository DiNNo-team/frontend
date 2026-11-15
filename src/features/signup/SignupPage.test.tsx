import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { ApiError } from '@/lib/api-client'
import type { Me } from '@/features/account/types'
import type { RestaurantProfile } from '@/features/restaurant/types'
import { FakeAuth, type FakeSession } from '@/test/auth-fixtures'
import { resetSessionActions, sessionActions } from '@/test/session-actions'
import { renderWithProviders } from '@/test/render'
import SignupPage from './SignupPage'

const mocks = vi.hoisted(() => ({ getMe: vi.fn(), getRestaurant: vi.fn(), signup: vi.fn() }))
vi.mock('@/features/account/api', () => ({ accountApi: { getMe: () => mocks.getMe() } }))
vi.mock('@/features/restaurant/api', () => ({ restaurantApi: { get: () => mocks.getRestaurant() } }))
vi.mock('./api', () => ({ signupApi: { signup: (input: unknown) => mocks.signup(input) } }))

const NO_PROFILE = new ApiError({ status: 403, code: 'PROFILE_REQUIRED' })
const IN_REVIEW: RestaurantProfile = {
  id: 'r1', name: 'Casa 72', category: 'colombian', address: 'Calle 72 # 10-34, Bogotá', latitude: null, longitude: null,
  schedules: [{ dayOfWeek: 1, isOpen24h: false, opensAt: '12:00', closesAt: '21:00' }],
  activeReservationsCount: 0, approvalStatus: 'pending', rejectionReason: null, contactPhone: '+573001234567',
}

function renderSignup(session: FakeSession = { signedIn: false }) {
  const router = createMemoryRouter(
    [
      { path: '/registro', element: <SignupPage /> },
      { path: '/solicitud', element: <p>Pantalla de solicitud</p> },
      { path: '/mesas', element: <p>Pantalla de mesas</p> },
      { path: '/login', element: <p>Pantalla de login</p> },
    ],
    { initialEntries: ['/registro'] },
  )
  return { router, ...renderWithProviders(<FakeAuth {...session}><RouterProvider router={router} /></FakeAuth>) }
}

type Rendered = ReturnType<typeof renderSignup>

async function fillValidDetails(user: Rendered['user']) {
  await user.type(await screen.findByLabelText('Nombre'), '  Casa Tamarindo ')
  await user.click(screen.getByRole('combobox', { name: 'Categoría' }))
  await user.click(screen.getByRole('option', { name: 'Colombiana' }))
  await user.type(screen.getByLabelText('Dirección'), 'Carrera 7 # 72-41, Bogotá')
  await user.type(screen.getByLabelText('Teléfono de contacto'), '+57 300 123 4567')
  await user.click(screen.getByRole('switch', { name: 'Lunes' }))
}

beforeEach(() => {
  vi.clearAllMocks()
  resetSessionActions()
  mocks.getMe.mockRejectedValue(NO_PROFILE)
})

describe('SignupPage · paso 1: crear la cuenta', () => {
  it('shows the progress, the email and password fields, Google, and a way back to login', () => {
    renderSignup()
    expect(screen.getByRole('heading', { level: 1, name: 'Crea tu cuenta de restaurante' })).toBeInTheDocument()
    const progress = screen.getByRole('navigation', { name: 'Progreso del registro' })
    expect(within(progress).getByText('Paso 1 de 2')).toBeInTheDocument()
    expect(within(progress).getAllByRole('listitem')[0]).toHaveAttribute('aria-current', 'step')
    expect(screen.getByLabelText('Correo')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: 'Continuar con Google' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Crear cuenta' })).toHaveLength(1)
  })

  it('says what to fix and does not create the account with a bad email or a short password', async () => {
    const { user } = renderSignup()
    await user.type(screen.getByLabelText('Correo'), 'correo-invalido')
    await user.type(screen.getByLabelText('Contraseña'), '123')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(await screen.findByText('Escribe un correo válido para crear tu cuenta.')).toBeInTheDocument()
    expect(screen.getByText('La contraseña es muy corta. Usa al menos 6 caracteres.')).toBeInTheDocument()
    expect(sessionActions.signUp).not.toHaveBeenCalled()
  })

  it('creates the account with the trimmed email and goes on', async () => {
    const { user } = renderSignup()
    await user.type(screen.getByLabelText('Correo'), ' dueno@casa72.co ')
    await user.type(screen.getByLabelText('Contraseña'), 'secreta1')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    await waitFor(() => expect(sessionActions.signUp).toHaveBeenCalledWith('dueno@casa72.co', 'secreta1'))
  })

  it('shows the reason in words when the account cannot be created, and keeps what was typed', async () => {
    sessionActions.signUp.mockRejectedValueOnce(new Error('Ya existe una cuenta con ese correo. Inicia sesión para continuar.'))
    const { user } = renderSignup()
    await user.type(screen.getByLabelText('Correo'), 'dueno@casa72.co')
    await user.type(screen.getByLabelText('Contraseña'), 'secreta1')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe una cuenta con ese correo. Inicia sesión para continuar.')
    expect(screen.getByLabelText('Correo')).toHaveValue('dueno@casa72.co')
  })

  it('disables the form while the account is being created', async () => {
    let finish!: () => void
    sessionActions.signUp.mockReturnValueOnce(new Promise<undefined>((resolve) => { finish = () => resolve(undefined) }))
    const { user } = renderSignup()
    await user.type(screen.getByLabelText('Correo'), 'dueno@casa72.co')
    await user.type(screen.getByLabelText('Contraseña'), 'secreta1')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(await screen.findByRole('button', { name: 'Creando cuenta…' })).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByLabelText('Correo')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Continuar con Google' })).toBeDisabled()
    finish()
  })

  it('signs up with Google', async () => {
    const { user } = renderSignup()
    await user.click(screen.getByRole('button', { name: 'Continuar con Google' }))
    expect(sessionActions.signInWithGoogle).toHaveBeenCalledOnce()
  })
})

describe('SignupPage · verificación del correo', () => {
  it('shows the verification screen under step 1 while the email is not verified, without asking the backend', async () => {
    renderSignup({ emailVerified: false })
    expect(await screen.findByRole('heading', { name: 'Verifica tu correo para continuar.' })).toBeInTheDocument()
    expect(screen.getByText('Paso 1 de 2')).toBeInTheDocument()
    expect(mocks.getMe).not.toHaveBeenCalled()
  })
})

describe('SignupPage · paso 2: datos del restaurante', () => {
  it('shows the progress and the restaurant form with the required contact phone', async () => {
    renderSignup({ emailVerified: true })
    expect(await screen.findByRole('heading', { level: 1, name: 'Cuéntanos de tu restaurante' })).toBeInTheDocument()
    expect(screen.getByText('Paso 2 de 2')).toBeInTheDocument()
    expect(screen.getByLabelText('Teléfono de contacto')).toBeInTheDocument()
    expect(screen.queryByText(/\(opcional\)/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar solicitud' })).toHaveAttribute('type', 'submit')
  })

  it('does not ask for confirmation while fields are missing: it says which ones, phone included', async () => {
    const { user } = renderSignup({ emailVerified: true })
    await user.click(await screen.findByRole('button', { name: 'Enviar solicitud' }))
    expect(await screen.findByText('Escribe un teléfono de contacto.')).toBeInTheDocument()
    expect(screen.getByText('Escribe el nombre de tu restaurante.')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(mocks.signup).not.toHaveBeenCalled()
  })

  it('rejects a phone with fewer than 7 digits', async () => {
    const { user } = renderSignup({ emailVerified: true })
    await user.type(await screen.findByLabelText('Teléfono de contacto'), '123 45')
    await user.tab()
    expect(await screen.findByText('Escribe un teléfono válido, de 7 a 15 dígitos.')).toBeInTheDocument()
  })

  it('asks for confirmation, sends the request with the phone and goes to the request screen', async () => {
    mocks.signup.mockResolvedValue(IN_REVIEW)
    const { user, router } = renderSignup({ emailVerified: true })
    await fillValidDetails(user)
    await user.click(screen.getByRole('button', { name: 'Enviar solicitud' }))

    const dialog = await screen.findByRole('dialog', { name: '¿Enviar tu solicitud?' })
    expect(mocks.signup).not.toHaveBeenCalled()
    await user.click(within(dialog).getByRole('button', { name: 'Enviar solicitud' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/solicitud'))
    expect(mocks.signup).toHaveBeenCalledWith({
      name: 'Casa Tamarindo',
      category: 'colombian',
      address: 'Carrera 7 # 72-41, Bogotá',
      schedules: [{ dayOfWeek: 1, isOpen24h: false, opensAt: '12:00', closesAt: '21:00' }],
      contactPhone: '+57 300 123 4567',
    })
  })

  it('keeps the form filled and says what to do when sending fails', async () => {
    mocks.signup.mockRejectedValue(new ApiError({ status: 500 }))
    const { user, router } = renderSignup({ emailVerified: true })
    await fillValidDetails(user)
    await user.click(screen.getByRole('button', { name: 'Enviar solicitud' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Enviar solicitud' }))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('No pudimos enviar tu solicitud. Intenta de nuevo en un momento.')
    expect(router.state.location.pathname).toBe('/registro')
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(screen.getByLabelText('Nombre')).toHaveValue('  Casa Tamarindo ')
    expect(screen.getByLabelText('Teléfono de contacto')).toHaveValue('+57 300 123 4567')
  })

  it('a 409 says it is already registered, and the account is taken to its request', async () => {
    mocks.signup.mockRejectedValue(new ApiError({ status: 409 }))
    const { user, router } = renderSignup({ emailVerified: true })
    await fillValidDetails(user)
    await user.click(screen.getByRole('button', { name: 'Enviar solicitud' }))
    const dialog = await screen.findByRole('dialog')
    mocks.getMe.mockResolvedValue({ id: 'u1', email: 'a@b.co', displayName: null, role: 'restaurant_admin', restaurantId: 'r1' } satisfies Me)
    mocks.getRestaurant.mockResolvedValue(IN_REVIEW)
    await user.click(within(dialog).getByRole('button', { name: 'Enviar solicitud' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/solicitud'))
  })

  it('an account that already has a pending restaurant goes straight to its request', async () => {
    mocks.getMe.mockResolvedValue({ id: 'u1', email: 'a@b.co', displayName: null, role: 'restaurant_admin', restaurantId: 'r1' } satisfies Me)
    mocks.getRestaurant.mockResolvedValue(IN_REVIEW)
    const { router } = renderSignup({ emailVerified: true })
    await waitFor(() => expect(router.state.location.pathname).toBe('/solicitud'))
  })

  it('an approved restaurant goes to its tables', async () => {
    mocks.getMe.mockResolvedValue({ id: 'u1', email: 'a@b.co', displayName: null, role: 'restaurant_admin', restaurantId: 'r1' } satisfies Me)
    mocks.getRestaurant.mockResolvedValue({ ...IN_REVIEW, approvalStatus: 'approved' })
    const { router } = renderSignup({ emailVerified: true })
    await waitFor(() => expect(router.state.location.pathname).toBe('/mesas'))
  })

  it('a diner account that comes in through here is told it is a diner account, with a way out', async () => {
    mocks.getMe.mockResolvedValue({ id: 'u1', email: 'a@b.co', displayName: null, role: 'diner', restaurantId: null } satisfies Me)
    const { user, router } = renderSignup({ emailVerified: true })
    expect(await screen.findByText('Esta es una cuenta de comensal. Para buscar mesa, usa la app DiNNo.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(sessionActions.signOut).toHaveBeenCalledOnce()
  })
})
