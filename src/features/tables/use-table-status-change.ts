import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { STATUS_META, useToast } from '@/components/ui'
import { ApiError, getApiErrorMessage } from '@/lib/api-client'
import { formatTableName } from '@/lib/format'
import { setCachedTableStatus, tablesQueryKey, useUpdateTableStatus } from './hooks'
import type { Table, TableStatus } from './types'

export interface StatusChangeError {
  tableId: string
  /** Text for the error Alert above the content. */
  message: string
  /** Retries this same change. Missing when retrying makes no sense (inactive table). */
  retry?: () => void
}

interface ChangeOptions {
  /** "Deshacer" itself: no new undo action on its toast. */
  isUndo?: boolean
}

/**
 * Status change of a table (PBI 6): optimistic, no confirmation, toast with "Deshacer";
 * on failure the table goes back and an Alert offers "Intentar de nuevo".
 */
export function useTableStatusChange({ onTableInactive }: { onTableInactive: (tableId: string) => void }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const updateStatus = useUpdateTableStatus()
  const [error, setError] = useState<StatusChangeError | null>(null)

  const changeStatus = useCallback(
    async function change(table: Table, status: TableStatus, { isUndo = false }: ChangeOptions = {}): Promise<void> {
      if (table.status === status) return
      const name = formatTableName(table.identifier)
      const previousStatus = table.status

      void queryClient.cancelQueries({ queryKey: tablesQueryKey })
      setCachedTableStatus(queryClient, table.id, status)

      try {
        const updated = await updateStatus.mutateAsync({ table, status, previousStatus })
        setError((current) => (current?.tableId === table.id ? null : current))
        toast.show({
          type: 'success',
          message: `${name} ahora está ${STATUS_META[status].label}`,
          action: isUndo
            ? undefined
            : { label: 'Deshacer', onClick: () => void change(updated, previousStatus, { isUndo: true }) },
        })
      } catch (caught) {
        if (caught instanceof ApiError && caught.code === 'TABLE_INACTIVE') {
          onTableInactive(table.id)
          void queryClient.invalidateQueries({ queryKey: tablesQueryKey })
          setError({ tableId: table.id, message: `${name} está inactiva. Reactívala para cambiar su estado.` })
          return
        }
        const isAccessError = caught instanceof ApiError && (caught.status === 401 || caught.status === 403)
        setError({
          tableId: table.id,
          message: isAccessError
            ? getApiErrorMessage(caught)
            : `No pudimos cambiar el estado de ${name}. Revisa tu conexión e intenta de nuevo.`,
          retry: isAccessError ? undefined : () => void change({ ...table, status: previousStatus }, status, { isUndo }),
        })
      }
    },
    [queryClient, toast, updateStatus, onTableInactive],
  )

  return { changeStatus, error, dismissError: () => setError(null) }
}
