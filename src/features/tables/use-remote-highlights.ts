import { useEffect, useState } from 'react'
import { hashKey, useQueryClient } from '@tanstack/react-query'
import { tablesQueryKey } from './hooks'
import type { Table } from './types'

const TABLES_HASH = hashKey(tablesQueryKey)
const statusKey = (table: Table) => `${table.status}:${table.isActive}`

/**
 * "Changed from another device" (manual 11.3): tables whose status changed in a list that came from the server, by id →
 * a new value each time, for the ring of `TableCard` / `TableNode`. Changes made here never ring: they reach the cache
 * with `setQueryData` (optimistic or the mutation's answer), which TanStack Query marks as manual.
 */
export function useRemoteHighlights(): Record<string, number> {
  const queryClient = useQueryClient()
  const [highlights, setHighlights] = useState<Record<string, number>>({})

  useEffect(() => {
    const cache = queryClient.getQueryCache()
    let known = new Map((queryClient.getQueryData<Table[]>(tablesQueryKey) ?? []).map((table) => [table.id, statusKey(table)]))
    return cache.subscribe((event) => {
      if (event.type !== 'updated' || event.query.queryHash !== TABLES_HASH || event.action.type !== 'success') return
      const tables = (event.query.state.data as Table[] | undefined) ?? []
      if (!event.action.manual) {
        const changed = tables.filter((table) => known.has(table.id) && known.get(table.id) !== statusKey(table))
        if (changed.length > 0) {
          const now = Date.now()
          setHighlights((current) => ({ ...current, ...Object.fromEntries(changed.map((table) => [table.id, now])) }))
        }
      }
      known = new Map(tables.map((table) => [table.id, statusKey(table)]))
    })
  }, [queryClient])

  return highlights
}
