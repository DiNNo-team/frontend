import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { tablesApi } from './api'
import type { CreateTableInput, Table, TableStatus, UpdateTableInput } from './types'

export const tablesQueryKey = ['tables'] as const
export const tableStatusMutationKey = ['tables', 'status'] as const

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

/** Replaces one table in the cached list with the backend's version. */
export function replaceCachedTable(queryClient: QueryClient, updated: Table) {
  queryClient.setQueryData<Table[]>(tablesQueryKey, (tables) => tables?.map((table) => (table.id === updated.id ? updated : table)))
}

/** Edits identifier and/or capacity. */
export function useUpdateTable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTableInput }) => tablesApi.update(id, input),
    onSuccess: (updated) => replaceCachedTable(queryClient, updated),
  })
}

/** Deactivates a table: it stops counting as operational and diners stop seeing it. */
export function useDeactivateTable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tablesApi.deactivate(id),
    onSuccess: (updated) => replaceCachedTable(queryClient, updated),
  })
}

/** Reactivates a table (the backend brings it back as available). */
export function useReactivateTable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tablesApi.reactivate(id),
    onSuccess: (updated) => replaceCachedTable(queryClient, updated),
  })
}

/** Writes a status into the cached list right away (cards and metrics update at once). */
export function setCachedTableStatus(queryClient: QueryClient, tableId: string, status: TableStatus) {
  queryClient.setQueryData<Table[]>(tablesQueryKey, (tables) =>
    tables?.map((table) => (table.id === tableId ? { ...table, status } : table)),
  )
}

export interface StatusChangeVariables {
  table: Table
  status: TableStatus
  /** Status shown before this change: restored if the backend fails. */
  previousStatus: TableStatus
}

/**
 * Persists a status change. The caller applies the optimistic value first (`setCachedTableStatus`);
 * requests run one after another (shared scope), so the last change wins, and the list is synced
 * with the backend once the last one settles.
 */
export function useUpdateTableStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: tableStatusMutationKey,
    scope: { id: 'table-status' },
    mutationFn: ({ table, status }: StatusChangeVariables) => tablesApi.updateStatus(table.id, status),
    onError: (_error, { table, previousStatus }) => setCachedTableStatus(queryClient, table.id, previousStatus),
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: tableStatusMutationKey }) <= 1) {
        void queryClient.invalidateQueries({ queryKey: tablesQueryKey })
      }
    },
  })
}
