import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { ArrowLeft, Check, RotateCcw } from 'lucide-react'
import {
  Alert,
  BILLING_STATUS,
  Button,
  Card,
  ConfirmDialog,
  DataTable,
  EmptyState,
  PageHeader,
  Pagination,
  Skeleton,
  StatusChip,
  useToast,
  type DataTableColumn,
} from '@/components/ui'
import { formatCapacity } from '@/lib/format'
import { matchesPerGuestFee } from '@/lib/per-guest-fee'
import { useDelayedFlag } from '@/lib/use-delayed-flag'
import { formatBogotaDateTime } from '@/features/summary/format'
import { formatDateTime } from '@/lib/format'
import { formatAdminCop } from '../admin/format'
import { bogotaMonthOf, monthName, monthTitle, parseMonth } from '../admin/month'
import { useAdminBillingDetailQuery, useAdminOverviewQuery, useMarkMonthPaid, useMarkMonthPending } from '../admin/panel-hooks'
import type { AdminBillingCheckIn } from '../admin/panel-types'
import {
  BILLING_TEXT,
  chargeAction,
  chargeFormula,
  CHECK_INS_PAGE_SIZE,
  describeBillingError,
  isBillingConflict,
  isNotFound,
  markedText,
} from './messages'

function toPage(value: string | null): number {
  const page = Math.floor(Number(value))
  return Number.isFinite(page) && page >= 1 ? page : 1
}

/**
 * `/admin/cobros/:restaurantId?mes=` (docs/admin-panel-contract.md §3): one restaurant's charge for one month. The amount is
 * the protagonist; under it, how it adds up and why it is charged. «Marcar como cobrado» is the only primary button and only
 * shows for a closed month that is pending and has something to bill; «Deshacer cobro» is for a paid one; a month still in
 * progress offers nothing. The list of check-ins never shows who the diner was. Every 409 shows its text and loads it again.
 */
