import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { Ban, Pencil } from 'lucide-react'
import { Button, STATUS_META, StatusPicker, TableNode, type TableCardShortcutStatus } from '@/components/ui'
import { formatCapacity, formatTableName } from '@/lib/format'
import type { TableMenuActions } from '../table-menu'
import { getTableDisplayStatus, TABLE_STATUS_OPTIONS } from '../table-status'
import type { Table, TableStatus } from '../types'
import { fitsAt, footprint, PLAN_COLUMNS, type Placement } from './plan-geometry'
import { SHAPE_LABELS } from './plan-labels'
import type { PlanEditor } from './use-plan-editor'

/** Below this height a node hides its capacity line (still in its accessible name); the status word never hides. */
const NODE_ROOMY = 64
/** A press that moves less than this is a tap, not a drag. */
const DRAG_THRESHOLD = 4
/** Space between a node and its cells, so neighbours never touch. */
const GAP = 2

const SHORTCUTS: Record<string, TableCardShortcutStatus> = { d: 'available', r: 'reserved', o: 'occupied' }
const ARROWS: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }

interface Drag {
  id: string
  pointerId: number
  startX: number
  startY: number
  dx: number
  dy: number
  moved: boolean
}

export interface FloorPlanProps extends TableMenuActions {
  /** Every table, in identifier order: the order of the list for screen readers and Tab. */
  tables: Table[]
  editor: PlanEditor
  /** Size of a cell in px (zoom). */
  cell: number
  /** Rows drawn; a table cannot be dropped below them. */
  rows: number
  /** Service mode: the table whose status picker is open. */
  openId: string | null
  onToggle: (table: Table) => void
  onOpenChange: (table: Table, open: boolean) => void
  onChangeStatus: (table: Table, status: TableStatus) => void
  toggleIdFor: (tableId: string) => string
  reactivatingId: string | null
  /** "Changed from another device" ring, by table id. */
  highlights: Record<string, number>
  /** Edit mode: the table shown in the inspector. */
  selectedId: string | null
  onSelect: (id: string) => void
  announce: (message: string) => void
}

function describeTable(table: Table) {
  return `${formatTableName(table.identifier)}, ${formatCapacity(table.capacity)}, ${STATUS_META[getTableDisplayStatus(table)].label}`
}

/**
 * Floor plan (manual 13.10): tables on a fixed grid of cells, scaled by `cell`. Service mode: positions are locked and a
 * tap opens the status picker with the table's details. Edit mode: drag with snap to the grid (Pointer Events), arrows
 * move one cell (Shift: 4), and a drop where the table does not fit sends it back.
 */
