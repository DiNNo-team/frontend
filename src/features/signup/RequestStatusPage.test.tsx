import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { ApiError } from '@/lib/api-client'
import type { RestaurantProfile } from '@/features/restaurant/types'
import { FakeAuth } from '@/test/auth-fixtures'
import { resetSessionActions, sessionActions } from '@/test/session-actions'
import { renderWithProviders } from '@/test/render'
import RequestStatusPage from './RequestStatusPage'
import { REQUEST_STATUS_REFRESH_MS } from './hooks'

/** The card with that title (cards are sections without an accessible name). */
const card = (title: string) => within(screen.getByRole('heading', { name: title }).closest('section') as HTMLElement)

const mocks = vi.hoisted(() => ({ get: vi.fn(), update: vi.fn(), resubmit: vi.fn() }))
vi.mock('@/features/restaurant/api', () => ({
  restaurantApi: { get: () => mocks.get(), update: (input: unknown) => mocks.update(input), resubmit: () => mocks.resubmit() },
}))

const PENDING: RestaurantProfile = {
  id: 'r1', name: 'Casa Tamarindo', category: 'colombian', address: 'Carrera 7 # 72-41, Bogotá', latitude: 4.65, longitude: -74.05,
  schedules: [{ dayOfWeek: 1, isOpen24h: false, opensAt: '12:00', closesAt: '21:00' }, { dayOfWeek: 6, isOpen24h: true, opensAt: null, closesAt: null }],
  activeReservationsCount: 0, approvalStatus: 'pending', rejectionReason: null, contactPhone: '+573001234567',
}
const REJECTED: RestaurantProfile = {
  ...PENDING, approvalStatus: 'rejected', rejectionReason: 'La dirección no coincide con la ubicación del mapa. Corrígela y vuelve a enviar la solicitud.',
}

function renderPage() {
  const router = createMemoryRouter(
    [
      { path: '/solicitud', element: <RequestStatusPage /> },
      { path: '/login', element: <p>Pantalla de login</p> },
    ],
    { initialEntries: ['/solicitud'] },
  )
  return { router, ...renderWithProviders(<FakeAuth><RouterProvider router={router} /></FakeAuth>) }
}

beforeEach(() => {
  vi.clearAllMocks()
  resetSessionActions()
  window.localStorage.clear()
})

