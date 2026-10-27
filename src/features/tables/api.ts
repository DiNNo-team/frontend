import { apiRequest } from '@/lib/api-client'
import type { CreateTableInput, Table, TablePlanItem, TableStatus, UpdateTableInput } from './types'

/** Tables endpoints (contract in types.ts). The restaurant always comes from the session, never from here. */
export interface TablesApi {
  list: () => Promise<Table[]>
  create: (input: CreateTableInput) => Promise<Table>
  updateStatus: (id: string, status: TableStatus) => Promise<Table>
  update: (id: string, input: UpdateTableInput) => Promise<Table>
  deactivate: (id: string) => Promise<Table>
  reactivate: (id: string) => Promise<Table>
  /** Replaces the whole floor plan; answers every table of the restaurant. */
  savePlan: (items: TablePlanItem[]) => Promise<Table[]>
}

/**
 * The plan fields arrive with the AddTablePlan migration. Until the backend has them, a table simply reads as
 * unplaced, so the grid and the rest of /mesas keep working.
 */
function withPlan(table: Table): Table {
  return { ...table, planX: table.planX ?? null, planY: table.planY ?? null, planShape: table.planShape ?? null }
}

const httpTablesApi: TablesApi = {
  list: async () => (await apiRequest<Table[]>('/tables')).map(withPlan),
  create: async (input) => withPlan(await apiRequest<Table>('/tables', { method: 'POST', body: input })),
  updateStatus: async (id, status) =>
    withPlan(await apiRequest<Table>(`/tables/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status } })),
  update: async (id, input) => withPlan(await apiRequest<Table>(`/tables/${encodeURIComponent(id)}`, { method: 'PATCH', body: input })),
  deactivate: async (id) => withPlan(await apiRequest<Table>(`/tables/${encodeURIComponent(id)}/deactivate`, { method: 'POST' })),
  reactivate: async (id) => withPlan(await apiRequest<Table>(`/tables/${encodeURIComponent(id)}/reactivate`, { method: 'POST' })),
  savePlan: async (items) => (await apiRequest<Table[]>('/tables/plan', { method: 'PUT', body: { tables: items } })).map(withPlan),
}

// Loaded on demand so production builds (VITE_USE_MOCKS unset) never ship the sample data.
const loadMock = () => import('./api.mock').then((module) => module.mockTablesApi)

const lazyMockTablesApi: TablesApi = {
  list: async () => (await loadMock()).list(),
  create: async (input) => (await loadMock()).create(input),
  updateStatus: async (id, status) => (await loadMock()).updateStatus(id, status),
  update: async (id, input) => (await loadMock()).update(id, input),
  deactivate: async (id) => (await loadMock()).deactivate(id),
  reactivate: async (id) => (await loadMock()).reactivate(id),
  savePlan: async (items) => (await loadMock()).savePlan(items),
}

/** `VITE_USE_MOCKS=true` switches to the in-memory mock; both follow the same contract. */
export const tablesApi: TablesApi = import.meta.env.VITE_USE_MOCKS === 'true' ? lazyMockTablesApi : httpTablesApi
