import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { STATUS_META, useToast } from '@/components/ui'
import { ApiError, getApiErrorMessage } from '@/lib/api-client'
import { formatTableName } from '@/lib/format'
import { setCachedTableStatus, tablesQueryKey, useUpdateTableStatus } from './hooks'
import type { PageAlert } from './page-alert'
import type { Table, TableStatus } from './types'

interface ChangeOptions {
  /** "Deshacer" itself: no new undo action on its toast. */
  isUndo?: boolean
}

/**
 * Status change of a table (PBI 6): optimistic, no confirmation, toast with "Deshacer";
 * on failure the table goes back and an Alert offers "Intentar de nuevo".
 */
export function useTableStatusChange({
  onTableInactive,
  reportError,
  clearErrorFor,
}: {
  onTableInactive: (tableId: string) => void
  reportError: (alert: PageAlert) => void
  clearErrorFor: (tableId: string) => void
}) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const updateStatus = useUpdateTableStatus()

  const changeStatus = useCallback(
    async function change(table: Table, status: TableStatus, { isUndo = false }: ChangeOptions = {}): Promise<void> {
      if (table.status === status) return
      const name = formatTableName(table.identifier)
      const previousStatus = table.status

      void queryClient.cancelQueries({ queryKey: tablesQueryKey })
      setCachedTableStatus(queryClient, table.id, status)

      try {
        const updated = await updateStatus.mutateAsync({ table, status, previousStatus })
        clearErrorFor(table.id)
        toast.show({
          type: 'success',
          message: `${name} ahora está ${STATUS_META[status].label}`,
          action: isUndo
            ? undefined
            : { label: 'Deshacer', onClick: () => void change(updated, previousStatus, { isUndo: true }) },
        })
      } catch (caught) {
        // 409 = the table is inactive (someone deactivated it); 404 = it no longer exists for this restaurant.
        if (caught instanceof ApiError && caught.status === 404) {
          onTableInactive(table.id)
          void queryClient.invalidateQueries({ queryKey: tablesQueryKey })
          reportError({ tableId: table.id, message: `No pudimos cambiar el estado de ${name}. Revisa tu conexión e intenta de nuevo.` })
          return
        }
        if (caught instanceof ApiError && caught.status === 409) {
          onTableInactive(table.id)
          void queryClient.invalidateQueries({ queryKey: tablesQueryKey })
          reportError({ tableId: table.id, message: `${name} está inactiva. Reactívala para cambiar su estado.` })
          return
        }
        const isAccessError = caught instanceof ApiError && (caught.status === 401 || caught.status === 403)
        reportError({
          tableId: table.id,
          message: isAccessError
            ? getApiErrorMessage(caught)
            : `No pudimos cambiar el estado de ${name}. Revisa tu conexión e intenta de nuevo.`,
          retry: isAccessError ? undefined : () => void change({ ...table, status: previousStatus }, status, { isUndo }),
        })
      }
    },
    [queryClient, toast, updateStatus, onTableInactive, reportError, clearErrorFor],
  )

  return { changeStatus }
}
