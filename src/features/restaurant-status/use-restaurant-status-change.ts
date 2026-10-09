import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui'
import { getApiErrorMessage, isAccessError } from '@/lib/api-client'
import {
  restaurantStatusMutationKey,
  useIsSavingRestaurantStatus,
  useLatestRestaurantStatusChange,
  useUpdateRestaurantStatus,
} from './hooks'
import { RESTAURANT_STATUS_TEXT } from './messages'

/** Manual texts for network, session and permission; the approved text for anything else. */
export function getSaveErrorMessage(error: unknown): string {
  return getApiErrorMessage(error, RESTAURANT_STATUS_TEXT.saveError)
}

export interface SaveErrorAlert {
  message: string
  /** Repeats the failed change. Missing for session or permission errors. */
  retry?: () => void
}

/**
 * Open/closed changes (PBI 8): opening and closing without reservations apply at once with a toast
 * (closing offers "Deshacer"); closing with reservations goes through the confirmation dialog
 * (`confirmClose`). Only one change at a time, wherever it starts.
 */
export function useRestaurantStatusChange() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { mutate } = useUpdateRestaurantStatus()
  const saving = useIsSavingRestaurantStatus()
  const latest = useLatestRestaurantStatusChange()

  // Read from the cache at call time: "Deshacer" lives in a toast that does not re-render.
  const isBusy = useCallback(() => queryClient.isMutating({ mutationKey: restaurantStatusMutationKey }) > 0, [queryClient])

  const open = useCallback(() => {
    if (isBusy()) return
    mutate(
      { isOpen: true, source: 'inline' },
      { onSuccess: () => toast.show({ type: 'success', message: RESTAURANT_STATUS_TEXT.openedToast }) },
    )
  }, [isBusy, mutate, toast])

  const showClosedToast = useCallback(() => {
    toast.show({
      type: 'success',
      message: RESTAURANT_STATUS_TEXT.closedToast,
      action: { label: RESTAURANT_STATUS_TEXT.undo, onClick: open },
    })
  }, [toast, open])

  /** Closes without asking (no reserved tables). */
  const closeNow = useCallback(() => {
    if (isBusy()) return
    mutate({ isOpen: false, source: 'inline' }, { onSuccess: showClosedToast })
  }, [isBusy, mutate, showClosedToast])

  /** Closes from the confirmation dialog; its error stays inside the dialog. */
  const confirmClose = useCallback(
    ({ onClosed, onError }: { onClosed: () => void; onError: (message: string) => void }) => {
      if (isBusy()) return
      mutate(
        { isOpen: false, source: 'dialog' },
        {
          onSuccess: () => {
            onClosed()
            showClosedToast()
          },
          onError: (error) => onError(getSaveErrorMessage(error)),
        },
      )
    },
    [isBusy, mutate, showClosedToast],
  )

  // The newest change failed outside the dialog: the banner shows it until another change succeeds.
  let saveError: SaveErrorAlert | null = null
  if (latest?.status === 'error' && latest.variables?.source === 'inline') {
    const retry = latest.variables.isOpen ? open : closeNow
    saveError = { message: getSaveErrorMessage(latest.error), retry: isAccessError(latest.error) ? undefined : retry }
  }

  return { open, closeNow, confirmClose, saving, saveError }
}
