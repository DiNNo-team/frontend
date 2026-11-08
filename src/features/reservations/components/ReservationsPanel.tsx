import { useEffect } from 'react'
import { Alert, Button, Card, Skeleton, StatusLine } from '@/components/ui'
import { getApiErrorMessage, isAccessError } from '@/lib/api-client'
import { formatCountdown, remainingMs, spokenCountdown } from '../countdown'
import { useMonotonicNow, useRestaurantReservationsQuery, type TimedReservation } from '../hooks'
import { dinerNameOf, RESERVATION_TEXT, reservationDetailsText } from '../messages'

/** After a row reaches 00:00 the backend expires it within ~15 s: ask again a little later. */
const AFTER_ZERO_REFRESH_MS = 5_000

function ReservationRow({ reservation, now }: { reservation: TimedReservation; now: number }) {
  const left = remainingMs(reservation.expiresAt, reservation.serverTime, reservation.receivedAt, now)
  const name = dinerNameOf(reservation.dinerName)
  return (
    <li className="flex items-center justify-between gap-4 py-3">
      <div className="flex min-w-0 flex-col gap-1">
        <p className="truncate text-body font-bold text-fg">{name}</p>
        <p className="text-sec text-fg">{reservationDetailsText(reservation)}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {left > 0 ? (
          <p className="text-h3 font-extrabold text-fg tabular-nums">
            <span aria-hidden="true">{formatCountdown(left)}</span>
            <span className="sr-only">Quedan {spokenCountdown(left)}</span>
          </p>
        ) : (
          <p className="text-sec font-bold text-fg">{RESERVATION_TEXT.panelExpiring}</p>
        )}
        <StatusLine status="reservation-active" size="sm" />
      </div>
    </li>
  )
}

/**
 * «Reservas DiNNo» (reparto 9.2, CLAUDE.md §12.6 and §12.8): who is on the way, the next to expire first, with the time
 * left from the server clock. NEVER shows the code (the API does not send it). Refreshes every 30 s and on focus.
 */
export function ReservationsPanel() {
  const query = useRestaurantReservationsQuery()
  const reservations = query.data ?? []
  const now = useMonotonicNow(reservations.length > 0)
  const { refetch } = query

  // A row at 00:00: the backend confirms the expiry; ask again shortly instead of waiting for the 30 s refresh.
  const anyAtZero = reservations.some((reservation) => remainingMs(reservation.expiresAt, reservation.serverTime, reservation.receivedAt, now) === 0)
  useEffect(() => {
    if (!anyAtZero) return
    const timer = window.setTimeout(() => void refetch(), AFTER_ZERO_REFRESH_MS)
    return () => window.clearTimeout(timer)
  }, [anyAtZero, refetch])

  function body() {
    if (query.isPending) {
      return (
        // No live region: /mesas already announces its own loading; this one is only described.
        <div aria-busy="true" aria-label={RESERVATION_TEXT.panelLoading} className="flex flex-col gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )
    }
    if (query.isError && !query.data) {
      const access = isAccessError(query.error)
      return (
        <Alert
          type="error"
          action={
            access ? undefined : (
              <Button size="sm" variant="outline" loading={query.isFetching} onClick={() => void refetch()}>
                {RESERVATION_TEXT.retry}
              </Button>
            )
          }
        >
          {access ? getApiErrorMessage(query.error) : RESERVATION_TEXT.panelLoadError}
        </Alert>
      )
    }
    if (reservations.length === 0) {
      return (
        <div className="flex flex-col gap-1">
          <p className="text-body font-bold text-fg">{RESERVATION_TEXT.panelEmpty}</p>
          <p className="text-sec text-fg">{RESERVATION_TEXT.panelEmptyDescription}</p>
        </div>
      )
    }
    return (
      <ul aria-label={RESERVATION_TEXT.panelTitle} className="flex flex-col divide-y divide-line">
        {reservations.map((reservation) => (
          <ReservationRow key={reservation.id} reservation={reservation} now={now} />
        ))}
      </ul>
    )
  }

  return (
    <Card as="section" title={RESERVATION_TEXT.panelTitle} aria-label={RESERVATION_TEXT.panelTitle}>
      {body()}
    </Card>
  )
}
