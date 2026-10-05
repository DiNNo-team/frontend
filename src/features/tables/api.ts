import { apiRequest } from '@/lib/api-client'
import type { CreateTableInput, Table, TableStatus, UpdateTableInput } from './types'

/** Tables endpoints (contract in types.ts). The restaurant always comes from the session, never from here. */
export interface TablesApi {
  list: () => Promise<Table[]>
  create: (input: CreateTableInput) => Promise<Table>
  updateStatus: (id: string, status: TableStatus) => Promise<Table>
  update: (id: string, input: UpdateTableInput) => Promise<Table>
  deactivate: (id: string) => Promise<Table>
  reactivate: (id: string) => Promise<Table>
}

const httpTablesApi: TablesApi = {
  list: () => apiRequest<Table[]>('/tables'),
  create: (input) => apiRequest<Table>('/tables', { method: 'POST', body: input }),
  updateStatus: (id, status) => apiRequest<Table>(`/tables/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status } }),
  update: (id, input) => apiRequest<Table>(`/tables/${encodeURIComponent(id)}`, { method: 'PATCH', body: input }),
  deactivate: (id) => apiRequest<Table>(`/tables/${encodeURIComponent(id)}/deactivate`, { method: 'POST' }),
  reactivate: (id) => apiRequest<Table>(`/tables/${encodeURIComponent(id)}/reactivate`, { method: 'POST' }),
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
}

/** `VITE_USE_MOCKS=true` switches to the in-memory mock; both follow the same contract. */
export const tablesApi: TablesApi = import.meta.env.VITE_USE_MOCKS === 'true' ? lazyMockTablesApi : httpTablesApi
