import { cn } from '@/lib/cn'
import { formatAdminCop } from '../../admin/format'
import { monthName, monthShort } from '../../admin/month'
import { OVERVIEW_TEXT } from '../messages'

export interface MonthBar {
  month: string
  /** What the bar measures: income in the administrator's panel, guests in the restaurant's summary. */
  value: number
}

interface MonthBarsProps {
  bars: MonthBar[]
  /** The chosen month. Without `onSelect` the bars only show numbers and nothing is chosen. */
  selected?: string
  /** The month in progress: drawn with stripes while it is not the chosen one. */
  current: string
  onSelect?: (month: string) => void
  /** A smaller version for the top of Cobros. */
  compact?: boolean
  /** The number over each bar and in its label: pesos by default. */
  formatValue?: (value: number) => string
  /** The label of a bar for screen readers. */
  describe?: (month: string, value: string, inProgress: boolean) => string
  groupLabel?: string
}

/**
 * «Ingresos por mes»: the month picker of the panel (and its bars). Each month is a button (`aria-pressed`) with its amount
 * and month in words; the chosen one is orange, the only orange of the chart; the month in progress is striped. The height
 * follows the income, and a month with none keeps a thin base so it can still be chosen.
 */
export function MonthBars({
  bars,
  selected,
  current,
  onSelect,
  compact = false,
  formatValue = formatAdminCop,
  describe = (month, value, inProgress) => OVERVIEW_TEXT.monthButton(month, value, inProgress),
  groupLabel = OVERVIEW_TEXT.monthsGroup,
}: MonthBarsProps) {
  const max = Math.max(1, ...bars.map((bar) => bar.value))
  return (
    <div role={onSelect ? 'group' : 'list'} aria-label={groupLabel} className={cn('flex items-stretch gap-2 md:gap-3', compact ? 'h-32' : 'h-56 md:h-64')}>
      {bars.map((bar) => {
        const chosen = bar.month === selected
        const running = bar.month === current
        const height = bar.value > 0 ? Math.max(4, (bar.value / max) * 100) : 2
        const text = formatValue(bar.value)
        const content = (
          <>
            <span aria-hidden="true" className={cn('text-label tabular-nums', chosen ? 'text-accent-text' : 'text-fg-2')}>
              {text}
            </span>
            <span className="flex min-h-0 flex-1 items-end">
              <span
                aria-hidden="true"
                style={{ height: `${height}%` }}
                className={cn(
                  'w-full rounded-t-tile',
                  onSelect ? (chosen ? 'bg-accent' : 'bg-line-strong group-hover:bg-inactive') : running ? 'bg-accent' : 'bg-brand',
                  running && !chosen && 'hatch-busy',
                )}
              />
            </span>
            <span aria-hidden="true" className={cn('text-sec', chosen || (!onSelect && running) ? 'font-bold text-fg' : 'text-fg-2')}>
              {monthShort(bar.month)}
              {running && onSelect && <span className="text-label font-medium"> · en curso</span>}
            </span>
          </>
        )
        const label = describe(`${monthName(bar.month)}`, text, running)
        const shared = 'group flex min-h-11 min-w-0 flex-1 flex-col justify-end gap-1.5 text-center'
        return onSelect ? (
          <button
            key={bar.month}
            type="button"
            aria-pressed={chosen}
            aria-label={label}
            onClick={() => onSelect(bar.month)}
            className={cn(shared, 'cursor-pointer rounded-tile')}
          >
            {content}
          </button>
        ) : (
          <div key={bar.month} role="listitem" aria-label={label} className={shared}>
            {content}
          </div>
        )
      })}
    </div>
  )
}
