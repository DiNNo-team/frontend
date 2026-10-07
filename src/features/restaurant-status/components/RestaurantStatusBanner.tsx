import { Alert, Button } from '@/components/ui'
import { getApiErrorMessage } from '@/lib/api-client'
import { useRestaurantStatusQuery } from '../hooks'
import { RESTAURANT_STATUS_TEXT } from '../messages'
import { isAccessError, useRestaurantStatusChange } from '../use-restaurant-status-change'

/**
 * Above the content (manual 3.3 and 11.1): the error Alert when loading or saving the status failed,
 * and the info Alert "Tu restaurante está cerrado…" with "Abrir ahora" while it is closed.
 */
export function RestaurantStatusBanner() {
  const statusQuery = useRestaurantStatusQuery()
  const { open, saving, saveError } = useRestaurantStatusChange()

  const loadFailed = statusQuery.isError && !statusQuery.data
  const isClosed = statusQuery.data?.isOpen === false
  if (!loadFailed && !saveError && !isClosed) return null

  return (
    <div className="flex flex-col gap-3">
      {loadFailed && (
        <Alert
          type="error"
          action={
            !isAccessError(statusQuery.error) && (
              <Button size="sm" variant="outline" loading={statusQuery.isFetching} onClick={() => void statusQuery.refetch()}>
                {RESTAURANT_STATUS_TEXT.retry}
              </Button>
            )
          }
        >
          {isAccessError(statusQuery.error) ? getApiErrorMessage(statusQuery.error) : RESTAURANT_STATUS_TEXT.loadError}
        </Alert>
      )}
      {saveError && (
        <Alert
          type="error"
          action={
            saveError.retry && (
              <Button size="sm" variant="outline" loading={saving} onClick={saveError.retry}>
                {RESTAURANT_STATUS_TEXT.retry}
              </Button>
            )
          }
        >
          {saveError.message}
        </Alert>
      )}
      {isClosed && (
        <Alert
          type="info"
          action={
            <Button size="sm" variant="secondary" loading={saving} onClick={open}>
              {RESTAURANT_STATUS_TEXT.openNow}
            </Button>
          }
        >
          {RESTAURANT_STATUS_TEXT.closedBanner}
        </Alert>
      )}
    </div>
  )
}
