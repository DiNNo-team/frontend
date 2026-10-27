import { useCallback, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Alert, Button, ConfirmDialog, EmptyState, PageHeader, SegmentedControl, useToast } from '@/components/ui'
import { formatTableName } from '@/lib/format'
import { useDelayedFlag } from '@/lib/use-delayed-flag'
import { useMediaQuery } from '@/lib/use-media-query'
import { TableFormDialog } from './components/TableFormDialog'
import { TablesGrid } from './components/TablesGrid'
import { TablesSkeleton } from './components/TablesSkeleton'
import { TablesStats } from './components/TablesStats'
import { useCreateTable, useTablesQuery, useUpdateTable } from './hooks'
import { usePageAlert } from './page-alert'
import { placementOf } from './plan/plan-geometry'
import { TablesPlanView } from './plan/TablesPlanView'
import { usePlanEditor } from './plan/use-plan-editor'
import type { TableMenuActions } from './table-menu'
import type { TableFormValues } from './table-form'
import { activeFirst, countTables, getTableDisplayStatus, sortTables, type TableDisplayStatus } from './table-status'
import type { Table, UpdateTableInput } from './types'
import { useRemoteHighlights } from './use-remote-highlights'
import { useTableActivation } from './use-table-activation'
import { useTableSelection } from './use-table-selection'
import { useTableStatusChange } from './use-table-status-change'

