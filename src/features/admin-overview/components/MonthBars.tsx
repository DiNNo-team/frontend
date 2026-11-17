import { cn } from '@/lib/cn'
import { formatAdminCop } from '../../admin/format'
import { monthName, monthShort } from '../../admin/month'
import { OVERVIEW_TEXT } from '../messages'

export interface MonthBar {
  month: string
  revenueCop: number
}

interface MonthBarsProps {
  bars: MonthBar[]
  selected: string
  /** The month in progress: drawn with stripes while it is not the chosen one. */
  current: string
  onSelect: (month: string) => void
  /** A smaller version for the top of Cobros. */
  compact?: boolean
}

/**
 * «Ingresos por mes»: the month picker of the panel (and its bars). Each month is a button (`aria-pressed`) with its amount
 * and month in words; the chosen one is orange, the only orange of the chart; the month in progress is striped. The height
 * follows the income, and a month with none keeps a thin base so it can still be chosen.
 */
export function MonthBars({ bars, selected, current, onSelect, compact = false }: MonthBarsProps) {
  const max = Math.max(1, ...bars.map((bar) => bar.revenueCop))
  return (
    <div role="group" aria-label={OVERVIEW_TEXT.monthsGroup} className={cn('flex items-stretch gap-2 md:gap-3', compact ? 'h-32' : 'h-56 md:h-64')}>
      {bars.map((bar) => {
        const chosen = bar.month === selected
        const running = bar.month === current
        const height = bar.revenueCop > 0 ? Math.max(4, (bar.revenueCop / max) * 100) : 2
        return (
          <button
            key={bar.month}
            type="button"
            aria-pressed={chosen}
            aria-label={OVERVIEW_TEXT.monthButton(`${monthName(bar.month)}`, formatAdminCop(bar.revenueCop), running)}
            onClick={() => onSelect(bar.month)}
            className="group flex min-h-11 min-w-0 flex-1 cursor-pointer flex-col justify-end gap-1.5 rounded-tile text-center"
          >
            <span aria-hidden="true" className={cn('text-label tabular-nums', chosen ? 'text-accent-text' : 'text-fg-2')}>
              {formatAdminCop(bar.revenueCop)}
            </span>
            <span className="flex min-h-0 flex-1 items-end">
              <span
                aria-hidden="true"
                style={{ height: `${height}%` }}
                className={cn(
                  'w-full rounded-t-tile',
                  chosen ? 'bg-accent' : 'bg-line-strong group-hover:bg-inactive',
                  running && !chosen && 'hatch-busy',
                )}
              />
            </span>
            <span aria-hidden="true" className={cn('text-sec', chosen ? 'font-bold text-fg' : 'text-fg-2')}>
              {monthShort(bar.month)}
              {running && <span className="text-label font-medium"> · en curso</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}
