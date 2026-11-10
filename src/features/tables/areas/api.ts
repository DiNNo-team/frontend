import { apiRequest } from '@/lib/api-client'
import type { TableArea } from '../types'

/** Zones of the restaurant (`/v1/table-areas`). The restaurant always comes from the session. */
export interface TableAreasApi {
  list: () => Promise<TableArea[]>
  create: (name: string) => Promise<TableArea>
  rename: (id: string, name: string) => Promise<TableArea>
  /** The tables of the zone stay, without zone and off the plan. */
  remove: (id: string) => Promise<void>
}

const httpTableAreasApi: TableAreasApi = {
  list: () => apiRequest<TableArea[]>('/table-areas'),
  create: (name) => apiRequest<TableArea>('/table-areas', { method: 'POST', body: { name } }),
  rename: (id, name) => apiRequest<TableArea>(`/table-areas/${encodeURIComponent(id)}`, { method: 'PATCH', body: { name } }),
  remove: async (id) => {
    await apiRequest<unknown>(`/table-areas/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },
}

// Loaded on demand so production builds never ship the sample data.
const loadMock = () => import('./api.mock').then((module) => module.mockTableAreasApi)

const lazyMockTableAreasApi: TableAreasApi = {
  list: async () => (await loadMock()).list(),
  create: async (name) => (await loadMock()).create(name),
  rename: async (id, name) => (await loadMock()).rename(id, name),
  remove: async (id) => (await loadMock()).remove(id),
}

/** `VITE_USE_MOCKS=true` switches to the in-memory mock; both follow the same contract. */
export const tableAreasApi: TableAreasApi = import.meta.env.VITE_USE_MOCKS === 'true' ? lazyMockTableAreasApi : httpTableAreasApi