export default function BillingDetailPage() {
  const { restaurantId = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const current = bogotaMonthOf()
  const month = parseMonth(params.get('mes'), current)
  const page = toPage(params.get('pagina'))
  const query = useAdminBillingDetailQuery(restaurantId, month, page, CHECK_INS_PAGE_SIZE)
  const showSkeleton = useDelayedFlag(query.isPending)
  const markPaid = useMarkMonthPaid()
  const markPending = useMarkMonthPending()
  const [dialog, setDialog] = useState<'mark' | 'undo' | null>(null)
  const [dialogError, setDialogError] = useState<string>()
  const detail = query.data
  // Today's fee per guest, only to describe the check-ins that were charged that way; the amounts are always the stored ones.
  const feePerGuestCop = useAdminOverviewQuery(month).data?.currentFeePerGuestCop
  const busy = markPaid.isPending || markPending.isPending

  const back = () => navigate(`/admin/cobros?mes=${month}`)

  async function run(kind: 'mark' | 'undo') {
    if (!detail || busy) return
    setDialogError(undefined)
    try {
      if (kind === 'mark') {
        await markPaid.mutateAsync({ id: restaurantId, month })
        toast.show({ type: 'success', message: markedText(month, detail.restaurant.name) })
      } else {
        await markPending.mutateAsync({ id: restaurantId, month })
        toast.show({ type: 'success', message: BILLING_TEXT.undoneToast })
      }
      setDialog(null)
    } catch (failure) {
      const text = describeBillingError(failure, kind === 'mark' ? BILLING_TEXT.markFailed : BILLING_TEXT.undoFailed)
      if (isBillingConflict(failure)) {
        // The month is not what this screen thought: say so, and the detail (already asked again) shows what it is now.
        setDialog(null)
        toast.show({ type: 'warning', message: text })
      } else setDialogError(text)
    }
  }

  const columns: DataTableColumn<AdminBillingCheckIn>[] = [
    { key: 'when', header: BILLING_TEXT.columnWhen, mobileLine: 1, className: 'tabular-nums', cell: (item) => formatBogotaDateTime(item.checkedInAt) },
    { key: 'party', header: BILLING_TEXT.columnParty, mobileLine: 2, cell: (item) => formatCapacity(item.partySize) },
    {
      key: 'fee',
      header: BILLING_TEXT.columnFee,
      mobileLine: 1,
      className: 'tabular-nums',
      cell: (item) => (
        <span className="flex flex-col">
          <span>{formatAdminCop(item.feeCop)}</span>
          {matchesPerGuestFee(item, feePerGuestCop) && <span className="text-label font-normal text-fg-2">{BILLING_TEXT.feeFormula(item.partySize, formatAdminCop(feePerGuestCop ?? 0))}</span>}
        </span>
      ),
    },
  ]

  if (!detail) {
    if (query.isError) {
      return (
        <EmptyState
          variant="error"
          title={isNotFound(query.error) ? BILLING_TEXT.notFound : describeBillingError(query.error, BILLING_TEXT.detailLoadError)}
          action={
            isNotFound(query.error) ? (
              <Button variant="secondary" onClick={back}>
                {BILLING_TEXT.backToList}
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => void query.refetch()}>
                {BILLING_TEXT.retry}
              </Button>
            )
          }
        />
      )
    }
    return (
      <div aria-busy="true" role="status" className="flex flex-col gap-6">
        <span className="sr-only">Cargando el cobro</span>
        {showSkeleton && (
          <>
            <Skeleton className="h-10 w-2/3" />
            <Skeleton radius="card" className="h-44" />
            <Skeleton radius="card" className="h-64" />
          </>
        )}
      </div>
    )
  }

  const action = chargeAction(detail)
  const name = detail.restaurant.name

  return (
    <>
      <div>
        <Button variant="ghost" icon={ArrowLeft} onClick={back}>
          {BILLING_TEXT.backToList}
        </Button>
      </div>
      <PageHeader
        title={name}
        description={`${monthTitle(month)}${detail.restaurant.approvalStatus === 'suspended' ? ` · ${BILLING_TEXT.suspendedNote}` : ''}`}
        actions={
          action === 'mark-paid' ? (
            <Button icon={Check} onClick={() => { setDialogError(undefined); setDialog('mark') }}>
              {BILLING_TEXT.markPaid}
            </Button>
          ) : action === 'undo' ? (
            <Button variant="outline" icon={RotateCcw} onClick={() => { setDialogError(undefined); setDialog('undo') }}>
              {BILLING_TEXT.undoPaid}
            </Button>
          ) : undefined
        }
      />
      {query.isError && <Alert type="error">{describeBillingError(query.error, BILLING_TEXT.detailLoadError)}</Alert>}
      {detail.amountMismatch && detail.snapshot && (
        <Alert type="warning" title={BILLING_TEXT.mismatchTitle}>
          {BILLING_TEXT.mismatch(formatAdminCop(detail.amountCop), formatAdminCop(detail.snapshot.amountCop))}
        </Alert>
      )}
      <Card as="section" aria-label={`Cobro de ${monthName(month)}`} className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <StatusChip status={BILLING_STATUS[detail.status]} />
          {detail.status === 'paid' && detail.paidAt && <span className="text-sec text-fg">{BILLING_TEXT.paidOn(formatDateTime(detail.paidAt))}</span>}
        </div>
        <p className="text-figure text-fg tabular-nums">{formatAdminCop(detail.amountCop)}</p>
        <p className="text-body text-fg tabular-nums">{detail.totalCheckIns > 0 ? chargeFormula(detail, feePerGuestCop) : BILLING_TEXT.nothingToBillNote}</p>
        {feePerGuestCop !== undefined && <p className="text-sec text-fg-2 tabular-nums">{BILLING_TEXT.feePerGuest(formatAdminCop(feePerGuestCop))}</p>}
        {action === 'in-progress' && <p className="text-sec font-bold text-fg">{BILLING_TEXT.inProgressNote}</p>}
        <div className="flex flex-col gap-1 border-t border-line pt-3">
          <h2 className="text-h3 text-fg">{BILLING_TEXT.whyTitle}</h2>
          <p className="text-sec text-fg">{BILLING_TEXT.why}</p>
        </div>
      </Card>
      <section aria-label={BILLING_TEXT.checkInsTitle} className="flex flex-col gap-4">
        <h2 className="text-h2 text-fg">{BILLING_TEXT.checkInsTitle}</h2>
        <DataTable
          caption={BILLING_TEXT.checkInsCaption}
          columns={columns}
          rows={detail.items}
          getRowId={(item) => item.checkInId}
          emptyState={<EmptyState title={BILLING_TEXT.checkInsEmpty} description={BILLING_TEXT.checkInsEmptyDescription} />}
        />
        <Pagination
          page={page}
          pageSize={CHECK_INS_PAGE_SIZE}
          totalItems={detail.totalCheckIns}
          onPageChange={(next) => {
            const nextParams = new URLSearchParams(params)
            if (next > 1) nextParams.set('pagina', String(next))
            else nextParams.delete('pagina')
            setParams(nextParams)
          }}
          itemsLabel={BILLING_TEXT.checkInsLabel}
        />
      </section>
      <ConfirmDialog
        open={dialog === 'mark'}
        onOpenChange={(open) => !busy && setDialog(open ? 'mark' : null)}
        title={BILLING_TEXT.markTitle(monthName(month), name, formatAdminCop(detail.amountCop))}
        description={BILLING_TEXT.markBody}
        confirmLabel={BILLING_TEXT.markPaid}
        confirmVariant="primary"
        loadingText={BILLING_TEXT.marking}
        loading={markPaid.isPending}
        error={dialog === 'mark' ? dialogError : undefined}
        onConfirm={() => void run('mark')}
      />
      <ConfirmDialog
        open={dialog === 'undo'}
        onOpenChange={(open) => !busy && setDialog(open ? 'undo' : null)}
        title={BILLING_TEXT.undoTitle(monthName(month), name)}
        description={BILLING_TEXT.undoBody}
        confirmLabel={BILLING_TEXT.undoPaid}
        confirmVariant="danger"
        loadingText={BILLING_TEXT.undoing}
        loading={markPending.isPending}
        error={dialog === 'undo' ? dialogError : undefined}
        onConfirm={() => void run('undo')}
      />
    </>
  )
}
