import { ApiError } from '@/lib/api-client'
import type { TableLogsApi } from './api'
import { TABLE_LOGS_LIMIT, type TableLog } from './types'

// Fixed sample of the table log while working without the backend. Same contract as GET /table-logs.
// The table ids are the ones of the tables mock seed (mock-1…mock-8), so the filter matches /mesas.
// Empty: ?mockEmpty (shared with tables) · error: ?mockError=table-logs-load · 200 rows: ?mockTableLogsFull
// Slower responses: ?mockLatency=3000 (shared)

export type MockTableLogsOperation = 'table-logs-load'

const EMAIL = 'admin@casa72.co'

const SEED: [tableNumber: number, previousStatus: string, newStatus: string, changedAt: string][] = [
  [2, 'available', 'occupied', '2026-10-08T23:40:00Z'],
  [3, 'available', 'reserved', '2026-10-08T23:15:00Z'],
  [6, 'available', 'inactive', '2026-10-08T22:50:00Z'],
  [5, 'reserved', 'occupied', '2026-10-08T22:05:00Z'],
  [8, 'available', 'reserved', '2026-10-08T21:30:00Z'],
  [5, 'available', 'reserved', '2026-10-08T20:10:00Z'],
  [4, 'occupied', 'available', '2026-10-08T19:45:00Z'],
  [4, 'available', 'occupied', '2026-10-08T18:20:00Z'],
  [6, 'inactive', 'available', '2026-10-07T17:00:00Z'],
  [6, 'occupied', 'inactive', '2026-10-07T16:30:00Z'],
]

function entry(index: number, tableNumber: number, previousStatus: string, newStatus: string, changedAt: string): TableLog {
  return {
    id: `log-${index + 1}`,
    tableId: `mock-${tableNumber}`,
    tableIdentifier: String(tableNumber).padStart(2, '0'),
    previousStatus,
    newStatus,
    changedAt,
    userEmail: EMAIL,
  }
}

function seedLogs(): TableLog[] {
  return SEED.map(([tableNumber, previous, next, changedAt], index) => entry(index, tableNumber, previous, next, changedAt))
}

/** More rows than the limit, one minute apart, to see the "200 most recent" notice. */
function fullLogs(): TableLog[] {
  return Array.from({ length: TABLE_LOGS_LIMIT + 20 }, (_, index) =>
    entry(index, (index % 8) + 1, index % 2 ? 'occupied' : 'available', index % 2 ? 'available' : 'occupied', new Date(Date.UTC(2026, 9, 8, 23, 59) - index * 60_000).toISOString()),
  )
}

function urlParams(): URLSearchParams {
  return typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search)
}

function initialLogs(): TableLog[] {
  const params = urlParams()
  if (params.has('mockEmpty')) return []
  return params.has('mockTableLogsFull') ? fullLogs() : seedLogs()
}

let logs: TableLog[] = initialLogs()
let latencyMs = Number(urlParams().get('mockLatency') ?? 400)
const forcedFailures = new Set<MockTableLogsOperation>()

/** Test and dev controls. */
export const mockTableLogsControl = {
  reset(next: TableLog[] = seedLogs()) {
    logs = next.map((log) => ({ ...log }))
    forcedFailures.clear()
  },
  setLatency(ms: number) {
    latencyMs = ms
  },
  failOn(operation: MockTableLogsOperation) {
    forcedFailures.add(operation)
  },
  clearFailures() {
    forcedFailures.clear()
  },
}

async function simulate(operation: MockTableLogsOperation) {
  if (latencyMs > 0) await new Promise((resolve) => setTimeout(resolve, latencyMs))
  const fromUrl = urlParams().get('mockError')?.split(',') ?? []
  if (forcedFailures.has(operation) || fromUrl.includes(operation)) {
    throw new ApiError({ status: 0, isNetworkError: true, message: `Mock network error on ${operation}` })
  }
}

export const mockTableLogsApi: TableLogsApi = {
  // Like the backend: filtered by table, newest first, 200 rows at most; an unknown tableId gives [].
  async list(tableId) {
    await simulate('table-logs-load')
    return logs
      .filter((log) => tableId === undefined || log.tableId === tableId)
      .sort((a, b) => Date.parse(b.changedAt) - Date.parse(a.changedAt))
      .slice(0, TABLE_LOGS_LIMIT)
      .map((log) => ({ ...log }))
  },
}