describe('RequestStatusPage · en revisión', () => {
  beforeEach(() => mocks.get.mockResolvedValue(PENDING))

  it('says what happened and what comes next, with the data that was sent in read mode', async () => {
    renderPage()
    expect(await screen.findByRole('heading', { level: 1, name: 'Tu solicitud está en revisión' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Cuando tu cuenta esté aprobada, esta pantalla te lleva a tus mesas. Se actualiza sola cada 30 segundos.')
    const sent = card('Datos que enviaste')
    expect(sent.getByText('Casa Tamarindo')).toBeInTheDocument()
    expect(sent.getByText('Colombiana')).toBeInTheDocument()
    expect(sent.getByText('+573001234567')).toBeInTheDocument()
    expect(sent.getByText('12:00 p. m. – 9:00 p. m.')).toBeInTheDocument()
    expect(sent.getByText('Abierto 24 horas')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Qué sigue' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'dinnoteam2026@gmail.com' })).toHaveAttribute('href', 'mailto:dinnoteam2026@gmail.com')
  })

  it('leaves a mark so the dashboard welcomes the restaurant once, after the approval', async () => {
    renderPage()
    await screen.findByRole('heading', { level: 1, name: 'Tu solicitud está en revisión' })
    expect(window.localStorage.getItem('dinno:awaiting-approval:r1')).toBe('1')
  })

  it('edits the data and saves only what changed, staying in review', async () => {
    mocks.update.mockResolvedValue({ ...PENDING, contactPhone: '+573105550101' })
    const { user } = renderPage()
    await user.click(await screen.findByRole('button', { name: 'Editar mis datos' }))

    const phone = screen.getByLabelText('Teléfono de contacto')
    expect(phone).toHaveValue('+573001234567')
    await user.clear(phone)
    await user.type(phone, '+573105550101')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(mocks.update).toHaveBeenCalledWith({ contactPhone: '+573105550101' }))
    expect(await screen.findByText('Cambios guardados')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).not.toBeInTheDocument()
    expect(mocks.resubmit).not.toHaveBeenCalled()
  })

  it('cancels the edition without saving', async () => {
    const { user } = renderPage()
    await user.click(await screen.findByRole('button', { name: 'Editar mis datos' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.getByRole('heading', { name: 'Datos que enviaste' })).toBeInTheDocument()
    expect(mocks.update).not.toHaveBeenCalled()
  })

  it('asks its state again every 30 s', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    renderPage()
    await screen.findByRole('heading', { level: 1, name: 'Tu solicitud está en revisión' })
    const calls = mocks.get.mock.calls.length
    await act(async () => {
      await vi.advanceTimersByTimeAsync(REQUEST_STATUS_REFRESH_MS + 100)
    })
    expect(mocks.get.mock.calls.length).toBeGreaterThan(calls)
  })

  it('signs out and goes to login', async () => {
    const { user, router } = renderPage()
    await user.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(sessionActions.signOut).toHaveBeenCalledOnce()
  })
})

describe('RequestStatusPage · no aprobada', () => {
  beforeEach(() => mocks.get.mockResolvedValue(REJECTED))

  it('shows the reason first, in words, and the form already filled', async () => {
    renderPage()
    expect(await screen.findByRole('heading', { level: 1, name: 'Tu solicitud no fue aprobada' })).toBeInTheDocument()
    const reason = screen.getByText('Qué debes corregir').closest('[role="status"]')
    expect(reason).toHaveTextContent('Qué debes corregir')
    expect(reason).toHaveTextContent('La dirección no coincide con la ubicación del mapa. Corrígela y vuelve a enviar la solicitud.')
    expect(screen.getByLabelText('Nombre')).toHaveValue('Casa Tamarindo')
    expect(screen.getByLabelText('Dirección')).toHaveValue('Carrera 7 # 72-41, Bogotá')
    expect(screen.getByRole('button', { name: 'Reenviar solicitud' })).toHaveAttribute('type', 'submit')
  })

  it('asks for confirmation, saves the changes, resends, and says so', async () => {
    mocks.update.mockResolvedValue(REJECTED)
    mocks.resubmit.mockResolvedValue({ ...REJECTED, approvalStatus: 'pending', rejectionReason: null })
    const { user } = renderPage()
    const address = await screen.findByLabelText('Dirección')
    await user.clear(address)
    await user.type(address, 'Carrera 7 # 72-50, Bogotá')
    await user.click(screen.getByRole('button', { name: 'Reenviar solicitud' }))

    const dialog = await screen.findByRole('dialog', { name: '¿Reenviar tu solicitud?' })
    expect(mocks.resubmit).not.toHaveBeenCalled()
    await user.click(within(dialog).getByRole('button', { name: 'Reenviar solicitud' }))

    await waitFor(() => expect(mocks.resubmit).toHaveBeenCalledOnce())
    expect(mocks.update).toHaveBeenCalledWith({ address: 'Carrera 7 # 72-50, Bogotá' })
    expect(await screen.findByText('Solicitud reenviada')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { level: 1, name: 'Tu solicitud está en revisión' })).toBeInTheDocument()
  })

  it('resends without saving when nothing changed', async () => {
    mocks.resubmit.mockResolvedValue({ ...REJECTED, approvalStatus: 'pending', rejectionReason: null })
    const { user } = renderPage()
    await user.click(await screen.findByRole('button', { name: 'Reenviar solicitud' }))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Reenviar solicitud' }))
    await waitFor(() => expect(mocks.resubmit).toHaveBeenCalledOnce())
    expect(mocks.update).not.toHaveBeenCalled()
  })

  it('RESTAURANT_NOT_REJECTED says it is not rejected anymore and asks the state again', async () => {
    mocks.resubmit.mockRejectedValue(new ApiError({ status: 409, code: 'RESTAURANT_NOT_REJECTED' }))
    const { user } = renderPage()
    await user.click(await screen.findByRole('button', { name: 'Reenviar solicitud' }))
    const dialog = await screen.findByRole('dialog')
    mocks.get.mockResolvedValue({ ...REJECTED, approvalStatus: 'pending', rejectionReason: null })
    await user.click(within(dialog).getByRole('button', { name: 'Reenviar solicitud' }))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Tu solicitud ya no está rechazada. Te mostramos su estado actual.')
    await waitFor(() => expect(mocks.get.mock.calls.length).toBeGreaterThan(1))
  })

  it('a network failure keeps the form filled and offers to try again', async () => {
    mocks.resubmit.mockRejectedValueOnce(new ApiError({ status: 0, isNetworkError: true })).mockResolvedValueOnce({ ...REJECTED, approvalStatus: 'pending' })
    const { user } = renderPage()
    await user.click(await screen.findByRole('button', { name: 'Reenviar solicitud' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Reenviar solicitud' }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.')

    await user.click(within(dialog).getByRole('button', { name: 'Reenviar solicitud' }))
    await waitFor(() => expect(mocks.resubmit).toHaveBeenCalledTimes(2))
  })

  it('does not resend with a field missing: it says which one', async () => {
    const { user } = renderPage()
    await user.clear(await screen.findByLabelText('Nombre'))
    await user.click(screen.getByRole('button', { name: 'Reenviar solicitud' }))
    expect(await screen.findByText('Escribe el nombre de tu restaurante.')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('RequestStatusPage · carga y error', () => {
  it('shows a polite loading state while the request loads', async () => {
    mocks.get.mockReturnValue(new Promise(() => undefined))
    renderPage()
    expect(await screen.findByText('Cargando tu solicitud')).toBeInTheDocument()
  })

  it('shows a clear error with a retry when it cannot load', async () => {
    mocks.get.mockRejectedValueOnce(new ApiError({ status: 0, isNetworkError: true })).mockResolvedValue(PENDING)
    const { user } = renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar tu solicitud. Revisa tu conexión e intenta de nuevo.')
    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Tu solicitud está en revisión' })).toBeInTheDocument()
  })
})
