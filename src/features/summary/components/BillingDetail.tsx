import { useState } from 'react'
import { Button, DataTable, EmptyState, Pagination, type DataTableColumn } from '@/components/ui'
import { formatCapacity, formatTableName } from '@/lib/format'
import { useDelayedFlag } from '@/lib/use-delayed-flag'
import { formatBogotaDateTime, formatCop } from '../format'
import { useBillingQuery } from '../hooks'
import { describeReportError, SUMMARY_TEXT } from '../messages'
import { BILLING_PAGE_SIZE, type BillingItem, type PeriodRange } from '../types'

const COLUMNS: DataTableColumn<BillingItem>[] = [
  { key: 'when', header: SUMMARY_TEXT.columnWhen, cell: (item) => formatBogotaDateTime(item.checkedInAt), className: 'tabular-nums whitespace-nowrap', mobileLine: 2 },
  { key: 'table', header: SUMMARY_TEXT.columnTable, cell: (item) => formatTableName(item.tableIdentifier), className: 'font-bold md:font-medium', mobileLine: 1 },
  { key: 'party', header: SUMMARY_TEXT.columnParty, cell: (item) => formatCapacity(item.partySize), mobileLine: 2 },
  { key: 'fee', header: SUMMARY_TEXT.columnFee, cell: (item) => formatCop(item.feeCop), className: 'tabular-nums md:text-right', mobileLine: 1 },
]

/**
 * The check-ins that make up the figure above, 50 per page, with the period's own total underneath: it is the same number.
 * It never shows who the diner was. The page goes back to the first when the period changes (the parent keys it by period).
 */
export function BillingDetail({ period }: { period: PeriodRange }) {
  const [page, setPage] = useState(1)
  const query = useBillingQuery(period, page, BILLING_PAGE_SIZE)
  const showSkeleton = useDelayedFlag(query.isPending)
  const statement = query.data

  return (
    <section aria-labelledby="detail-title" className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 id="detail-title" className="text-h2 text-fg">
          {SUMMARY_TEXT.detailTitle}
        </h2>
        <p className="text-sec text-fg">{SUMMARY_TEXT.detailDescription}</p>
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
            columns={COLUMNS}
            rows={statement?.items ?? []}
            getRowId={(item) => item.checkInId}
            loading={query.isPending && showSkeleton}
            emptyState={<EmptyState title={SUMMARY_TEXT.detailEmpty} description={SUMMARY_TEXT.detailEmptyDescription} />}
          />
          {statement && statement.totalCheckIns > 0 && (
            <p className="text-sec font-bold text-fg tabular-nums">{SUMMARY_TEXT.detailTotal(statement.totalCheckIns, statement.amountCop)}</p>
          )}
          <Pagination
            page={page}
            pageSize={BILLING_PAGE_SIZE}
            totalItems={statement?.totalCheckIns ?? 0}
            onPageChange={setPage}
            itemsLabel={SUMMARY_TEXT.itemsLabel}
          />
        </>
      )}
    </section>
  )
}
