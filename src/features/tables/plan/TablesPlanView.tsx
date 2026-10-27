import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useBlocker } from 'react-router'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Frame, Move, Plus, Scan, Undo2, WandSparkles, ZoomIn, ZoomOut } from 'lucide-react'
import { Alert, Button, ConfirmDialog, FloatingBar, IconButton, SegmentedControl, useToast } from '@/components/ui'
import { getApiErrorMessage } from '@/lib/api-client'
import { formatCapacity, formatTableName } from '@/lib/format'
import { Icon } from '@/lib/icon'
import { tablesApi } from '../api'
import { useSaveTablePlan } from '../hooks'
import type { TableMenuActions } from '../table-menu'
import type { Table, TableShape, TableStatus } from '../types'
import { FloorPlan } from './FloorPlan'
import { SHAPE_LABELS } from './plan-labels'
import { PLAN_COLUMNS, planRows } from './plan-geometry'
import type { PlanEditor } from './use-plan-editor'

/**
 * Cell sizes of the zoom (px). 36 is the smallest where a 3-cell table still shows "Disponible" whole and its capacity
 * line (measured: at 32 the word truncates on a phone).
 */
const CELL_STEPS = [36, 44, 52, 60, 72] as const
const FIT_MIN = 36
const FIT_MAX = 56
/** Empty rows under the lowest table: one in service, room to drag down while editing. */
const ROOM_SERVICE = 1
const ROOM_EDITING = 6

const CONFLICT_MESSAGE = 'Hay mesas encima de otra o fuera del plano (borde rojo). Muévelas para guardar.'
const SAVE_ERROR = 'No pudimos guardar el plano. Revisa tu conexión e intenta de nuevo.'
const NO_ROOM = 'No hay espacio libre en el plano. Mueve o quita una mesa primero.'

type ShapeChoice = 'rect' | 'square' | 'round'
const SHAPE_OPTIONS: { value: ShapeChoice; label: string }[] = (['rect', 'square', 'round'] as const).map((value) => ({
  value,
  label: SHAPE_LABELS[value],
}))

export interface TablesPlanViewProps extends TableMenuActions {
  /** Every table, in the order of the grid (natural, inactive last). */
  tables: Table[]
  editor: PlanEditor
  /** Phones see the plan but never edit it (manual 13.10). */
  canEdit: boolean
  openId: string | null
  onToggle: (table: Table) => void
  onOpenChange: (table: Table, open: boolean) => void
  onChangeStatus: (table: Table, status: TableStatus) => void
  toggleIdFor: (tableId: string) => string
  reactivatingId: string | null
  highlights: Record<string, number>
  announce: (message: string) => void
}

/**
 * Plano (manual 13.10). Service mode by default: positions locked, tap a table for its status and details, zoom and
 * scroll inside the frame. "Editar plano" (tablet and computer) opens the edit mode: drag, arrows or the move buttons,
 * "Sin ubicar", shape, and "Guardar plano" · "Cancelar". The plan lives in the backend, the same for every device.
 */
