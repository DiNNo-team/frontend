import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import { ApiError } from '@/lib/api-client'
import { restaurantApi } from '../api'
import { emptyRestaurantFormValues, toRestaurantFormValues, type RestaurantFormValues } from '../restaurant-form'
import type { RestaurantProfile } from '../types'
import { fakeMap } from './LocationMap.fake'
import { RestaurantForm } from './RestaurantForm'

vi.mock('../api', () => ({ restaurantApi: { geocode: vi.fn() } }))
vi.mock('./LocationMap', () => import('./LocationMap.fake'))

const geocode = vi.mocked(restaurantApi.geocode)

const FOUND = { latitude: 4.655671, longitude: -74.057006, formattedAddress: 'Cl. 72 #10-34, Bogotá, Colombia' }

// Everything valid except the location, as someone who filled the registration would have it.
function filledRegistration(): RestaurantFormValues {
  const empty = emptyRestaurantFormValues()
  return {
    ...empty,
    name: 'Casa 72',
    category: 'colombian',
    address: 'Calle 72 # 10-34, Bogotá',
    hours: empty.hours.map((day) => (day.day === 'mon' ? { ...day, isOpen: true } : day)),
  }
}

function renderRegistration() {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const utils = renderWithProviders(
    <RestaurantForm initialValues={filledRegistration()} submitLabel="Guardar y continuar" saving={false} onSubmit={onSubmit} requireLocation />,
  )
  return { ...utils, onSubmit }
}

beforeEach(() => {
  vi.clearAllMocks()
  fakeMap.available = true
  fakeMap.dropAt = { latitude: 4.660123, longitude: -74.053211 }
})

describe('RestaurantForm · ubicación en el registro', () => {
  it('valid address: puts the pin on it and registers with its coordinates', async () => {
    geocode.mockResolvedValue(FOUND)
    const { user, onSubmit } = renderRegistration()

    await user.click(screen.getByRole('button', { name: 'Ubicar en el mapa' }))
    expect(geocode).toHaveBeenCalledWith('Calle 72 # 10-34, Bogotá')
    expect(await screen.findByText('Pin: 4.655671, -74.057006')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Guardar y continuar' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ location: { latitude: 4.655671, longitude: -74.057006 } }))
  })

  it('address not found: shows Bogotá with the pin to move, and saves once it is moved', async () => {
    geocode.mockRejectedValue(new ApiError({ status: 404, code: 'ADDRESS_NOT_FOUND' }))
    const { user, onSubmit } = renderRegistration()

    await user.click(screen.getByRole('button', { name: 'Ubicar en el mapa' }))
    expect(await screen.findByText('No encontramos esa dirección. Mueve el pin al lugar correcto.')).toBeInTheDocument()
    expect(screen.getByText('Pin: 4.650000, -74.100000')).toBeInTheDocument()

    // The pin in the middle of Bogotá is not the restaurant until it is moved.
    await user.click(screen.getByRole('button', { name: 'Guardar y continuar' }))
    expect(screen.getByText('Ubica tu restaurante en el mapa.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Mover pin' }))
    await user.click(screen.getByRole('button', { name: 'Guardar y continuar' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ location: fakeMap.dropAt }))
  })

  it('geocoding down: same as not found, and saving is not blocked', async () => {
    geocode.mockRejectedValue(new ApiError({ status: 503, code: 'GEOCODING_UNAVAILABLE' }))
    const { user, onSubmit } = renderRegistration()

    await user.click(screen.getByRole('button', { name: 'Ubicar en el mapa' }))
    expect(
      await screen.findByText('No pudimos ubicar la dirección en este momento. Mueve el pin al lugar correcto.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mover pin' }))
    await user.click(screen.getByRole('button', { name: 'Guardar y continuar' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ location: fakeMap.dropAt }))
  })

  it('does not register without a location while the map works', async () => {
    const { user, onSubmit } = renderRegistration()

    await user.click(screen.getByRole('button', { name: 'Guardar y continuar' }))
    expect(screen.getByText('Ubica tu restaurante en el mapa.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ubicar en el mapa' })).toHaveFocus()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('a pin outside Bogotá is an error', async () => {
    fakeMap.dropAt = { latitude: 4.9, longitude: -74.05 }
    const { user, onSubmit } = renderRegistration()

    await user.click(screen.getByRole('button', { name: 'Mover pin' }))
    expect(screen.getByText('Ubica tu restaurante dentro de Bogotá.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Guardar y continuar' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('an empty address shows its error instead of looking it up', async () => {
    const onSubmit = vi.fn()
    const { user } = renderWithProviders(
      <RestaurantForm initialValues={emptyRestaurantFormValues()} submitLabel="Guardar y continuar" saving={false} onSubmit={onSubmit} requireLocation />,
    )

    await user.click(screen.getByRole('button', { name: 'Ubicar en el mapa' }))
    expect(screen.getByLabelText('Dirección')).toHaveAccessibleDescription('Escribe la dirección de tu restaurante.')
    expect(geocode).not.toHaveBeenCalled()
  })
})

describe('RestaurantForm · mapa que no carga', () => {
  beforeEach(() => {
    fakeMap.available = false
  })

  it('tells the map is not available and saves the point of the address', async () => {
    geocode.mockResolvedValue(FOUND)
    const { user, onSubmit } = renderRegistration()

    expect(await screen.findByText(/No pudimos cargar el mapa/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ubicar en el mapa' }))
    expect(await screen.findByText('Ubicamos tu dirección: Cl. 72 #10-34, Bogotá, Colombia.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Guardar y continuar' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ location: { latitude: 4.655671, longitude: -74.057006 } }))
  })

  it('without map and without a point, the registration goes on without location', async () => {
    geocode.mockRejectedValue(new ApiError({ status: 503, code: 'GEOCODING_UNAVAILABLE' }))
    const { user, onSubmit } = renderRegistration()

    await user.click(screen.getByRole('button', { name: 'Ubicar en el mapa' }))
    expect(
      await screen.findByText('No pudimos ubicar tu dirección. Puedes guardar y completar la ubicación después en Restaurante.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Guardar y continuar' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ location: null }))
  })
})

describe('RestaurantForm · ubicación en la edición', () => {
  const PROFILE: RestaurantProfile = {
    id: 'restaurant-1',
    name: 'Casa 72',
    category: 'colombian',
    address: 'Calle 72 # 10-34, Bogotá',
    latitude: 4.655671,
    longitude: -74.057006,
    schedules: [{ dayOfWeek: 1, isOpen24h: false, opensAt: '12:00', closesAt: '21:00' }],
  }

  it('shows the pin on the saved location', () => {
    renderWithProviders(
      <RestaurantForm initialValues={toRestaurantFormValues(PROFILE)} submitLabel="Guardar cambios" saving={false} onSubmit={vi.fn()} />,
    )
    expect(screen.getByText('Pin: 4.655671, -74.057006')).toBeInTheDocument()
  })

  it('a restaurant without location can still save other changes', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const { user } = renderWithProviders(
      <RestaurantForm
        initialValues={toRestaurantFormValues({ ...PROFILE, latitude: null, longitude: null })}
        submitLabel="Guardar cambios"
        saving={false}
        onSubmit={onSubmit}
      />,
    )
    expect(screen.getByText('Pin: sin pin')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ location: null }))
  })
})
