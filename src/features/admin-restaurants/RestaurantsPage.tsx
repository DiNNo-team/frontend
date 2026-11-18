import { useNavigate, useSearchParams } from 'react-router'
import { Wallet } from 'lucide-react'
import { Button, DataTable, EmptyState, PageHeader, Pagination, SegmentedControl, StatusChip, REVIEW_STATUS, type DataTableColumn } from '@/components/ui'
import { RESTAURANT_CATEGORY_LABELS } from '@/features/restaurant/types'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/format'
import { useDelayedFlag } from '@/lib/use-delayed-flag'
import { useMediaQuery } from '@/lib/use-media-query'
import { RequestDetail } from '../admin/components/RequestDetail'
import { ADMIN_TEXT } from '../admin/messages'
import { formatAdminCop } from '../admin/format'
import { bogotaMonthOf, parseMonth } from '../admin/month'
import { useAdminActivityQuery } from '../admin/panel-hooks'
import type { AdminActivityItem } from '../admin/panel-types'
import { formatSince } from '../admin/relative-time'
import { describeBlockError } from '../admin-overview/messages'
import { DIRECTORY_FETCH_SIZE, FILTER_BY_PARAM, filterDirectory, memberSince, PARAM_BY_FILTER, RESTAURANTS_PAGE_SIZE, RESTAURANTS_TEXT, type DirectoryFilter } from './messages'

const WIDE_QUERY = '(min-width: 1024px)'

function toPage(value: string | null): number {
  const page = Math.floor(Number(value))
  return Number.isFinite(page) && page >= 1 ? page : 1
}

/**
 * `/admin/restaurantes` (docs/admin-panel-contract.md §4): the directory of the restaurants in DiNNo with what they did in the
 * month. «Todos · Activos · Suspendidos» filters the whole list; picking a restaurant opens its detail (beside the list from
 * 1024 px, as a page below) with «Suspender restaurante» or «Reactivar restaurante» and «Ver cobro del mes». The filter, the
 * page and the open restaurant live in the URL.
 */
