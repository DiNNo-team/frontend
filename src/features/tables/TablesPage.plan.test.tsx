import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { createTestQueryClient, renderWithProviders } from '@/test/render'
import { mockTablesApi, mockTablesControl, seedPlacedTables } from './api.mock'
import { tablesQueryKey } from './hooks'
import TablesPage from './TablesPage'

vi.mock('./api', () => ({ tablesApi: mockTablesApi }))

// Cell of 44 px: ResizeObserver is a stub in jsdom, so the plan keeps its default size.
const CELL = 44

function renderPage({ queryClient = createTestQueryClient() } = {}) {
  const router = createMemoryRouter(
    [
      { path: '/mesas', element: <TablesPage /> },
      { path: '/bitacora', element: <p>Bitácora</p> },
    ],
    { initialEntries: ['/mesas'] },
  )
  return { router, ...renderWithProviders(<RouterProvider router={router} />, { queryClient }) }
}

const plan = () => screen.getByRole('list', { name: 'Plano del restaurante' })
const node = (name: string) => within(plan()).getByRole('button', { name: new RegExp(`^${name},`) })
const nodeItem = (name: string) => node(name).closest('[role="listitem"]') as HTMLElement
/** The element that carries the position: the node itself while editing, the picker's anchor around it in service. */
const placed = (name: string) => {
  const item = nodeItem(name)
  return item.style.transform ? item : (item.parentElement as HTMLElement)
}
const stored = (identifier: string) => mockTablesControl.snapshot().find((table) => table.identifier === identifier)

function phone(matches: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: matches && query.includes('max-width: 767px'),
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      }) as MediaQueryList,
  )
}

beforeEach(() => {
  window.localStorage.clear()
  mockTablesControl.reset(seedPlacedTables())
  mockTablesControl.setLatency(0)
})

afterEach(() => {
  vi.restoreAllMocks()
})

async function openEditing() {
  const utils = renderPage()
  await screen.findByRole('list', { name: 'Plano del restaurante' })
  await utils.user.click(screen.getByRole('button', { name: 'Editar plano' }))
  return utils
}

