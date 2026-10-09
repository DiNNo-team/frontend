import { useQuery } from '@tanstack/react-query'
import { tableLogsApi } from './api'

export const tableLogsQueryKey = ['table-logs'] as const

/**
 * Table log of the restaurant, or of one table. Always refetched when the screen mounts: a change made
 * in /mesas a moment ago must show up here even within the global 30 s staleTime.
 */
export function useTableLogsQuery(tableId?: string) {
  return useQuery({
    queryKey: [...tableLogsQueryKey, tableId ?? 'all'],
    queryFn: () => tableLogsApi.list(tableId),
    refetchOnMount: 'always',
  })
}
