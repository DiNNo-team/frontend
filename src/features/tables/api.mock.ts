import { ApiError } from '@/lib/api-client'
import { normalizeTableIdentifier } from '@/lib/format'
import type { TablesApi } from './api'
import { TABLE_LIMITS, type Table, type TableErrorCode, type TableStatus } from './types'

// In-memory stand-in for the tables backend while Elizabeth's endpoints land. Same contract, same rules.
// Force errors from the URL: /mesas?mockError=list or ?mockError=create,status · start empty: /mesas?mockEmpty
// Slower responses to see loading states: /mesas?mockLatency=3000

export type MockOperation = 'list' | 'create' | 'status' | 'update' | 'deactivate' | 'reactivate'

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

function seedTables(): Table[] {
  const now = new Date().toISOString()
  return SEED.map(([identifier, capacity, status, isActive], index) => ({
    id: `mock-${index + 1}`,
    identifier,
    capacity,
    status,
    isActive,
    updatedAt: now,
  }))
}

function urlParams(): URLSearchParams {
  return typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search)
}

let tables: Table[] = urlParams().has('mockEmpty') ? [] : seedTables()
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

function fail(status: number, code: TableErrorCode, fields?: Record<string, string>): never {
  throw new ApiError({ status, code, fieldErrors: fields })
}

function findTable(id: string): Table {
  return tables.find((table) => table.id === id) ?? fail(404, 'TABLE_NOT_FOUND')
}

function validateIdentifier(identifier: string, ignoreId?: string): string {
  const trimmed = identifier.trim()
  if (!trimmed) fail(400, 'VALIDATION_ERROR', { identifier: 'required' })
  if (trimmed.length > TABLE_LIMITS.identifierMaxLength) fail(400, 'VALIDATION_ERROR', { identifier: 'maxLength' })
  const key = normalizeTableIdentifier(trimmed)
  if (tables.some((table) => table.id !== ignoreId && normalizeTableIdentifier(table.identifier) === key)) {
    fail(409, 'TABLE_IDENTIFIER_TAKEN')
  }
  return trimmed
}

function validateCapacity(capacity: number) {
  if (!Number.isInteger(capacity) || capacity < TABLE_LIMITS.minCapacity || capacity > TABLE_LIMITS.maxCapacity) {
    fail(400, 'VALIDATION_ERROR', { capacity: 'range' })
  }
}

function save(table: Table, patch: Partial<Table>): Table {
  Object.assign(table, patch, { updatedAt: new Date().toISOString() })
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
      updatedAt: new Date().toISOString(),
    }
    tables.push(table)
    return { ...table }
  },
  async updateStatus(id, status) {
    await simulate('status')
    const table = findTable(id)
    if (!table.isActive) fail(409, 'TABLE_INACTIVE')
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
    if (!table.isActive) fail(409, 'TABLE_ALREADY_INACTIVE')
    return save(table, { isActive: false })
  },
  async reactivate(id) {
    await simulate('reactivate')
    const table = findTable(id)
    if (table.isActive) fail(409, 'TABLE_ALREADY_ACTIVE')
    // Pending confirmation with Elizabeth: a reactivated table comes back as Disponible.
    return save(table, { isActive: true, status: 'available' })
  },
}
