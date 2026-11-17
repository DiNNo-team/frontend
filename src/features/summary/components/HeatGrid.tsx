import type { KeyboardEvent } from 'react'
import { cn } from '@/lib/cn'
import { formatHour, WEEKDAY_NAMES } from '../format'
import { HEAT_HOURS, HEAT_LEVEL_CLASS, type HeatCell, type HeatCursor } from '../heat'
import { ChartTable } from './ChartTable'

const SHORT_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const
const LABELLED_HOURS = [7, 11, 15, 19] as const

interface HeatGridProps {
  grid: HeatCell[][]
  active: HeatCursor
  onActive: (cursor: HeatCursor | ((current: HeatCursor) => HeatCursor)) => void
  /** The element that reads the active cell aloud (`aria-live`), owned by the block that uses the map. */
  describedBy: string
  /** What the map says it is and how to move through it (screen readers). */
  hint: string
  keys: string
  /** Caption of the table that backs the map for screen readers. */
  caption: string
  /** «Menos … Más» under the map, or `null`. */
  legend?: { less: string; more: string } | null
}

/**
 * Weekday × hour from 7 a. m. to 10 p. m., six tones. The map is one tab stop and the arrows move through it, so the tone is
 * never the only way to know the number: the block that uses it shows the cell read (`useHeatCursor`). Shared by the
 * administrator's «Reservas por hora» and the restaurant's «Horas de mayor demanda».
 */
export function HeatGrid({ grid, active, onActive, describedBy, hint, keys, caption, legend = null }: HeatGridProps) {
  const columns = grid[0]?.length ?? 0

  function move(event: KeyboardEvent<HTMLDivElement>) {
    const deltas: Record<string, [number, number]> = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0] }
    const delta = deltas[event.key]
    if (!delta) return
    event.preventDefault()
    onActive((current) => {
      const [row, column] = current ?? [0, 0]
      return [Math.min(grid.length - 1, Math.max(0, row + delta[0])), Math.min(columns - 1, Math.max(0, column + delta[1]))]
    })
  }

  return (
    <>
      <div
        role="img"
        tabIndex={0}
        aria-label={`${hint}. ${keys}`}
        aria-describedby={describedBy}
        onKeyDown={move}
        onFocus={() => onActive((current) => current ?? [0, 0])}
        onBlur={() => onActive(null)}
        onMouseLeave={() => onActive(null)}
        className="flex gap-2 rounded-tile"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {grid.map((row, rowIndex) => (
            <div key={SHORT_DAYS[rowIndex]} className="flex h-4 gap-2 md:h-5">
              <span aria-hidden="true" className="flex w-7 shrink-0 items-center text-label font-bold text-fg-2">
                {SHORT_DAYS[rowIndex]}
              </span>
              <span className="flex min-w-0 flex-1 gap-0.5">
                {row.map((cell, columnIndex) => (
                  <span
                    key={cell.hour}
                    aria-hidden="true"
                    onMouseEnter={() => onActive([rowIndex, columnIndex])}
                    className={cn('min-w-0 flex-1 rounded-tile', HEAT_LEVEL_CLASS[cell.level], active?.[0] === rowIndex && active[1] === columnIndex && 'outline-2 outline-fg')}
                  />
                ))}
              </span>
            </div>
          ))}
          <div aria-hidden="true" className="flex gap-2 pt-1 text-label font-medium text-fg-2">
            <span className="w-7 shrink-0" />
            <span className="flex min-w-0 flex-1 gap-0.5">
              {grid[0].map((cell) => (
                <span key={cell.hour} className="min-w-0 flex-1 overflow-visible whitespace-nowrap">
                  {(LABELLED_HOURS as readonly number[]).includes(cell.hour) ? formatHour(cell.hour).replace(':00', '') : ''}
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>
      {legend && (
        <p aria-hidden="true" className="flex items-center gap-1.5 text-label text-fg-2">
          {legend.less}
          {HEAT_LEVEL_CLASS.map((tone) => (
            <span key={tone} className={cn('size-3 rounded-tile', tone)} />
          ))}
          {legend.more}
        </p>
      )}
      <ChartTable
        caption={`${caption} (de ${HEAT_HOURS.from}:00 a ${HEAT_HOURS.to}:00)`}
        headers={['Día y hora', 'Reservas']}
        rows={grid.flatMap((row) =>
          row.filter((cell) => cell.reservations > 0).map((cell) => ({ label: `${WEEKDAY_NAMES[cell.dayOfWeek - 1]}, ${formatHour(cell.hour)}`, value: cell.reservations })),
        )}
      />
    </>
  )
}
