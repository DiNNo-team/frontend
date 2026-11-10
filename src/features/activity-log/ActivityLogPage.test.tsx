import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen, waitFor, within } from '@testing-library/react'
import { mockTablesControl } from '@/features/tables/api.mock'
import { MOCK_AREAS, mockAreasControl } from '@/features/tables/areas/api.mock'
import { ApiError } from '@/lib/api-client'
import { renderWithProviders } from '@/test/render'
import ActivityLogPage from './ActivityLogPage'
import { mockTableLogsApi, mockTableLogsControl } from './api.mock'
import type { TableLog } from './types'

// Async factories: the page imports both APIs while the mocks are still loading.
vi.mock('./api', async () => ({ tableLogsApi: (await import('./api.mock')).mockTableLogsApi }))
vi.mock('@/features/tables/api', async () => ({ tablesApi: (await import('@/features/tables/api.mock')).mockTablesApi }))
vi.mock('@/features/tables/areas/api', async () => ({ tableAreasApi: (await import('@/features/tables/areas/api.mock')).mockTableAreasApi }))

// Dates are shown in the browser's time zone: fix it so "7:30 p. m." does not depend on the machine.
vi.stubEnv('TZ', 'America/Bogota')

function log(overrides: Partial<TableLog> & Pick<TableLog, 'id' | 'changedAt'>): TableLog {
  return {
    tableId: 'mock-4',
    tableIdentifier: '04',
    previousStatus: 'available',
    newStatus: 'occupied',
    userEmail: 'admin@casa72.co',
    source: 'manual',
    ...overrides,
  }
}

beforeEach(() => {
  mockTableLogsControl.reset()
  mockTableLogsControl.setLatency(0)
  // Seed: Mesa 01…08, Mesa 06 inactive.
  mockTablesControl.reset()
  mockTablesControl.setLatency(0)
  mockAreasControl.reset()
  mockAreasControl.setLatency(0)
})

afterEach(() => {
  vi.restoreAllMocks()
})

async function renderPage() {
  const utils = renderWithProviders(<ActivityLogPage />)
  await screen.findByRole('table', { name: 'Bitácora de cambios de mesas' })
  return utils
}

// DataTable renders the desktop table and the mobile list (CSS hides one): look inside the table.
const table = () => screen.getByRole('table', { name: 'Bitácora de cambios de mesas' })
const bodyRows = () => within(table()).getAllByRole('row').slice(1)
const cellsOf = (row: HTMLElement) => within(row).getAllByRole('cell')

async function chooseTable(user: ReturnType<typeof renderWithProviders>['user'], name: string) {
  await waitFor(() => expect(screen.getByRole('combobox', { name: 'Mesa' })).toBeEnabled())
  await user.click(screen.getByRole('combobox', { name: 'Mesa' }))
  await user.click(screen.getByRole('option', { name }))
}

