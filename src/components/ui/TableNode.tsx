import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes } from 'react'
import { GripVertical, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatCapacity } from '@/lib/format'
import { Icon } from '@/lib/icon'
import { STATUS_META, TONE_SURFACE, TONE_TEXT } from './status'
import { StatusLine } from './StatusLine'
import type { TableCardStatus } from './TableCard'

export type TableNodeShape = 'square' | 'round' | 'rect'

const SURFACE: Record<TableCardStatus, string> = {
  available: TONE_SURFACE.ok,
  reserved: TONE_SURFACE.reserved,
  occupied: TONE_SURFACE.busy,
  inactive: 'border-dashed border-field border-line-strong bg-surface text-fg-2',
}

export interface TableNodeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Short identifier drawn on the node: "04". The full name goes in `trigger['aria-label']`. */
  label: string
  capacity: number
  status: TableCardStatus
  shape: TableNodeShape
  /** Tall enough to show the capacity line (it stays in the accessible name either way). */
  roomy: boolean
  /** Its status picker is open, or it is the table being edited: 2 px selection border. */
  selected?: boolean
  /** Edit mode: grab cursor and grip. */
  editing?: boolean
  dragging?: boolean
  /** Outside the grid or on top of another table: error border and warning icon. */
  invalid?: boolean
  /** Moves without the transition (keyboard moves). */
  instant?: boolean
  /** Going back to its cell after a drop where it did not fit. */
  returning?: boolean
  /** A new value plays the "changed from another device" ring once (manual 11.3). */
  highlight?: number
  /** The button that covers the node: opens the picker in service mode, focuses the table in edit mode. */
  trigger: ButtonHTMLAttributes<HTMLButtonElement> & { id?: string; 'aria-label': string }
}

/**
 * Table on the floor plan (manual 12.2 TableNode, 13.10). The same status surface as `TableCard` (tint + edge, hatch for
 * Ocupada, dashed for Inactiva) with the shape and the word always visible. Position and size come from the plan in
 * `style`; the node only draws. Visual piece only: the plan, the drag and the picker live in `features/tables/plan`.
 */
export const TableNode = forwardRef<HTMLDivElement, TableNodeProps>(function TableNode(
  { label, capacity, status, shape, roomy, selected, editing, dragging, invalid, instant, returning, highlight, trigger, className, ...rest },
  ref,
) {
  const round = shape === 'round'
  const radius = round ? 'rounded-full' : 'rounded-tile'
  return (
    <div
      ref={ref}
      data-status={status}
      data-editing={editing || undefined}
      data-dragging={dragging || undefined}
      data-instant={instant || undefined}
      data-returning={returning || undefined}
      className={cn(
        'plan-node flex flex-col overflow-hidden border p-1.5 text-fg select-none',
        radius,
        round ? 'items-center justify-center gap-0.5 text-center' : 'justify-between',
        SURFACE[status],
        selected && 'border-selection ring-1 ring-selection ring-inset',
        invalid && 'border-error ring-1 ring-error ring-inset',
        className,
      )}
      {...rest}
    >
      {highlight !== undefined && (
        <span
          key={highlight}
          aria-hidden="true"
          className={cn('pointer-events-none absolute -inset-0.5 animate-remote-change border-2 border-current', radius, TONE_TEXT[STATUS_META[status].tone])}
        />
      )}
      <button
        type="button"
        {...trigger}
        className={cn('absolute inset-0 outline-none focus-visible:shadow-(--focus-ring)', radius, editing ? 'cursor-grab' : 'cursor-pointer')}
      />
      <span className={cn('pointer-events-none flex items-center gap-1', round ? 'justify-center' : 'w-full justify-between')}>
        <span className="min-w-0 truncate text-sec font-extrabold">{label}</span>
        {invalid ? (
          <Icon icon={TriangleAlert} size={16} className="shrink-0 text-error" />
        ) : (
          editing && <Icon icon={GripVertical} size={16} className="shrink-0" />
        )}
      </span>
      {roomy && <span className="pointer-events-none text-label font-medium">{formatCapacity(capacity)}</span>}
      <StatusLine status={status} size="sm" className={cn('pointer-events-none', status === 'inactive' && 'text-fg-2')} />
    </div>
  )
})
