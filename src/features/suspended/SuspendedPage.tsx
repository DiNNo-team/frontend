import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ChartNoAxesColumn, ScanLine } from 'lucide-react'
import { Alert, Button, Card, EmptyState, PageHeader, Skeleton } from '@/components/ui'
import { AuthAnchor } from '@/features/auth/components/AuthLink'
import { TEAM_EMAIL } from '@/features/auth/restaurant-request'
import { CheckInDialog } from '@/features/reservations/components/CheckInDialog'
import { ReservationsPanel } from '@/features/reservations/components/ReservationsPanel'
import { useRestaurantQuery } from '@/features/restaurant/hooks'
import { useDelayedFlag } from '@/lib/use-delayed-flag'
import { SUSPENDED_TEXT } from './messages'

/**
 * `/suspendido` (backend contract, section 6): where an approved restaurant the administrator paused lands. It says why,
 * keeps the check-in of the reservations already on their way and points to the read-only summary. Everything else of
 * the dashboard answers 403 RESTAURANT_SUSPENDED, so it is not offered. Closing the session is in the user menu.
 */
export default function SuspendedPage() {
  const navigate = useNavigate()
  const query = useRestaurantQuery()
  const showSkeleton = useDelayedFlag(query.isPending)
  const [checkInOpen, setCheckInOpen] = useState(false)
  const restaurant = query.data

  if (!restaurant) {
    if (query.isError) {
      return (
        <EmptyState
          variant="error"
          title={SUSPENDED_TEXT.loadError}
          action={
            <Button variant="secondary" onClick={() => void query.refetch()}>
              {SUSPENDED_TEXT.retry}
            </Button>
          }
        />
      )
    }
    return (
      <div aria-busy="true" className="flex flex-col gap-6">
        <span role="status" className="sr-only">
          Cargando tu cuenta
        </span>
        {showSkeleton && (
          <>
            <Skeleton className="h-10 w-2/3" />
            <Skeleton radius="card" className="h-24" />
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title={SUSPENDED_TEXT.title}
        description={SUSPENDED_TEXT.description}
        actions={
          <Button icon={ScanLine} onClick={() => setCheckInOpen(true)}>
            {SUSPENDED_TEXT.checkIn}
          </Button>
        }
      />
      {restaurant.suspensionReason && (
        <Alert type="warning">
          <span className="block font-bold">{SUSPENDED_TEXT.reasonTitle}</span>
          {restaurant.suspensionReason}
        </Alert>
      )}
      <ReservationsPanel />
      <Card as="section" title={SUSPENDED_TEXT.summaryTitle}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sec text-fg">{SUSPENDED_TEXT.summaryDescription}</p>
          <Button variant="outline" icon={ChartNoAxesColumn} onClick={() => navigate('/resumen')}>
            {SUSPENDED_TEXT.summaryLink}
          </Button>
        </div>
      </Card>
      <p className="text-sec text-fg">
        {SUSPENDED_TEXT.contactQuestion} <AuthAnchor href={`mailto:${TEAM_EMAIL}`}>{TEAM_EMAIL}</AuthAnchor>.
      </p>
      <CheckInDialog open={checkInOpen} onOpenChange={setCheckInOpen} />
    </>
  )
}