export function TablesPlanView({
  tables,
  editor,
  canEdit,
  openId,
  onToggle,
  onOpenChange,
  onChangeStatus,
  toggleIdFor,
  reactivatingId,
  highlights,
  announce,
  ...actions
}: TablesPlanViewProps) {
  const toast = useToast()
  const savePlan = useSaveTablePlan()
  const frame = useRef<HTMLDivElement>(null)
  const [fitCell, setFitCell] = useState(44)
  const [zoom, setZoom] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string>()
  const [discardOpen, setDiscardOpen] = useState(false)
  const { editing, dirty } = editor
  const guard = editing && dirty && !savePlan.isPending
  const blocker = useBlocker(guard)

  useLayoutEffect(() => {
    const element = frame.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      const fitted = Math.floor(entry.contentRect.width / PLAN_COLUMNS)
      setFitCell(Math.min(FIT_MAX, Math.max(FIT_MIN, fitted)))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!guard) return
    function preventUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', preventUnload)
    return () => window.removeEventListener('beforeunload', preventUnload)
  }, [guard])

  const cell = zoom ?? fitCell
  const rows = planRows(editor.placed, editing ? ROOM_EDITING : ROOM_SERVICE)
  const placedCount = tables.length - editor.unplaced.length
  const selected = editing ? tables.find((table) => table.id === selectedId && editor.placementFor(table)) : undefined
  const selectedPlacement = selected ? editor.placementFor(selected) : null

  function zoomBy(direction: 1 | -1) {
    const next = direction === 1 ? CELL_STEPS.find((step) => step > cell) : [...CELL_STEPS].reverse().find((step) => step < cell)
    if (next) setZoom(next)
  }

  function startEditing(autoPlace = false) {
    setSaveError(undefined)
    setSelectedId(null)
    editor.start()
    if (autoPlace) editor.autoPlace(tables)
  }

  function finish() {
    editor.stop()
    setSelectedId(null)
    setSaveError(undefined)
    setDiscardOpen(false)
  }

  function requestCancel() {
    if (dirty) setDiscardOpen(true)
    else finish()
  }

  function confirmDiscard() {
    finish()
    if (blocker.state === 'blocked') blocker.proceed()
  }

  function keepEditing() {
    setDiscardOpen(false)
    if (blocker.state === 'blocked') blocker.reset()
  }

  async function save() {
    if (editor.conflicts.size > 0) {
      setSaveError(CONFLICT_MESSAGE)
      return
    }
    if (!dirty) {
      finish()
      return
    }
    setSaveError(undefined)
    // Only to tell whether another device saved meanwhile (the last save wins either way). If this read fails the save
    // still goes on, without that notice; it does not touch the cached list, so /mesas never falls into its error state.
    const latest = await tablesApi.list().catch(() => null)
    try {
      await savePlan.mutateAsync(editor.items())
      toast.show({
        type: 'success',
        message: latest && editor.savedElsewhere(latest) ? 'Guardamos tu plano. Reemplazó el que guardaron desde otro dispositivo.' : 'Plano guardado',
      })
      finish()
    } catch (error) {
      setSaveError(getApiErrorMessage(error, SAVE_ERROR))
    }
  }

  function placeFromTray(table: Table) {
    if (editor.place(table.id)) {
      setSelectedId(table.id)
      announce(`${formatTableName(table.identifier)} quedó en el plano`)
    } else {
      toast.show({ type: 'error', message: NO_ROOM })
    }
  }

  function autoPlace() {
    const left = editor.autoPlace(tables)
    if (left > 0) toast.show({ type: 'error', message: `${left === 1 ? 'Una mesa no cupo' : `${left} mesas no cupieron`}. ${NO_ROOM}` })
    else announce('Mesas ubicadas')
  }

  function nudge(table: Table, dx: number, dy: number) {
    const placement = editor.placementFor(table)
    if (!placement) return
    const x = placement.x + dx
    const y = placement.y + dy
    if (editor.move(table.id, x, y)) announce(`${formatTableName(table.identifier)}, fila ${y + 1}, columna ${x + 1}`)
    else announce(`${formatTableName(table.identifier)} no cabe ahí`)
  }

  function chooseShape(table: Table, shape: ShapeChoice) {
    // "Rectangular" is the default size by capacity: stored as no shape, so choosing it again is not a change.
    const next: TableShape | null = shape === 'rect' ? null : shape
    editor.setShape(table.id, next)
  }

  const modeHint = editing ? 'Arrastra las mesas o muévelas con las flechas (Shift: 4 celdas).' : 'Modo servicio: las mesas no se mueven.'

  return (
    <section aria-label="Plano" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sec text-fg-2">
          <Icon icon={editing ? Move : Frame} size={16} />
          {modeHint}
        </p>
        <div className="flex items-center gap-1">
          <IconButton icon={ZoomOut} label="Alejar" size="sm" onClick={() => zoomBy(-1)} disabled={cell <= CELL_STEPS[0]} />
          <Button variant="ghost" size="sm" icon={Scan} onClick={() => setZoom(null)} disabled={zoom === null}>
            Ajustar
          </Button>
          <IconButton icon={ZoomIn} label="Acercar" size="sm" onClick={() => zoomBy(1)} disabled={cell >= CELL_STEPS[CELL_STEPS.length - 1]} />
          {canEdit && !editing && (
            <Button variant="outline" size="sm" icon={Move} onClick={() => startEditing()} className="ml-2">
              Editar plano
            </Button>
          )}
        </div>
      </div>

      {!canEdit && <p className="text-sec text-fg-2">Edita el plano desde una tablet o un computador.</p>}
      {!editing && placedCount > 0 && editor.unplaced.length > 0 && (
        <p className="text-sec text-fg-2">
          {editor.unplaced.length === 1 ? '1 mesa no está' : `${editor.unplaced.length} mesas no están`} en el plano:{' '}
          {editor.unplaced.map((table) => formatTableName(table.identifier)).join(', ')}. Las ves en la cuadrícula.
        </p>
      )}

      <div ref={frame} className="overflow-auto rounded-card border border-line">
        {placedCount === 0 && !editing ? (
          <div className="plan-canvas flex min-h-80 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-h3 text-fg">Aún no hay mesas en el plano</p>
            <p className="max-w-sm text-sec text-fg">Ubícalas como están en tu salón para ver de un vistazo cuáles están libres.</p>
            {canEdit && (
              <Button variant="outline" icon={WandSparkles} onClick={() => startEditing(true)}>
                Ubicar mesas
              </Button>
            )}
          </div>
        ) : (
          <FloorPlan
            tables={tables}
            editor={editor}
            cell={cell}
            rows={rows}
            openId={openId}
            onToggle={onToggle}
            onOpenChange={onOpenChange}
            onChangeStatus={onChangeStatus}
            toggleIdFor={toggleIdFor}
            reactivatingId={reactivatingId}
            highlights={highlights}
            selectedId={selectedId}
            onSelect={setSelectedId}
            announce={announce}
            {...actions}
          />
        )}
      </div>

      {editing && (
        <div className="grid gap-3 md:grid-cols-2">
          <section aria-label="Sin ubicar" className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
            <p className="text-label text-fg">Sin ubicar ({editor.unplaced.length})</p>
            {editor.unplaced.length === 0 ? (
              <p className="text-sec text-fg-2">Todas las mesas están en el plano.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {editor.unplaced.map((table) => (
                  <li key={table.id}>
                    <Button variant="outline" size="sm" icon={Plus} onClick={() => placeFromTray(table)}>
                      {`Ubicar ${formatTableName(table.identifier)}`}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-label="Mesa seleccionada" className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
            {selected && selectedPlacement ? (
              <>
                <p className="text-h3 text-fg">
                  {formatTableName(selected.identifier)} <span className="text-sec text-fg-2">· {formatCapacity(selected.capacity)}</span>
                </p>
                <SegmentedControl
                  aria-label={`Forma de ${formatTableName(selected.identifier)}`}
                  value={selectedPlacement.shape ?? 'rect'}
                  onValueChange={(shape) => chooseShape(selected, shape)}
                  options={SHAPE_OPTIONS}
                />
                <div className="flex flex-wrap items-center gap-1">
                  <IconButton icon={ArrowLeft} label="Mover a la izquierda" size="sm" onClick={() => nudge(selected, -1, 0)} />
                  <IconButton icon={ArrowUp} label="Mover arriba" size="sm" onClick={() => nudge(selected, 0, -1)} />
                  <IconButton icon={ArrowDown} label="Mover abajo" size="sm" onClick={() => nudge(selected, 0, 1)} />
                  <IconButton icon={ArrowRight} label="Mover a la derecha" size="sm" onClick={() => nudge(selected, 1, 0)} />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Undo2}
                    className="ml-auto"
                    onClick={() => {
                      editor.unplace(selected.id)
                      setSelectedId(null)
                      announce(`${formatTableName(selected.identifier)} volvió a Sin ubicar`)
                    }}
                  >
                    Quitar del plano
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sec text-fg-2">Toca una mesa del plano para cambiar su forma o moverla con botones.</p>
            )}
          </section>
        </div>
      )}

      {editing && saveError && <Alert type="error">{saveError}</Alert>}

      {editing && (
        <FloatingBar title="Editando el plano" description={editor.conflicts.size > 0 ? CONFLICT_MESSAGE : 'Los estados siguen llegando en vivo mientras editas.'}>
          {/* Outline, not ghost: orange text fails AA on the glass bar (manual 7.3, R13). */}
          <Button variant="outline" size="sm" icon={WandSparkles} onClick={autoPlace} disabled={editor.unplaced.length === 0}>
            Ubicar automáticamente
          </Button>
          <Button variant="outline" size="sm" onClick={requestCancel} disabled={savePlan.isPending}>
            Cancelar
          </Button>
          <Button size="sm" onClick={() => void save()} loading={savePlan.isPending} loadingText="Guardando…">
            Guardar plano
          </Button>
        </FloatingBar>
      )}

      <ConfirmDialog
        open={discardOpen || blocker.state === 'blocked'}
        onOpenChange={(open) => {
          if (!open) keepEditing()
        }}
        title="¿Salir sin guardar el plano?"
        description="Las mesas vuelven a donde estaban la última vez que se guardó el plano."
        confirmLabel="Salir sin guardar"
        cancelLabel="Seguir editando"
        onConfirm={confirmDiscard}
      />
    </section>
  )
}