describe('TablesPage · plano', () => {
  it('opens in Plano when the restaurant has a plan: every table on its cell with number, capacity and status', async () => {
    renderPage()
    await screen.findByRole('list', { name: 'Plano del restaurante' })

    expect(screen.getByRole('radio', { name: 'Plano' })).toHaveAttribute('aria-checked', 'true')
    const names = within(plan())
      .getAllByRole('button')
      .map((button) => button.getAttribute('aria-label'))
    // Reading order = identifier order, inactive last, like the grid.
    expect(names[0]).toBe('Mesa 01, 4 personas, Disponible')
    expect(names[1]).toBe('Mesa 02, 2 personas, Ocupada')
    expect(names.at(-1)).toBe('Mesa 06, 4 personas, Inactiva')
    // Mesa 05 (6 personas) is a wider rectangle than Mesa 01 (4 personas) at (1, 6).
    expect(placed('Mesa 05').style.transform).toBe(`translate(${1 * CELL + 2}px, ${6 * CELL + 2}px)`)
    expect(parseFloat(placed('Mesa 05').style.width)).toBeGreaterThan(parseFloat(placed('Mesa 01').style.width))
    expect(within(nodeItem('Mesa 02')).getByText('Ocupada')).toBeInTheDocument()
    expect(within(nodeItem('Mesa 02')).getByText('2 personas')).toBeInTheDocument()
  })

  it('without a plan opens in Cuadrícula with the invitation; "Ubicar mesas" starts a plan that survives a reload', async () => {
    mockTablesControl.reset()
    const first = renderPage()
    await screen.findByRole('list', { name: 'Mesas' })
    expect(screen.getByText('Arma el plano de tu restaurante.')).toBeInTheDocument()

    await first.user.click(screen.getByRole('button', { name: 'Ubicar mesas' }))
    expect(screen.getByText('Aún no hay mesas en el plano')).toBeInTheDocument()
    await first.user.click(screen.getByRole('button', { name: 'Ubicar mesas' }))
    // Auto-placed as a starting point; nothing is stored until "Guardar plano".
    expect(within(plan()).getAllByRole('listitem')).toHaveLength(8)
    expect(stored('01')?.planX).toBeNull()

    await first.user.click(screen.getByRole('button', { name: 'Guardar plano' }))
    await waitFor(() => expect(stored('01')?.planX).not.toBeNull())
    expect(screen.getAllByText('Plano guardado').length).toBeGreaterThan(0)
    first.unmount()

    // A reload (new cache, same backend): the same plan, from the server, not from the browser.
    expect(Object.keys(window.localStorage)).toEqual(['dinno:mesas:vista'])
    window.localStorage.clear()
    renderPage()
    await screen.findByRole('list', { name: 'Plano del restaurante' })
    const saved = stored('03')
    expect(placed('Mesa 03').style.transform).toBe(`translate(${(saved?.planX ?? 0) * CELL + 2}px, ${(saved?.planY ?? 0) * CELL + 2}px)`)
  })

  it('remembers Plano · Cuadrícula on this device', async () => {
    const first = renderPage()
    await screen.findByRole('list', { name: 'Plano del restaurante' })
    await first.user.click(screen.getByRole('radio', { name: 'Cuadrícula' }))
    expect(screen.getByRole('list', { name: 'Mesas' })).toBeInTheDocument()
    first.unmount()

    renderPage()
    expect(await screen.findByRole('list', { name: 'Mesas' })).toBeInTheDocument()
  })

  it('service mode: a tap shows the real details and the status; positions never move', async () => {
    const { user } = renderPage()
    await screen.findByRole('list', { name: 'Plano del restaurante' })
    const before = placed('Mesa 03').style.transform

    await user.click(node('Mesa 03'))
    const picker = await screen.findByRole('dialog', { name: 'Estado de Mesa 03' })
    expect(within(picker).getByText('4 personas · Redonda')).toBeInTheDocument()
    expect(within(picker).getByRole('button', { name: 'Editar mesa' })).toBeInTheDocument()
    await user.click(within(picker).getByRole('radio', { name: /Ocupada/ }))

    await waitFor(() => expect(stored('03')?.status).toBe('occupied'))
    expect(node('Mesa 03')).toHaveAccessibleName('Mesa 03, 4 personas, Ocupada')

    // Neither a drag nor the arrows move a table outside edit mode.
    fireEvent.pointerDown(nodeItem('Mesa 03'), { pointerId: 1, button: 0, clientX: 10, clientY: 10 })
    fireEvent.pointerMove(nodeItem('Mesa 03'), { pointerId: 1, clientX: 200, clientY: 10 })
    fireEvent.pointerUp(nodeItem('Mesa 03'), { pointerId: 1, clientX: 200, clientY: 10 })
    node('Mesa 03').focus()
    await user.keyboard('{ArrowRight}')
    expect(placed('Mesa 03').style.transform).toBe(before)
  })

  it('edit mode: arrows move one cell (Shift: 4), a blocked move is announced, and the plan saves with PUT', async () => {
    const savePlan = vi.spyOn(mockTablesApi, 'savePlan')
    const { user } = await openEditing()

    node('Mesa 01').focus()
    await user.keyboard('{ArrowDown}')
    expect(node('Mesa 01')).toHaveAccessibleName(/fila 3, columna 2/)
    await user.keyboard('{Shift>}{ArrowDown}{/Shift}')
    expect(node('Mesa 01')).toHaveAccessibleName(/fila 3, columna 2/) // Mesa 05 sits 4 rows below: blocked
    expect(screen.getByRole('status')).toHaveTextContent('Mesa 01 no cabe ahí')
    await user.keyboard('{ArrowLeft}')
    expect(node('Mesa 01')).toHaveAccessibleName(/fila 3, columna 1/)

    await user.click(screen.getByRole('button', { name: 'Guardar plano' }))
    await waitFor(() => expect(savePlan).toHaveBeenCalledTimes(1))
    expect(savePlan.mock.calls[0][0]).toContainEqual({ id: 'mock-1', x: 0, y: 2, shape: null })
    expect(savePlan.mock.calls[0][0]).toHaveLength(8)
    await waitFor(() => expect(screen.queryByRole('region', { name: 'Editando el plano' })).not.toBeInTheDocument())
    expect(stored('01')).toMatchObject({ planX: 0, planY: 2 })
  })

  it('edit mode: dragging snaps to the grid; a drop on another table sends it back', async () => {
    await openEditing()
    const item = nodeItem('Mesa 04')

    // Two cells to the right and one down, with a few px of slack: snaps to the nearest cell.
    fireEvent.pointerDown(item, { pointerId: 1, button: 0, clientX: 100, clientY: 100 })
    fireEvent.pointerMove(item, { pointerId: 1, clientX: 100 + 2 * CELL + 10, clientY: 100 + CELL - 6 })
    expect(item).toHaveAttribute('data-dragging', 'true')
    fireEvent.pointerUp(item, { pointerId: 1, clientX: 100 + 2 * CELL + 10, clientY: 100 + CELL - 6 })
    expect(node('Mesa 04')).toHaveAccessibleName(/fila 3, columna 16/)

    // Onto Mesa 03 (columns 10–12): it does not fit, so it goes back with the return animation.
    const back = nodeItem('Mesa 04')
    fireEvent.pointerDown(back, { pointerId: 2, button: 0, clientX: 0, clientY: 0 })
    fireEvent.pointerMove(back, { pointerId: 2, clientX: -5 * CELL, clientY: -CELL })
    fireEvent.pointerUp(back, { pointerId: 2, clientX: -5 * CELL, clientY: -CELL })
    expect(node('Mesa 04')).toHaveAccessibleName(/fila 3, columna 16/)
    expect(nodeItem('Mesa 04')).toHaveAttribute('data-returning', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Mesa 04 no cabe ahí. Volvió a su lugar.')
  })

  it('edit mode: the inspector changes the shape and moves with buttons; "Quitar del plano" sends it to Sin ubicar', async () => {
    const savePlan = vi.spyOn(mockTablesApi, 'savePlan')
    const { user } = await openEditing()

    await user.click(node('Mesa 08'))
    const inspector = screen.getByRole('region', { name: 'Mesa seleccionada' })
    await user.click(within(inspector).getByRole('radio', { name: 'Redonda' }))
    expect(nodeItem('Mesa 08').style.height).toBe(`${3 * CELL - 4}px`)
    await user.click(within(inspector).getByRole('button', { name: 'Mover a la derecha' }))
    expect(node('Mesa 08')).toHaveAccessibleName(/columna 16/)

    await user.click(node('Mesa 07'))
    await user.click(within(screen.getByRole('region', { name: 'Mesa seleccionada' })).getByRole('button', { name: 'Quitar del plano' }))
    const tray = screen.getByRole('region', { name: 'Sin ubicar' })
    expect(within(tray).getByRole('button', { name: 'Ubicar Mesa 07' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Guardar plano' }))
    await waitFor(() => expect(savePlan).toHaveBeenCalled())
    const items = savePlan.mock.calls[0][0]
    expect(items).toContainEqual({ id: 'mock-8', x: 15, y: 6, shape: 'round' })
    expect(items.find((entry) => entry.id === 'mock-7')).toBeUndefined()
    await waitFor(() => expect(stored('07')?.planX).toBeNull())
  })

  it('Cancelar with changes asks first, then puts every table back and saves nothing', async () => {
    const savePlan = vi.spyOn(mockTablesApi, 'savePlan')
    const { user } = await openEditing()
    node('Mesa 01').focus()
    await user.keyboard('{ArrowDown}')

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    const dialog = await screen.findByRole('dialog', { name: '¿Salir sin guardar el plano?' })
    await user.click(within(dialog).getByRole('button', { name: 'Salir sin guardar' }))

    expect(screen.getByRole('button', { name: 'Editar plano' })).toBeInTheDocument()
    expect(node('Mesa 01')).toHaveAccessibleName('Mesa 01, 4 personas, Disponible')
    expect(placed('Mesa 01').style.transform).toBe(`translate(${CELL + 2}px, ${CELL + 2}px)`)
    expect(savePlan).not.toHaveBeenCalled()
  })

  it('leaving /mesas with unsaved changes asks before navigating', async () => {
    const { router, user } = await openEditing()
    node('Mesa 01').focus()
    await user.keyboard('{ArrowDown}')

    await act(() => router.navigate('/bitacora'))
    expect(await screen.findByRole('dialog', { name: '¿Salir sin guardar el plano?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Seguir editando' }))
    expect(router.state.location.pathname).toBe('/mesas')
    expect(screen.getByRole('region', { name: 'Editando el plano' })).toBeInTheDocument()
  })

  it('a table that grew past its room is marked and the plan cannot be saved until it moves', async () => {
    const tables = seedPlacedTables()
    // Mesa 04 (columns 13–15) was edited to 12 people after the plan was saved: now 5 cells wide (13–17), on top of
    // Mesa 07, which sits at column 16.
    tables[3] = { ...tables[3], capacity: 12 }
    tables[6] = { ...tables[6], planX: 16, planY: 1, planShape: null }
    mockTablesControl.reset(tables)
    const savePlan = vi.spyOn(mockTablesApi, 'savePlan')
    const { user } = await openEditing()

    expect(within(nodeItem('Mesa 04')).getByRole('button')).toBeInTheDocument()
    expect(nodeItem('Mesa 04').className).toContain('border-error')
    await user.click(screen.getByRole('button', { name: 'Guardar plano' }))
    expect(screen.getAllByText(/Hay mesas encima de otra o fuera del plano/).length).toBeGreaterThan(0)
    expect(savePlan).not.toHaveBeenCalled()
  })

  it('a failed save keeps the changes and says what to do', async () => {
    const { user } = await openEditing()
    node('Mesa 01').focus()
    await user.keyboard('{ArrowDown}')
    mockTablesControl.failOn('plan')

    await user.click(screen.getByRole('button', { name: 'Guardar plano' }))
    expect(await screen.findByText('No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.')).toBeInTheDocument()
    expect(node('Mesa 01')).toHaveAccessibleName(/fila 3, columna 2/)
    expect(stored('01')?.planY).toBe(1)
  })

  it('warns when the save replaced a plan saved from another device meanwhile', async () => {
    const { user } = await openEditing()
    node('Mesa 01').focus()
    await user.keyboard('{ArrowDown}')
    // Another device moves Mesa 08 and saves while this one edits.
    const elsewhere = mockTablesControl.snapshot().map((table) => (table.id === 'mock-8' ? { ...table, planY: 11 } : table))
    mockTablesControl.reset(elsewhere)

    await user.click(screen.getByRole('button', { name: 'Guardar plano' }))
    expect((await screen.findAllByText('Guardamos tu plano. Reemplazó el que guardaron desde otro dispositivo.')).length).toBeGreaterThan(0)
    // The last save wins: this device's plan, with Mesa 08 where this device had it.
    expect(stored('08')?.planY).toBe(6)
  })

  it('a status changed from another device plays the ring; a change made here does not', async () => {
    const { user, queryClient } = renderPage()
    await screen.findByRole('list', { name: 'Plano del restaurante' })

    await user.click(node('Mesa 01'))
    await user.click(within(await screen.findByRole('dialog', { name: 'Estado de Mesa 01' })).getByRole('radio', { name: /Reservada/ }))
    await waitFor(() => expect(stored('01')?.status).toBe('reserved'))
    await act(() => queryClient.invalidateQueries({ queryKey: tablesQueryKey }))
    expect(nodeItem('Mesa 01').querySelector('.animate-remote-change')).toBeNull()

    mockTablesControl.reset(mockTablesControl.snapshot().map((table) => (table.id === 'mock-4' ? { ...table, status: 'occupied' } : table)))
    await act(() => queryClient.invalidateQueries({ queryKey: tablesQueryKey }))
    await waitFor(() => expect(node('Mesa 04')).toHaveAccessibleName('Mesa 04, 2 personas, Ocupada'))
    expect(nodeItem('Mesa 04').querySelector('.animate-remote-change')).not.toBeNull()
  })

  it('on a phone /mesas opens in the grid, and the plan is for service only', async () => {
    phone(true)
    const { user } = renderPage()
    await screen.findByRole('list', { name: 'Mesas' })
    expect(screen.queryByText('Arma el plano de tu restaurante.')).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Plano' }))
    await screen.findByRole('list', { name: 'Plano del restaurante' })
    expect(screen.queryByRole('button', { name: 'Editar plano' })).not.toBeInTheDocument()
    expect(screen.getByText('Edita el plano desde una tablet o un computador.')).toBeInTheDocument()
  })
})
