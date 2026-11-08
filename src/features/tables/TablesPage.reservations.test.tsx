import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { mockReservationsControl } from '@/features/reservations/api.mock'
import { renderWithProviders } from '@/test/render'
import { mockTablesApi, mockTablesControl } from './api.mock'
import TablesPage from './TablesPage'

vi.mock('./api', () => ({ tablesApi: mockTablesApi }))
vi.mock('@/features/reservations/api', async () => ({ reservationsApi: (await import('@/features/reservations/api.mock')).mockReservationsApi }))

const PROTECTED =
  'Esta mesa tiene una reserva de DiNNo en curso. Se libera sola cuando el comensal llegue, cancele o se venza la reserva.'

// Seed: Mesa 01 (4 personas) and Mesa 07 (2 personas) are Disponible; both get a DiNNo reservation.
function withReservations() {
  mockReservationsControl.reset([
    { tableId: 'mock-7', tableIdentifier: '07', partySize: 2, dinerName: null, minutesLeft: 3, code: 'P3R8TW' },
    { tableId: 'mock-1', tableIdentifier: '01', partySize: 3, dinerName: 'Laura', minutesLeft: 12, code: 'K7M4QX' },
  ])
  // Like the backend: reserving moves the table from Disponible to Reservada.
  mockTablesControl.reset(mockTablesControl.snapshot().map((t) => (t.id === 'mock-1' || t.id === 'mock-7' ? { ...t, status: 'reserved' } : t)))
  mockTablesControl.setDinnoReservations({ 'mock-1': 3, 'mock-7': 2 })
}

beforeEach(() => {
  mockTablesControl.reset()
  mockTablesControl.setLatency(0)
  mockReservationsControl.reset()
  mockReservationsControl.setLatency(0)
  window.localStorage.clear()
})

async function renderPage() {
  const utils = renderWithProviders(<TablesPage />)
  await screen.findByRole('list', { name: 'Mesas' })
  return utils
}

const panel = () => screen.getByRole('region', { name: 'Reservas DiNNo' })
const card = (name: string) => screen.getByRole('button', { name })

describe('TablesPage · Reservas DiNNo', () => {
  it('empty panel: «No hay reservas en este momento»', async () => {
    await renderPage()
    expect(await within(panel()).findByText('No hay reservas en este momento')).toBeInTheDocument()
  })

  it('lists who is on the way, the next to expire first, with time left and never a code', async () => {
    withReservations()
    await renderPage()
    const rows = await within(panel()).findAllByRole('listitem')
    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('Comensal')
    expect(rows[0]).toHaveTextContent('Mesa 07 · 2 personas')
    expect(rows[0]).toHaveTextContent(/0[23]:\d\d/)
    expect(rows[1]).toHaveTextContent('Laura')
    expect(rows[1]).toHaveTextContent('Mesa 01 · 3 personas')
    expect(panel()).not.toHaveTextContent('K7M4QX')
    expect(panel()).not.toHaveTextContent('P3R8TW')
  })

  it('a load error offers «Intentar de nuevo»', async () => {
    mockReservationsControl.failOn('reservations-list')
    const { user } = await renderPage()
    const alert = await within(panel()).findByRole('alert')
    expect(alert).toHaveTextContent('No pudimos cargar las reservas. Revisa tu conexión e intenta de nuevo.')
    mockReservationsControl.clearFailures()
    await user.click(within(alert).getByRole('button', { name: 'Intentar de nuevo' }))
    expect(await within(panel()).findByText('No hay reservas en este momento')).toBeInTheDocument()
  })
})

describe('TablesPage · mesa con reserva DiNNo (§12.2)', () => {
  it('shows «Reserva DiNNo», its picker explains why instead of offering statuses, and the menu has only Editar', async () => {
    withReservations()
    const { user } = await renderPage()
    await waitFor(() => expect(card('Mesa 01')).toHaveAccessibleDescription(/Reserva DiNNo/))
    expect(card('Mesa 03')).toHaveAccessibleDescription('4 personas Reservada')

    await user.click(card('Mesa 01'))
    expect(await screen.findByText(PROTECTED)).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: 'Estado de Mesa 01' })).not.toBeInTheDocument()
    await user.keyboard('{Escape}')

    await user.click(screen.getAllByRole('button', { name: 'Más acciones de Mesa 01' })[0])
    expect(within(screen.getByRole('menu')).getAllByRole('menuitem').map((item) => item.textContent)).toEqual(['Editar'])
  })

  it('D, R and O do nothing on it', async () => {
    withReservations()
    const { user } = await renderPage()
    await waitFor(() => expect(card('Mesa 01')).toHaveAccessibleDescription(/Reserva DiNNo/))
    card('Mesa 01').focus()
    await user.keyboard('d')
    await user.keyboard('o')
    expect(mockTablesControl.snapshot().find((t) => t.id === 'mock-1')?.status).toBe('reserved')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('TablesPage · Validar código (§12.6)', () => {
  async function openCheckIn() {
    const utils = await renderPage()
    await utils.user.click(screen.getByRole('button', { name: 'Validar código' }))
    const dialog = await screen.findByRole('dialog', { name: 'Validar código' })
    const field = within(dialog).getByRole('textbox', { name: 'Código de la reserva' })
    return { ...utils, dialog, field }
  }

  it('lowercase with spaces works: confirms, the row leaves the panel, the table turns Ocupada and the field is ready again', async () => {
    withReservations()
    const { user, dialog, field } = await openCheckIn()
    await user.type(field, 'k7m 4qx')
    expect(field).toHaveValue('K7M4QX')
    await user.click(within(dialog).getByRole('button', { name: 'Validar código' }))

    expect(await within(dialog).findByRole('status')).toHaveTextContent('Check-in confirmado · Mesa 01 · 3 personas · Laura')
    await waitFor(() => expect(field).toHaveValue(''))
    await waitFor(() => expect(field).toHaveFocus())
    await user.keyboard('{Escape}')
    await waitFor(() => expect(within(panel()).getAllByRole('listitem')).toHaveLength(1))
    await waitFor(() => expect(card('Mesa 01')).toHaveAccessibleDescription('4 personas Ocupada'))
  })

  it.each([
    ['ABCDEF', 'No encontramos una reserva con ese código en tu restaurante.'],
    ['VENC9D', 'Esta reserva se venció a las 12:41. La mesa ya se liberó.'],
    ['USAD4S', 'Este código ya se usó a las 12:35.'],
    ['CANC3X', 'El comensal canceló esta reserva.'],
  ])('%s → «%s», and the field clears for the next one', async (code, text) => {
    const { user, dialog, field } = await openCheckIn()
    await user.type(field, code)
    await user.keyboard('{Enter}')
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(text)
    await waitFor(() => expect(field).toHaveValue(''))
  })

  it('checks the format before sending: empty or not 6 characters never reaches the API', async () => {
    const { user, dialog, field } = await openCheckIn()
    await user.click(within(dialog).getByRole('button', { name: 'Validar código' }))
    expect(field).toHaveAccessibleDescription('Escribe el código que te muestra el comensal.')
    await user.type(field, 'K7M4')
    await user.keyboard('{Enter}')
    expect(field).toHaveAccessibleDescription('El código tiene 6 letras y números. Revísalo con el comensal.')
    expect(field).toHaveValue('K7M4')
  })
})
