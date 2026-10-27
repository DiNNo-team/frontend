import { ApiError } from '@/lib/api-client'
import { normalizeTableIdentifier } from '@/lib/format'
import type { TablesApi } from './api'
import { firstFreeSpot, placementOf, planConflicts, type PlacedTable } from './plan/plan-geometry'
import { TABLE_LIMITS, type Table, type TableShape, type TableStatus } from './types'

// In-memory stand-in for the tables backend while Elizabeth's endpoints land. Same contract, same rules.
// Force errors from the URL: /mesas?mockError=list or ?mockError=create,status · start empty: /mesas?mockEmpty
// Slower responses to see loading states: /mesas?mockLatency=3000
// Tables start unplaced, like every real table after the AddTablePlan migration; with a plan already drawn: /mesas?mockPlan
// A big room (40 tables, placed by "Ubicar automáticamente"): /mesas?mockPlan&mockMany

export type MockOperation = 'list' | 'create' | 'status' | 'update' | 'deactivate' | 'reactivate' | 'plan'

const SEED: [identifier: string, capacity: number, status: TableStatus, isActive: boolean][] = [
  ['01', 4, 'available', true],
  ['02', 2, 'occupied', true],
  ['03', 4, 'reserved', true],
  ['04', 2, 'available', true],
  ['05', 6, 'occupied', true],
  ['06', 4, 'available', false],
  ['07', 2, 'available', true],
  ['08', 4, 'reserved', true],
]

/** Plan of the seed for `?mockPlan` and the plan tests: two rows, one round and one square table. */
const SEED_PLAN: [x: number, y: number, shape: TableShape | null][] = [
  [1, 1, null],
  [5, 1, null],
  [9, 1, 'round'],
  [13, 1, null],
  [1, 6, null],
  [6, 6, null],
  [10, 6, 'square'],
  [14, 6, null],
]

function seedTables(): Table[] {
  return SEED.map(([identifier, capacity, status, isActive], index) => ({
    id: `mock-${index + 1}`,
    identifier,
    capacity,
    status,
    isActive,
    planX: null,
    planY: null,
    planShape: null,
  }))
}

/** The seed with its plan already drawn. */
export function seedPlacedTables(): Table[] {
  return seedTables().map((table, index) => {
    const [planX, planY, planShape] = SEED_PLAN[index]
    return { ...table, planX, planY, planShape }
  })
}

function urlParams(): URLSearchParams {
  return typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search)
}

/** 40 tables of 2 to 12 people with every status, placed row by row. */
function manyPlacedTables(): Table[] {
  const statuses: TableStatus[] = ['available', 'occupied', 'reserved', 'available', 'occupied']
  const result: Table[] = []
  for (let index = 0; index < 40; index += 1) {
    const capacity = [2, 4, 4, 6, 2, 8, 4, 12][index % 8]
    const table: Table = {
      id: `mock-many-${index + 1}`,
      identifier: String(index + 1).padStart(2, '0'),
      capacity,
      status: statuses[index % statuses.length],
      isActive: index % 13 !== 12,
      planX: null,
      planY: null,
      planShape: index % 7 === 3 ? 'round' : null,
    }
    const placed: PlacedTable[] = result.map((item) => ({ ...item, placement: placementOf(item) }))
    const spot = firstFreeSpot(placed, { id: table.id, capacity, placement: null }, table.planShape)
    result.push(spot ? { ...table, planX: spot.x, planY: spot.y } : { ...table, planShape: null })
  }
  return result
}

function initialTables(): Table[] {
  const params = urlParams()
  if (params.has('mockEmpty')) return []
  if (params.has('mockMany')) return manyPlacedTables()
  return params.has('mockPlan') ? seedPlacedTables() : seedTables()
}

let tables: Table[] = initialTables()
let nextId = tables.length + 1
let latencyMs = Number(urlParams().get('mockLatency') ?? 400)
const forcedFailures = new Set<MockOperation>()

/** Test and dev controls. */
export const mockTablesControl = {
  reset(next: Table[] = seedTables()) {
    tables = next.map((table) => ({ ...table }))
    nextId = tables.length + 1
    forcedFailures.clear()
  },
  setLatency(ms: number) {
    latencyMs = ms
  },
  failOn(operation: MockOperation) {
    forcedFailures.add(operation)
  },
  clearFailures() {
    forcedFailures.clear()
  },
  snapshot(): Table[] {
    return tables.map((table) => ({ ...table }))
  },
}

