import { useMemo, useState } from 'react'
import { Button, Card, DataTable, EmptyState, Pagination, type DataTableColumn } from '@/components/ui'
import { formatCapacity, formatTableName } from '@/lib/format'
import { useDelayedFlag } from '@/lib/use-delayed-flag'
import { matchesPerGuestFee } from '@/lib/per-guest-fee'
import { formatBogotaDateTime, formatCop } from '../format'
import { useBillingQuery } from '../hooks'
import { describeReportError, SUMMARY_TEXT } from '../messages'
import { BILLING_PAGE_SIZE, type BillingItem, type PeriodRange } from '../types'
import { HelpToggle } from './HelpToggle'

/** Rows shown before asking for them all. */
const PREVIEW_ROWS = 3

function columnsFor(feePerGuestCop: number | undefined): DataTableColumn<BillingItem>[] {
  return [
  { key: 'when', header: SUMMARY_TEXT.columnWhen, cell: (item) => formatBogotaDateTime(item.checkedInAt), className: 'tabular-nums whitespace-nowrap', mobileLine: 2 },
  { key: 'table', header: SUMMARY_TEXT.columnTable, cell: (item) => formatTableName(item.tableIdentifier), className: 'font-bold md:font-medium', mobileLine: 1 },
  { key: 'party', header: SUMMARY_TEXT.columnParty, cell: (item) => formatCapacity(item.partySize), mobileLine: 2 },
    {
      key: 'fee',
      header: SUMMARY_TEXT.columnFee,
      cell: (item) => (
        <span className="flex flex-col md:items-end">
          <span>{formatCop(item.feeCop)}</span>
          {matchesPerGuestFee(item, feePerGuestCop) && <span className="text-label font-normal text-fg-2">{SUMMARY_TEXT.feeFormula(item.partySize, feePerGuestCop ?? 0)}</span>}
        </span>
      ),
      className: 'tabular-nums md:text-right',
      mobileLine: 1,
    },
  ]
}

/**
 * Block 5: the check-ins that make up the total to pay. It shows the 3 most recent and «Ver los N check-ins», which opens the
 * whole list (50 per page); under it, the period's total, which is the same number as the one at the top. It never shows
 * who the diner was. The parent keys it by period, so the page goes back to the first when the period changes.
 */
export function PaymentDetail({ period, feePerGuestCop }: { period: PeriodRange; feePerGuestCop?: number }) {
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState(false)
  const query = useBillingQuery(period, page, BILLING_PAGE_SIZE)
  const showSkeleton = useDelayedFlag(query.isPending)
  const statement = query.data
  const rows = statement ? (expanded ? statement.items : statement.items.slice(0, PREVIEW_ROWS)) : []
  const total = statement?.totalCheckIns ?? 0
  const columns = useMemo(() => columnsFor(feePerGuestCop), [feePerGuestCop])

  return (
    <Card as="section" aria-labelledby="detail-title" className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 id="detail-title" className="text-h2 text-fg">
          {SUMMARY_TEXT.detailTitle}
        </h2>
        <p className="text-sec text-fg-2">{SUMMARY_TEXT.detailDescription}</p>
      </header>

      {query.isError && !statement ? (
        <EmptyState
          variant="error"
          title={describeReportError(query.error, SUMMARY_TEXT.detailLoadError)}
          action={
            <Button variant="secondary" onClick={() => void query.refetch()}>
              {SUMMARY_TEXT.retry}
            </Button>
          }
        />
      ) : (
        <>
          <DataTable
            caption={SUMMARY_TEXT.detailCaption}
            columns={columns}
            rows={rows}
            getRowId={(item) => item.checkInId}
            loading={query.isPending && showSkeleton}
            emptyState={<EmptyState title={SUMMARY_TEXT.detailEmpty} description={SUMMARY_TEXT.detailEmptyDescription} />}
          />
          {statement && total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <p className="text-sec text-fg tabular-nums">
                <strong>{SUMMARY_TEXT.detailTotal(total, statement.amountCop)}</strong>
              </p>
              {total > PREVIEW_ROWS && (
                <Button
                  variant="ghost"
                  size="sm"
                  aria-expanded={expanded}
                  onClick={() => {
                    setExpanded((value) => !value)
                    setPage(1)
                  }}
                >
                  {expanded ? SUMMARY_TEXT.seeLess : SUMMARY_TEXT.seeAll(total)}
                </Button>
              )}
            </div>
          )}
          {expanded && <Pagination page={page} pageSize={BILLING_PAGE_SIZE} totalItems={total} onPageChange={setPage} itemsLabel={SUMMARY_TEXT.itemsLabel} />}
        </>
      )}
      <HelpToggle label={SUMMARY_TEXT.feeHelpLabel}>{SUMMARY_TEXT.feeHelp}</HelpToggle>
    </Card>
  )
}
