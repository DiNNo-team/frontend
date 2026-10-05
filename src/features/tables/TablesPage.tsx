import { useCallback, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Alert, Button, ConfirmDialog, EmptyState, PageHeader, useToast } from '@/components/ui'
import { formatTableName } from '@/lib/format'
import { useDelayedFlag } from '@/lib/use-delayed-flag'
import { TableFormDialog } from './components/TableFormDialog'
import { TableStatusBar } from './components/TableStatusBar'
import { TablesGrid } from './components/TablesGrid'
import { TablesSkeleton } from './components/TablesSkeleton'
import { TablesStats } from './components/TablesStats'
import { useCreateTable, useTablesQuery, useUpdateTable } from './hooks'
import { usePageAlert } from './page-alert'
import { tableMenuItems, type TableMenuActions } from './table-menu'
import type { TableFormValues } from './table-form'
import { countTables, sortTables } from './table-status'
import type { Table, UpdateTableInput } from './types'
import { useTableActivation } from './use-table-activation'
import { useTableSelection } from './use-table-selection'
import { useTableStatusChange } from './use-table-status-change'

const TITLE = 'Mesas'
const DESCRIPTION = 'Actualiza el estado de cada mesa en tiempo real'

/** Only the fields that changed, so editing one does not resend the other. */
function changedFields(table: Table, values: TableFormValues): UpdateTableInput {
  const input: UpdateTableInput = {}
  if (values.identifier !== table.identifier) input.identifier = values.identifier
  if (values.capacity !== table.capacity) input.capacity = values.capacity
  return input
}

/** /mesas (manual 12.3 and 12.4): metrics + grid of tables, with loading, empty and error states. */
export default function TablesPage() {
  const tablesQuery = useTablesQuery()
  const showSkeleton = useDelayedFlag(tablesQuery.isPending)
  const tables = useMemo(() => sortTables(tablesQuery.data ?? []), [tablesQuery.data])
  const counts = useMemo(() => countTables(tables), [tables])
  const toast = useToast()
  const createTable = useCreateTable()
  const updateTable = useUpdateTable()
  const pageAlert = usePageAlert()
  const selection = useTableSelection(tables)

  // Create (no table) or edit (a table) share the same dialog.
  const [formOpen, setFormOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | undefined>()
  const [deactivating, setDeactivating] = useState<Table | null>(null)
  const [deactivateError, setDeactivateError] = useState<string>()

  const statusChange = useTableStatusChange({
    onTableInactive: selection.clear,
    reportError: pageAlert.report,
    clearErrorFor: pageAlert.clearFor,
  })

  const { clear: clearSelection, menuIdFor } = selection
  const handleDeactivated = useCallback(
    (table: Table) => {
      clearSelection()
      // The bar (and its ⋯) disappear: keep focus on the card's own ⋯.
      window.requestAnimationFrame(() => document.getElementById(menuIdFor(table.id))?.focus())
    },
    [clearSelection, menuIdFor],
  )
  const activation = useTableActivation({
    reportError: pageAlert.report,
    clearErrorFor: pageAlert.clearFor,
    onDeactivated: handleDeactivated,
  })

  function openCreate() {
    setEditingTable(undefined)
    setFormOpen(true)
  }

  const menuActions: TableMenuActions = {
    onEdit: (table) => {
      setEditingTable(table)
      setFormOpen(true)
    },
    onDeactivate: (table) => {
      setDeactivateError(undefined)
      setDeactivating(table)
    },
    onReactivate: (table) => void activation.reactivate(table),
  }

  async function confirmDeactivate() {
    if (!deactivating) return
    try {
      await activation.deactivate(deactivating)
      setDeactivating(null)
    } catch (caught) {
      setDeactivateError(caught instanceof Error ? caught.message : undefined)
    }
  }

  const addTableButton = (
    <Button icon={Plus} onClick={openCreate}>
      Agregar mesa
    </Button>
  )

  const dialogs = (
    <>
      <TableFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        table={editingTable}
        existingTables={tables}
        saving={createTable.isPending || updateTable.isPending}
        onSubmit={async (values) => {
          if (!editingTable) return createTable.mutateAsync(values)
          const input = changedFields(editingTable, values)
          if (Object.keys(input).length === 0) return editingTable
          return updateTable.mutateAsync({ id: editingTable.id, input })
        }}
        onSaved={(table) =>
          toast.show({
            type: 'success',
            message: editingTable ? 'Cambios guardados' : `${formatTableName(table.identifier)} agregada`,
          })
        }
      />
      <ConfirmDialog
        open={deactivating !== null}
        onOpenChange={(open) => {
          if (!open) setDeactivating(null)
        }}
        title={deactivating ? `¿Desactivar ${formatTableName(deactivating.identifier)}?` : ''}
        description="No aparecerá para los comensales. Puedes reactivarla cuando quieras."
        confirmLabel="Desactivar mesa"
        loadingText="Desactivando…"
        confirmVariant="danger"
        loading={activation.deactivating}
        error={deactivateError}
        onConfirm={() => void confirmDeactivate()}
      />
    </>
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
        {dialogs}
      </>
    )
  }

  const { alert } = pageAlert

  return (
    <>
      {alert && (
        <Alert
          type="error"
          action={
            alert.retry && (
              <Button size="sm" variant="outline" onClick={alert.retry}>
                Intentar de nuevo
              </Button>
            )
          }
        >
          {alert.message}
        </Alert>
      )}
      <PageHeader title={TITLE} description={DESCRIPTION} actions={addTableButton} />
      <TablesStats counts={counts} />
      <TablesGrid
        tables={tables}
        selectedId={selection.selectedId}
        onSelect={selection.toggle}
        toggleIdFor={selection.toggleIdFor}
        menuIdFor={selection.menuIdFor}
        reactivatingId={activation.reactivatingId}
        {...menuActions}
      />
      {selection.selectedTable && (
        <TableStatusBar
          table={selection.selectedTable}
          controlId={selection.controlId}
          onChangeStatus={(table, status) => void statusChange.changeStatus(table, status)}
          menuItems={tableMenuItems(selection.selectedTable, menuActions)}
        />
      )}
      {dialogs}
    </>
  )
}
