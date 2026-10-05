import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Alert, Button, EmptyState, PageHeader, useToast } from '@/components/ui'
import { formatTableName } from '@/lib/format'
import { useDelayedFlag } from '@/lib/use-delayed-flag'
import { TableFormDialog } from './components/TableFormDialog'
import { TableStatusBar } from './components/TableStatusBar'
import { TablesGrid } from './components/TablesGrid'
import { TablesSkeleton } from './components/TablesSkeleton'
import { TablesStats } from './components/TablesStats'
import { useCreateTable, useTablesQuery } from './hooks'
import { countTables, sortTables } from './table-status'
import { useTableSelection } from './use-table-selection'
import { useTableStatusChange } from './use-table-status-change'

const TITLE = 'Mesas'
const DESCRIPTION = 'Actualiza el estado de cada mesa en tiempo real'

/** /mesas (manual 12.3 and 12.4): metrics + grid of tables, with loading, empty and error states. */
export default function TablesPage() {
  const tablesQuery = useTablesQuery()
  const showSkeleton = useDelayedFlag(tablesQuery.isPending)
  const tables = useMemo(() => sortTables(tablesQuery.data ?? []), [tablesQuery.data])
  const counts = useMemo(() => countTables(tables), [tables])
  const toast = useToast()
  const createTable = useCreateTable()
  const [createOpen, setCreateOpen] = useState(false)
  const selection = useTableSelection(tables)
  const statusChange = useTableStatusChange({ onTableInactive: selection.clear })

  const addTableButton = (
    <Button icon={Plus} onClick={() => setCreateOpen(true)}>
      Agregar mesa
    </Button>
  )
  const createDialog = (
    <TableFormDialog
      open={createOpen}
      onOpenChange={setCreateOpen}
      existingTables={tables}
      saving={createTable.isPending}
      onSubmit={(values) => createTable.mutateAsync(values)}
      onSaved={(table) => toast.show({ type: 'success', message: `${formatTableName(table.identifier)} agregada` })}
    />
  )

  if (tablesQuery.isPending) {
    return (
      <>
        <PageHeader title={TITLE} description={DESCRIPTION} />
        <div aria-busy="true">
          <p role="status" className="sr-only">
            Cargando mesas
          </p>
          {showSkeleton && <TablesSkeleton />}
        </div>
      </>
    )
  }

  if (tablesQuery.isError) {
    return (
      <>
        <PageHeader title={TITLE} description={DESCRIPTION} />
        <EmptyState
          variant="error"
          title="No pudimos cargar tus mesas"
          description="Revisa tu conexión e intenta de nuevo."
          action={
            <Button loading={tablesQuery.isFetching} onClick={() => tablesQuery.refetch()}>
              Intentar de nuevo
            </Button>
          }
        />
      </>
    )
  }

  if (tables.length === 0) {
    // Only one primary per screen: the empty state's button replaces the header one, and the metrics hide.
    return (
      <>
        <PageHeader title={TITLE} description={DESCRIPTION} />
        <EmptyState title="Aún no tienes mesas" description="Agrega tus mesas para empezar a recibir comensales." action={addTableButton} />
        {createDialog}
      </>
    )
  }

  const { error: statusError } = statusChange

  return (
    <>
      {statusError && (
        <Alert
          type="error"
          action={
            statusError.retry && (
              <Button size="sm" variant="outline" onClick={statusError.retry}>
                Intentar de nuevo
              </Button>
            )
          }
        >
          {statusError.message}
        </Alert>
      )}
      <PageHeader title={TITLE} description={DESCRIPTION} actions={addTableButton} />
      <TablesStats counts={counts} />
      <TablesGrid
        tables={tables}
        selectedId={selection.selectedId}
        onSelect={selection.toggle}
        toggleIdFor={selection.toggleIdFor}
      />
      {selection.selectedTable && (
        <TableStatusBar
          table={selection.selectedTable}
          controlId={selection.controlId}
          onChangeStatus={(table, status) => void statusChange.changeStatus(table, status)}
        />
      )}
      {createDialog}
    </>
  )
}
