import { apiRequest } from '@/lib/api-client'
import type { TableLog } from './types'

/** Table log endpoint (contract in types.ts). The restaurant always comes from the session, never from here. */
export interface TableLogsApi {
  /** Without `tableId`, every table of the restaurant. */
  list: (tableId?: string) => Promise<TableLog[]>
}

const httpTableLogsApi: TableLogsApi = {
  list: (tableId) => apiRequest<TableLog[]>(tableId ? `/table-logs?tableId=${encodeURIComponent(tableId)}` : '/table-logs'),
}

// Loaded on demand so production builds (VITE_USE_MOCKS unset) never ship the sample data.
const loadMock = () => import('./api.mock').then((module) => module.mockTableLogsApi)

const lazyMockTableLogsApi: TableLogsApi = {
  list: async (tableId) => (await loadMock()).list(tableId),
}

/** `VITE_USE_MOCKS=true` switches to the in-memory mock; both follow the same contract. */
export const tableLogsApi: TableLogsApi = import.meta.env.VITE_USE_MOCKS === 'true' ? lazyMockTableLogsApi : httpTableLogsApi
