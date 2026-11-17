import { useSearchParams } from 'react-router'
import { Button, EmptyState, PageHeader, SegmentedControl, REVIEW_STATUS } from '@/components/ui'
import { useMediaQuery } from '@/lib/use-media-query'
import { useDelayedFlag } from '@/lib/use-delayed-flag'
import { RequestDetail } from './components/RequestDetail'
import { RequestsTable } from './components/RequestsTable'
import { useAdminRestaurantsQuery, usePendingRestaurantsCount } from './hooks'
import { ADMIN_PAGE_SIZE, ADMIN_TEXT } from './messages'
import type { ReviewStatus } from './types'

// The state of the screen lives in the URL, so «back», a reload and a shared link keep the tab, the page and the open request.
const STATUS_BY_PARAM: Record<string, ReviewStatus> = { pendientes: 'pending', aprobadas: 'approved', rechazadas: 'rejected', suspendidas: 'suspended' }
const PARAM_BY_STATUS: Record<ReviewStatus, string> = { pending: 'pendientes', approved: 'aprobadas', rejected: 'rechazadas', suspended: 'suspendidas' }

/** From 1024 px the detail opens beside the list; below, it takes the page. */
const WIDE_QUERY = '(min-width: 1024px)'

function toPage(value: string | null): number {
  const page = Math.floor(Number(value))
  return Number.isFinite(page) && page >= 1 ? page : 1
}

/**
 * `/admin/solicitudes` (CLAUDE.md §12.12 and §12.15): the requests of restaurants that want to be in DiNNo. Pendientes · Aprobadas · Rechazadas · Suspendidas
 * are views of one list; picking a request opens its detail (beside the list on a desktop, as a page on a phone) with
 * «Aprobar restaurante» and «Rechazar solicitud». Only a `platform_admin` gets here.
 */
export default function AdminPage() {
  const [params, setParams] = useSearchParams()
  const wide = useMediaQuery(WIDE_QUERY)
  const status = STATUS_BY_PARAM[params.get('estado') ?? ''] ?? 'pending'
  const page = toPage(params.get('pagina'))
  const selectedId = params.get('solicitud')
  const list = useAdminRestaurantsQuery({ status, page, pageSize: ADMIN_PAGE_SIZE })
  const pendingCount = usePendingRestaurantsCount()
  const showSkeleton = useDelayedFlag(list.isPending)

  function update(changes: { estado?: ReviewStatus; pagina?: number; solicitud?: string | null }) {
    const next = new URLSearchParams(params)
    if (changes.estado !== undefined) {
      next.set('estado', PARAM_BY_STATUS[changes.estado])
      next.delete('pagina')
      next.delete('solicitud')
    }
    if (changes.pagina !== undefined) {
      if (changes.pagina > 1) next.set('pagina', String(changes.pagina))
      else next.delete('pagina')
    }
    if (changes.solicitud !== undefined) {
      if (changes.solicitud === null) next.delete('solicitud')
      else next.set('solicitud', changes.solicitud)
    }
    setParams(next)
  }

  // A phone shows the detail alone, like a page of its own.
  if (selectedId && !wide) {
    return <RequestDetail id={selectedId} variant="page" onClose={() => update({ solicitud: null })} />
  }

  const pendingLabel = pendingCount.data ? `${ADMIN_TEXT.tabPending} (${pendingCount.data})` : ADMIN_TEXT.tabPending
  const table = list.data ? (
    <RequestsTable
      status={status}
      rows={list.data.items}
      total={list.data.total}
      page={page}
      loading={false}
      selectedId={selectedId}
      onSelect={(id) => update({ solicitud: id })}
      onPageChange={(next) => update({ pagina: next })}
    />
  ) : list.isError ? (
    <EmptyState
      variant="error"
      title={ADMIN_TEXT.listLoadError}
      action={
        <Button variant="secondary" onClick={() => void list.refetch()}>
          {ADMIN_TEXT.retry}
        </Button>
      }
    />
  ) : (
    <RequestsTable
      status={status}
      rows={[]}
      total={0}
      page={1}
      loading={showSkeleton}
      selectedId={null}
      onSelect={() => undefined}
      onPageChange={() => undefined}
    />
  )

  return (
    <>
      <PageHeader title={ADMIN_TEXT.title} description={ADMIN_TEXT.description} />
      <div className="max-w-full overflow-x-auto">
      <SegmentedControl
        aria-label={ADMIN_TEXT.tabsLabel}
        value={status}
        onValueChange={(next) => update({ estado: next })}
        options={[
          { value: 'pending', label: pendingLabel, status: REVIEW_STATUS.pending },
          { value: 'approved', label: ADMIN_TEXT.tabApproved, status: REVIEW_STATUS.approved },
          { value: 'rejected', label: ADMIN_TEXT.tabRejected, status: REVIEW_STATUS.rejected },
          { value: 'suspended', label: ADMIN_TEXT.tabSuspended, status: REVIEW_STATUS.suspended },
        ]}
      />
      </div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">{table}</div>
        {selectedId && wide && (
          <div className="w-full lg:w-2/5 lg:shrink-0">
            <RequestDetail id={selectedId} variant="panel" onClose={() => update({ solicitud: null })} />
          </div>
        )}
      </div>
    </>
  )
}
