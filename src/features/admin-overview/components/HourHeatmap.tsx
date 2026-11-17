import { useId, useState, type KeyboardEvent } from 'react'
import { Card, EmptyState } from '@/components/ui'
import { cn } from '@/lib/cn'
import { ChartTable } from '@/features/summary/components/ChartTable'
import { formatHour, WEEKDAY_NAMES } from '@/features/summary/format'
import { HEAT_HOURS, type HeatCell } from '../data'
import { OVERVIEW_TEXT } from '../messages'

/** Six tones, from none to the busiest; the busiest are orange (the one accent of the chart). */
const LEVEL_CLASS = ['bg-surface-2', 'bg-fg/15', 'bg-fg/35', 'bg-accent/45', 'bg-accent/75', 'bg-accent'] as const
const SHORT_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const
const LABELLED_HOURS = [7, 11, 15, 19] as const

interface HourHeatmapProps {
  grid: HeatCell[][]
  /** A phrase for the whole map («Almuerzo y cena, como se espera»), or `null`. */
  summary: string | null
}

/**
 * «Pulso por hora»: a complement, small. Weekday × hour from 7 a. m. to 10 p. m., six tones. The line above reads the cell
 * under the pointer or the keyboard (the map is one tab stop; the arrows move through it), so the tone is never the only way
 * to know the number.
 */
export function HourHeatmap({ grid, summary }: HourHeatmapProps) {
  const readoutId = useId()
  const [active, setActive] = useState<[number, number] | null>(null)
  const columns = grid[0]?.length ?? 0
  const empty = grid.every((row) => row.every((cell) => cell.reservations === 0))
  const cellAt = (cursor: [number, number] | null) => (cursor ? grid[cursor[0]]?.[cursor[1]] : undefined)
  const shown = cellAt(active)

  function move(event: KeyboardEvent<HTMLDivElement>) {
    const deltas: Record<string, [number, number]> = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0] }
    const delta = deltas[event.key]
    if (!delta) return
    event.preventDefault()
    setActive((current) => {
      const [row, column] = current ?? [0, 0]
      return [Math.min(grid.length - 1, Math.max(0, row + delta[0])), Math.min(columns - 1, Math.max(0, column + delta[1]))]
    })
  }

  return (
    <Card as="section" aria-labelledby="pulse-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="pulse-title" className="text-h2 text-fg">
          {OVERVIEW_TEXT.pulseTitle}
        </h2>
        <p id={readoutId} aria-live="polite" className="text-sec font-bold text-accent-text">
          {shown ? OVERVIEW_TEXT.pulseCell(WEEKDAY_NAMES[shown.dayOfWeek - 1], formatHour(shown.hour), shown.reservations) : !empty && summary ? summary : ''}
        </p>
      </div>
      {empty ? (
        <EmptyState title={OVERVIEW_TEXT.pulseEmpty} />
      ) : (
        <>
          <div
            role="img"
            tabIndex={0}
            aria-label={`${OVERVIEW_TEXT.pulseHint}. ${OVERVIEW_TEXT.pulseKeys}`}
            aria-describedby={readoutId}
            onKeyDown={move}
            onFocus={() => setActive((current) => current ?? [0, 0])}
            onBlur={() => setActive(null)}
            onMouseLeave={() => setActive(null)}
            className="flex gap-2 rounded-tile"
          >
            <div aria-hidden="true" className="flex shrink-0 flex-col justify-between gap-0.5 text-label font-bold text-fg-2">
              {SHORT_DAYS.map((day) => (
                <span key={day} className="flex flex-1 items-center">{day}</span>
              ))}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              {grid.map((row, rowIndex) => (
                <div key={SHORT_DAYS[rowIndex]} className="flex h-4 gap-0.5 md:h-5">
                  {row.map((cell, columnIndex) => (
                    <span
                      key={cell.hour}
                      aria-hidden="true"
                      onMouseEnter={() => setActive([rowIndex, columnIndex])}
                      className={cn('min-w-0 flex-1 rounded-tile', LEVEL_CLASS[cell.level], active?.[0] === rowIndex && active[1] === columnIndex && 'outline-2 outline-fg')}
                    />
                  ))}
                </div>
              ))}
              <div aria-hidden="true" className="flex gap-0.5 pt-1 text-label font-medium text-fg-2">
                {grid[0].map((cell) => (
                  <span key={cell.hour} className="min-w-0 flex-1 overflow-visible whitespace-nowrap">
                    {(LABELLED_HOURS as readonly number[]).includes(cell.hour) ? formatHour(cell.hour).replace(':00', '') : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <ChartTable
            caption={`${OVERVIEW_TEXT.pulseTitle} (de ${HEAT_HOURS.from}:00 a ${HEAT_HOURS.to}:00)`}
            headers={['Día y hora', 'Reservas']}
            rows={grid.flatMap((row) => row.filter((cell) => cell.reservations > 0).map((cell) => ({ label: `${WEEKDAY_NAMES[cell.dayOfWeek - 1]}, ${formatHour(cell.hour)}`, value: cell.reservations })))}
          />
        </>
      )}
    </Card>
  )
}