async function simulate(operation: MockOperation) {
  if (latencyMs > 0) await new Promise((resolve) => setTimeout(resolve, latencyMs))
  const fromUrl = urlParams().get('mockError')?.split(',') ?? []
  if (forcedFailures.has(operation) || fromUrl.includes(operation)) {
    throw new ApiError({ status: 0, isNetworkError: true, message: `Mock network error on ${operation}` })
  }
}

// Same shape as the backend: status + Spanish message, no errorCode for tables errors.
function fail(status: number, message: string): never {
  throw new ApiError({ status, message })
}

function findTable(id: string): Table {
  return tables.find((table) => table.id === id) ?? fail(404, 'No encontramos esta mesa. Actualiza la lista de mesas e intenta de nuevo.')
}

function validateIdentifier(identifier: string, ignoreId?: string): string {
  const trimmed = identifier.trim()
  if (!trimmed) fail(400, 'Escribe un nombre para la mesa.')
  if (trimmed.length > TABLE_LIMITS.identifierMaxLength) fail(400, 'El nombre de la mesa es muy largo.')
  const key = normalizeTableIdentifier(trimmed)
  if (tables.some((table) => table.id !== ignoreId && normalizeTableIdentifier(table.identifier) === key)) {
    fail(409, 'Ya tienes una mesa con ese nombre. Usa uno diferente.')
  }
  return trimmed
}

function validateCapacity(capacity: number) {
  if (!Number.isInteger(capacity) || capacity < TABLE_LIMITS.minCapacity || capacity > TABLE_LIMITS.maxCapacity) {
    fail(400, 'Escribe cuántas personas caben en la mesa, entre 1 y 20.')
  }
}

function save(table: Table, patch: Partial<Table>): Table {
  Object.assign(table, patch)
  return { ...table }
}

export const mockTablesApi: TablesApi = {
  async list() {
    await simulate('list')
    return tables.map((table) => ({ ...table }))
  },
  async create({ identifier, capacity }) {
    await simulate('create')
    const cleanIdentifier = validateIdentifier(identifier)
    validateCapacity(capacity)
    const table: Table = {
      id: `mock-${nextId++}`,
      identifier: cleanIdentifier,
      capacity,
      status: 'available',
      isActive: true,
      planX: null,
      planY: null,
      planShape: null,
    }
    tables.push(table)
    return { ...table }
  },
  async updateStatus(id, status) {
    await simulate('status')
    const table = findTable(id)
    if (!table.isActive) fail(409, 'Esta mesa está inactiva. Reactívala para cambiar su estado.')
    // Like the backend: the same status is a valid no-op.
    if (table.status === status) return { ...table }
    return save(table, { status })
  },
  async update(id, input) {
    await simulate('update')
    const table = findTable(id)
    const patch: Partial<Table> = {}
    if (input.identifier !== undefined) patch.identifier = validateIdentifier(input.identifier, id)
    if (input.capacity !== undefined) {
      validateCapacity(input.capacity)
      patch.capacity = input.capacity
    }
    return save(table, patch)
  },
  async deactivate(id) {
    await simulate('deactivate')
    const table = findTable(id)
    if (!table.isActive) fail(409, 'Esta mesa ya está inactiva.')
    return save(table, { isActive: false })
  },
  async reactivate(id) {
    await simulate('reactivate')
    const table = findTable(id)
    if (table.isActive) fail(409, 'Esta mesa ya está activa.')
    // Pending confirmation with Elizabeth: a reactivated table comes back as Disponible.
    return save(table, { isActive: true, status: 'available' })
  },
  async savePlan(items) {
    await simulate('plan')
    // Same rules and texts as PUT /v1/tables/plan: the whole plan at once, the last save wins.
    if (new Set(items.map((item) => item.id)).size !== items.length) {
      fail(400, 'Una mesa aparece dos veces en el plano. Envía cada mesa una sola vez.')
    }
    const byId = new Map(items.map((item) => [item.id, item]))
    for (const item of items) findTable(item.id)
    const next = tables.map((table) => {
      const item = byId.get(table.id)
      return { ...table, planX: item?.x ?? null, planY: item?.y ?? null, planShape: item ? item.shape : null }
    })
    if (planConflicts(next.map((table) => ({ ...table, placement: placementOf(table) }))).size > 0) {
      fail(400, 'Dos mesas quedaron una encima de otra. Sepáralas e intenta de nuevo.')
    }
    tables = next
    return tables.map((table) => ({ ...table }))
  },
}
