import { useId } from 'react'
import { Card, EmptyState } from '@/components/ui'
import { cn } from '@/lib/cn'
import { topHours } from '../calendar'
import { formatHour, WEEKDAY_NAMES } from '../format'
import { heatGrid } from '../heat'
import { SUMMARY_TEXT } from '../messages'
import { useHeatCursor } from '../use-heat-cursor'
import type { RestaurantSummary } from '../types'
import { BarTrack } from './BarTrack'
import { ChartTable } from './ChartTable'
import { HeatGrid } from './HeatGrid'

const SHORT_WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const

/**
 * Block 4: when the reservations are made, in one place: the weekday × hour map (the administrator's `HeatGrid`), the three
 * busiest hours and the reservations of each weekday. One orange per chart: the busiest weekday. Every figure also reads in
 * words (the line above the map, the lists, the tables behind the charts).
 */
export function DemandBlock({ summary }: { summary: RestaurantSummary }) {
  const readoutId = useId()
  const grid = heatGrid(summary.byDayHour)
  const { active, setActive, shown } = useHeatCursor(grid)
  const peaks = topHours(summary.peakHours)
  const days = [...summary.byDayOfWeek].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
  const max = Math.max(0, ...days.map((day) => day.reservations))
  const empty = max === 0 && peaks.length === 0

  return (
    <Card as="section" aria-labelledby="demand-title" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id="demand-title" className="text-h2 text-fg">
          {SUMMARY_TEXT.demandTitle}
        </h2>
        <p className="text-sec text-fg-2">{SUMMARY_TEXT.demandDescription}</p>
      </div>
      {empty ? (
        <EmptyState title={SUMMARY_TEXT.demandEmpty} description={SUMMARY_TEXT.demandEmptyDescription} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-demand lg:gap-10">
          <div className="flex flex-col gap-3">
            <p id={readoutId} aria-live="polite" className="min-h-5 text-sec font-bold text-accent-text">
              {shown ? SUMMARY_TEXT.demandCell(WEEKDAY_NAMES[shown.dayOfWeek - 1], formatHour(shown.hour), shown.reservations) : ''}
            </p>
            <HeatGrid
              grid={grid}
              active={active}
              onActive={setActive}
              describedBy={readoutId}
              hint={SUMMARY_TEXT.demandHint}
              keys={SUMMARY_TEXT.demandKeys}
              caption={SUMMARY_TEXT.demandTitle}
              legend={{ less: SUMMARY_TEXT.demandLegendLess, more: SUMMARY_TEXT.demandLegendMore }}
            />
          </div>

          <section aria-labelledby="peak-title" className="flex flex-col gap-2">
            <h3 id="peak-title" className="text-body font-bold text-fg">
              {SUMMARY_TEXT.peakTitle}
            </h3>
            {peaks.length === 0 ? (
              <p className="text-sec text-fg-2">{SUMMARY_TEXT.peakEmpty}</p>
            ) : (
              <ol className="flex flex-col divide-y divide-line">
                {peaks.map((peak, index) => (
                  <li key={peak.hour} className="flex items-baseline justify-between gap-3 py-3 first:pt-1 tabular-nums">
                    <p className="text-body text-fg">
                      <span className={cn('font-bold', index === 0 ? 'text-accent-text' : 'text-fg-2')}>{index + 1} </span>
                      <span className="font-bold">{formatHour(peak.hour)}</span>
                    </p>
                    <p className="text-sec text-fg-2">{SUMMARY_TEXT.peakValue(peak.reservations)}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section aria-labelledby="weekdays-title" className="flex flex-col gap-2">
            <h3 id="weekdays-title" className="text-body font-bold text-fg">
              {SUMMARY_TEXT.weekdaysTitle}
            </h3>
            <ul aria-hidden="true" className="flex flex-col gap-2.5">
              {days.map((day) => {
                const top = max > 0 && day.reservations === max
                return (
                  <li key={day.dayOfWeek} className="grid grid-weekday-bar-row items-center gap-2.5 text-sec tabular-nums">
                    <span className={cn(top ? 'font-bold text-fg' : 'text-fg-2')}>{SHORT_WEEKDAYS[day.dayOfWeek - 1]}</span>
                    <BarTrack value={day.reservations} max={max} fillClassName={top ? 'fill-accent' : 'fill-fg'} />
                    <span className="text-right font-bold text-fg">{day.reservations}</span>
                  </li>
                )
              })}
            </ul>
            <ChartTable
              caption={SUMMARY_TEXT.weekdaysTitle}
              headers={[SUMMARY_TEXT.chartTableHeaders.day, SUMMARY_TEXT.chartTableHeaders.count]}
              rows={days.map((day) => ({ label: WEEKDAY_NAMES[day.dayOfWeek - 1], value: day.reservations }))}
            />
          </section>
        </div>
      )}
    </Card>
  )
}
