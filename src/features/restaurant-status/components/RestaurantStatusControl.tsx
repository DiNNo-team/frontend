import { useEffect, useRef, useState } from 'react'
import { ConfirmDialog, Skeleton, STATUS_META, Switch } from '@/components/ui'
import { useDelayedFlag } from '@/lib/use-delayed-flag'
import { useRestaurantStatusQuery } from '../hooks'
import { closeWithReservationsText, RESTAURANT_STATUS_TEXT } from '../messages'
import { useCountReservedTables } from '../use-reserved-tables'
import { useRestaurantStatusChange } from '../use-restaurant-status-change'

const SWITCH_ID = 'restaurant-status-switch'

interface CloseConfirmation {
  /** `null` when the reserved tables could not be counted. */
  reserved: number | null
}

/**
 * Topbar control (manual 3.3): "Estado del restaurante" + Switch Abierto / Cerrado.
 * Closing with reserved tables asks first; the banner shows the load and save errors.
 */
export function RestaurantStatusControl() {
  const statusQuery = useRestaurantStatusQuery()
  const showSkeleton = useDelayedFlag(statusQuery.isPending)
  const { open, closeNow, confirmClose, saving } = useRestaurantStatusChange()
  const countReservedTables = useCountReservedTables()
  const [checking, setChecking] = useState(false)
  const [confirmation, setConfirmation] = useState<CloseConfirmation | null>(null)
  const [confirmError, setConfirmError] = useState<string>()

  // A disabled switch loses focus: give it back when the save ends, so keyboard users keep their place.
  const refocusAfterSave = useRef(false)
  useEffect(() => {
    if (saving || !refocusAfterSave.current) return
    refocusAfterSave.current = false
    document.getElementById(SWITCH_ID)?.focus()
  }, [saving])

  if (statusQuery.isPending) {
    return (
      <div aria-busy="true" className="flex items-center gap-3">
        <span role="status" className="sr-only">
          {RESTAURANT_STATUS_TEXT.loading}
        </span>
        {showSkeleton && (
          <>
            <Skeleton radius="full" className="h-6.5 w-11" />
            <Skeleton className="h-4 w-16" />
          </>
        )}
      </div>
    )
  }

  // Load error: the banner explains it and offers "Intentar de nuevo".
  if (!statusQuery.data) return null

  async function requestClose() {
    if (checking) return
    setChecking(true)
    try {
      const reserved = await countReservedTables()
      if (reserved === 0) {
        closeNow()
        return
      }
      // The dialog takes focus and gives it back to the switch when it closes.
      refocusAfterSave.current = false
      setConfirmError(undefined)
      setConfirmation({ reserved })
    } finally {
      setChecking(false)
    }
  }

  function handleCheckedChange(next: boolean) {
    refocusAfterSave.current = document.activeElement?.id === SWITCH_ID
    if (next) open()
    else void requestClose()
  }

  function handleConfirm() {
    setConfirmError(undefined)
    confirmClose({ onClosed: () => setConfirmation(null), onError: setConfirmError })
  }

  return (
    <>
      {/* TODO(Sergio): falta la variante de estado del Switch en el kit (punto con pulso para Abierto, raya para Cerrado; manual 3.3). Pedida a Sebastián. */}
      <Switch
        id={SWITCH_ID}
        label={<span className="sr-only sm:not-sr-only">{RESTAURANT_STATUS_TEXT.switchLabel}</span>}
        checked={statusQuery.data.isOpen}
        onCheckedChange={handleCheckedChange}
        onLabel={STATUS_META.open.label}
        offLabel={STATUS_META.closed.label}
        disabled={saving}
      />
      <ConfirmDialog
        open={confirmation !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setConfirmation(null)
        }}
        title={RESTAURANT_STATUS_TEXT.confirmTitle}
        description={
          confirmation?.reserved == null
            ? RESTAURANT_STATUS_TEXT.confirmUnknownReservations
            : closeWithReservationsText(confirmation.reserved)
        }
        confirmLabel={RESTAURANT_STATUS_TEXT.confirmLabel}
        loadingText={RESTAURANT_STATUS_TEXT.confirmLoading}
        confirmVariant="danger"
        loading={saving}
        error={confirmError}
        onConfirm={handleConfirm}
      />
    </>
  )
}
