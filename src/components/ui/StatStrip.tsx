import { cn } from '@/lib/cn'
import { STATUS_META, TONE_TEXT, type Status } from './status'
import { StatusShape } from './StatusShape'

export interface StatStripItem<T extends string> {
  value: T
  status: Status
  count: number
  /** Word next to the shape, capitalized and already in singular or plural: "Disponibles", "Inactiva". */
  label: string
}

export interface StatStripProps<T extends string> {
  items: StatStripItem<T>[]
  /** Accessible name of the group: "Resumen de mesas". */
  'aria-label': string
  /** Active filter. With `onSelectedChange` each card is a toggle button that filters the view. */
  selected?: T | null
  onSelectedChange?: (value: T | null) => void
  className?: string
}

/**
 * Summary cards (manual v2.1, 12.2 `StatStrip`): one glass card per status, all alike: the shape and the word on top,
 * the figure as type below. Each card can filter the view; pressing the active one clears it. 2 × 2 below 1024 px.
 */
export function StatStrip<T extends string>({
  items,
  'aria-label': ariaLabel,
  selected,
  onSelectedChange,
  className,
}: StatStripProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className={cn('grid grid-cols-2 gap-3 lg:grid-cols-4', className)}>
      {items.map((item) => {
        const meta = STATUS_META[item.status]
        const content = (
          <>
            <span className="flex items-center gap-2">
              <StatusShape shape={meta.shape} size={10} className={TONE_TEXT[meta.tone]} />
              <span className="text-sec font-bold text-fg">{item.label}</span>
            </span>
            <span className="text-display text-fg tabular-nums">{item.count}</span>
          </>
        )
        const cell = 'glass-card flex min-h-36 flex-col items-start justify-between gap-2 rounded-card p-5 text-left'
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
            className={cn(cell, 'press lift cursor-pointer aria-pressed:ring-2 aria-pressed:ring-selection')}
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}
