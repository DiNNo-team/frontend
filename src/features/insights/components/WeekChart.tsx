import { History } from 'lucide-react'
import { Card, StatusShape, TONE_TEXT } from '@/components/ui'
import { ChartTable } from '@/features/summary/components/ChartTable'
import { formatLongDay } from '@/features/summary/format'
import { cn } from '@/lib/cn'
import { Icon } from '@/lib/icon'
import { INSIGHTS_TEXT } from '../messages'
import type { InsightsDaily, InsightsMetrics } from '../types'

const activeOf = (day: InsightsDaily) => Math.max(0, day.created - day.completed - day.cancelled - day.expired)

/** One part of a day's bar, as wide as its share. Same colors as «Estado de las reservas» of Resumen. */
function Segment({ count, className }: { count: number; className: string }) {
  if (count === 0) return null
  return <span style={{ flexGrow: count }} className={cn('basis-0', className)} />
}

const SEGMENT = {
  completed: 'bg-ok',
  expired: 'hatch-busy bg-line-strong',
  // `line` almost vanishes on a dark card; the secondary text color reads apart from the striped «expired» in dark.
  cancelled: 'bg-line dark:bg-fg-2',
  active: 'border border-dashed border-line-strong',
} as const

function DayRow({ day, max, isToday }: { day: InsightsDaily; max: number; isToday: boolean }) {
  return (
    // On a phone the bar takes its own full-width line under the day (a third of the width would hide the differences);
    // from md on, day · bar · changes share one line.
    <li className="grid grid-weekday-row items-center gap-x-3 gap-y-1">
      <span className={cn('text-sec tabular-nums', isToday ? 'font-bold text-fg' : 'text-fg-2')}>{INSIGHTS_TEXT.shortDay(day.date, isToday)}</span>
      <span className="col-span-3 row-start-2 flex min-w-0 items-center gap-2 md:col-span-1 md:col-start-2 md:row-start-1">
        {day.created > 0 && (
          // The bar grows once from the left (the only movement of the screen); with reduced motion it does not move.
          <span style={{ width: `${(day.created / max) * 100}%` }} className="flex h-3 animate-grow-x gap-0.5 overflow-hidden rounded-tile origin-left">
            <Segment count={day.completed} className={SEGMENT.completed} />
            <Segment count={day.expired} className={SEGMENT.expired} />
            <Segment count={day.cancelled} className={SEGMENT.cancelled} />
            <Segment count={activeOf(day)} className={SEGMENT.active} />
          </span>
        )}
        <strong className="shrink-0 text-sec text-fg tabular-nums">{day.created}</strong>
      </span>
      <span className="col-start-3 row-start-1 flex items-center justify-end gap-1.5 text-sec text-fg tabular-nums">
        {day.manualUpdates > 0 ? (
          <>
            <Icon icon={History} size={16} />
            {day.manualUpdates}
          </>
        ) : (
          <span className={TONE_TEXT.inactive}>
            <StatusShape shape="dash" size={10} />
          </span>
        )}
      </span>
    </li>
  )
}

function Legend({ hasActive }: { hasActive: boolean }) {
  const item = 'flex items-center gap-2'
  const swatch = 'h-3 w-4 shrink-0 rounded-tile'
  return (
    <ul aria-hidden="true" className="flex flex-wrap gap-x-5 gap-y-2 text-label text-fg">
      <li className={item}>
        <span className={cn(swatch, SEGMENT.completed)} />
        {INSIGHTS_TEXT.legendCompleted}
      </li>
      <li className={item}>
        <span className={cn(swatch, SEGMENT.expired)} />
        {INSIGHTS_TEXT.legendExpired}
      </li>
      <li className={item}>
        <span className={cn(swatch, SEGMENT.cancelled)} />
        {INSIGHTS_TEXT.legendCancelled}
      </li>
      {hasActive && (
        <li className={item}>
          <span className={cn(swatch, SEGMENT.active)} />
          {INSIGHTS_TEXT.legendActive}
        </li>
      )}
      <li className={item}>
        <Icon icon={History} size={16} />
        {INSIGHTS_TEXT.legendManual}
      </li>
      <li className={item}>
        <span className={TONE_TEXT.inactive}>
          <StatusShape shape="dash" size={10} />
        </span>
        {INSIGHTS_TEXT.legendNoManual}
      </li>
    </ul>
  )
}

/**
 * «La semana día a día»: one row per day, oldest first and today last. The bar is how the reservations created that day
 * ended (with check-in, expired without check-in, cancelled, still active), as wide as that day against the busiest one;
 * on the right, the table changes made by hand (the history icon of Bitácora, or a dash for none). The visual part is hidden
 * from screen readers: ChartTable says the same in words.
 */
export function WeekChart({ metrics, today }: { metrics: InsightsMetrics; today: string }) {
  const max = Math.max(1, ...metrics.daily.map((day) => day.created))
  const [slot] = metrics.topSlots
  return (
    <Card as="section" aria-labelledby="week-title" className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 id="week-title" className="text-h2 text-fg">
          {INSIGHTS_TEXT.weekTitle}
        </h2>
        <p className="text-sec text-fg-2">{INSIGHTS_TEXT.daysWithManualUpdates(metrics.daysWithManualUpdates, metrics.daily.length)}</p>
      </div>
      <ul aria-hidden="true" className="flex flex-col gap-3">
        <li className="grid grid-weekday-row gap-3 text-label text-fg-2">
          <span />
          <span>{INSIGHTS_TEXT.columnReservations}</span>
          <span className="text-right">{INSIGHTS_TEXT.columnManual}</span>
        </li>
        {metrics.daily.map((day) => (
          <DayRow key={day.date} day={day} max={max} isToday={day.date === today} />
        ))}
      </ul>
      <Legend hasActive={metrics.daily.some((day) => activeOf(day) > 0)} />
      <p className="text-sec font-bold text-fg">
        {slot ? INSIGHTS_TEXT.topSlot(slot.dayOfWeek, slot.hour, slot.reservations) : INSIGHTS_TEXT.noTopSlot}
      </p>
      <ChartTable
        caption={INSIGHTS_TEXT.weekChartLabel}
        headers={INSIGHTS_TEXT.chartHeaders}
        rows={metrics.daily.map((day) => ({
          label: day.date === today ? `${INSIGHTS_TEXT.today}, ${formatLongDay(day.date)}` : formatLongDay(day.date),
          value: INSIGHTS_TEXT.dayDetail(day.created, day.completed, day.cancelled, day.expired, day.manualUpdates),
        }))}
      />
    </Card>
  )
}
