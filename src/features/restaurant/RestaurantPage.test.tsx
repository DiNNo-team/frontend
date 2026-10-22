import { Outlet, Link, createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import { ApiError } from '@/lib/api-client'
import type { RestaurantProfile } from './types'
import RestaurantPage from './RestaurantPage'

const mocks = vi.hoisted(() => ({ get: vi.fn(), update: vi.fn() }))

vi.mock('./api', () => ({ restaurantApi: { get: mocks.get, update: mocks.update, register: vi.fn(), geocode: vi.fn() } }))
// jsdom cannot load Google Maps: the fake map moves the pin with a button (Santiago, Sprint 2).
vi.mock('./components/LocationMap', () => import('./components/LocationMap.fake'))
vi.mock('@/features/auth/auth-context', () => ({
  useAuth: () => ({ user: { uid: 'restaurant-owner' } }),
}))

const PROFILE: RestaurantProfile = {
  id: 'restaurant-1',
  name: 'Casa 72',
  category: 'grill',
  address: 'Calle 72 # 10-34, Bogotá',
  latitude: 4.655671,
  longitude: -74.057006,
  schedules: [
    { dayOfWeek: 1, isOpen24h: false, opensAt: '18:00', closesAt: '02:00' },
    { dayOfWeek: 6, isOpen24h: true, opensAt: null, closesAt: null },
  ],
}

function TestLayout() {
  return (
    <>
      <nav>
        <Link to="/otra">Otra sección</Link>
      </nav>
      <Outlet />
    </>
  )
}

function renderPage(profile: RestaurantProfile | Promise<RestaurantProfile> = PROFILE) {
  mocks.get.mockImplementation(() => Promise.resolve(profile))
  const router = createMemoryRouter(
    [
      {
        element: <TestLayout />,
        children: [
          { path: '/restaurante', element: <RestaurantPage /> },
          { path: '/otra', element: <h1>Otra sección</h1> },
        ],
      },
    ],
    { initialEntries: ['/restaurante'] },
  )
  return { router, ...renderWithProviders(<RouterProvider router={router} />) }
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.get.mockResolvedValue(PROFILE)
  mocks.update.mockResolvedValue(PROFILE)
})

