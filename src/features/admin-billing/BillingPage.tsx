import { useNavigate, useSearchParams } from 'react-router'
import { Button, Card, DataTable, EmptyState, PageHeader, Pagination, REVIEW_STATUS, StatusChip, BILLING_STATUS, type DataTableColumn } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useDelayedFlag } from '@/lib/use-delayed-flag'
import { formatAdminCop } from '../admin/format'
import { bogotaMonthOf, lastMonths, monthTitle, parseMonth } from '../admin/month'
import { useAdminBillingQuery, useAdminOverviewQuery } from '../admin/panel-hooks'
import type { AdminBillingItem } from '../admin/panel-types'
import { BlockState } from '../admin-overview/components/BlockState'
import { MonthBars } from '../admin-overview/components/MonthBars'
import { describeBlockError } from '../admin-overview/messages'
import { BILLING_PAGE_SIZE, BILLING_TEXT } from './messages'

function toPage(value: string | null): number {
  const page = Math.floor(Number(value))
  return Number.isFinite(page) && page >= 1 ? page : 1
}

function Totals({ totals }: { totals: { checkIns: number; amountCop: number; paidCop: number; pendingCop: number } }) {
  const items = [
    [BILLING_TEXT.totalCheckIns, String(totals.checkIns)],
    [BILLING_TEXT.totalAmount, formatAdminCop(totals.amountCop)],
    [BILLING_TEXT.totalPaid, formatAdminCop(totals.paidCop)],
    [BILLING_TEXT.totalPending, formatAdminCop(totals.pendingCop)],
  ] as const
  return (
    <Card as="section" aria-label={BILLING_TEXT.totalsLabel}>
      <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-1">
            <dt className="text-kicker text-fg-2">{label}</dt>
            <dd className="text-h2 text-fg tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}

/**
 * `/admin/cobros` (docs/admin-panel-contract.md §3): what each restaurant owes for the chosen month. The month is picked in the
 * same bars as the summary and lives in the URL (`?mes=`); the table is paged by the backend (`?pagina=`) and each row opens
 * the detail of that restaurant and month.
 */
export default function BillingPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const current = bogotaMonthOf()
  const month = parseMonth(params.get('mes'), current)
  const page = toPage(params.get('pagina'))
  const overview = useAdminOverviewQuery(month)
  const billing = useAdminBillingQuery(month, page, BILLING_PAGE_SIZE)
  const showSkeleton = useDelayedFlag(billing.isPending)
  const data = billing.data

  function update(changes: { mes?: string; pagina?: number }) {
    const next = new URLSearchParams(params)
    if (changes.mes !== undefined) {
      next.set('mes', changes.mes)
      next.delete('pagina')
    }
    if (changes.pagina !== undefined) {
      if (changes.pagina > 1) next.set('pagina', String(changes.pagina))
      else next.delete('pagina')
    }
    setParams(next)
  }

  const max = Math.max(1, ...(data?.items.map((item) => item.amountCop) ?? [1]))
  const columns: DataTableColumn<AdminBillingItem>[] = [
    {
      key: 'restaurant',
      header: BILLING_TEXT.columnRestaurant,
      mobileLine: 1,
      cell: (item) => (
        <button
          type="button"
          aria-label={BILLING_TEXT.seeDetailOf(item.name)}
          onClick={() => navigate(`/admin/cobros/${encodeURIComponent(item.restaurantId)}?mes=${month}`)}
          className="cursor-pointer rounded-tile text-left font-bold text-fg underline-offset-4 hover:underline"
        >
          {item.name}
        </button>
      ),
    },
    {
      key: 'state',
      header: BILLING_TEXT.columnState,
      mobileLine: 2,
      cell: (item) => <StatusChip status={item.approvalStatus === 'suspended' ? REVIEW_STATUS.suspended : 'restaurant-active'} />,
    },
    { key: 'checkIns', header: BILLING_TEXT.columnCheckIns, mobileLine: 2, className: 'tabular-nums', cell: (item) => `${item.checkIns} ${BILLING_TEXT.checkInsLabel}` },
    {
      key: 'amount',
      header: BILLING_TEXT.columnAmount,
      mobileLine: 1,
      cell: (item) => (
        <span className="flex min-w-32 flex-col gap-1">
          <span className="font-bold tabular-nums text-fg">{formatAdminCop(item.amountCop)}</span>
          <span aria-hidden="true" className="block h-1.5 w-full rounded-full bg-line">
            <span style={{ width: `${(item.amountCop / max) * 100}%` }} className={cn('block h-full rounded-full', item.amountCop > 0 ? 'bg-fg' : '')} />
          </span>
        </span>
      ),
    },
    { key: 'charge', header: BILLING_TEXT.columnCharge, mobileLine: 2, cell: (item) => <StatusChip status={BILLING_STATUS[item.status]} /> },
    {
      key: 'detail',
      header: <span className="sr-only">{BILLING_TEXT.seeDetail}</span>,
      mobileLine: 2,
      cell: (item) => (
        <button
          type="button"
          aria-label={BILLING_TEXT.seeDetailOf(item.name)}
          onClick={() => navigate(`/admin/cobros/${encodeURIComponent(item.restaurantId)}?mes=${month}`)}
          className="cursor-pointer rounded-tile font-bold text-accent-text hover:underline"
        >
          {BILLING_TEXT.seeDetail}
        </button>
      ),
    },
  ]

  return (
    <>
      <PageHeader title={BILLING_TEXT.title} description={BILLING_TEXT.description} />
      <BlockState query={overview} skeleton="h-44" loadingLabel="Cargando los meses">
        {overview.data && (
          <Card as="section" aria-label={BILLING_TEXT.monthPicker}>
            <MonthBars
              compact
              bars={overview.data.monthly.filter((entry) => lastMonths(current, 6).includes(entry.month))}
              selected={month}
              current={current}
              onSelect={(next) => update({ mes: next })}
            />
          </Card>
        )}
      </BlockState>
      {data && <Totals totals={data.totals} />}
      <section aria-label={BILLING_TEXT.tableCaption} className="flex flex-col gap-4">
        <h2 className="text-h2 text-fg">{monthTitle(month)}</h2>
        {billing.isError && !data ? (
          <EmptyState
            variant="error"
            title={describeBlockError(billing.error)}
            action={
              <Button variant="secondary" onClick={() => void billing.refetch()}>
                {BILLING_TEXT.retry}
              </Button>
            }
          />
        ) : (
          <>
            <DataTable
              caption={BILLING_TEXT.tableCaption}
              columns={columns}
              rows={data?.items ?? []}
              getRowId={(item) => item.restaurantId}
              loading={!data && showSkeleton}
              emptyState={<EmptyState title={BILLING_TEXT.emptyTitle} description={BILLING_TEXT.emptyDescription} />}
            />
            <Pagination page={page} pageSize={BILLING_PAGE_SIZE} totalItems={data?.total ?? 0} onPageChange={(next) => update({ pagina: next })} itemsLabel={BILLING_TEXT.itemsLabel} />
          </>
        )}
      </section>
    </>
  )
}
