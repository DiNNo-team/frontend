import { useMemo, useState } from 'react'
import { Alert, Button, DataTable, EmptyState, PageHeader, type DataTableColumn } from '@/components/ui'
import { useTablesQuery } from '@/features/tables/hooks'
import { getApiErrorMessage, isAccessError } from '@/lib/api-client'
import { formatDateTime, formatTableName } from '@/lib/format'
import { useDelayedFlag } from '@/lib/use-delayed-flag'
import { TableLogChange } from './components/TableLogChange'
import { ALL_TABLES, TableLogFilter } from './components/TableLogFilter'
import { useTableLogsQuery } from './hooks'
import { TABLE_LOG_TEXT, tableWithoutChangesText } from './messages'
import { TABLE_LOGS_LIMIT, type TableLog } from './types'

const COLUMNS: DataTableColumn<TableLog>[] = [
  {
    key: 'changedAt',
    header: TABLE_LOG_TEXT.columnDate,
    cell: (log) => formatDateTime(log.changedAt),
    className: 'tabular-nums whitespace-nowrap',
  },
  { key: 'table', header: TABLE_LOG_TEXT.columnTable, cell: (log) => formatTableName(log.tableIdentifier) },
  {
    key: 'change',
    header: TABLE_LOG_TEXT.columnChange,
    cell: (log) => <TableLogChange previousStatus={log.previousStatus} newStatus={log.newStatus} />,
  },
  { key: 'user', header: TABLE_LOG_TEXT.columnUser, cell: (log) => log.userEmail, className: 'break-all' },
]

/** The backend already answers newest first; sorting again keeps the order whatever the source. */
function newestFirst(logs: TableLog[]): TableLog[] {
  return [...logs].sort((a, b) => Date.parse(b.changedAt) - Date.parse(a.changedAt))
}

/** /bitacora (manual 12.4): status changes of the tables, newest first, with a filter by table. */
export default function ActivityLogPage() {
  const [filter, setFilter] = useState(ALL_TABLES)
  const tableId = filter === ALL_TABLES ? undefined : filter
  const logsQuery = useTableLogsQuery(tableId)
  const tablesQuery = useTablesQuery()
  const showSkeleton = useDelayedFlag(logsQuery.isPending)
  const logs = useMemo(() => newestFirst(logsQuery.data ?? []), [logsQuery.data])

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
          rows={logs}
          getRowId={(log) => log.id}
          loading={showSkeleton}
          emptyState={<EmptyState title={TABLE_LOG_TEXT.emptyTitle} description={emptyDescription} />}
        />
      </>
    )
  }

  return (
    <>
      <PageHeader title={TABLE_LOG_TEXT.title} description={TABLE_LOG_TEXT.description} />
      <div className="flex flex-col gap-4">
        <TableLogFilter value={filter} onValueChange={setFilter} tables={tablesQuery.data} />
        {content()}
      </div>
    </>
  )
}