describe('RestaurantPage', () => {
  it('shows restaurant details grouped in cards and formats all seven days', async () => {
    renderPage()

    expect(await screen.findByText('Casa 72')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tu restaurante' })).toBeInTheDocument()
    expect(screen.getByText('Casa 72')).toBeInTheDocument()
    expect(screen.getByText('Parrilla')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Ubicación' })).toBeInTheDocument()
    expect(screen.getByText('Calle 72 # 10-34, Bogotá')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Horarios' })).toBeInTheDocument()
    expect(screen.getByText('6:00 p. m. – 2:00 a. m. (día siguiente)')).toBeInTheDocument()
    expect(screen.getByText('Abierto 24 horas')).toBeInTheDocument()
    expect(screen.getAllByText('Cerrado')).toHaveLength(5)
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
  })

  it('shows missing profile fields and absent schedule data as "Sin completar"', async () => {
    const incomplete = {
      ...PROFILE,
      name: '',
      category: null,
      address: null,
      schedules: undefined,
    } as unknown as RestaurantProfile
    renderPage(incomplete)

    expect(await screen.findAllByText('Sin completar')).toHaveLength(10)
  })

  it('shows a delayed skeleton while the restaurant is loading', async () => {
    let resolveProfile: (value: RestaurantProfile) => void = () => undefined
    const loadingProfile = new Promise<RestaurantProfile>((resolve) => {
      resolveProfile = resolve
    })
    renderPage(loadingProfile)

    expect(await screen.findByRole('status')).toHaveTextContent('Cargando información del restaurante')
    expect(screen.getByRole('status').parentElement).toHaveAttribute('aria-busy', 'true')

    resolveProfile(PROFILE)
    expect(await screen.findByText('Casa 72')).toBeInTheDocument()
  })

  it('shows a retry Alert on load error and retries the query', async () => {
    mocks.get.mockRejectedValueOnce(new ApiError({ status: 500 })).mockResolvedValueOnce(PROFILE)
    const { user } = renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar la información de tu restaurante.')
    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
    expect(await screen.findByText('Casa 72')).toBeInTheDocument()
    expect(mocks.get).toHaveBeenCalledTimes(2)
  })

  it('enters edit mode and cancels immediately when there are no changes', async () => {
    const { user } = renderPage()
    await user.click(await screen.findByRole('button', { name: 'Editar' }))

    expect(screen.getByLabelText('Nombre')).toHaveValue('Casa 72')
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByLabelText('Nombre')).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(mocks.update).not.toHaveBeenCalled()
  })

  it('sends only changed scalar fields, updates cache from response, and returns to reading mode', async () => {
    const updated = { ...PROFILE, name: 'Casa 72 Centro' }
    mocks.update.mockResolvedValue(updated)
    const { user } = renderPage()
    await user.click(await screen.findByRole('button', { name: 'Editar' }))
    await user.clear(screen.getByLabelText('Nombre'))
    await user.type(screen.getByLabelText('Nombre'), updated.name)
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText(updated.name)).toBeInTheDocument()
    expect(mocks.update).toHaveBeenCalledWith({ name: updated.name })
    expect(mocks.get).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('Cambios guardados')).toBeInTheDocument()
    expect(screen.queryByLabelText('Nombre')).not.toBeInTheDocument()
  })

  it('sends both coordinates when the pin moves, and only them', async () => {
    const { user } = renderPage()
    await user.click(await screen.findByRole('button', { name: 'Editar' }))
    await user.click(screen.getByRole('button', { name: 'Mover pin' }))
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(mocks.update).toHaveBeenCalledWith({ latitude: 4.660123, longitude: -74.053211 }))
  })

  it('sends the complete open schedule list when hours change', async () => {
    const updated = {
      ...PROFILE,
      schedules: [
        ...PROFILE.schedules,
        { dayOfWeek: 2, isOpen24h: false, opensAt: '12:00', closesAt: '21:00' },
      ],
    }
    mocks.update.mockResolvedValue(updated)
    const { user } = renderPage()
    await user.click(await screen.findByRole('button', { name: 'Editar' }))
    await user.click(screen.getByRole('switch', { name: 'Martes' }))
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(1))
    expect(mocks.update).toHaveBeenCalledWith({
      schedules: [
        { dayOfWeek: 1, isOpen24h: false, opensAt: '18:00', closesAt: '02:00' },
        { dayOfWeek: 2, isOpen24h: false, opensAt: '12:00', closesAt: '21:00' },
        { dayOfWeek: 6, isOpen24h: true },
      ],
    })
  })

  it('does not call PATCH when submit has no changes', async () => {
    const { user } = renderPage()
    await user.click(await screen.findByRole('button', { name: 'Editar' }))
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(screen.queryByLabelText('Nombre')).not.toBeInTheDocument())
    expect(mocks.update).not.toHaveBeenCalled()
  })

  it('keeps edits visible when the server rejects the update', async () => {
    mocks.update.mockRejectedValue(new ApiError({ status: 400 }))
    const { user } = renderPage()
    await user.click(await screen.findByRole('button', { name: 'Editar' }))
    await user.clear(screen.getByLabelText('Nombre'))
    await user.type(screen.getByLabelText('Nombre'), 'Casa nueva')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos guardar tu restaurante. Revisa el nombre, la categoría, la dirección y los horarios e intenta de nuevo.')
    expect(screen.getByLabelText('Nombre')).toHaveValue('Casa nueva')
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument()
  })

  it('blocks navigation with unsaved changes and lets the user stay or leave', async () => {
    const { user, router } = renderPage()
    await user.click(await screen.findByRole('button', { name: 'Editar' }))
    await user.type(screen.getByLabelText('Nombre'), ' Centro')
    await user.click(screen.getByRole('link', { name: 'Otra sección' }))

    expect(await screen.findByRole('dialog', { name: '¿Salir sin guardar?' })).toBeInTheDocument()
    expect(screen.getByText('Perderás los cambios que hiciste en tu restaurante.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Seguir editando' }))
    expect(router.state.location.pathname).toBe('/restaurante')
    expect(screen.getByLabelText('Nombre')).toHaveValue('Casa 72 Centro')

    await user.click(screen.getByRole('link', { name: 'Otra sección' }))
    await user.click(await screen.findByRole('button', { name: 'Salir sin guardar' }))
    expect(await screen.findByRole('heading', { name: 'Otra sección' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/otra')
  })

  it('asks before cancelling edit mode when changes are pending', async () => {
    const { user } = renderPage()
    await user.click(await screen.findByRole('button', { name: 'Editar' }))
    await user.type(screen.getByLabelText('Nombre'), ' Centro')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(await screen.findByRole('dialog', { name: '¿Salir sin guardar?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Salir sin guardar' }))
    expect(screen.queryByLabelText('Nombre')).not.toBeInTheDocument()
    expect(screen.getByText('Casa 72')).toBeInTheDocument()
  })

  it('activates beforeunload only while editing has pending changes', async () => {
    const { user } = renderPage()
    const cleanEvent = new Event('beforeunload', { cancelable: true })
    fireEvent(window, cleanEvent)
    expect(cleanEvent.defaultPrevented).toBe(false)

    await user.click(await screen.findByRole('button', { name: 'Editar' }))
    await user.type(screen.getByLabelText('Nombre'), ' Centro')
    await waitFor(() => expect(screen.getByLabelText('Nombre')).toHaveValue('Casa 72 Centro'))
    const dirtyEvent = new Event('beforeunload', { cancelable: true })
    fireEvent(window, dirtyEvent)
    expect(dirtyEvent.defaultPrevented).toBe(true)
  })
})