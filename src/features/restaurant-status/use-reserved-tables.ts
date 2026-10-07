import { useCallback } from 'react'
import { useTablesQuery } from '@/features/tables/hooks'
import { countTables } from '@/features/tables/table-status'

/**
 * Counts the active reserved tables before closing, reusing the tables cache of /mesas
 * (a status change there updates the count at once). Resolves `null` when they cannot be counted,
 * so the caller asks for confirmation to be safe.
 */
export function useCountReservedTables(): () => Promise<number | null> {
  const { data, refetch } = useTablesQuery()
  return useCallback(async () => {
    const tables = data ?? (await refetch()).data
    return tables ? countTables(tables).reserved : null
  }, [data, refetch])
}