describe('ActivityLogPage', () => {
  it('shows the header, the filter and the columns of the manual', async () => {
    await renderPage()
    expect(screen.getByRole('heading', { name: 'Bitácora', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('Cambios de estado de tus mesas')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Mesa' })).toHaveTextContent('Todas las mesas')
    expect(within(table()).getAllByRole('columnheader').map((header) => header.textContent)).toEqual([
      'Fecha y hora',
      'Mesa',
      'Cambio',
      'Usuario',
    ])
  })

  it('shows skeletons only when loading takes more than 300 ms', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mockTableLogsControl.setLatency(1000)
    renderWithProviders(<ActivityLogPage />)

    expect(screen.getByRole('status')).toHaveTextContent('Cargando la bitácora')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    await act(() => vi.advanceTimersByTimeAsync(350))
    // DataTable marks its wrapper busy and draws skeleton rows (5) instead of data.
    expect(screen.getByRole('table', { name: 'Bitácora de cambios de mesas' }).closest('[aria-busy="true"]')).not.toBeNull()
    expect(screen.queryByText('admin@casa72.co')).not.toBeInTheDocument()

    await act(() => vi.advanceTimersByTimeAsync(1000))
    expect(await screen.findAllByText('admin@casa72.co')).not.toHaveLength(0)
  })

  it('shows the rows newest first, even if they arrive out of order', async () => {
    vi.spyOn(mockTableLogsApi, 'list').mockResolvedValue([
      log({ id: 'old', changedAt: '2026-09-30T14:00:00Z' }),
      log({ id: 'new', changedAt: '2026-10-01T00:30:00Z', tableIdentifier: '02' }),
      log({ id: 'mid', changedAt: '2026-09-30T20:00:00Z', tableIdentifier: '03' }),
    ])
    await renderPage()

    expect(bodyRows().map((row) => cellsOf(row)[1].textContent)).toEqual(['Mesa 02', 'Mesa 03', 'Mesa 04'])
  })

  it('formats date and table, shows both chips and the email', async () => {
    mockTableLogsControl.reset([
      log({ id: 'a', changedAt: '2026-10-01T00:30:00Z', tableIdentifier: '4', previousStatus: 'available', newStatus: 'occupied' }),
    ])
    await renderPage()

    const [date, tableName, change, user] = cellsOf(bodyRows()[0])
    // 00:30 UTC on 1 Oct is 7:30 p. m. on 30 Sept in Bogotá.
    expect(date).toHaveTextContent('30 sept · 7:30 p. m.')
    expect(tableName).toHaveTextContent('Mesa 04')
    expect(within(change).getByText('Disponible')).toBeInTheDocument()
    expect(within(change).getByText('Ocupada')).toBeInTheDocument()
    expect(user).toHaveTextContent('admin@casa72.co')
  })

  it('reads the change as "Disponible a Ocupada"; the arrow is decorative', async () => {
    mockTableLogsControl.reset([log({ id: 'a', changedAt: '2026-10-01T00:30:00Z' })])
    await renderPage()

    const change = cellsOf(bodyRows()[0])[2]
    expect(change).toHaveTextContent('Disponible a Ocupada')
    expect(change.querySelector('svg.lucide-arrow-right')).toHaveAttribute('aria-hidden', 'true')
  })

  it('shows the four statuses with the chips of /mesas, Inactiva included', async () => {
    await renderPage()

    const changes = bodyRows().map((row) => cellsOf(row)[2].textContent)
    expect(changes).toContain('Disponible a Ocupada')
    expect(changes).toContain('Disponible a Reservada')
    // Seed: Mesa 06 deactivated (available → inactive) and reactivated (inactive → available).
    expect(changes).toContain('Disponible a Inactiva')
    expect(changes).toContain('Inactiva a Disponible')
  })

  it('lists every table in the filter, the inactive one included', async () => {
    const { user } = await renderPage()
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Mesa' })).toBeEnabled())
    await user.click(screen.getByRole('combobox', { name: 'Mesa' }))

    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'Todas las mesas',
      'Mesa 01',
      'Mesa 02',
      'Mesa 03',
      'Mesa 04',
      'Mesa 05',
      'Mesa 06',
      'Mesa 07',
      'Mesa 08',
    ])
  })

  it('choosing a table asks for ?tableId of that table, and "Todas las mesas" shows every table again', async () => {
    const list = vi.spyOn(mockTableLogsApi, 'list')
    const { user } = await renderPage()
    expect(list).toHaveBeenLastCalledWith(undefined)

    await chooseTable(user, 'Mesa 04')
    await waitFor(() => expect(list).toHaveBeenLastCalledWith('mock-4'))
    await waitFor(() => expect(bodyRows().every((row) => cellsOf(row)[1].textContent === 'Mesa 04')).toBe(true))
    expect(bodyRows()).toHaveLength(2)

    // Back to the cached list of every table (refetched again when the screen is opened).
    await chooseTable(user, 'Todas las mesas')
    await waitFor(() => expect(bodyRows()).toHaveLength(10))
  })

  it('empty: "Aún no hay cambios" with the manual text and no button', async () => {
    mockTableLogsControl.reset([])
    renderWithProviders(<ActivityLogPage />)

    expect(await screen.findByRole('heading', { name: 'Aún no hay cambios' })).toBeInTheDocument()
    expect(screen.getByText('Aquí verás cada cambio de estado de tus mesas.')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('empty with a table selected names the table', async () => {
    const { user } = await renderPage()
    await chooseTable(user, 'Mesa 07')

    expect(await screen.findByText('Mesa 07 todavía no tiene cambios de estado.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Aún no hay cambios' })).toBeInTheDocument()
  })

  it('load error: manual texts and "Intentar de nuevo" loads the table', async () => {
    mockTableLogsControl.failOn('table-logs-load')
    const { user } = renderWithProviders(<ActivityLogPage />)

    const alert = await screen.findByRole('alert')
    expect(within(alert).getByRole('heading', { name: 'No pudimos cargar la bitácora' })).toBeInTheDocument()
    expect(alert).toHaveTextContent('Revisa tu conexión e intenta de nuevo.')
    expect(alert).not.toHaveTextContent('Mock network error')

    mockTableLogsControl.clearFailures()
    await user.click(within(alert).getByRole('button', { name: 'Intentar de nuevo' }))
    expect(await screen.findByRole('table', { name: 'Bitácora de cambios de mesas' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('a role error shows the manual text, never the backend message, and no retry', async () => {
    vi.spyOn(mockTableLogsApi, 'list').mockRejectedValue(new ApiError({ status: 403, message: 'Texto del backend' }))
    renderWithProviders(<ActivityLogPage />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('No tienes acceso a esta sección.')
    expect(alert).not.toHaveTextContent('Texto del backend')
    expect(within(alert).queryByRole('button')).not.toBeInTheDocument()
  })

  it('if the tables fail to load, the filter is disabled with "Todas las mesas" and the log is still shown', async () => {
    mockTablesControl.failOn('list')
    await renderPage()

    const filter = screen.getByRole('combobox', { name: 'Mesa' })
    await waitFor(() => expect(filter).toBeDisabled())
    expect(filter).toHaveTextContent('Todas las mesas')
    expect(bodyRows().length).toBeGreaterThan(0)
  })

  it('shows the 200-row notice only when the backend answers 200 rows', async () => {
    const rows = (count: number) =>
      Array.from({ length: count }, (_, index) => log({ id: `r${index}`, changedAt: new Date(Date.UTC(2026, 9, 8) - index * 60_000).toISOString() }))
    const notice = 'Ves los 200 cambios más recientes. Filtra por mesa para ver cambios anteriores de esa mesa.'

    mockTableLogsControl.reset(rows(199))
    const { unmount } = await renderPage()
    expect(screen.queryByText(notice)).not.toBeInTheDocument()
    unmount()

    mockTableLogsControl.reset(rows(220))
    await renderPage()
    // 200 rows arrive; the table shows them 15 per page.
    expect(bodyRows()).toHaveLength(15)
    expect(screen.getByText('1–15 de 200 cambios')).toBeInTheDocument()
    expect(screen.getByText(notice)).toBeInTheDocument()
  })

  it('shows 15 changes per page and moves between pages', async () => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
    mockTableLogsControl.reset(
      Array.from({ length: 40 }, (_, index) => log({ id: `p${index}`, changedAt: new Date(Date.UTC(2026, 9, 8) - index * 60_000).toISOString() })),
    )
    const { user } = await renderPage()

    expect(bodyRows()).toHaveLength(15)
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(screen.getByText('31–40 de 40 cambios')).toBeInTheDocument()
    expect(bodyRows()).toHaveLength(10)
  })

  it('searches by table and goes back to page 1 when the search changes', async () => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
    mockTableLogsControl.reset(
      Array.from({ length: 30 }, (_, index) =>
        log({
          id: `s${index}`,
          tableId: index % 2 ? 'mock-4' : 'mock-1',
          tableIdentifier: index % 2 ? '04' : '01',
          changedAt: new Date(Date.UTC(2026, 9, 8) - index * 60_000).toISOString(),
        }),
      ),
    )
    const { user } = await renderPage()
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))

    await user.type(screen.getByRole('searchbox', { name: 'Buscar mesa' }), '4')

    // 15 changes of Mesa 04 fit in one page: back on page 1, without pagination.
    expect(screen.queryByRole('navigation', { name: 'Paginación' })).not.toBeInTheDocument()
    expect(bodyRows()).toHaveLength(15)
    expect(bodyRows().every((row) => cellsOf(row)[1].textContent === 'Mesa 04')).toBe(true)
    await user.clear(screen.getByRole('searchbox', { name: 'Buscar mesa' }))
    await user.type(screen.getByRole('searchbox', { name: 'Buscar mesa' }), 'T9')
    expect(screen.getByText('No hay cambios con esos filtros')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Ver todos los cambios' }))
    expect(screen.getByText('1–15 de 30 cambios')).toBeInTheDocument()
  })

  it('asks again every time the screen is opened, so a change made in /mesas shows up', async () => {
    const list = vi.spyOn(mockTableLogsApi, 'list')
    const { unmount, queryClient } = await renderPage()
    expect(list).toHaveBeenCalledTimes(1)
    unmount()

    // Same cache (the data is still fresh for the global staleTime): it refetches anyway.
    renderWithProviders(<ActivityLogPage />, { queryClient })
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2))
  })

  it('mobile list: two lines per change, table and change first, then date and user (no field is lost)', async () => {
    mockTableLogsControl.reset([log({ id: 'a', changedAt: '2026-10-01T00:30:00Z' })])
    await renderPage()

    const list = screen.getByRole('list', { name: 'Bitácora de cambios de mesas' })
    const item = within(list).getAllByRole('listitem')[0]
    const [first, second] = Array.from(item.children)
    expect(first).toHaveTextContent('Mesa 04')
    expect(first).toHaveTextContent('Disponible a Ocupada')
    expect(second).toHaveTextContent('30 sept · 7:30 p. m. · admin@casa72.co')
  })

  it('filters by the current zone of each table', async () => {
    mockAreasControl.reset(MOCK_AREAS)
    mockTablesControl.reset(mockTablesControl.snapshot().map((table) => ({ ...table, areaId: table.id === 'mock-5' ? 'area-terraza' : 'area-salon' })))
    mockTableLogsControl.reset([
      log({ id: 'z1', tableId: 'mock-1', tableIdentifier: '01', changedAt: '2026-10-08T12:00:00Z' }),
      log({ id: 'z2', tableId: 'mock-5', tableIdentifier: '05', changedAt: '2026-10-08T11:00:00Z' }),
    ])
    const { user } = await renderPage()

    await user.click(await screen.findByRole('combobox', { name: 'Zona' }))
    await user.click(screen.getByRole('option', { name: 'Terraza' }))

    expect(bodyRows().map((row) => cellsOf(row)[1].textContent)).toEqual(['Mesa 05'])
  })
})
