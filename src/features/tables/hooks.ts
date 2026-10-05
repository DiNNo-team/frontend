import { useQuery } from '@tanstack/react-query'
import { tablesApi } from './api'

export const tablesQueryKey = ['tables'] as const

/** All tables of the current restaurant (active and inactive). Refetches when the window regains focus. */
export function useTablesQuery() {
  return useQuery({ queryKey: tablesQueryKey, queryFn: () => tablesApi.list() })
}
