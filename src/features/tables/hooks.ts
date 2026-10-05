import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tablesApi } from './api'
import type { CreateTableInput, Table } from './types'

export const tablesQueryKey = ['tables'] as const

/** All tables of the current restaurant (active and inactive). Refetches when the window regains focus. */
export function useTablesQuery() {
  return useQuery({ queryKey: tablesQueryKey, queryFn: () => tablesApi.list() })
}

/** Creates a table and adds it to the cached list, so it appears without reloading. */
export function useCreateTable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTableInput) => tablesApi.create(input),
    onSuccess: (created) => {
      queryClient.setQueryData<Table[]>(tablesQueryKey, (tables = []) => [...tables, created])
    },
  })
}
