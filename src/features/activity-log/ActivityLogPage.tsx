import { useMemo, useRef, useState } from 'react'
import { Layers, Search } from 'lucide-react'
import { Alert, Button, DataTable, EmptyState, PageHeader, Pagination, Select, TextField, type DataTableColumn } from '@/components/ui'
import { useTableAreasQuery } from '@/features/tables/areas/hooks'
import { useTablesQuery } from '@/features/tables/hooks'
import { ALL_AREAS, inArea, matchesQuery, NO_AREA } from '@/features/tables/table-filters'
import { getApiErrorMessage, isAccessError } from '@/lib/api-client'
import { formatDateTime, formatTableName } from '@/lib/format'
import { useDelayedFlag } from '@/lib/use-delayed-flag'
import { TableLogChange } from './components/TableLogChange'
import { ALL_TABLES, TableLogFilter } from './components/TableLogFilter'
import { useTableLogsQuery } from './hooks'
import { logAuthor, TABLE_LOG_TEXT, tableWithoutChangesText } from './messages'
import { TABLE_LOGS_LIMIT, type TableLog } from './types'

const COLUMNS: DataTableColumn<TableLog>[] = [
  {
    key: 'changedAt',
    header: TABLE_LOG_TEXT.columnDate,
    cell: (log) => formatDateTime(log.changedAt),
    className: 'tabular-nums whitespace-nowrap',
    mobileLine: 2,
  },
  // Two-line rows on phones (manual 13.4): "Mesa 04 · Disponible → Ocupada", then date · user.
  { key: 'table', header: TABLE_LOG_TEXT.columnTable, cell: (log) => formatTableName(log.tableIdentifier), className: 'font-bold md:font-medium', mobileLine: 1 },
  {
    key: 'change',
    header: TABLE_LOG_TEXT.columnChange,
    cell: (log) => <TableLogChange previousStatus={log.previousStatus} newStatus={log.newStatus} />,
    mobileLine: 1,
  },
  { key: 'user', header: TABLE_LOG_TEXT.columnUser, cell: (log) => logAuthor(log), className: 'break-all', mobileLine: 2 },
]

/** At most 15 changes per page: the log never becomes an endless list. */
export const LOGS_PER_PAGE = 15

/** The backend already answers newest first; sorting again keeps the order whatever the source. */
function newestFirst(logs: TableLog[]): TableLog[] {
  return [...logs].sort((a, b) => Date.parse(b.changedAt) - Date.parse(a.changedAt))
}

/**
 * /bitacora (manual 12.4): status changes of the tables, newest first, 15 per page. Filters: "Buscar mesa" and "Zona"
 * (both on the loaded changes; the zone is the table's current one) and "Mesa" (asks the backend for that table).
 */
