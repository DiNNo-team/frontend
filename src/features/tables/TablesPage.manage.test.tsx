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

const cardOf = (name: string) => screen.getByRole('heading', { name }).closest('article') as HTMLElement
const metric = (label: string) => screen.getByText(label).previousSibling
const stored = (identifier: string) => mockTablesControl.snapshot().find((t) => t.identifier === identifier)

async function openMenu(user: ReturnType<typeof renderWithProviders>['user'], name: string) {
  await user.click(screen.getAllByRole('button', { name: `Más acciones de ${name}` })[0])
  return screen.getByRole('menu')
}

describe('TablesPage · menú ⋯', () => {
  it('active table: Editar · Desactivar (red, after a divider); inactive: Editar · Reactivar', async () => {
    const { user } = await renderPage()
    let menu = await openMenu(user, 'Mesa 04')
    expect(within(menu).getAllByRole('menuitem').map((item) => item.textContent)).toEqual(['Editar', 'Desactivar'])
    expect(within(menu).getByRole('separator')).toBeInTheDocument()
    await user.keyboard('{Escape}')

    menu = await openMenu(user, 'Mesa 06')
    expect(within(menu).getAllByRole('menuitem').map((item) => item.textContent)).toEqual(['Editar', 'Reactivar'])
  })

  it('the status bar has the same menu', async () => {
    const { user } = await renderPage()
    await user.click(screen.getByRole('button', { name: 'Mesa 04' }))
    const bar = screen.getByRole('region', { name: 'Mesa 04' })
    await user.click(within(bar).getByRole('button', { name: 'Más acciones de Mesa 04' }))
    expect(within(screen.getByRole('menu')).getAllByRole('menuitem').map((item) => item.textContent)).toEqual(['Editar', 'Desactivar'])
  })
})

describe('TablesPage · editar mesa', () => {
  it('reuses the form, prefilled; saving updates the card and toasts "Cambios guardados"', async () => {
    const { user } = await renderPage()
    await openMenu(user, 'Mesa 04')
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }))

    const dialog = screen.getByRole('dialog', { name: 'Editar Mesa 04' })
    expect(within(dialog).getByLabelText('Identificador')).toHaveValue('04')
    expect(within(dialog).getByRole('spinbutton', { name: 'Capacidad' })).toHaveValue('2')
    await user.click(within(dialog).getByRole('button', { name: 'Agregar una persona' }))
    await user.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getAllByText('Cambios guardados').length).toBeGreaterThan(0)
    expect(within(cardOf('Mesa 04')).getByText('3 personas')).toBeInTheDocument()
    expect(stored('04')?.capacity).toBe(3)
  })

  it('renames a table and keeps its own identifier valid', async () => {
    const { user } = await renderPage()
    await openMenu(user, 'Mesa 04')
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }))
    const identifier = screen.getByLabelText('Identificador')
    await user.clear(identifier)
    await user.type(identifier, '4')
    await user.tab()
    expect(screen.queryByText(/Ya tienes una/)).not.toBeInTheDocument()

    await user.clear(identifier)
    await user.type(identifier, 'T4')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByRole('heading', { name: 'Mesa T4' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Mesa 04' })).not.toBeInTheDocument()
  })

  it('repeated identifier: same error as creating, nothing saved', async () => {
    const { user } = await renderPage()
    await openMenu(user, 'Mesa 04')
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }))
    const identifier = screen.getByLabelText('Identificador')
    await user.clear(identifier)
    await user.type(identifier, '1')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(identifier).toHaveAccessibleDescription('Ya tienes una Mesa 01. Usa otro identificador.')
    expect(stored('04')).toBeDefined()
  })

  it('network error: Alert inside the dialog, keeps the values', async () => {
    mockTablesControl.failOn('update')
    const { user } = await renderPage()
    await openMenu(user, 'Mesa 04')
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }))
    await user.click(screen.getByRole('button', { name: 'Agregar una persona' }))
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await within(screen.getByRole('dialog')).findByRole('alert')).toHaveTextContent(
      'No pudimos guardar la mesa. Revisa tu conexión e intenta de nuevo.',
    )
    expect(screen.getByRole('spinbutton', { name: 'Capacidad' })).toHaveValue('3')
    expect(stored('04')?.capacity).toBe(2)
  })
})

