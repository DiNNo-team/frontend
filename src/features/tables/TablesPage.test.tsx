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

async function renderLoaded() {
  const utils = renderWithProviders(<TablesPage />)
  await screen.findByRole('list', { name: 'Mesas' })
  return utils
}

describe('TablesPage', () => {
  it('lists the tables in natural order with name, capacity and status', async () => {
    await renderLoaded()
    const items = within(screen.getByRole('list', { name: 'Mesas' })).getAllByRole('listitem')
    expect(items).toHaveLength(8)
    expect(items.map((item) => within(item).getByRole('heading').textContent)).toEqual([
      'Mesa 01',
      'Mesa 02',
      'Mesa 03',
      'Mesa 04',
      'Mesa 05',
      'Mesa 06',
      'Mesa 07',
      'Mesa 08',
    ])
    expect(within(items[1]).getByText('2 personas')).toBeInTheDocument()
    expect(within(items[1]).getByText('Ocupada')).toBeInTheDocument()
    expect(within(items[5]).getByText('Inactiva')).toBeInTheDocument()
  })

  it('counts only active tables in libres/reservadas/ocupadas, with singular for one', async () => {
    await renderLoaded()
    expect(screen.getByText('libres').previousSibling).toHaveTextContent('3')
    expect(screen.getByText('reservadas').previousSibling).toHaveTextContent('2')
    expect(screen.getByText('ocupadas').previousSibling).toHaveTextContent('2')
    expect(screen.getByText('inactiva').previousSibling).toHaveTextContent('1')
  })

  it('sorts identifiers naturally ("2" before "10")', async () => {
    const [first] = mockTablesControl.snapshot()
    mockTablesControl.reset([
      { ...first, id: 'a', identifier: '10' },
      { ...first, id: 'b', identifier: '2' },
      { ...first, id: 'c', identifier: 'T1' },
    ])
    await renderLoaded()
    const names = within(screen.getByRole('list', { name: 'Mesas' })).getAllByRole('heading').map((heading) => heading.textContent)
    expect(names).toEqual(['Mesa 02', 'Mesa 10', 'Mesa T1'])
  })

  it('has a single primary "Agregar mesa" in the header', async () => {
    await renderLoaded()
    expect(screen.getAllByRole('button', { name: 'Agregar mesa' })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1, name: 'Mesas' })).toBeInTheDocument()
  })

  it('empty: shows the empty state as the only primary and hides the metrics', async () => {
    mockTablesControl.reset([])
    renderWithProviders(<TablesPage />)
    expect(await screen.findByRole('heading', { name: 'Aún no tienes mesas' })).toBeInTheDocument()
    expect(screen.getByText('Agrega tus mesas para empezar a recibir comensales.')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Agregar mesa' })).toHaveLength(1)
    expect(screen.queryByText('libres')).not.toBeInTheDocument()
  })

  it('load error: explains it and "Intentar de nuevo" fetches the list again', async () => {
    mockTablesControl.failOn('list')
    const { user } = renderWithProviders(<TablesPage />)
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar tus mesas')
    expect(screen.getByText('Revisa tu conexión e intenta de nuevo.')).toBeInTheDocument()

    mockTablesControl.clearFailures()
    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
    await waitFor(() => expect(screen.getByRole('list', { name: 'Mesas' })).toBeInTheDocument())
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('loading: announces it and shows nothing visual before 300 ms', async () => {
    mockTablesControl.setLatency(1000)
    renderWithProviders(<TablesPage />)
    expect(screen.getByRole('status')).toHaveTextContent('Cargando mesas')
    expect(document.querySelector('.animate-skeleton')).toBeNull()
    await waitFor(() => expect(document.querySelector('.animate-skeleton')).not.toBeNull(), { timeout: 900 })
  })
})
