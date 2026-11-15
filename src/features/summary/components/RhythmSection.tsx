import { cn } from '@/lib/cn'
import { formatHour, WEEKDAY_NAMES } from '../format'
import { SUMMARY_TEXT } from '../messages'
import type { RestaurantSummary } from '../types'
import { BarTrack } from './BarTrack'
import { ChartTable } from './ChartTable'

/** The three hours with most reservations, highest first. There are only three: no 24-hour map is drawn from them. */
function PeakHours({ peakHours }: { peakHours: RestaurantSummary['peakHours'] }) {
  const max = Math.max(0, ...peakHours.map((hour) => hour.reservations))
  return (
    <section aria-labelledby="peak-title" className="flex flex-col gap-3">
      <header className="flex flex-col gap-1">
        <h3 id="peak-title" className="text-h3 text-fg">
          {SUMMARY_TEXT.peakTitle}
        </h3>
        <p className="text-sec text-fg">{SUMMARY_TEXT.peakDescription}</p>
      </header>
      {peakHours.length === 0 ? (
        <p className="text-body text-fg">{SUMMARY_TEXT.peakEmpty}</p>
      ) : (
        <ol className="flex flex-col divide-y divide-line">
          {peakHours.map((hour, index) => (
            <li key={hour.hour} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
              <div className="flex items-baseline justify-between gap-4 tabular-nums">
                <p className="text-body text-fg">
                  <span className="font-bold text-accent-text">{index + 1}. </span>
                  <span className="font-bold">{formatHour(hour.hour)}</span>
                </p>
                <p className="text-sec text-fg">{SUMMARY_TEXT.peakValue(hour.reservations)}</p>
              </div>
              <BarTrack value={hour.reservations} max={max} fillClassName={index === 0 ? 'fill-fg' : 'fill-fg-2'} />
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

/** Reservations created on each day of the week, Monday to Sunday, with the busiest one marked in words and in the bar. */
function DaysOfWeek({ byDayOfWeek }: { byDayOfWeek: RestaurantSummary['byDayOfWeek'] }) {
  const days = [...byDayOfWeek].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
  const max = Math.max(0, ...days.map((day) => day.reservations))
  const empty = max === 0

  return (
    <section aria-labelledby="days-title" className="flex flex-col gap-3">
      <header className="flex flex-col gap-1">
        <h3 id="days-title" className="text-h3 text-fg">
          {SUMMARY_TEXT.daysTitle}
        </h3>
        <p className="text-sec text-fg">{SUMMARY_TEXT.daysDescription}</p>
      </header>
      {empty ? (
        <p className="text-body text-fg">{SUMMARY_TEXT.daysEmpty}</p>
      ) : (
        <>
          <ul className="flex flex-col gap-2" aria-hidden="true">
            {days.map((day) => {
              const top = day.reservations === max
              return (
                <li key={day.dayOfWeek} className="flex items-center gap-3 text-sec text-fg tabular-nums">
                  <span className={cn('w-24 shrink-0', top && 'font-bold')}>{WEEKDAY_NAMES[day.dayOfWeek - 1]}</span>
                  <span className="min-w-0 flex-1">
                    <BarTrack value={day.reservations} max={max} fillClassName={top ? 'fill-fg' : 'fill-fg-2'} />
                  </span>
                  <span className={cn('w-8 shrink-0 text-right', top && 'font-bold')}>{day.reservations}</span>
                </li>
              )
            })}
          </ul>
          <p className="text-sec text-fg" aria-hidden="true">
            <span className="font-bold">{SUMMARY_TEXT.daysTop}: </span>
            {days
              .filter((day) => day.reservations === max)
              .map((day) => WEEKDAY_NAMES[day.dayOfWeek - 1])
              .join(', ')}
          </p>
          <ChartTable
            caption={SUMMARY_TEXT.chartTableCaption.days}
            headers={[SUMMARY_TEXT.chartTableHeaders.day, SUMMARY_TEXT.chartTableHeaders.count]}
            rows={days.map((day) => ({
              label: WEEKDAY_NAMES[day.dayOfWeek - 1],
              value: day.reservations === max ? `${day.reservations} (${SUMMARY_TEXT.daysTop})` : day.reservations,
            }))}
          />
        </>
      )}
    </section>
  )
}

/** «Tu ritmo»: the peak hours and the busiest days, side by side on a desktop and one after the other on a phone. */
export function RhythmSection({ summary }: { summary: RestaurantSummary }) {
  return (
    <section aria-labelledby="rhythm-title" className="flex flex-col gap-6">
      <h2 id="rhythm-title" className="text-h2 text-fg">
        {SUMMARY_TEXT.rhythmTitle}
      </h2>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <PeakHours peakHours={summary.peakHours} />
        <DaysOfWeek byDayOfWeek={summary.byDayOfWeek} />
      </div>
    </section>
  )
}
