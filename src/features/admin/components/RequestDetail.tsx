import { useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, ExternalLink, Pause, Play, X } from 'lucide-react'
import { Alert, Button, Card, ConfirmDialog, DetailList, EmptyState, REVIEW_STATUS, Skeleton, StatusChip, useToast } from '@/components/ui'
import { closesNextDay, DAY_LABELS } from '@/components/ui/hours'
import { toRestaurantFormValues } from '@/features/restaurant/restaurant-form'
import { RESTAURANT_CATEGORY_LABELS } from '@/features/restaurant/types'
import { formatDateTime, formatTime12h } from '@/lib/format'
import { Icon } from '@/lib/icon'
import { useDelayedFlag } from '@/lib/use-delayed-flag'
import { adminQueryKey, useAdminRestaurantQuery, useApproveRestaurant, useReactivateRestaurant, useRejectRestaurant, useSuspendRestaurant } from '../hooks'
import { ADMIN_TEXT, describeReviewError, isNotApprovedError, isNotFoundError, isNotPendingError, isNotSuspendedError } from '../messages'
import { formatSince } from '../relative-time'
import type { AdminRestaurantDetail } from '../types'
import { RejectDialog } from './RejectDialog'
import { SuspendDialog } from './SuspendDialog'

interface RequestDetailProps {
  id: string
  /** `page`: a phone, the detail replaces the list and has a way back. `panel`: next to the list. */
  variant: 'panel' | 'page'
  onClose: () => void
  /** More actions beside the decisions (the Restaurantes screen adds «Ver cobro del mes»). */
  extraActions?: ReactNode
}

function mapsUrl({ latitude, longitude }: { latitude: number; longitude: number }): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = `request-section-${title}`
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h3 id={id} className="text-h3 text-fg">
        {title}
      </h3>
      {children}
    </section>
  )
}

/** The last suspension (there is no history): the reason and who, also once the restaurant is active again. */
function SuspensionSection({ detail }: { detail: AdminRestaurantDetail }) {
  const date = detail.suspendedAt ? formatDateTime(detail.suspendedAt) : ''
  if (detail.approvalStatus !== 'suspended') {
    return (
      <Section title={ADMIN_TEXT.detailTitleSuspension}>
        <p className="text-sec text-fg">{ADMIN_TEXT.suspendedBefore(date, detail.suspensionReason ?? '')}</p>
      </Section>
    )
  }
  return (
    <Section title={ADMIN_TEXT.detailTitleSuspension}>
      <DetailList
        items={[
          { label: ADMIN_TEXT.suspendedSince, value: `${date}${detail.suspendedAt ? ' · ' + formatSince(detail.suspendedAt) : ''}` },
          { label: ADMIN_TEXT.reasonLabel, value: detail.suspensionReason ?? '' },
          ...(detail.suspendedByEmail ? [{ label: ADMIN_TEXT.suspendedBy, value: <span className="break-all">{detail.suspendedByEmail}</span> }] : []),
        ]}
      />
    </Section>
  )
}