export default function ActivityLogPage() {
  const [filter, setFilterState] = useState(ALL_TABLES)
  const [query, setQueryState] = useState('')
  const [area, setAreaState] = useState(ALL_AREAS)
  const [page, setPage] = useState(1)
  const top = useRef<HTMLDivElement>(null)
  const tableId = filter === ALL_TABLES ? undefined : filter
  const logsQuery = useTableLogsQuery(tableId)
  const tablesQuery = useTablesQuery()
  const areas = useTableAreasQuery().data ?? []
  const showSkeleton = useDelayedFlag(logsQuery.isPending)
  const logs = useMemo(() => newestFirst(logsQuery.data ?? []), [logsQuery.data])

  // Any filter change starts again on page 1.
  const setFilter = (value: string) => {
    setFilterState(value)
    setPage(1)
  }
  const setQuery = (value: string) => {
    setQueryState(value)
    setPage(1)
  }
  const setArea = (value: string) => {
    setAreaState(value)
    setPage(1)
  }
  const knownArea = area === ALL_AREAS || area === NO_AREA || areas.some((item) => item.id === area)
  const areaFilter = knownArea ? area : ALL_AREAS
  const areaOf = useMemo(() => new Map((tablesQuery.data ?? []).map((table) => [table.id, table.areaId])), [tablesQuery.data])
  const visibleLogs = useMemo(
    () =>
      logs.filter(
        (log) => matchesQuery({ identifier: log.tableIdentifier }, query) && inArea({ areaId: areaOf.get(log.tableId) ?? null }, areaFilter),
      ),
    [logs, query, areaFilter, areaOf],
  )
  const filtering = query.trim() !== '' || areaFilter !== ALL_AREAS
  const pageCount = Math.max(1, Math.ceil(visibleLogs.length / LOGS_PER_PAGE))
  const currentPage = Math.min(page, pageCount)
  const pageLogs = visibleLogs.slice((currentPage - 1) * LOGS_PER_PAGE, currentPage * LOGS_PER_PAGE)

  function changePage(next: number) {
    setPage(next)
    top.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }

  function clearFilters() {
    setQuery('')
    setArea(ALL_AREAS)
    setFilter(ALL_TABLES)
  }

  const selectedTable = tablesQuery.data?.find((table) => table.id === tableId)
  const emptyDescription = selectedTable
    ? tableWithoutChangesText(formatTableName(selectedTable.identifier))
    : TABLE_LOG_TEXT.emptyDescription

  function content() {
    if (logsQuery.isError && !logsQuery.data) {
      const accessError = isAccessError(logsQuery.error)
      return (
        <EmptyState
          variant="error"
          title={TABLE_LOG_TEXT.loadErrorTitle}
          description={accessError ? getApiErrorMessage(logsQuery.error) : TABLE_LOG_TEXT.loadErrorDescription}
          action={
            accessError ? undefined : (
              <Button loading={logsQuery.isFetching} onClick={() => void logsQuery.refetch()}>
                {TABLE_LOG_TEXT.retry}
              </Button>
            )
          }
        />
      )
    }

    if (logsQuery.isPending && !showSkeleton) {
      return (
        <div aria-busy="true">
          <p role="status" className="sr-only">
            {TABLE_LOG_TEXT.loading}
          </p>
        </div>
      )
    }

    return (
      <>
        {logs.length >= TABLE_LOGS_LIMIT && <Alert type="info">{TABLE_LOG_TEXT.limitNotice}</Alert>}
        <DataTable
          caption={TABLE_LOG_TEXT.caption}
          columns={COLUMNS}
          rows={pageLogs}
          getRowId={(log) => log.id}
          loading={showSkeleton}
          emptyState={
            filtering && logs.length > 0 ? (
              <EmptyState
                title={TABLE_LOG_TEXT.noMatchesTitle}
                description={TABLE_LOG_TEXT.noMatchesDescription}
                action={
                  <Button variant="outline" onClick={clearFilters}>
                    {TABLE_LOG_TEXT.clearFilters}
                  </Button>
                }
              />
            ) : (
              <EmptyState title={TABLE_LOG_TEXT.emptyTitle} description={emptyDescription} />
            )
          }
        />
        <Pagination
          page={currentPage}
          pageSize={LOGS_PER_PAGE}
          totalItems={visibleLogs.length}
          onPageChange={changePage}
          itemsLabel={TABLE_LOG_TEXT.itemsLabel}
        />
      </>
    )
  }

  return (
    <>
      <PageHeader title={TABLE_LOG_TEXT.title} description={TABLE_LOG_TEXT.description} />
      <div ref={top} className="flex scroll-mt-24 flex-col gap-4">
        <div role="group" aria-label="Filtrar la bitácora" className="flex flex-col gap-3 md:flex-row md:items-end">
          <TextField
            label={TABLE_LOG_TEXT.searchLabel}
            type="search"
            icon={Search}
            placeholder={TABLE_LOG_TEXT.searchPlaceholder}
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="md:min-w-48 md:flex-1"
          />
          {areas.length > 0 && (
            <Select
              label={TABLE_LOG_TEXT.areaLabel}
              icon={Layers}
              options={[
                { value: ALL_AREAS, label: TABLE_LOG_TEXT.allAreas },
                ...areas.map((item) => ({ value: item.id, label: item.name })),
                { value: NO_AREA, label: TABLE_LOG_TEXT.noArea },
              ]}
              value={areaFilter}
              onValueChange={setArea}
              className="md:min-w-48 md:flex-1"
            />
          )}
          <TableLogFilter value={filter} onValueChange={setFilter} tables={tablesQuery.data} />
        </div>
        {content()}
      </div>
    </>
  )
}
