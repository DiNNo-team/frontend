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
const metric = (label: string) => screen.getByText(label).previousSibling
const storedStatus = (identifier: string) => mockTablesControl.snapshot().find((t) => t.identifier === identifier)?.status

describe('TablesPage · cambiar estado', () => {
  it('selecting a card shows the status bar; selecting it again hides it', async () => {
    const { user } = await renderPage()
    await user.click(card('Mesa 04'))
    expect(card('Mesa 04')).toHaveAttribute('aria-pressed', 'true')
    const bar = screen.getByRole('region', { name: 'Mesa 04' })
    expect(within(bar).getByText('2 personas')).toBeInTheDocument()
    expect(within(bar).getByRole('radiogroup', { name: 'Estado de Mesa 04' })).toBeInTheDocument()
    expect(within(bar).getByRole('radio', { name: 'Disponible' })).toHaveAttribute('aria-checked', 'true')
    expect(within(bar).queryByRole('radio', { name: 'Inactiva' })).not.toBeInTheDocument()

    await user.click(card('Mesa 04'))
    expect(screen.queryByRole('region', { name: 'Mesa 04' })).not.toBeInTheDocument()
  })

  it('only one table is selected at a time and inactive tables cannot be selected', async () => {
    const { user } = await renderPage()
    await user.click(card('Mesa 01'))
    await user.click(card('Mesa 02'))
    expect(card('Mesa 01')).toHaveAttribute('aria-pressed', 'false')
    expect(card('Mesa 02')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByRole('button', { name: 'Mesa 06' })).not.toBeInTheDocument()
  })

  it('changes at once (optimistic), persists, updates metrics and toasts with Deshacer', async () => {
    const { user } = await renderPage()
    expect(metric('ocupadas')).toHaveTextContent('2')
    await user.click(card('Mesa 04'))
    await user.click(screen.getByRole('radio', { name: 'Ocupada' }))

    expect(card('Mesa 04')).toHaveAccessibleDescription('2 personas Ocupada')
    expect(metric('ocupadas')).toHaveTextContent('3')
    expect(metric('libres')).toHaveTextContent('2')
    expect(await screen.findByRole('button', { name: 'Deshacer' })).toBeInTheDocument()
    expect(screen.getAllByText('Mesa 04 ahora está Ocupada').length).toBeGreaterThan(0)
    expect(storedStatus('04')).toBe('occupied')
  })

  it('"Deshacer" goes back to the previous status with the same call', async () => {
    const { user } = await renderPage()
    await user.click(card('Mesa 04'))
    await user.click(screen.getByRole('radio', { name: 'Reservada' }))
    await user.click(await screen.findByRole('button', { name: 'Deshacer' }))

    await waitFor(() => expect(storedStatus('04')).toBe('available'))
    expect(card('Mesa 04')).toHaveAccessibleDescription('2 personas Disponible')
    expect(screen.getAllByText('Mesa 04 ahora está Disponible').length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: 'Deshacer' })).not.toBeInTheDocument()
  })

  it('several quick changes on the same table: the last one wins', async () => {
    mockTablesControl.setLatency(30)
    const { user } = await renderPage()
    await user.click(card('Mesa 04'))
    await user.click(screen.getByRole('radio', { name: 'Ocupada' }))
    await user.click(screen.getByRole('radio', { name: 'Reservada' }))
    expect(card('Mesa 04')).toHaveAccessibleDescription('2 personas Reservada')
    await waitFor(() => expect(storedStatus('04')).toBe('reserved'))
    await waitFor(() => expect(card('Mesa 04')).toHaveAccessibleDescription('2 personas Reservada'))
  })

  it('on failure the table goes back and an Alert offers "Intentar de nuevo"', async () => {
    mockTablesControl.failOn('status')
    const { user } = await renderPage()
    await user.click(card('Mesa 04'))
    await user.click(screen.getByRole('radio', { name: 'Ocupada' }))

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

  it('409 inactive table: refreshes the list, closes the bar and explains it', async () => {
    const { user } = await renderPage()
    await user.click(card('Mesa 04'))
    // Someone deactivated Mesa 04 meanwhile.
    mockTablesControl.reset(mockTablesControl.snapshot().map((t) => (t.identifier === '04' ? { ...t, isActive: false } : t)))
    await user.click(screen.getByRole('radio', { name: 'Ocupada' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Mesa 04 está inactiva. Reactívala para cambiar su estado.')
    expect(within(screen.getByRole('alert')).queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Mesa 04' })).not.toBeInTheDocument()
    await waitFor(() => expect(metric('inactivas')).toHaveTextContent('2'))
  })

  it('keyboard: Tab to a card, Enter selects and focuses the active segment, arrows + Enter apply, Esc closes', async () => {
    const { user } = await renderPage()
    card('Mesa 01').focus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Más acciones de Mesa 01' })).toHaveFocus()
    await user.tab()
    expect(card('Mesa 02')).toHaveFocus()

    await user.keyboard('{Enter}')
    const bar = screen.getByRole('region', { name: 'Mesa 02' })
    await waitFor(() => expect(within(bar).getByRole('radio', { name: 'Ocupada' })).toHaveFocus())

    await user.keyboard('{ArrowLeft}')
    expect(within(bar).getByRole('radio', { name: 'Reservada' })).toHaveFocus()
    expect(storedStatus('02')).toBe('occupied')
    await user.keyboard('{Enter}')
    await waitFor(() => expect(storedStatus('02')).toBe('reserved'))

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('region', { name: 'Mesa 02' })).not.toBeInTheDocument()
    expect(card('Mesa 02')).toHaveFocus()
    expect(card('Mesa 02')).toHaveAttribute('aria-pressed', 'false')
  })

  it('Esc inside the create dialog closes only the dialog, not the selection', async () => {
    const { user } = await renderPage()
    await user.click(card('Mesa 04'))
    await user.click(screen.getByRole('button', { name: 'Agregar mesa' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Mesa 04' })).toBeInTheDocument()
  })
})
