import { useId, useState, type KeyboardEvent } from 'react'
import { Card, EmptyState } from '@/components/ui'
import { cn } from '@/lib/cn'
import { WEEKDAY_NAMES } from '@/features/summary/format'
import { ChartTable } from '@/features/summary/components/ChartTable'
import { formatAverage } from '../../admin/format'
import { monthName, weekdayOf } from '../../admin/month'
import type { DailySeries, DayBar } from '../data'
import { OVERVIEW_TEXT } from '../messages'

const KIND_CLASS: Record<DayBar['kind'], string> = {
  best: 'bg-accent',
  above: 'bg-fg',
  below: 'bg-line-strong',
  future: 'border border-dashed border-line-strong',
}

function labelOf(bar: DayBar): string {
  return `${WEEKDAY_NAMES[weekdayOf(bar.date) - 1]} ${bar.day}`
}

function readoutOf(bar: DayBar): string {
  if (bar.kind === 'future') return OVERVIEW_TEXT.dailyFuture(labelOf(bar))
  return bar.kind === 'best' ? OVERVIEW_TEXT.dailyBest(labelOf(bar), bar.reservations) : OVERVIEW_TEXT.dailyOne(labelOf(bar), bar.reservations)
}

interface DailyReservationsProps {
  series: DailySeries
  month: string
}

/**
 * «Reservas por día»: one bar per day of the month. Only the best day is orange; days over the average are strong, the rest
 * soft, and the days still to come are dotted. The line above reads the day under the pointer or the keyboard («Viernes 13 ·
 * 25 reservas»): the plot is one tab stop and the arrow keys walk the days, so what a mouse shows a keyboard reads too.
 */
export function DailyReservations({ series, month }: DailyReservationsProps) {
  const readoutId = useId()
  const [active, setActive] = useState<number | null>(null)
  const { bars, best, average } = series
  const max = Math.max(1, ...bars.map((bar) => bar.reservations))
  const idle = best ?? null
  const shown = active !== null ? bars[active] : idle
  const hasData = bars.some((bar) => bar.reservations > 0)

  function move(event: KeyboardEvent<HTMLDivElement>) {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 }
    if (event.key === 'Home') setActive(0)
    else if (event.key === 'End') setActive(bars.length - 1)
    else if (event.key in keys) setActive((current) => Math.min(bars.length - 1, Math.max(0, (current ?? (idle ? idle.day - 1 : 0)) + keys[event.key])))
    else return
    event.preventDefault()
  }

  return (
    <Card as="section" aria-labelledby="daily-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="daily-title" className="text-h2 text-fg">
          {OVERVIEW_TEXT.dailyTitle(monthName(month))}
        </h2>
        <p id={readoutId} aria-live="polite" className="text-sec font-bold text-accent-text tabular-nums">
          {shown && hasData ? readoutOf(shown) : ''}
        </p>
      </div>
      {hasData ? (
        <>
          <div
            role="img"
            tabIndex={0}
            aria-label={`${OVERVIEW_TEXT.dailyTitle(monthName(month))}. ${OVERVIEW_TEXT.dailyKeys}`}
            aria-describedby={readoutId}
            onKeyDown={move}
            onFocus={() => setActive((current) => current ?? (idle ? idle.day - 1 : 0))}
            onBlur={() => setActive(null)}
            onMouseLeave={() => setActive(null)}
            className="flex h-44 items-end gap-0.5 rounded-tile md:h-56"
          >
            {bars.map((bar, index) => (
              <span
                key={bar.date}
                aria-hidden="true"
                onMouseEnter={() => setActive(index)}
                style={{ height: `${bar.kind === 'future' ? 4 : Math.max(3, (bar.reservations / max) * 100)}%` }}
                className={cn('min-w-0 flex-1 rounded-t-tile', KIND_CLASS[bar.kind], active === index && 'outline-2 outline-offset-1 outline-fg')}
              />
            ))}
          </div>
          <div aria-hidden="true" className="flex justify-between text-label font-medium text-fg-2 tabular-nums">
            {[1, 5, 10, 15, 20, 25, bars.length].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-label text-fg">
            <li className="flex items-center gap-2"><span aria-hidden="true" className="size-2.5 rounded-tile bg-accent" />{OVERVIEW_TEXT.legendBest}</li>
            <li className="flex items-center gap-2"><span aria-hidden="true" className="size-2.5 rounded-tile bg-fg" />{OVERVIEW_TEXT.legendAbove(formatAverage(average))}</li>
            <li className="flex items-center gap-2"><span aria-hidden="true" className="size-2.5 rounded-tile bg-line-strong" />{OVERVIEW_TEXT.legendBelow}</li>
            {bars.some((bar) => bar.kind === 'future') && (
              <li className="flex items-center gap-2"><span aria-hidden="true" className="size-2.5 rounded-tile border border-dashed border-line-strong" />{OVERVIEW_TEXT.legendFuture}</li>
            )}
          </ul>
          <ChartTable
            caption={OVERVIEW_TEXT.dailyTitle(monthName(month))}
            headers={['Día', 'Reservas']}
            rows={bars.filter((bar) => bar.kind !== 'future').map((bar) => ({ label: labelOf(bar), value: bar.reservations }))}
          />
        </>
      ) : (
        <EmptyState title={OVERVIEW_TEXT.dailyEmpty} description={OVERVIEW_TEXT.dailyEmptyDescription} />
      )}
    </Card>
  )
}