describe('TablesPage · desactivar y reactivar', () => {
  it('Cancelar keeps the table active', async () => {
    const { user } = await renderPage()
    await openMenu(user, 'Mesa 04')
    await user.click(screen.getByRole('menuitem', { name: 'Desactivar' }))
    const dialog = screen.getByRole('dialog', { name: '¿Desactivar Mesa 04?' })
    expect(dialog).toHaveAccessibleDescription('No aparecerá para los comensales. Puedes reactivarla cuando quieras.')
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(stored('04')?.isActive).toBe(true)
  })

  it('confirming: the card turns inactive, stops counting, and the toast offers Deshacer', async () => {
    const { user } = await renderPage()
    expect(metric('libres')).toHaveTextContent('3')
    await openMenu(user, 'Mesa 04')
    await user.click(screen.getByRole('menuitem', { name: 'Desactivar' }))
    await user.click(screen.getByRole('button', { name: 'Desactivar mesa' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    const card = cardOf('Mesa 04')
    expect(within(card).getByText('Inactiva')).toBeInTheDocument()
    expect(within(card).getByRole('button', { name: 'Reactivar' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mesa 04' })).not.toBeInTheDocument()
    expect(metric('libres')).toHaveTextContent('2')
    expect(metric('inactivas')).toHaveTextContent('2')
    expect(screen.getAllByText('Mesa 04 desactivada').length).toBeGreaterThan(0)
    expect(stored('04')?.isActive).toBe(false)
    await waitFor(() => expect(within(card).getByRole('button', { name: 'Más acciones de Mesa 04' })).toHaveFocus())

    await user.click(screen.getByRole('button', { name: 'Deshacer' }))
    await waitFor(() => expect(stored('04')?.isActive).toBe(true))
    expect(screen.getAllByText('Mesa 04 reactivada').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Mesa 04' })).toHaveAccessibleDescription('2 personas Disponible')
  })

  it('deactivating the selected table from the bar closes the bar', async () => {
    const { user } = await renderPage()
    await user.click(screen.getByRole('button', { name: 'Mesa 02' }))
    const bar = screen.getByRole('region', { name: 'Mesa 02' })
    await user.click(within(bar).getByRole('button', { name: 'Más acciones de Mesa 02' }))
    await user.click(screen.getByRole('menuitem', { name: 'Desactivar' }))
    await user.click(screen.getByRole('button', { name: 'Desactivar mesa' }))
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Mesa 02' })).not.toBeInTheDocument())
    expect(within(cardOf('Mesa 02')).getByText('Inactiva')).toBeInTheDocument()
  })

  it('deactivation error: Alert inside the dialog, which stays open', async () => {
    mockTablesControl.failOn('deactivate')
    const { user } = await renderPage()
    await openMenu(user, 'Mesa 04')
    await user.click(screen.getByRole('menuitem', { name: 'Desactivar' }))
    await user.click(screen.getByRole('button', { name: 'Desactivar mesa' }))
    const dialog = screen.getByRole('dialog', { name: '¿Desactivar Mesa 04?' })
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'No pudimos desactivar la mesa. Revisa tu conexión e intenta de nuevo.',
    )
    expect(stored('04')?.isActive).toBe(true)
  })

  it('"Reactivar" on the card: no confirmation, comes back Disponible, toast', async () => {
    const { user } = await renderPage()
    expect(metric('inactiva')).toHaveTextContent('1')
    await user.click(within(cardOf('Mesa 06')).getByRole('button', { name: 'Reactivar' }))
    await waitFor(() => expect(stored('06')?.isActive).toBe(true))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mesa 06' })).toHaveAccessibleDescription('4 personas Disponible')
    expect(screen.getAllByText('Mesa 06 reactivada').length).toBeGreaterThan(0)
    expect(metric('inactivas')).toHaveTextContent('0')
  })

  it('"Reactivar" from the menu works the same', async () => {
    const { user } = await renderPage()
    await openMenu(user, 'Mesa 06')
    await user.click(screen.getByRole('menuitem', { name: 'Reactivar' }))
    await waitFor(() => expect(stored('06')?.isActive).toBe(true))
  })

  it('reactivation error: Alert above the content with "Intentar de nuevo"', async () => {
    mockTablesControl.failOn('reactivate')
    const { user } = await renderPage()
    await user.click(within(cardOf('Mesa 06')).getByRole('button', { name: 'Reactivar' }))
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('No pudimos reactivar Mesa 06. Revisa tu conexión e intenta de nuevo.')

    mockTablesControl.clearFailures()
    await user.click(within(alert).getByRole('button', { name: 'Intentar de nuevo' }))
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    expect(stored('06')?.isActive).toBe(true)
  })
})
