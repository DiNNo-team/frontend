import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tablesQueryKey } from '../hooks'
import type { TableArea } from '../types'
import { tableAreasApi } from './api'

export const tableAreasQueryKey = ['table-areas'] as const

/** Zones of the restaurant, in creation order. */
export function useTableAreasQuery() {
  return useQuery({ queryKey: tableAreasQueryKey, queryFn: () => tableAreasApi.list() })
}

export function useCreateTableArea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => tableAreasApi.create(name),
    onSuccess: (created) => queryClient.setQueryData<TableArea[]>(tableAreasQueryKey, (areas = []) => [...areas, created]),
  })
}

export function useRenameTableArea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => tableAreasApi.rename(id, name),
    onSuccess: (renamed) =>
      queryClient.setQueryData<TableArea[]>(tableAreasQueryKey, (areas) => areas?.map((area) => (area.id === renamed.id ? renamed : area))),
  })
}

/** Deleting a zone leaves its tables without zone and off the plan, so the tables are fetched again. */
export function useDeleteTableArea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tableAreasApi.remove(id),
    onSuccess: (_result, id) => {
      queryClient.setQueryData<TableArea[]>(tableAreasQueryKey, (areas) => areas?.filter((area) => area.id !== id))
      void queryClient.invalidateQueries({ queryKey: tablesQueryKey })
    },
  })
}
