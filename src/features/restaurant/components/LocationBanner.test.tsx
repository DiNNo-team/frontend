import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { renderWithProviders } from '@/test/render'
import { ApiError } from '@/lib/api-client'
import { restaurantApi } from '../api'
import { useUpdateRestaurant } from '../hooks'
import type { RestaurantProfile } from '../types'
import { LocationBanner } from './LocationBanner'

vi.mock('../api', () => ({ restaurantApi: { get: vi.fn(), update: vi.fn() } }))

const TEXT = 'Completa la ubicación de tu restaurante para que los comensales te encuentren en DiNNo.'

const WITHOUT_LOCATION: RestaurantProfile = {
  id: 'restaurant-1',
  name: 'Casa 72',
  category: 'colombian',
  address: 'Calle 72 # 10-34, Bogotá',
  latitude: null,
  longitude: null,
  schedules: [{ dayOfWeek: 1, isOpen24h: false, opensAt: '12:00', closesAt: '21:00' }],
}
const WITH_LOCATION: RestaurantProfile = { ...WITHOUT_LOCATION, latitude: 4.655671, longitude: -74.057006 }

// Saves the location as the edition of /restaurante does (PATCH through the same query cache).
function SaveLocation() {
  const update = useUpdateRestaurant()
  return (
    <button type="button" onClick={() => update.mutate({ latitude: 4.655671, longitude: -74.057006 })}>
      Guardar ubicación
    </button>
  )
}

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      { path: '/mesas', element: <LocationBanner /> },
      {
        path: '/restaurante',
        element: (
          <>
            <LocationBanner />
            <h1>Restaurante</h1>
            <SaveLocation />
          </>
        ),
      },
    ],
    { initialEntries: [path] },
  )
  return { router, ...renderWithProviders(<RouterProvider router={router} />) }
}

const get = vi.mocked(restaurantApi.get)
const update = vi.mocked(restaurantApi.update)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LocationBanner', () => {
  it('shows up while the restaurant has no coordinates, with a button to /restaurante', async () => {
    get.mockResolvedValue(WITHOUT_LOCATION)
    const { user, router } = renderAt('/mesas')

    expect(await screen.findByText(TEXT)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Completar ubicación' }))
    expect(router.state.location.pathname).toBe('/restaurante')
  })

  it('does not show up when the restaurant has coordinates', async () => {
    get.mockResolvedValue(WITH_LOCATION)
    renderAt('/mesas')

    await waitFor(() => expect(get).toHaveBeenCalled())
    expect(screen.queryByText(TEXT)).not.toBeInTheDocument()
  })

  it('does not show up without a restaurant or when loading fails', async () => {
    get.mockRejectedValue(new ApiError({ status: 403, code: 'RESTAURANT_REQUIRED' }))
    renderAt('/mesas')

    await waitFor(() => expect(get).toHaveBeenCalled())
    expect(screen.queryByText(TEXT)).not.toBeInTheDocument()
  })

  it('on /restaurante it shows the text without the button', async () => {
    get.mockResolvedValue(WITHOUT_LOCATION)
    renderAt('/restaurante')

    expect(await screen.findByText(TEXT)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Completar ubicación' })).not.toBeInTheDocument()
  })

  it('goes away as soon as the location is saved', async () => {
    get.mockResolvedValue(WITHOUT_LOCATION)
    update.mockResolvedValue(WITH_LOCATION)
    const { user } = renderAt('/restaurante')

    expect(await screen.findByText(TEXT)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Guardar ubicación' }))
    await waitFor(() => expect(screen.queryByText(TEXT)).not.toBeInTheDocument())
    expect(get).toHaveBeenCalledTimes(1)
  })
})
