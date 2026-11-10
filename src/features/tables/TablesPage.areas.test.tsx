import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { renderWithProviders } from '@/test/render'
import { mockTablesApi, mockTablesControl, seedPlacedTables } from './api.mock'
import { MOCK_AREAS, mockAreasControl, mockTableAreasApi } from './areas/api.mock'
import TablesPage from './TablesPage'
import type { Table } from './types'

vi.mock('./api', () => ({ tablesApi: mockTablesApi }))
vi.mock('./areas/api', () => ({ tableAreasApi: mockTableAreasApi }))
vi.mock('@/features/reservations/api', async () => ({ reservationsApi: (await import('@/features/reservations/api.mock')).mockReservationsApi }))

// Salón: 01–04 · Terraza: 05–07 · Mesa 08 without zone (the seed of ?mockAreas).
function zonedSeed(placed = false): Table[] {
  const base = placed ? seedPlacedTables() : seedPlacedTables().map((table) => ({ ...table, planX: null, planY: null, planShape: null }))
  return base.map((table, index) => ({ ...table, areaId: index < 4 ? 'area-salon' : index < 7 ? 'area-terraza' : null }))
}

function renderPage() {
  const router = createMemoryRouter([{ path: '/mesas', element: <TablesPage /> }], { initialEntries: ['/mesas'] })
  return renderWithProviders(<RouterProvider router={router} />)
}

const storedTable = (identifier: string) => mockTablesControl.snapshot().find((table) => table.identifier === identifier)
const cardNames = (list: HTMLElement) => within(list).getAllByRole('heading').map((heading) => heading.textContent)

beforeEach(() => {
  window.localStorage.clear()
  window.localStorage.setItem('dinno:mesas:vista', 'grid')
  mockTablesControl.reset(zonedSeed())
  mockTablesControl.setLatency(0)
  mockAreasControl.reset(MOCK_AREAS)
  mockAreasControl.setLatency(0)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('TablesPage · zones, search and filters', () => {
  it('groups the grid by zone, with the tables without zone last', async () => {
    renderPage()

    const salon = await screen.findByRole('list', { name: 'Mesas de Salón' })
    expect(cardNames(salon)).toEqual(['Mesa 01', 'Mesa 02', 'Mesa 03', 'Mesa 04'])
    expect(cardNames(screen.getByRole('list', { name: 'Mesas de Terraza' }))).toEqual(['Mesa 05', 'Mesa 07', 'Mesa 06'])
    expect(cardNames(screen.getByRole('list', { name: 'Mesas de Sin zona' }))).toEqual(['Mesa 08'])
  })

  it('finds a table by its number, without mixing it with others that contain it', async () => {
    renderPage()
    await screen.findByRole('list', { name: 'Mesas de Salón' })

    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar mesa' }), { target: { value: '5' } })

    expect(screen.queryByRole('list', { name: 'Mesas de Salón' })).not.toBeInTheDocument()
    expect(cardNames(screen.getByRole('list', { name: 'Mesas de Terraza' }))).toEqual(['Mesa 05'])
  })

  it('says which filters left the grid empty and clears them all', async () => {
    renderPage()
    await screen.findByRole('list', { name: 'Mesas de Salón' })

    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar mesa' }), { target: { value: 'T9' } })

    expect(screen.getByText('No hay mesas que coincidan con «T9».')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ver todas las mesas' }))
    expect(await screen.findByRole('list', { name: 'Mesas de Salón' })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Buscar mesa' })).toHaveValue('')
  })

  it('creates a zone and moves a table to it from the edit form', async () => {
    const { user } = renderPage()
    await screen.findByRole('list', { name: 'Mesas de Salón' })

    fireEvent.click(screen.getByRole('button', { name: 'Zonas' }))
    const dialog = await screen.findByRole('dialog', { name: 'Zonas' })
    fireEvent.change(within(dialog).getByLabelText('Nueva zona'), { target: { value: ' terraza ' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Agregar zona' }))
    expect(await within(dialog).findByText('Ya tienes una zona llamada «terraza». Usa otro nombre.')).toBeInTheDocument()

    fireEvent.change(within(dialog).getByLabelText('Nueva zona'), { target: { value: 'Piso 2' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Agregar zona' }))
    expect(await within(dialog).findByText('Piso 2')).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cerrar' }))

    await user.click(screen.getByRole('button', { name: 'Más acciones de Mesa 08' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Editar' }))
    const form = await screen.findByRole('dialog', { name: 'Editar Mesa 08' })
    await user.click(within(form).getByRole('combobox', { name: 'Zona' }))
    await user.click(await screen.findByRole('option', { name: 'Piso 2' }))
    await user.click(within(form).getByRole('button', { name: 'Guardar cambios' }))

    expect(cardNames(await screen.findByRole('list', { name: 'Mesas de Piso 2' }))).toEqual(['Mesa 08'])
    expect(storedTable('08')?.areaId).toBe(mockAreasControl.snapshot().find((area) => area.name === 'Piso 2')?.id)
  })

  it('deletes a zone after saying its tables stay, without zone', async () => {
    const { user } = renderPage()
    await screen.findByRole('list', { name: 'Mesas de Terraza' })

    fireEvent.click(screen.getByRole('button', { name: 'Zonas' }))
    const dialog = await screen.findByRole('dialog', { name: 'Zonas' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Eliminar Terraza' }))
    expect(within(dialog).getByText(/Sus 3 mesas no se borran: quedan sin zona y salen del plano\./)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar zona' }))
    await user.click(await within(dialog).findByRole('button', { name: 'Cerrar' }))

    await waitFor(() => expect(screen.queryByRole('list', { name: 'Mesas de Terraza' })).not.toBeInTheDocument())
    expect(cardNames(await screen.findByRole('list', { name: 'Mesas de Sin zona' }))).toEqual(['Mesa 05', 'Mesa 07', 'Mesa 08', 'Mesa 06'])
    expect(storedTable('05')?.areaId).toBeNull()
  })

  it('shows one zone per plan and saving it keeps the plan of the other zones', async () => {
    mockTablesControl.reset(zonedSeed(true))
    window.localStorage.setItem('dinno:mesas:vista', 'plan')
    const { user } = renderPage()

    const plan = await screen.findByRole('list', { name: 'Plano del restaurante' })
    expect(within(plan).getAllByRole('button', { name: /^Mesa \d+,/ }).map((node) => node.getAttribute('aria-label')?.split(',')[0])).toEqual([
      'Mesa 01',
      'Mesa 02',
      'Mesa 03',
      'Mesa 04',
    ])
    const terraceBefore = storedTable('05')

    await user.click(screen.getByRole('button', { name: 'Editar plano' }))
    await user.click(within(plan).getByRole('button', { name: /^Mesa 01,/ }))
    await user.click(screen.getByRole('button', { name: 'Mover abajo' }))
    await user.click(screen.getByRole('button', { name: 'Guardar plano' }))

    await waitFor(() => expect(storedTable('01')?.planY).toBe(2))
    expect(storedTable('05')).toMatchObject({ planX: terraceBefore?.planX, planY: terraceBefore?.planY })
  })
})
