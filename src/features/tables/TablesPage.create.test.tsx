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

async function openCreateDialog() {
  const utils = renderWithProviders(<TablesPage />)
  await screen.findByRole('list', { name: 'Mesas' })
  await utils.user.click(screen.getByRole('button', { name: 'Agregar mesa' }))
  const dialog = screen.getByRole('dialog', { name: 'Agregar mesa' })
  return { ...utils, dialog }
}

describe('TablesPage · crear mesa', () => {
  it('creates a valid table: closes, toasts and shows it without reloading', async () => {
    const { user, dialog } = await openCreateDialog()
    const identifier = within(dialog).getByLabelText('Identificador')
    expect(identifier).toHaveFocus()
    await user.type(identifier, '9')
    expect(within(dialog).getByText('Así la verás: Mesa 09')).toBeInTheDocument()
    expect(within(dialog).getByRole('spinbutton', { name: 'Capacidad' })).toHaveValue('4')
    await user.click(within(dialog).getByRole('button', { name: 'Agregar una persona' }))

    await user.click(within(dialog).getByRole('button', { name: 'Agregar mesa' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getAllByText('Mesa 09 agregada').length).toBeGreaterThan(0)
    const grid = screen.getByRole('list', { name: 'Mesas' })
    expect(within(grid).getAllByRole('listitem')).toHaveLength(9)
    const created = within(grid).getByRole('heading', { name: 'Mesa 09' }).closest('li') as HTMLElement
    expect(within(created).getByText('5 personas')).toBeInTheDocument()
    expect(within(created).getByText('Disponible')).toBeInTheDocument()
    expect(screen.getByText('libres').previousSibling).toHaveTextContent('4')
    expect(mockTablesControl.snapshot()).toHaveLength(9)
  })

  it('empty identifier: error on submit, focus on the field, nothing sent', async () => {
    const { user, dialog } = await openCreateDialog()
    await user.click(within(dialog).getByRole('button', { name: 'Agregar mesa' }))
    const identifier = within(dialog).getByLabelText('Identificador')
    expect(identifier).toHaveAccessibleDescription('Escribe el identificador de la mesa')
    expect(identifier).toHaveAttribute('aria-invalid', 'true')
    expect(identifier).toHaveFocus()
    expect(mockTablesControl.snapshot()).toHaveLength(8)
  })

  it('validates on blur, not on every key', async () => {
    const { user, dialog } = await openCreateDialog()
    const identifier = within(dialog).getByLabelText('Identificador')
    await user.type(identifier, '12345678901')
    expect(within(dialog).queryByText('Usa máximo 10 caracteres')).not.toBeInTheDocument()
    await user.tab()
    expect(within(dialog).getByText('Usa máximo 10 caracteres')).toBeInTheDocument()
  })

  it('repeated identifier is caught in the front (also against inactive tables)', async () => {
    const { user, dialog } = await openCreateDialog()
    await user.type(within(dialog).getByLabelText('Identificador'), '6')
    await user.click(within(dialog).getByRole('button', { name: 'Agregar mesa' }))
    expect(within(dialog).getByText('Ya tienes una Mesa 06. Usa otro identificador.')).toBeInTheDocument()
    expect(mockTablesControl.snapshot()).toHaveLength(8)
  })

  it('repeated identifier reported by the backend (409) shows the same field error', async () => {
    const { user, dialog } = await openCreateDialog()
    // Someone else created Mesa 10 after our list loaded.
    const current = mockTablesControl.snapshot()
    mockTablesControl.reset([...current, { ...current[0], id: 'other', identifier: '10' }])
    await user.type(within(dialog).getByLabelText('Identificador'), '10')
    await user.click(within(dialog).getByRole('button', { name: 'Agregar mesa' }))
    expect(await within(dialog).findByText('Ya tienes una Mesa 10. Usa otro identificador.')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('network error: Alert inside the dialog without losing what was typed', async () => {
    mockTablesControl.failOn('create')
    const { user, dialog } = await openCreateDialog()
    await user.type(within(dialog).getByLabelText('Identificador'), 'T2')
    await user.click(within(dialog).getByRole('button', { name: 'Agregar mesa' }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'No pudimos guardar la mesa. Revisa tu conexión e intenta de nuevo.',
    )
    expect(within(dialog).getByLabelText('Identificador')).toHaveValue('T2')

    mockTablesControl.clearFailures()
    await user.click(within(dialog).getByRole('button', { name: 'Agregar mesa' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(within(screen.getByRole('list', { name: 'Mesas' })).getByRole('heading', { name: 'Mesa T2' })).toBeInTheDocument()
  })

  it('Cancelar closes without creating and the empty state opens the same dialog', async () => {
    mockTablesControl.reset([])
    const { user } = renderWithProviders(<TablesPage />)
    await user.click(await screen.findByRole('button', { name: 'Agregar mesa' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Agregar mesa' }))
    await user.type(screen.getByLabelText('Identificador'), '1')
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Agregar mesa' }))
    expect(await screen.findByRole('list', { name: 'Mesas' })).toBeInTheDocument()
    expect(screen.getByText('libre').previousSibling).toHaveTextContent('1')
  })
})