/** "Buenas noches": the greeting that opens /mesas (manual v2.1), by the hour of the device. */
function greetingFor(date: Date): string {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return 'Buenos días'
  if (hour >= 12 && hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

/** "Lunes 27 de octubre". */
function todayLabel(date: Date): string {
  const label = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
}
const FILTER_WORDS: Record<TableDisplayStatus, string> = {
  available: 'disponibles',
  reserved: 'reservadas',
  occupied: 'ocupadas',
  inactive: 'inactivas',
}

type TablesView = 'plan' | 'grid'
const VIEW_STORAGE_KEY = 'dinno:mesas:vista'

// The chosen view is a per-device convenience (manual 13.10), the only thing of /mesas kept in the browser. Storage can
// be missing or blocked (private window): then the default applies.
function readStoredView(): TablesView | null {
  try {
    const value = window.localStorage.getItem(VIEW_STORAGE_KEY)
    return value === 'plan' || value === 'grid' ? value : null
  } catch {
    return null
  }
}

function storeView(view: TablesView) {
  try {
    window.localStorage.setItem(VIEW_STORAGE_KEY, view)
  } catch {
    // Not remembered on this device; the view still changes.
  }
}

/** Only the fields that changed, so editing one does not resend the other. */
function changedFields(table: Table, values: TableFormValues): UpdateTableInput {
  const input: UpdateTableInput = {}
  if (values.identifier !== table.identifier) input.identifier = values.identifier
  if (values.capacity !== table.capacity) input.capacity = values.capacity
  return input
}

/**
 * /mesas (manual 13.10): Plano · Cuadrícula + summary strip. The grid filters with the strip; the plan shows the room
 * (service mode, and edit mode from 768 px). In both, tapping a table opens its status picker (D · R · O on a focused
 * table). Loading, empty and error states.
 */
export default function TablesPage() {
  const tablesQuery = useTablesQuery()
  const showSkeleton = useDelayedFlag(tablesQuery.isPending)
  const tables = useMemo(() => activeFirst(sortTables(tablesQuery.data ?? [])), [tablesQuery.data])
  const counts = useMemo(() => countTables(tables), [tables])
  // Read once when the screen opens: the greeting and the date do not need to tick while it is open.
  const [now] = useState(() => new Date())
  // Just the greeting: the restaurant's name is already in the top bar.
  const title = greetingFor(now)
  const active = counts.available + counts.reserved + counts.occupied
  const liveLine =
    active > 0
      ? ` · ${counts.available} ${counts.available === 1 ? 'mesa disponible' : 'mesas disponibles'} de ${active}`
      : ''
  const greeting = { variant: 'hero', title, description: `${todayLabel(now)}${liveLine}` } as const
  const [filter, setFilter] = useState<TableDisplayStatus | null>(null)
  const visibleTables = useMemo(
    () => (filter ? tables.filter((table) => getTableDisplayStatus(table) === filter) : tables),
    [tables, filter],
  )
  const toast = useToast()
  const createTable = useCreateTable()
  const updateTable = useUpdateTable()
  const pageAlert = usePageAlert()
  const selection = useTableSelection(tables)
  const editor = usePlanEditor(tables)
  const highlights = useRemoteHighlights()
  const canEditPlan = !useMediaQuery('(max-width: 767px)')
  const [storedView, setStoredView] = useState(readStoredView)
  const hasPlan = tables.some((table) => placementOf(table) !== null)
  // With no choice on this device: the plan if the restaurant already has one; phones open in the grid (manual 13.10).
  const view: TablesView = storedView ?? (hasPlan && canEditPlan ? 'plan' : 'grid')
  const [announcement, setAnnouncement] = useState('')

  function changeView(next: TablesView) {
    selection.clear()
    storeView(next)
    setStoredView(next)
  }

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
    onReactivate: (table) => {
      selection.clear()
      void activation.reactivate(table)
    },
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
        <PageHeader {...greeting} />
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
        <PageHeader {...greeting} />
        <EmptyState
          variant="error"
          title="No pudimos cargar tus mesas"
          description="Revisa tu conexión e intenta de nuevo."
          action={
            <Button variant="secondary" loading={tablesQuery.isFetching} onClick={() => tablesQuery.refetch()}>
              Intentar de nuevo
            </Button>
          }
        />
      </>
    )
  }

  if (tables.length === 0) {
    // On an empty screen "Agregar mesa" is the one primary; the summary hides.
    return (
      <>
        <PageHeader {...greeting} />
        <EmptyState
          title="Aún no tienes mesas"
          description="Agrega tus mesas para empezar a recibir comensales."
          action={
            <Button icon={Plus} onClick={openCreate}>
              Agregar mesa
            </Button>
          }
        />
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
      <PageHeader
        {...greeting}
        actions={
          <>
            <SegmentedControl
              aria-label="Vista de mesas"
              value={view}
              onValueChange={changeView}
              // While editing the plan the way out is "Guardar plano" or "Cancelar".
              disabled={editor.editing}
              options={[
                { value: 'plan', label: 'Plano' },
                { value: 'grid', label: 'Cuadrícula' },
              ]}
            />
            <Button icon={Plus} onClick={openCreate} className="rounded-full">
              Agregar mesa
            </Button>
          </>
        }
      />
      <TablesStats counts={counts} filter={view === 'grid' ? filter : null} onFilterChange={view === 'grid' ? setFilter : undefined} />
      {view === 'grid' && !hasPlan && canEditPlan && (
        <Alert
          type="info"
          title="Arma el plano de tu restaurante."
          action={
            <Button size="sm" variant="outline" onClick={() => changeView('plan')}>
              Ubicar mesas
            </Button>
          }
        >
          Ubica tus mesas como están en el salón y ve de un vistazo cuáles están libres.
        </Alert>
      )}
      <p role="status" className="sr-only">
        {announcement}
      </p>
      {view === 'plan' ? (
        <TablesPlanView
          tables={tables}
          editor={editor}
          canEdit={canEditPlan}
          openId={selection.openId}
          onToggle={selection.toggle}
          onOpenChange={selection.setOpen}
          onChangeStatus={(table, status) => {
            selection.clear()
            void statusChange.changeStatus(table, status)
          }}
          toggleIdFor={selection.toggleIdFor}
          reactivatingId={activation.reactivatingId}
          highlights={highlights}
          announce={setAnnouncement}
          {...menuActions}
        />
      ) : visibleTables.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-tile border border-dashed border-line-strong p-6">
          <p className="text-sec text-fg">No hay mesas {filter ? FILTER_WORDS[filter] : ''} ahora.</p>
          <Button variant="ghost" size="sm" className="px-0" onClick={() => setFilter(null)}>
            Ver todas las mesas
          </Button>
        </div>
      ) : (
        <TablesGrid
          tables={visibleTables}
          openId={selection.openId}
          onToggle={selection.toggle}
          onOpenChange={selection.setOpen}
          onChangeStatus={(table, status) => {
            selection.clear()
            void statusChange.changeStatus(table, status)
          }}
          toggleIdFor={selection.toggleIdFor}
          menuIdFor={selection.menuIdFor}
          reactivatingId={activation.reactivatingId}
          highlights={highlights}
          {...menuActions}
        />
      )}
      {dialogs}
    </>
  )
}