export default function RestaurantsPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const wide = useMediaQuery(WIDE_QUERY)
  const month = parseMonth(params.get('mes'), bogotaMonthOf())
  const filter = FILTER_BY_PARAM[params.get('estado') ?? ''] ?? 'all'
  const page = toPage(params.get('pagina'))
  const selectedId = params.get('restaurante')
  const query = useAdminActivityQuery(month, 1, DIRECTORY_FETCH_SIZE)
  const showSkeleton = useDelayedFlag(query.isPending)

  function update(changes: { estado?: DirectoryFilter; pagina?: number; restaurante?: string | null }) {
    const next = new URLSearchParams(params)
    if (changes.estado !== undefined) {
      next.set('estado', PARAM_BY_FILTER[changes.estado])
      next.delete('pagina')
    }
    if (changes.pagina !== undefined) {
      if (changes.pagina > 1) next.set('pagina', String(changes.pagina))
      else next.delete('pagina')
    }
    if (changes.restaurante !== undefined) {
      if (changes.restaurante === null) next.delete('restaurante')
      else next.set('restaurante', changes.restaurante)
    }
    setParams(next)
  }

  const seeBilling = (
    <Button variant="outline" icon={Wallet} onClick={() => navigate(`/admin/cobros/${encodeURIComponent(selectedId ?? '')}?mes=${month}`)}>
      {ADMIN_TEXT.seeBilling}
    </Button>
  )

  if (selectedId && !wide) {
    return <RequestDetail id={selectedId} variant="page" onClose={() => update({ restaurante: null })} extraActions={seeBilling} />
  }

  const filtered = filterDirectory(query.data?.items ?? [], filter)
  const visible = filtered.slice((page - 1) * RESTAURANTS_PAGE_SIZE, page * RESTAURANTS_PAGE_SIZE)

  const allColumns: DataTableColumn<AdminActivityItem>[] = [
    {
      key: 'restaurant',
      header: RESTAURANTS_TEXT.columnRestaurant,
      mobileLine: 1,
      cell: (item) => (
        <button
          type="button"
          aria-label={RESTAURANTS_TEXT.openRestaurant(item.name)}
          aria-current={item.id === selectedId ? 'true' : undefined}
          onClick={() => update({ restaurante: item.id })}
          className={cn('cursor-pointer rounded-tile text-left font-bold text-fg underline-offset-4 hover:underline', item.id === selectedId && 'text-accent-text underline')}
        >
          {item.name}
        </button>
      ),
    },
    { key: 'category', header: RESTAURANTS_TEXT.columnCategory, mobileLine: 2, cell: (item) => (item.category ? RESTAURANT_CATEGORY_LABELS[item.category] : RESTAURANTS_TEXT.noCategory) },
    {
      key: 'state',
      header: RESTAURANTS_TEXT.columnState,
      mobileLine: 1,
      cell: (item) => <StatusChip status={item.approvalStatus === 'suspended' ? REVIEW_STATUS.suspended : 'restaurant-active'} />,
    },
    { key: 'open', header: RESTAURANTS_TEXT.columnOpen, mobileLine: 2, cell: (item) => <StatusChip status={item.isOpen ? 'open' : 'closed'} /> },
    { key: 'checkIns', header: RESTAURANTS_TEXT.columnCheckIns, mobileLine: 2, className: 'tabular-nums', cell: (item) => `${item.checkIns} check-ins` },
    { key: 'amount', header: RESTAURANTS_TEXT.columnAmount, mobileLine: 2, className: 'tabular-nums whitespace-nowrap', cell: (item) => formatAdminCop(item.amountCop) },
    {
      key: 'plan',
      header: RESTAURANTS_TEXT.columnPlan,
      mobileLine: 2,
      className: 'whitespace-nowrap',
      cell: (item) => (item.lastTableActivityAt ? formatSince(item.lastTableActivityAt) : RESTAURANTS_TEXT.noPlanChanges),
    },
    { key: 'since', header: RESTAURANTS_TEXT.columnSince, mobileLine: 2, className: 'whitespace-nowrap', cell: (item) => formatDate(memberSince(item)) },
  ]

  // With the detail open beside it the list is narrow: it keeps who, in what state and how much; the rest is in the detail.
  const compact = selectedId !== null && wide
  const columns = compact ? allColumns.filter((column) => ['restaurant', 'state', 'amount'].includes(column.key)) : allColumns

  const emptyTitle = filter === 'suspended' ? RESTAURANTS_TEXT.emptySuspended : filter === 'active' ? RESTAURANTS_TEXT.emptyActive : RESTAURANTS_TEXT.emptyAll

  return (
    <>
      <PageHeader title={RESTAURANTS_TEXT.title} description={RESTAURANTS_TEXT.description} />
      <SegmentedControl
        aria-label={RESTAURANTS_TEXT.filterLabel}
        value={filter}
        onValueChange={(next) => update({ estado: next })}
        options={[
          { value: 'all', label: RESTAURANTS_TEXT.all },
          { value: 'active', label: RESTAURANTS_TEXT.active, status: 'restaurant-active' },
          { value: 'suspended', label: RESTAURANTS_TEXT.suspended, status: REVIEW_STATUS.suspended },
        ]}
      />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          {query.isError && !query.data ? (
            <EmptyState
              variant="error"
              title={describeBlockError(query.error)}
              action={
                <Button variant="secondary" onClick={() => void query.refetch()}>
                  {RESTAURANTS_TEXT.retry}
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col gap-4">
              <DataTable
                caption={RESTAURANTS_TEXT.tableCaption}
                columns={columns}
                rows={visible}
                getRowId={(item) => item.id}
                loading={query.isPending && showSkeleton}
                emptyState={<EmptyState title={emptyTitle} description={filter === 'all' ? RESTAURANTS_TEXT.emptyAllDescription : undefined} />}
              />
              <Pagination page={page} pageSize={RESTAURANTS_PAGE_SIZE} totalItems={filtered.length} onPageChange={(next) => update({ pagina: next })} itemsLabel={RESTAURANTS_TEXT.itemsLabel} />
            </div>
          )}
        </div>
        {selectedId && wide && (
          <div className="w-full lg:w-2/5 lg:shrink-0">
            <RequestDetail id={selectedId} variant="panel" onClose={() => update({ restaurante: null })} extraActions={seeBilling} />
          </div>
        )}
      </div>
    </>
  )
}
