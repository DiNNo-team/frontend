import { Fragment, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactElement } from 'react'
import { flushSync } from 'react-dom'
import { Popover } from 'radix-ui'
import { Ban, Check, Ellipsis, Frame, GripVertical, LayoutGrid, Move, Pencil, Plus, RefreshCw, RotateCcw, Users, WandSparkles } from 'lucide-react'
import { Button, DropdownMenu, IconButton, SegmentedControl, STATUS_META, StatusShape, useToast } from '@/components/ui'
import { TONE_TEXT } from '@/components/ui/status'
import { cn } from '@/lib/cn'
import { formatCapacity, formatTableName, tableIdentifierCore } from '@/lib/format'
import { Icon } from '@/lib/icon'
import {
  DEMO_TABLES,
  PLAN_COLS,
  PLAN_ROWS,
  STATUS_KEY_LABEL,
  STATUS_KEYS,
  firstFreeSpot,
  fitsAt,
  footprint,
  type DemoStatus,
  type DemoTable,
} from './demo-tables'

type View = 'plan' | 'grid'
type Display = DemoStatus | 'inactive'

const STATUSES: DemoStatus[] = ['available', 'reserved', 'occupied']
const PLURALS: Record<Display, string> = { available: 'disponibles', reserved: 'reservadas', occupied: 'ocupadas', inactive: 'inactivas' }
const MIN_CELL = 32
const MAX_CELL = 56
/** Below this height a node hides its capacity (still in its accessible name); the status word never hides. */
const NODE_ROOMY = 64

const displayOf = (table: DemoTable): Display => (table.isActive ? table.status : 'inactive')
const nameOf = (table: DemoTable) => formatTableName(table.identifier)
const describe = (table: DemoTable) => `${nameOf(table)}, ${formatCapacity(table.capacity)}, ${STATUS_META[displayOf(table)].label}`
const transitionName = (table: DemoTable) => ({ viewTransitionName: `mesa-${table.id}` }) as CSSProperties

function byIdentifier(a: DemoTable, b: DemoTable) {
  if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
  return tableIdentifierCore(a.identifier).localeCompare(tableIdentifierCore(b.identifier), 'es', { numeric: true, sensitivity: 'base' })
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  return reduced
}

function StatusLine({ status, compact = false }: { status: Display; compact?: boolean }) {
  const meta = STATUS_META[status]
  return (
    <span className={cn('flex min-w-0 items-center gap-1.5 font-bold', compact ? 'sv2-label' : 'text-sec')}>
      <StatusShape shape={meta.shape} className={TONE_TEXT[meta.tone]} />
      <span className="truncate">{meta.label}</span>
    </span>
  )
}

/**
 * Status picker (manual 12.2): glass popover anchored to the table; the current status is tinted and checked.
 * An inactive table offers "Reactivar mesa" instead. Content gets `sv2` because it renders in a portal.
 */
