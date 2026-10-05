import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui'
import { ApiError, getApiErrorMessage } from '@/lib/api-client'
import { formatTableName } from '@/lib/format'
import { tablesQueryKey, useDeactivateTable, useReactivateTable } from './hooks'
import type { PageAlert } from './page-alert'
import type { Table } from './types'

export const DEACTIVATE_ERROR = 'No pudimos desactivar la mesa. Revisa tu conexión e intenta de nuevo.'

interface ActivationOptions {
  reportError: (alert: PageAlert) => void
  clearErrorFor: (tableId: string) => void
  onDeactivated: (table: Table) => void
}

/**
 * Deactivate (after the confirmation dialog) and reactivate (no confirmation) a table (PBI 7).
 * Deactivating offers "Deshacer", which reactivates it.
 */
export function useTableActivation({ reportError, clearErrorFor, onDeactivated }: ActivationOptions) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const deactivateMutation = useDeactivateTable()
  const reactivateMutation = useReactivateTable()
  const [reactivatingId, setReactivatingId] = useState<string | null>(null)

  const reactivate = useCallback(
    async function reactivateTable(table: Table): Promise<void> {
      const name = formatTableName(table.identifier)
      setReactivatingId(table.id)
      try {
        await reactivateMutation.mutateAsync(table.id)
        clearErrorFor(table.id)
        toast.show({ type: 'success', message: `${name} reactivada` })
      } catch (caught) {
        if (caught instanceof ApiError && caught.code === 'TABLE_ALREADY_ACTIVE') {
          void queryClient.invalidateQueries({ queryKey: tablesQueryKey })
          return
        }
        const isAccessError = caught instanceof ApiError && (caught.status === 401 || caught.status === 403)
        reportError({
          tableId: table.id,
          message: isAccessError ? getApiErrorMessage(caught) : `No pudimos reactivar ${name}. Revisa tu conexión e intenta de nuevo.`,
          retry: isAccessError ? undefined : () => void reactivateTable(table),
        })
      } finally {
        setReactivatingId(null)
      }
    },
    [queryClient, toast, reactivateMutation, reportError, clearErrorFor],
  )

  /** Resolves when done; throws the text to show inside the confirmation dialog when it fails. */
  const deactivate = useCallback(
    async (table: Table): Promise<void> => {
      try {
        const updated = await deactivateMutation.mutateAsync(table.id)
        clearErrorFor(table.id)
        onDeactivated(updated)
        toast.show({
          type: 'success',
          message: `${formatTableName(table.identifier)} desactivada`,
          action: { label: 'Deshacer', onClick: () => void reactivate(updated) },
        })
      } catch (caught) {
        if (caught instanceof ApiError && caught.code === 'TABLE_ALREADY_INACTIVE') {
          // Someone else already deactivated it: just show the current list.
          void queryClient.invalidateQueries({ queryKey: tablesQueryKey })
          onDeactivated({ ...table, isActive: false })
          return
        }
        const isAccessError = caught instanceof ApiError && (caught.status === 401 || caught.status === 403)
        throw new Error(isAccessError ? getApiErrorMessage(caught) : DEACTIVATE_ERROR)
      }
    },
    [queryClient, toast, deactivateMutation, reactivate, clearErrorFor, onDeactivated],
  )

  return { deactivate, deactivating: deactivateMutation.isPending, reactivate, reactivatingId }
}
