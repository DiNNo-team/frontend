import { apiRequest } from '@/lib/api-client'
import { mockTablesApi } from './api.mock'
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

/** `VITE_USE_MOCKS=true` switches to the in-memory mock; both follow the same contract. */
export const tablesApi: TablesApi = import.meta.env.VITE_USE_MOCKS === 'true' ? mockTablesApi : httpTablesApi
