import { cn } from '@/lib/cn'
import { STATUS_META, TONE_TEXT, type Status } from './status'
import { StatusShape } from './StatusShape'

export interface StatStripItem<T extends string> {
  value: T
  status: Status
  count: number
  /** Word under the figure, already in singular or plural: "disponibles", "inactiva". */
  label: string
}

export interface StatStripProps<T extends string> {
  items: StatStripItem<T>[]
  /** Accessible name of the group: "Resumen de mesas". */
  'aria-label': string
  /** Active filter. With `onSelectedChange` each cell is a toggle button that filters the view. */
  selected?: T | null
  onSelectedChange?: (value: T | null) => void
  className?: string
}

/**
 * Summary strip (manual 12.2): one level-1 container split by hairlines, figures as type (no tiles, no icons in
 * circles). Each cell can filter the view; pressing the active one clears it. 2 × 2 below 640 px.
 */
export function StatStrip<T extends string>({ items, 'aria-label': ariaLabel, selected, onSelectedChange, className }: StatStripProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn('grid grid-cols-2 gap-px overflow-hidden rounded-tile border border-line bg-line sm:grid-cols-4', className)}
    >
      {items.map((item) => {
        const meta = STATUS_META[item.status]
        const content = (
          <>
            <span className="flex items-center gap-2">
              <StatusShape shape={meta.shape} size={10} className={TONE_TEXT[meta.tone]} />
              <span className="text-metric text-fg tabular-nums">{item.count}</span>
            </span>
            <span className="text-sec text-fg-2">{item.label}</span>
          </>
        )
        const cell = 'flex flex-col items-start gap-1 bg-surface p-4 text-left'
        if (!onSelectedChange) {
          return (
            <div key={item.value} className={cell}>
              {content}
            </div>
          )
        }
        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={selected === item.value}
            onClick={() => onSelectedChange(selected === item.value ? null : item.value)}
            className={cn(cell, 'press cursor-pointer hover:bg-surface-2 aria-pressed:bg-surface-2 aria-pressed:ring-2 aria-pressed:ring-selection aria-pressed:ring-inset')}
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}
