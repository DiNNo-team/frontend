import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import { mockTablesApi, mockTablesControl } from './api.mock'
import TablesPage from './TablesPage'

vi.mock('./api', () => ({ tablesApi: mockTablesApi }))

beforeEach(() => {
  mockTablesControl.reset()
  mockTablesControl.setLatency(0)
})

async function renderPage() {
  const utils = renderWithProviders(<TablesPage />)
  await screen.findByRole('list', { name: 'Mesas' })
  return utils
}

const card = (name: string) => screen.getByRole('button', { name })
const picker = (name: string) => screen.getByRole('radiogroup', { name: `Estado de ${name}` })
const metric = (label: string) => screen.getByText(label).previousSibling
const storedStatus = (identifier: string) => mockTablesControl.snapshot().find((t) => t.identifier === identifier)?.status

describe('TablesPage · cambiar estado', () => {
  it('tapping a card opens its status picker next to it; tapping it again closes it', async () => {
    const { user } = await renderPage()
    await user.click(card('Mesa 04'))
    expect(card('Mesa 04')).toHaveAttribute('aria-expanded', 'true')
    const group = picker('Mesa 04')
    expect(within(group).getByRole('radio', { name: 'Disponible' })).toHaveAttribute('aria-checked', 'true')
    expect(within(group).getByRole('radio', { name: 'Reservada' })).toHaveAttribute('aria-checked', 'false')
    expect(within(group).queryByRole('radio', { name: 'Inactiva' })).not.toBeInTheDocument()

    await user.click(card('Mesa 04'))
    await waitFor(() => expect(screen.queryByRole('radiogroup', { name: /^Estado de/ })).not.toBeInTheDocument())
    expect(card('Mesa 04')).toHaveAttribute('aria-expanded', 'false')
  })

  it('one picker at a time; an inactive table offers "Reactivar mesa" instead of statuses', async () => {
    const { user } = await renderPage()
    await user.click(card('Mesa 01'))
    await user.click(card('Mesa 02'))
    expect(card('Mesa 01')).toHaveAttribute('aria-expanded', 'false')
    expect(card('Mesa 02')).toHaveAttribute('aria-expanded', 'true')
    await waitFor(() => expect(screen.getAllByRole('radiogroup', { name: /^Estado de/ })).toHaveLength(1))

    await user.click(card('Mesa 06'))
    expect(await screen.findByText('Mesa 06 está inactiva. No aparece para los comensales.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reactivar mesa' })).toBeInTheDocument()
    expect(screen.queryByRole('radiogroup', { name: 'Estado de Mesa 06' })).not.toBeInTheDocument()
  })

  it('changes at once (optimistic), closes the picker, persists, updates the summary and toasts with Deshacer', async () => {
    const { user } = await renderPage()
    expect(metric('ocupadas')).toHaveTextContent('2')
    await user.click(card('Mesa 04'))
    await user.click(within(picker('Mesa 04')).getByRole('radio', { name: 'Ocupada' }))

    expect(card('Mesa 04')).toHaveAccessibleDescription('2 personas Ocupada')
    await waitFor(() => expect(screen.queryByRole('radiogroup', { name: /^Estado de/ })).not.toBeInTheDocument())
    expect(metric('ocupadas')).toHaveTextContent('3')
    expect(metric('disponibles')).toHaveTextContent('2')
    expect(await screen.findByRole('button', { name: 'Deshacer' })).toBeInTheDocument()
    expect(screen.getAllByText('Mesa 04 ahora está Ocupada').length).toBeGreaterThan(0)
    expect(storedStatus('04')).toBe('occupied')
  })

  it('"Deshacer" goes back to the previous status with the same call', async () => {
    const { user } = await renderPage()
    await user.click(card('Mesa 04'))
    await user.click(within(picker('Mesa 04')).getByRole('radio', { name: 'Reservada' }))
    await user.click(await screen.findByRole('button', { name: 'Deshacer' }))

    await waitFor(() => expect(storedStatus('04')).toBe('available'))
    expect(card('Mesa 04')).toHaveAccessibleDescription('2 personas Disponible')
    expect(screen.getAllByText('Mesa 04 ahora está Disponible').length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: 'Deshacer' })).not.toBeInTheDocument()
  })

  it('several quick changes on the same table: the last one wins', async () => {
    mockTablesControl.setLatency(30)
    const { user } = await renderPage()
    card('Mesa 04').focus()
    await user.keyboard('o')
    await user.keyboard('r')
    expect(card('Mesa 04')).toHaveAccessibleDescription('2 personas Reservada')
    await waitFor(() => expect(storedStatus('04')).toBe('reserved'))
    await waitFor(() => expect(card('Mesa 04')).toHaveAccessibleDescription('2 personas Reservada'))
  })

  it('on failure the table goes back and an Alert offers "Intentar de nuevo"', async () => {
    mockTablesControl.failOn('status')
    const { user } = await renderPage()
    await user.click(card('Mesa 04'))
    await user.click(within(picker('Mesa 04')).getByRole('radio', { name: 'Ocupada' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('No pudimos cambiar el estado de Mesa 04. Revisa tu conexión e intenta de nuevo.')
    expect(card('Mesa 04')).toHaveAccessibleDescription('2 personas Disponible')
    expect(storedStatus('04')).toBe('available')

    mockTablesControl.clearFailures()
    await user.click(within(alert).getByRole('button', { name: 'Intentar de nuevo' }))
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    expect(storedStatus('04')).toBe('occupied')
    expect(card('Mesa 04')).toHaveAccessibleDescription('2 personas Ocupada')
  })

  it('409 inactive table: refreshes the list and explains it', async () => {
    const { user } = await renderPage()
    await user.click(card('Mesa 04'))
    // Someone deactivated Mesa 04 meanwhile.
    mockTablesControl.reset(mockTablesControl.snapshot().map((t) => (t.identifier === '04' ? { ...t, isActive: false } : t)))
    await user.click(within(picker('Mesa 04')).getByRole('radio', { name: 'Ocupada' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Mesa 04 está inactiva. Reactívala para cambiar su estado.')
    expect(within(screen.getByRole('alert')).queryByRole('button')).not.toBeInTheDocument()
    await waitFor(() => expect(metric('inactivas')).toHaveTextContent('2'))
  })

  it('keyboard: Enter opens on the current status, arrows move, Enter applies and focus returns; Esc closes', async () => {
    const { user } = await renderPage()
    card('Mesa 01').focus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Más acciones de Mesa 01' })).toHaveFocus()
    await user.tab()
    expect(card('Mesa 02')).toHaveFocus()

    await user.keyboard('{Enter}')
    await waitFor(() => expect(within(picker('Mesa 02')).getByRole('radio', { name: 'Ocupada' })).toHaveFocus())
    await user.keyboard('{ArrowUp}')
    expect(within(picker('Mesa 02')).getByRole('radio', { name: 'Reservada' })).toHaveFocus()
    expect(storedStatus('02')).toBe('occupied')
    await user.keyboard('{Enter}')
    await waitFor(() => expect(storedStatus('02')).toBe('reserved'))
    await waitFor(() => expect(card('Mesa 02')).toHaveFocus())

    await user.keyboard('{Enter}')
    await screen.findByRole('radiogroup', { name: 'Estado de Mesa 02' })
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('radiogroup', { name: /^Estado de/ })).not.toBeInTheDocument())
    expect(card('Mesa 02')).toHaveFocus()
    expect(card('Mesa 02')).toHaveAttribute('aria-expanded', 'false')
  })

  it('D, R and O on a focused card change its status without opening the picker', async () => {
    const { user } = await renderPage()
    card('Mesa 07').focus()
    await user.keyboard('o')
    expect(card('Mesa 07')).toHaveAccessibleDescription('2 personas Ocupada')
    expect(screen.queryByRole('radiogroup', { name: /^Estado de/ })).not.toBeInTheDocument()
    await waitFor(() => expect(storedStatus('07')).toBe('occupied'))
    expect(screen.getAllByText('Mesa 07 ahora está Ocupada').length).toBeGreaterThan(0)
  })
})