function DetailBody({ detail }: { detail: AdminRestaurantDetail }) {
  const { hours } = toRestaurantFormValues({ ...detail, activeReservationsCount: 0 })
  const located = detail.latitude !== null && detail.longitude !== null
  return (
    <>
      <Section title={ADMIN_TEXT.detailTitleData}>
        <DetailList
          items={[
            { label: 'Categoría', value: detail.category ? RESTAURANT_CATEGORY_LABELS[detail.category] : 'Sin categoría' },
            { label: 'Dirección', value: detail.address ?? 'Sin dirección' },
            { label: 'Teléfono', value: detail.contactPhone ?? 'Sin teléfono' },
            { label: 'Correo del dueño', value: <span className="break-all">{detail.ownerEmail ?? 'Sin correo'}</span> },
            { label: 'Recibida', value: `${formatDateTime(detail.submittedAt)} · ${formatSince(detail.submittedAt)}` },
          ]}
        />
      </Section>
      <Section title={ADMIN_TEXT.detailTitleLocation}>
        {located ? (
          <DetailList
            items={[
              { label: 'Coordenadas', value: <span className="tabular-nums">{detail.latitude?.toFixed(6)}, {detail.longitude?.toFixed(6)}</span> },
              {
                label: 'Mapa',
                value: (
                  <a
                    href={mapsUrl({ latitude: detail.latitude as number, longitude: detail.longitude as number })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-accent-text underline-offset-4 hover:underline"
                  >
                    {ADMIN_TEXT.seeOnMap}
                    <Icon icon={ExternalLink} size={16} />
                    <span className="sr-only"> (se abre en una pestaña nueva)</span>
                  </a>
                ),
              },
            ]}
          />
        ) : (
          <p className="text-sec text-fg">{ADMIN_TEXT.noLocation}</p>
        )}
      </Section>
      <Section title={ADMIN_TEXT.detailTitleSchedule}>
        <DetailList
          items={hours.map((day) => {
            let value = 'Cerrado'
            if (day.isOpen24h) value = 'Abierto 24 horas'
            else if (day.isOpen) value = `${formatTime12h(day.opensAt)} – ${formatTime12h(day.closesAt)}${closesNextDay(day) ? ' (día siguiente)' : ''}`
            return { label: DAY_LABELS[day.day].long, value }
          })}
        />
      </Section>
      <Section title={ADMIN_TEXT.detailTitleReview}>
        <DetailList
          items={[
            { label: 'Estado', value: <StatusChip status={REVIEW_STATUS[detail.approvalStatus]} /> },
            {
              label: 'Revisada',
              value: detail.reviewedAt
                ? `${formatDateTime(detail.reviewedAt)} · ${formatSince(detail.reviewedAt)}`
                : ADMIN_TEXT.notReviewed,
            },
            ...(detail.reviewedByEmail ? [{ label: 'Revisada por', value: <span className="break-all">{detail.reviewedByEmail}</span> }] : []),
            ...(detail.rejectionReason ? [{ label: ADMIN_TEXT.reasonLabel, value: detail.rejectionReason }] : []),
          ]}
        />
      </Section>
      {detail.suspendedAt && <SuspensionSection detail={detail} />}
    </>
  )
}

/**
 * One request in full (CLAUDE.md §12.12), with the two decisions when it is still pending. «Aprobar restaurante» is the
 * only primary button; «Rechazar solicitud» asks for the reason in a dialog. A 409 (somebody reviewed it first) shows the
 * request as it is now; a 404 closes the detail. The backend has no undo, and both dialogs say so.
 */
export function RequestDetail({ id, variant, onClose, extraActions }: RequestDetailProps) {
  const toast = useToast()
  const queryClient = useQueryClient()
  const query = useAdminRestaurantQuery(id)
  const showSkeleton = useDelayedFlag(query.isPending)
  const approve = useApproveRestaurant()
  const reject = useRejectRestaurant()
  const suspend = useSuspendRestaurant()
  const reactivate = useReactivateRestaurant()
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [reactivateOpen, setReactivateOpen] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [error, setError] = useState<string>()
  const detail = query.data
  const busy = approve.isPending || reject.isPending || suspend.isPending || reactivate.isPending

  function handleReviewFailure(failure: unknown, fallback: string) {
    if (isNotPendingError(failure) || isNotApprovedError(failure) || isNotSuspendedError(failure)) {
      // Somebody else changed it first: close the dialog and let the detail show what it is now.
      setApproveOpen(false)
      setRejectOpen(false)
      setSuspendOpen(false)
      setReactivateOpen(false)
      toast.show({ type: 'warning', message: describeReviewError(failure, fallback) })
      return
    }
    if (isNotFoundError(failure)) {
      setApproveOpen(false)
      setRejectOpen(false)
      setSuspendOpen(false)
      setReactivateOpen(false)
      toast.show({ type: 'warning', message: describeReviewError(failure, fallback) })
      void queryClient.invalidateQueries({ queryKey: adminQueryKey })
      onClose()
      return
    }
    setError(describeReviewError(failure, fallback))
  }

  async function handleApprove() {
    if (busy) return
    setError(undefined)
    try {
      await approve.mutateAsync({ id })
      setApproveOpen(false)
      toast.show({ type: 'success', message: ADMIN_TEXT.approveSuccess })
    } catch (failure) {
      handleReviewFailure(failure, ADMIN_TEXT.approveFailed)
    }
  }

  async function handleReject(reason: string) {
    if (busy) return
    setError(undefined)
    try {
      await reject.mutateAsync({ id, reason })
      setRejectOpen(false)
      toast.show({ type: 'success', message: ADMIN_TEXT.rejectSuccess })
    } catch (failure) {
      handleReviewFailure(failure, ADMIN_TEXT.rejectFailed)
    }
  }

  async function handleSuspend(reason: string) {
    if (busy || !detail) return
    setError(undefined)
    try {
      await suspend.mutateAsync({ id, reason })
      setSuspendOpen(false)
      toast.show({ type: 'success', message: ADMIN_TEXT.suspendSuccess(detail.name) })
    } catch (failure) {
      handleReviewFailure(failure, ADMIN_TEXT.suspendFailed)
    }
  }

  async function handleReactivate() {
    if (busy || !detail) return
    setError(undefined)
    try {
      await reactivate.mutateAsync({ id })
      setReactivateOpen(false)
      toast.show({ type: 'success', message: ADMIN_TEXT.reactivateSuccess(detail.name) })
    } catch (failure) {
      handleReviewFailure(failure, ADMIN_TEXT.reactivateFailed)
    }
  }

  let content
  if (detail) {
    content = (
      <>
        <header className="flex flex-col gap-2">
          <h2 className="text-h2 text-fg">{detail.name}</h2>
          <div>
            <StatusChip status={REVIEW_STATUS[detail.approvalStatus]} />
          </div>
        </header>
        <DetailBody detail={detail} />
        {detail.approvalStatus === 'pending' && (
          <div className="flex flex-col-reverse gap-3 *:w-full sm:flex-row sm:justify-end sm:*:w-auto">
            <Button
              variant="outline"
              icon={X}
              onClick={() => {
                setError(undefined)
                setRejectOpen(true)
              }}
            >
              {ADMIN_TEXT.rejectTitle}
            </Button>
            <Button
              icon={Check}
              onClick={() => {
                setError(undefined)
                setApproveOpen(true)
              }}
            >
              {ADMIN_TEXT.approveTitle}
            </Button>
          </div>
        )}
        {(detail.approvalStatus === 'approved' || detail.approvalStatus === 'suspended' || extraActions) && (
          <div className="flex flex-col-reverse gap-3 *:w-full sm:flex-row sm:justify-end sm:*:w-auto">
            {extraActions}
            {detail.approvalStatus === 'approved' && (
              <Button
                variant="danger"
                icon={Pause}
                onClick={() => {
                  setError(undefined)
                  setSuspendOpen(true)
                }}
              >
                {ADMIN_TEXT.suspend}
              </Button>
            )}
            {detail.approvalStatus === 'suspended' && (
              <Button
                variant="outline"
                icon={Play}
                onClick={() => {
                  setError(undefined)
                  setReactivateOpen(true)
                }}
              >
                {ADMIN_TEXT.reactivate}
              </Button>
            )}
          </div>
        )}
        <SuspendDialog
          open={suspendOpen}
          onOpenChange={setSuspendOpen}
          restaurantName={detail.name}
          saving={suspend.isPending}
          error={error}
          onSuspend={handleSuspend}
        />
        <ConfirmDialog
          open={reactivateOpen}
          onOpenChange={(open) => !busy && setReactivateOpen(open)}
          title={ADMIN_TEXT.reactivateTitle(detail.name)}
          description={ADMIN_TEXT.reactivateBody}
          confirmLabel={ADMIN_TEXT.reactivate}
          confirmVariant="primary"
          loadingText={ADMIN_TEXT.reactivating}
          loading={reactivate.isPending}
          error={error}
          onConfirm={handleReactivate}
        />
        <ConfirmDialog
          open={approveOpen}
          onOpenChange={(open) => !busy && setApproveOpen(open)}
          title={`${ADMIN_TEXT.approveTitle}: ${detail.name}`}
          description={ADMIN_TEXT.approveBody(detail.name)}
          confirmLabel={ADMIN_TEXT.approveConfirm}
          confirmVariant="primary"
          loadingText={ADMIN_TEXT.approving}
          loading={approve.isPending}
          error={error}
          onConfirm={handleApprove}
        />
        <RejectDialog
          open={rejectOpen}
          onOpenChange={setRejectOpen}
          restaurantName={detail.name}
          saving={reject.isPending}
          error={error}
          onReject={handleReject}
        />
      </>
    )
  } else if (query.isError) {
    content = (
      <EmptyState
        variant="error"
        title={isNotFoundError(query.error) ? ADMIN_TEXT.notFound : ADMIN_TEXT.detailLoadError}
        action={
          isNotFoundError(query.error) ? (
            <Button variant="secondary" onClick={onClose}>
              {ADMIN_TEXT.back}
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => void query.refetch()}>
              {ADMIN_TEXT.retry}
            </Button>
          )
        }
      />
    )
  } else {
    content = (
      <div aria-busy="true" className="flex flex-col gap-4">
        <span role="status" className="sr-only">
          {ADMIN_TEXT.loadingDetail}
        </span>
        {showSkeleton && (
          <>
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-6 w-24" />
            <Skeleton radius="card" className="h-40" />
            <Skeleton radius="card" className="h-40" />
          </>
        )}
      </div>
    )
  }

  const wrapper = (
    <div className="flex flex-col gap-6">
      {variant === 'page' && (
        <div>
          <Button variant="ghost" icon={ArrowLeft} onClick={onClose}>
            {ADMIN_TEXT.back}
          </Button>
        </div>
      )}
      {query.isError && detail && <Alert type="error">{ADMIN_TEXT.detailLoadError}</Alert>}
      {content}
    </div>
  )

  return variant === 'panel' ? (
    <Card as="aside" aria-label="Detalle de la solicitud">
      <div className="flex flex-col gap-6">
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" icon={X} onClick={onClose}>
            Cerrar detalle
          </Button>
        </div>
        {wrapper}
      </div>
    </Card>
  ) : (
    wrapper
  )
}