function StatusPicker({
  table,
  open,
  onOpenChange,
  onPick,
  onReactivate,
  triggerId,
  children,
}: {
  table: DemoTable
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (status: DemoStatus) => void
  onReactivate: () => void
  triggerId: string
  children: ReactElement
}) {
  const list = useRef<HTMLDivElement>(null)

  function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const options = [...(list.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? [])]
    const index = options.indexOf(document.activeElement as HTMLButtonElement)
    options[(index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length]?.focus()
  }

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Anchor asChild>{children}</Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={16}
          aria-label={`Estado de ${nameOf(table)}`}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            const target = list.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]') ?? list.current?.querySelector<HTMLButtonElement>('button')
            target?.focus()
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            document.getElementById(triggerId)?.focus()
          }}
          className="sv2 sv2-picker sv2-glass-panel z-(--z-dropdown) flex flex-col gap-1 rounded-tile p-2 text-fg"
        >
          {!table.isActive ? (
            <div ref={list} className="flex flex-col gap-3 p-2">
              <p className="text-sec">{nameOf(table)} está inactiva. No aparece para los comensales.</p>
              <Button variant="outline" size="sm" icon={RotateCcw} onClick={onReactivate} className="sv2-press self-start">
                Reactivar mesa
              </Button>
            </div>
          ) : (
            <>
          <p className="px-3 pt-1 pb-1 sv2-label">Estado de {nameOf(table)}</p>
          <div ref={list} role="radiogroup" aria-label={`Estado de ${nameOf(table)}`} className="flex flex-col gap-1" onKeyDown={moveFocus}>
            {STATUSES.map((status) => {
              const current = table.status === status
              return (
                <button
                  key={status}
                  type="button"
                  role="radio"
                  aria-checked={current}
                  data-current={current}
                  data-status={status}
                  onClick={() => onPick(status)}
                  className="sv2-picker-option sv2-press flex h-12 cursor-pointer items-center gap-3 rounded-input px-3 text-left text-body font-bold hover:bg-surface-2"
                >
                  <StatusShape shape={STATUS_META[status].shape} className={TONE_TEXT[STATUS_META[status].tone]} />
                  <span className="flex-1">{STATUS_META[status].label}</span>
                  {current ? <Icon icon={Check} size={16} /> : <span className="text-sec">{STATUS_KEY_LABEL[status]}</span>}
                </button>
              )
            })}
          </div>
            </>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function TableMenu({ table, onToggleActive }: { table: DemoTable; onToggleActive: () => void }) {
  return (
    <DropdownMenu
      items={[
        { label: 'Editar', icon: Pencil, onSelect: () => undefined },
        table.isActive
          ? { label: 'Desactivar', icon: Ban, destructive: true, onSelect: onToggleActive }
          : { label: 'Reactivar', icon: RotateCcw, onSelect: onToggleActive },
      ]}
      trigger={<IconButton icon={Ellipsis} label={`Más acciones de ${nameOf(table)}`} size="sm" className="relative z-1 -mt-2 -mr-2" />}
    />
  )
}

interface TableProps {
  table: DemoTable
  open: boolean
  flash?: number
  onOpenChange: (open: boolean) => void
  onPick: (status: DemoStatus) => void
  onToggleActive: () => void
}

function triggerKeys(event: KeyboardEvent<HTMLButtonElement>, onPick: (status: DemoStatus) => void) {
  const status = STATUS_KEYS[event.key.toLowerCase()]
  if (!status || event.metaKey || event.ctrlKey || event.altKey) return
  event.preventDefault()
  onPick(status)
}

/** v2.0 TableCard: status surface, equal heights, inactive without opacity; tapping always opens its picker (manual 12.2). */
function DemoCard({ table, open, flash, onOpenChange, onPick, onToggleActive }: TableProps) {
  const status = displayOf(table)
  const triggerId = `sv2-card-${table.id}`
  return (
    <StatusPicker table={table} open={open} onOpenChange={onOpenChange} onPick={onPick} onReactivate={onToggleActive} triggerId={triggerId}>
      <li
        data-status={status}
        data-open={open}
        style={transitionName(table)}
        className="sv2-table sv2-press flex min-w-0 flex-col justify-between gap-3 rounded-tile p-4"
      >
        {flash && <span key={flash} aria-hidden="true" className={cn('sv2-ring', TONE_TEXT[STATUS_META[status].tone])} />}
        <button
          id={triggerId}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={describe(table)}
          className="sv2-table-trigger outline-none"
          onClick={() => onOpenChange(!open)}
          onKeyDown={(event) => {
            if (table.isActive) triggerKeys(event, onPick)
          }}
        />
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 min-w-0 text-h3 break-words">{nameOf(table)}</h3>
          <TableMenu table={table} onToggleActive={onToggleActive} />
        </div>
        <p className="flex items-center gap-2 text-sec">
          <Icon icon={Users} size={16} />
          {formatCapacity(table.capacity)}
        </p>
        <StatusLine status={status} />
      </li>
    </StatusPicker>
  )
}

function StatStrip({ tables, filter, onFilter }: { tables: DemoTable[]; filter: Display | null; onFilter: (value: Display | null) => void }) {
  const keys: Display[] = ['available', 'reserved', 'occupied', 'inactive']
  return (
    <div role="group" aria-label="Resumen de mesas" className="grid grid-cols-2 gap-px overflow-hidden rounded-tile border border-line bg-line sm:grid-cols-4">
      {keys.map((key) => {
        const count = tables.filter((table) => displayOf(table) === key).length
        const meta = STATUS_META[key]
        return (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => onFilter(filter === key ? null : key)}
            className="sv2-press flex cursor-pointer flex-col items-start gap-1 bg-surface p-4 text-left aria-pressed:bg-surface-2"
          >
            <span className="flex items-center gap-2">
              <StatusShape shape={meta.shape} className={TONE_TEXT[meta.tone]} />
              <span className="sv2-metric">{count}</span>
            </span>
            <span className="text-sec text-fg-2">{PLURALS[key]}</span>
          </button>
        )
      })}
    </div>
  )
}

interface Drag {
  id: string
  pointerId: number
  startX: number
  startY: number
  dx: number
  dy: number
}

/** Floor plan (manual 12.2 FloorPlan / TableNode): service mode opens the picker; edit mode drags with snap and arrows. */
function FloorPlan({
  tables,
  setTables,
  editing,
  openId,
  setOpenId,
  flashes,
  onPick,
  onReactivate,
  announce,
}: {
  tables: DemoTable[]
  setTables: (update: (tables: DemoTable[]) => DemoTable[]) => void
  editing: boolean
  openId: string | null
  setOpenId: (id: string | null) => void
  flashes: Record<string, number>
  onPick: (table: DemoTable, status: DemoStatus) => void
  onReactivate: (table: DemoTable) => void
  announce: (message: string) => void
}) {
  const frame = useRef<HTMLDivElement>(null)
  const [cell, setCell] = useState(44)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [returningId, setReturningId] = useState<string | null>(null)
  const [instantId, setInstantId] = useState<string | null>(null)

  useLayoutEffect(() => {
    const element = frame.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      const fitted = Math.floor(entry.contentRect.width / PLAN_COLS)
      setCell(Math.min(MAX_CELL, Math.max(MIN_CELL, fitted)))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const dragged = drag ? tables.find((table) => table.id === drag.id) : undefined
  const target =
    drag && dragged?.plan ? { x: dragged.plan.x + Math.round(drag.dx / cell), y: dragged.plan.y + Math.round(drag.dy / cell) } : null
  const targetFits = target && dragged ? fitsAt(tables, dragged, target.x, target.y) : false

  function place(table: DemoTable, x: number, y: number) {
    setTables((current) => current.map((item) => (item.id === table.id ? { ...item, plan: { x, y } } : item)))
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>, table: DemoTable) {
    if (!editing || !table.plan || drag) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag({ id: table.id, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, dx: 0, dy: 0 })
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag || event.pointerId !== drag.pointerId) return
    setDrag({ ...drag, dx: event.clientX - drag.startX, dy: event.clientY - drag.startY })
  }

  function endDrag(event: PointerEvent<HTMLDivElement>, cancelled: boolean) {
    if (!drag || event.pointerId !== drag.pointerId || !dragged) return
    if (!cancelled && target && targetFits) {
      place(dragged, target.x, target.y)
      announce(`${nameOf(dragged)}, fila ${target.y + 1}, columna ${target.x + 1}`)
    } else if (drag.dx !== 0 || drag.dy !== 0) {
      setReturningId(dragged.id)
      window.setTimeout(() => setReturningId(null), 260)
    }
    setDrag(null)
  }

  function onNodeKeyDown(event: KeyboardEvent<HTMLButtonElement>, table: DemoTable) {
    if (!editing) {
      triggerKeys(event, (status) => onPick(table, status))
      return
    }
    const step = event.shiftKey ? 4 : 1
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    const move = moves[event.key]
    if (!move || !table.plan) return
    event.preventDefault()
    const x = table.plan.x + move[0]
    const y = table.plan.y + move[1]
    if (!fitsAt(tables, table, x, y)) {
      announce(`${nameOf(table)} no cabe ahí`)
      return
    }
    // Keyboard moves never animate (manual 11.4).
    setInstantId(table.id)
    place(table, x, y)
    announce(`${nameOf(table)}, fila ${y + 1}, columna ${x + 1}`)
    window.requestAnimationFrame(() => setInstantId(null))
  }

  return (
    <div ref={frame} className="overflow-x-auto rounded-card border border-line">
      <div
        role="list"
        aria-label="Plano del restaurante"
        className={cn('sv2-canvas', editing && 'sv2-edit')}
        style={{ width: cell * PLAN_COLS, height: cell * PLAN_ROWS, '--plan-cell': `${cell}px` } as CSSProperties}
      >
        {target && dragged && (
          <span
            aria-hidden="true"
            data-valid={targetFits}
            className={cn('sv2-drop', dragged.shape === 'round' ? 'rounded-full' : 'rounded-tile')}
            style={{
              width: footprint(dragged).w * cell - 4,
              height: footprint(dragged).h * cell - 4,
              transform: `translate(${target.x * cell + 2}px, ${target.y * cell + 2}px)`,
            }}
          />
        )}
        {tables.map((table) => {
          if (!table.plan) return null
          const size = footprint(table)
          const status = displayOf(table)
          const isDragging = drag?.id === table.id
          const x = table.plan.x * cell + 2 + (isDragging ? drag.dx : 0)
          const y = table.plan.y * cell + 2 + (isDragging ? drag.dy : 0)
          const height = size.h * cell - 4
          const triggerId = `sv2-node-${table.id}`
          const open = openId === table.id && !editing
          const node = (
            <div
              role="listitem"
              data-status={status}
              data-open={open}
              data-dragging={isDragging}
              data-returning={returningId === table.id}
              data-instant={instantId === table.id}
              onPointerDown={(event) => onPointerDown(event, table)}
              onPointerMove={onPointerMove}
              onPointerUp={(event) => endDrag(event, false)}
              onPointerCancel={(event) => endDrag(event, true)}
              className={cn(
                'sv2-node sv2-table flex flex-col overflow-hidden p-1.5',
                table.shape === 'round' ? 'items-center justify-center gap-0.5 rounded-full text-center' : 'justify-between rounded-tile',
              )}
              style={{
                width: size.w * cell - 4,
                height,
                transform: `translate(${x}px, ${y}px)${isDragging ? ' scale(1.02)' : ''}`,
                ...transitionName(table),
              }}
            >
              {flashes[table.id] && <span key={flashes[table.id]} aria-hidden="true" className={cn('sv2-ring', TONE_TEXT[STATUS_META[status].tone])} />}
              <button
                id={triggerId}
                type="button"
                aria-label={editing ? `${describe(table)}, fila ${table.plan.y + 1}, columna ${table.plan.x + 1}. Muévela con las flechas.` : describe(table)}
                aria-haspopup={editing ? undefined : 'dialog'}
                aria-expanded={editing ? undefined : open}
                className="sv2-table-trigger outline-none"
                onClick={() => {
                  if (!editing) setOpenId(open ? null : table.id)
                }}
                onKeyDown={(event) => onNodeKeyDown(event, table)}
              />
              <span className={cn('flex items-center gap-1', table.shape === 'round' ? 'justify-center' : 'w-full justify-between')}>
                <span className="min-w-0 truncate text-sec font-extrabold">{table.identifier}</span>
                {editing && <Icon icon={GripVertical} size={16} className="shrink-0" />}
              </span>
              {height >= NODE_ROOMY && <span className="sv2-label font-medium">{formatCapacity(table.capacity)}</span>}
              <StatusLine status={status} compact />
            </div>
          )
          if (editing) return <Fragment key={table.id}>{node}</Fragment>
          return (
            <StatusPicker
              key={table.id}
              table={table}
              open={open}
              onOpenChange={(next) => setOpenId(next ? table.id : null)}
              onPick={(next) => onPick(table, next)}
              onReactivate={() => onReactivate(table)}
              triggerId={triggerId}
            >
              {node}
            </StatusPicker>
          )
        })}
      </div>
    </div>
  )
}

/** The whole /mesas proposal: header, strip, Plano · Cuadrícula, picker, remote changes. */
export function TablesDemo() {
  const toast = useToast()
  const reduceMotion = usePrefersReducedMotion()
  const [tables, setTables] = useState(DEMO_TABLES)
  const [view, setView] = useState<View>('plan')
  const [filter, setFilter] = useState<Display | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [snapshot, setSnapshot] = useState<DemoTable[] | null>(null)
  const [flashes, setFlashes] = useState<Record<string, number>>({})
  const [announcement, setAnnouncement] = useState('')

  const sorted = [...tables].sort(byIdentifier)
  const visible = filter ? sorted.filter((table) => displayOf(table) === filter) : sorted
  const unplaced = tables.filter((table) => !table.plan)

  function update(id: string, change: Partial<DemoTable>) {
    setTables((current) => current.map((table) => (table.id === id ? { ...table, ...change } : table)))
  }

  function pick(table: DemoTable, status: DemoStatus, isUndo = false) {
    setOpenId(null)
    if (table.status === status) return
    const previous = table.status
    update(table.id, { status })
    toast.show({
      type: 'success',
      message: `${nameOf(table)} ahora está ${STATUS_META[status].label}`,
      action: isUndo ? undefined : { label: 'Deshacer', onClick: () => pick({ ...table, status }, previous, true) },
    })
  }

  function toggleActive(table: DemoTable) {
    setOpenId(null)
    update(table.id, table.isActive ? { isActive: false } : { isActive: true, status: 'available' })
    toast.show({ type: 'success', message: `${nameOf(table)} ${table.isActive ? 'desactivada' : 'reactivada'}` })
  }

  function simulateRemoteChange() {
    const candidates = tables.filter((table) => table.isActive)
    const table = candidates[Math.floor(Math.random() * candidates.length)]
    const options = STATUSES.filter((status) => status !== table.status)
    const status = options[Math.floor(Math.random() * options.length)]
    update(table.id, { status })
    setFlashes((current) => ({ ...current, [table.id]: Date.now() }))
    setAnnouncement(`${nameOf(table)} cambió a ${STATUS_META[status].label} desde otro dispositivo`)
  }

  function switchView(next: View) {
    setOpenId(null)
    const start = (document as Document & { startViewTransition?: (callback: () => void) => unknown }).startViewTransition
    if (!start || reduceMotion) {
      setView(next)
      return
    }
    start.call(document, () => flushSync(() => setView(next)))
  }

  function startEditing() {
    setOpenId(null)
    setSnapshot(tables)
    setEditing(true)
  }

  function finishEditing(save: boolean) {
    if (!save && snapshot) setTables(snapshot)
    setSnapshot(null)
    setEditing(false)
    if (save) toast.show({ type: 'success', message: 'Plano guardado' })
  }

  function autoPlace() {
    setTables((current) => {
      let next = current
      for (const table of current.filter((item) => !item.plan)) {
        const spot = firstFreeSpot(next, table)
        if (spot) next = next.map((item) => (item.id === table.id ? { ...item, plan: spot } : item))
      }
      return next
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="sv2-h1">Mesas</h2>
          <p className="text-sec text-fg-2">Actualiza el estado de cada mesa en tiempo real</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            aria-label="Vista de mesas"
            value={view}
            onValueChange={switchView}
            options={[
              { value: 'plan', label: 'Plano' },
              { value: 'grid', label: 'Cuadrícula' },
            ]}
          />
          <Button variant="outline" icon={Plus} className="sv2-press">
            Agregar mesa
          </Button>
        </div>
      </header>

      <StatStrip tables={tables} filter={view === 'grid' ? filter : null} onFilter={setFilter} />

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={simulateRemoteChange} className="sv2-press">
          Simular cambio desde otro dispositivo
        </Button>
        <p className="text-sec text-fg-2">
          Toca una mesa para cambiar su estado. Con una mesa enfocada: <strong className="text-fg">D</strong>,{' '}
          <strong className="text-fg">R</strong> u <strong className="text-fg">O</strong>.
        </p>
      </div>
      <p role="status" className="sr-only">
        {announcement}
      </p>

      {view === 'grid' ? (
        <ul aria-label="Mesas" className="grid grid-tables gap-3" style={{ gridAutoRows: '1fr' }}>
          {visible.map((table) => (
            <DemoCard
              key={table.id}
              table={table}
              open={openId === table.id}
              flash={flashes[table.id]}
              onOpenChange={(next) => setOpenId(next ? table.id : null)}
              onPick={(status) => pick(table, status)}
              onToggleActive={() => toggleActive(table)}
            />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sec text-fg-2">
              <Icon icon={editing ? Move : Frame} size={16} />
              {editing ? 'Arrastra las mesas o muévelas con las flechas (Shift: 4 celdas).' : 'Modo servicio: las mesas no se mueven.'}
            </p>
            {!editing && (
              <Button variant="outline" size="sm" icon={Move} onClick={startEditing} className="sv2-press">
                Editar plano
              </Button>
            )}
          </div>
          <FloorPlan
            tables={tables}
            setTables={setTables}
            editing={editing}
            openId={openId}
            setOpenId={setOpenId}
            flashes={flashes}
            onPick={pick}
            onReactivate={(table) => {
              setOpenId(null)
              toggleActive(table)
            }}
            announce={setAnnouncement}
          />
          {editing && (
            <section
              aria-label="Edición del plano"
              className="sv2-glass-panel sticky bottom-4 z-(--z-sticky) flex flex-col gap-3 rounded-card p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex min-w-0 flex-wrap items-center gap-2 text-sec text-fg">
                <span className="font-bold">Sin ubicar ({unplaced.length})</span>
                {unplaced.map((table) => (
                  <span key={table.id} className="rounded-full border border-line px-3 py-1">
                    {nameOf(table)}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="ghost" size="sm" icon={WandSparkles} onClick={autoPlace} disabled={unplaced.length === 0}>
                  Ubicar automáticamente
                </Button>
                <Button variant="outline" size="sm" onClick={() => finishEditing(false)} className="sv2-press">
                  Cancelar
                </Button>
                <Button size="sm" onClick={() => finishEditing(true)} className="sv2-press">
                  Guardar plano
                </Button>
              </div>
            </section>
          )}
        </div>
      )}
      <p className="flex items-center gap-2 text-sec text-fg-2">
        <Icon icon={LayoutGrid} size={16} />
        La cuadrícula filtra con la franja de arriba. Las mesas inactivas van al final.
      </p>
    </div>
  )
}
