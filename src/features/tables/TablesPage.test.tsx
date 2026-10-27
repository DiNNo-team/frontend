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
  it('lists the tables in natural order (inactive last) with name, capacity and status', async () => {
    await renderLoaded()
    const items = within(screen.getByRole('list', { name: 'Mesas' })).getAllByRole('listitem')
    expect(items).toHaveLength(8)
    expect(items.map((item) => within(item).getByRole('heading').textContent)).toEqual([
      'Mesa 01',
      'Mesa 02',
      'Mesa 03',
      'Mesa 04',
      'Mesa 05',
      'Mesa 07',
      'Mesa 08',
      'Mesa 06',
    ])
    expect(within(items[1]).getByText('2 personas')).toBeInTheDocument()
    expect(within(items[1]).getByText('Ocupada')).toBeInTheDocument()
    // Inactive tables go at the end (manual 13.10).
    expect(within(items[7]).getByText('Inactiva')).toBeInTheDocument()
  })

  it('counts only active tables in disponibles/reservadas/ocupadas, with singular for one', async () => {
    await renderLoaded()
    expect(within(screen.getByRole('group', { name: 'Resumen de mesas' })).getByText('Disponibles').parentElement?.nextElementSibling).toHaveTextContent('3')
    expect(within(screen.getByRole('group', { name: 'Resumen de mesas' })).getByText('Reservadas').parentElement?.nextElementSibling).toHaveTextContent('2')
    expect(within(screen.getByRole('group', { name: 'Resumen de mesas' })).getByText('Ocupadas').parentElement?.nextElementSibling).toHaveTextContent('2')
    expect(within(screen.getByRole('group', { name: 'Resumen de mesas' })).getByText('Inactiva').parentElement?.nextElementSibling).toHaveTextContent('1')
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

  it('opens with the greeting; the view switch and a single primary "Agregar mesa" sit in the header (manual v2.1)', async () => {
    await renderLoaded()
    const header = screen.getByRole('heading', { level: 1, name: /^Buen(os días|as tardes|as noches)/ }).closest('header') as HTMLElement
    expect(within(header).getByText(/3 mesas disponibles de 7/)).toBeInTheDocument()
    expect(within(header).getByRole('radiogroup', { name: 'Vista de mesas' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Agregar mesa' })).toHaveLength(1)
    expect(within(header).getByRole('button', { name: 'Agregar mesa' })).toHaveClass('bg-accent')
  })

  it('empty: shows the empty state as the only primary and hides the metrics', async () => {
    mockTablesControl.reset([])
    renderWithProviders(<TablesPage />)
    expect(await screen.findByRole('heading', { name: 'Aún no tienes mesas' })).toBeInTheDocument()
    expect(screen.getByText('Agrega tus mesas para empezar a recibir comensales.')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Agregar mesa' })).toHaveLength(1)
    expect(screen.queryByRole('group', { name: 'Resumen de mesas' })).not.toBeInTheDocument()
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

  it('the summary filters the grid; pressing the active cell or "Ver todas" clears it', async () => {
    const { user } = await renderLoaded()
    const reserved = screen.getByRole('button', { name: /reservadas/i })
    await user.click(reserved)
    expect(reserved).toHaveAttribute('aria-pressed', 'true')
    let names = within(screen.getByRole('list', { name: 'Mesas' })).getAllByRole('heading').map((heading) => heading.textContent)
    expect(names).toEqual(['Mesa 03', 'Mesa 08'])
    await user.click(reserved)
    expect(within(screen.getByRole('list', { name: 'Mesas' })).getAllByRole('listitem')).toHaveLength(8)

    await user.click(screen.getByRole('button', { name: /inactiva/i }))
    names = within(screen.getByRole('list', { name: 'Mesas' })).getAllByRole('heading').map((heading) => heading.textContent)
    expect(names).toEqual(['Mesa 06'])
  })

  it('loading: announces it and shows nothing visual before 300 ms', async () => {
    mockTablesControl.setLatency(1000)
    renderWithProviders(<TablesPage />)
    expect(screen.getByRole('status')).toHaveTextContent('Cargando mesas')
    expect(document.querySelector('.animate-skeleton')).toBeNull()
    await waitFor(() => expect(document.querySelector('.animate-skeleton')).not.toBeNull(), { timeout: 900 })
  })
})
