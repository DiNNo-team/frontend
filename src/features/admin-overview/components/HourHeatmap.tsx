import { useId } from 'react'
import { Card, EmptyState } from '@/components/ui'
import { HeatGrid } from '@/features/summary/components/HeatGrid'
import { useHeatCursor } from '@/features/summary/use-heat-cursor'
import { formatHour, WEEKDAY_NAMES } from '@/features/summary/format'
import type { HeatCell } from '../data'
import { OVERVIEW_TEXT } from '../messages'

interface HourHeatmapProps {
  grid: HeatCell[][]
  /** A phrase for the whole map («Almuerzo y cena, como se espera»), or `null`. */
  summary: string | null
}

/**
 * «Reservas por hora»: a complement, small. Weekday × hour from 7 a. m. to 10 p. m., six tones. The line above reads the cell
 * under the pointer or the keyboard (the map is one tab stop; the arrows move through it), so the tone is never the only way
 * to know the number. The map itself is `HeatGrid`, shared with the restaurant's summary.
 */
export function HourHeatmap({ grid, summary }: HourHeatmapProps) {
  const readoutId = useId()
  const { active, setActive, shown } = useHeatCursor(grid)
  const empty = grid.every((row) => row.every((cell) => cell.reservations === 0))

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
        <HeatGrid
          grid={grid}
          active={active}
          onActive={setActive}
          describedBy={readoutId}
          hint={OVERVIEW_TEXT.pulseHint}
          keys={OVERVIEW_TEXT.pulseKeys}
          caption={OVERVIEW_TEXT.pulseTitle}
        />
      )}
    </Card>
  )
}