export function FloorPlan({
  tables,
  editor,
  cell,
  rows,
  openId,
  onToggle,
  onOpenChange,
  onChangeStatus,
  toggleIdFor,
  reactivatingId,
  highlights,
  selectedId,
  onSelect,
  announce,
  ...actions
}: FloorPlanProps) {
  const { editing } = editor
  const [drag, setDragState] = useState<Drag | null>(null)
  // The live drag: pointer events can arrive faster than React renders, so handlers read this, not the state.
  const dragRef = useRef<Drag | null>(null)
  const [returningId, setReturningId] = useState<string | null>(null)
  const [instantId, setInstantId] = useState<string | null>(null)
  // The click that follows a drag must not count as a tap.
  const skipClick = useRef(false)

  function setDrag(next: Drag | null) {
    dragRef.current = next
    setDragState(next)
  }

  useEffect(() => {
    if (!returningId) return
    const timer = window.setTimeout(() => setReturningId(null), 320)
    return () => window.clearTimeout(timer)
  }, [returningId])

  useEffect(() => {
    if (!instantId) return
    const frame = window.requestAnimationFrame(() => setInstantId(null))
    return () => window.cancelAnimationFrame(frame)
  }, [instantId])

  /** Inside the rows drawn and on top of no other table. */
  function canPlace(id: string, spot: Placement) {
    const item = editor.placed.find((candidate) => candidate.id === id)
    if (!item || spot.y + footprint(item.capacity, spot.shape).h > rows) return false
    return fitsAt(editor.placed, item, spot)
  }

  const dragged = drag?.moved ? tables.find((table) => table.id === drag.id) : undefined
  const target = drag?.moved ? dropSpot(drag) : null
  const targetFits = Boolean(dragged && target && canPlace(dragged.id, target))

  function onPointerDown(event: PointerEvent<HTMLDivElement>, table: Table) {
    if (!editing || dragRef.current || event.button !== 0) return
    try {
      // Keeps the moves coming when the pointer leaves the node.
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // The pointer already went away (a cancelled touch): without capture the drag still follows the node.
    }
    onSelect(table.id)
    setDrag({ id: table.id, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, dx: 0, dy: 0, moved: false })
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = dragRef.current
    if (!current || event.pointerId !== current.pointerId) return
    const dx = event.clientX - current.startX
    const dy = event.clientY - current.startY
    setDrag({ ...current, dx, dy, moved: current.moved || Math.hypot(dx, dy) > DRAG_THRESHOLD })
  }

  /** Cell under the dragged table, from the live drag. */
  function dropSpot(current: Drag): Placement | null {
    const table = tables.find((candidate) => candidate.id === current.id)
    const placement = table ? editor.placementFor(table) : null
    return placement && { ...placement, x: placement.x + Math.round(current.dx / cell), y: placement.y + Math.round(current.dy / cell) }
  }

  function endDrag(event: PointerEvent<HTMLDivElement>, cancelled: boolean) {
    const current = dragRef.current
    if (!current || event.pointerId !== current.pointerId) return
    skipClick.current = current.moved
    const table = tables.find((candidate) => candidate.id === current.id)
    const spot = dropSpot(current)
    if (current.moved && table && spot) {
      const name = formatTableName(table.identifier)
      if (!cancelled && canPlace(table.id, spot) && editor.move(table.id, spot.x, spot.y)) {
        announce(`${name}, fila ${spot.y + 1}, columna ${spot.x + 1}`)
      } else {
        setReturningId(table.id)
        if (!cancelled) announce(`${name} no cabe ahí. Volvió a su lugar.`)
      }
    }
    setDrag(null)
  }

  function onNodeKeyDown(event: KeyboardEvent<HTMLButtonElement>, table: Table) {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    if (!editing) {
      const status = SHORTCUTS[event.key.toLowerCase()]
      if (status && table.isActive) {
        event.preventDefault()
        onChangeStatus(table, status)
      }
      return
    }
    const arrow = ARROWS[event.key]
    const placement = editor.placementFor(table)
    if (!arrow || !placement) return
    event.preventDefault()
    const step = event.shiftKey ? 4 : 1
    const spot = { ...placement, x: placement.x + arrow[0] * step, y: placement.y + arrow[1] * step }
    const name = formatTableName(table.identifier)
    onSelect(table.id)
    if (canPlace(table.id, spot) && editor.move(table.id, spot.x, spot.y)) {
      // Keyboard moves never animate (manual 11.4).
      setInstantId(table.id)
      announce(`${name}, fila ${spot.y + 1}, columna ${spot.x + 1}`)
    } else {
      announce(`${name} no cabe ahí`)
    }
  }

  function onNodeClick(table: Table) {
    if (skipClick.current) {
      skipClick.current = false
      return
    }
    if (editing) onSelect(table.id)
    else onToggle(table)
  }

  return (
    <div
      role="list"
      aria-label="Plano del restaurante"
      className="plan-canvas relative overflow-hidden"
      style={{ width: cell * PLAN_COLUMNS, height: cell * rows, '--plan-cell': `${cell}px` } as CSSProperties}
    >
      {dragged && target && (
        <span
          aria-hidden="true"
          data-valid={targetFits}
          className={target.shape === 'round' ? 'plan-drop rounded-full' : 'plan-drop rounded-tile'}
          style={{
            width: footprint(dragged.capacity, target.shape).w * cell - GAP * 2,
            height: footprint(dragged.capacity, target.shape).h * cell - GAP * 2,
            transform: `translate(${target.x * cell + GAP}px, ${target.y * cell + GAP}px)`,
          }}
        />
      )}
      {tables.map((table) => {
        const placement = editor.placementFor(table)
        if (!placement) return null
        const size = footprint(table.capacity, placement.shape)
        const name = formatTableName(table.identifier)
        const isDragging = dragged?.id === table.id
        // A table that grew past the edge is drawn inside the grid and marked until someone moves it.
        const x = Math.max(0, Math.min(placement.x, PLAN_COLUMNS - size.w)) * cell + GAP + (isDragging && drag ? drag.dx : 0)
        const y = Math.max(0, Math.min(placement.y, rows - size.h)) * cell + GAP + (isDragging && drag ? drag.dy : 0)
        const width = size.w * cell - GAP * 2
        const height = size.h * cell - GAP * 2
        const position: CSSProperties = { width, height, transform: `translate(${x}px, ${y}px)${isDragging ? ' scale(1.02)' : ''}` }
        const open = !editing && openId === table.id
        const common = {
          role: 'listitem',
          label: table.identifier,
          capacity: table.capacity,
          status: getTableDisplayStatus(table),
          shape: placement.shape ?? 'rect',
          roomy: height >= NODE_ROOMY,
          highlight: highlights[table.id],
        } as const
        const trigger = {
          id: toggleIdFor(table.id),
          onClick: () => onNodeClick(table),
          onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => onNodeKeyDown(event, table),
        }

        if (editing) {
          return (
            <TableNode
              key={table.id}
              {...common}
              trigger={{
                ...trigger,
                'aria-label': `${describeTable(table)}, fila ${placement.y + 1}, columna ${placement.x + 1}. Muévela con las flechas.`,
                'aria-pressed': selectedId === table.id,
              }}
              style={position}
              selected={selectedId === table.id}
              invalid={editor.conflicts.has(table.id)}
              editing
              dragging={isDragging}
              instant={instantId === table.id}
              returning={returningId === table.id}
              onPointerDown={(event) => onPointerDown(event, table)}
              onPointerMove={onPointerMove}
              onPointerUp={(event) => endDrag(event, false)}
              onPointerCancel={(event) => endDrag(event, true)}
            />
          )
        }

        return (
          <StatusPicker
            key={table.id}
            open={open}
            onOpenChange={(next) => onOpenChange(table, next)}
            title={`Estado de ${name}`}
            details={`${formatCapacity(table.capacity)} · ${SHAPE_LABELS[placement.shape ?? 'rect']}`}
            options={TABLE_STATUS_OPTIONS}
            value={table.status}
            onValueChange={(next) => onChangeStatus(table, next)}
            returnFocusId={toggleIdFor(table.id)}
            anchorClassName="absolute top-0 left-0"
            anchorStyle={position}
            inactive={
              table.isActive
                ? undefined
                : {
                    message: `${name} está inactiva. No aparece para los comensales.`,
                    actionLabel: 'Reactivar mesa',
                    onAction: () => actions.onReactivate(table),
                    loading: reactivatingId === table.id,
                    loadingText: 'Reactivando…',
                  }
            }
            actions={
              <>
                {/* Outline, not ghost: orange text fails AA on the glass picker (manual 7.3, R13). */}
                <Button variant="outline" size="sm" icon={Pencil} onClick={() => actions.onEdit(table)}>
                  Editar mesa
                </Button>
                {table.isActive && (
                  <Button variant="outline" size="sm" icon={Ban} onClick={() => actions.onDeactivate(table)}>
                    Desactivar mesa
                  </Button>
                )}
              </>
            }
          >
            <TableNode
              {...common}
              trigger={{ ...trigger, 'aria-label': describeTable(table), 'aria-haspopup': 'dialog', 'aria-expanded': open }}
              className="size-full"
              selected={open}
            />
          </StatusPicker>
        )
      })}
    </div>
  )
}
