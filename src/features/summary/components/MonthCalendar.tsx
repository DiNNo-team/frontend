import { useRef, type KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { IconButton } from '@/components/ui'
import { cn } from '@/lib/cn'
import { monthName } from '../../admin/month'
import { buildMonth, type CalendarDay } from '../calendar'
import { formatDayMonth } from '../format'
import { HEAT_LEVEL_CLASS } from '../heat'
import { SUMMARY_TEXT } from '../messages'
import type { PeriodRange, SummaryDay } from '../types'


interface MonthCalendarProps {
  /** The month shown, `YYYY-MM`. */
  month: string
  months: string[]
  byDate: SummaryDay[]
  period: PeriodRange
  today: string
  selected: string | null
  onSelect: (date: string) => void
  onMonthChange: (month: string) => void
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

function labelOf(day: CalendarDay): string {
  const date = formatDayMonth(day.date)
  if (day.kind === 'future') return SUMMARY_TEXT.calendarDayFuture(date)
  if (day.kind === 'outside') return SUMMARY_TEXT.calendarDayOutside(date)
  return SUMMARY_TEXT.calendarDay(date, day.reservations, day.checkIns)
}

/**
 * One month, Monday first. Each day is a button with its words (`aria-label`) and `aria-pressed`; its tone is the reservations
 * created (six tones) and the green circle with a number is the check-ins. Days that have not come yet are dotted and cannot
 * be chosen. The grid is one tab stop: the arrows move between days (±1 and ±7), Home and End go to the first and last day.
 */
export function MonthCalendar({ month, months, byDate, period, today, selected, onSelect, onMonthChange }: MonthCalendarProps) {
  const grid = useRef<HTMLDivElement>(null)
  const calendar = buildMonth(month, byDate, period, today)
  const enabled = calendar.days.filter((day) => day.kind === 'data')
  const tabStop = enabled.find((day) => day.date === selected)?.date ?? enabled[0]?.date
  const index = months.indexOf(month)

  function move(event: KeyboardEvent<HTMLDivElement>) {
    const steps: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
    const current = enabled.findIndex((day) => day.date === document.activeElement?.getAttribute('data-date'))
    if (current < 0) return
    let next = current
    if (event.key in steps) next = Math.min(enabled.length - 1, Math.max(0, current + steps[event.key]))
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = enabled.length - 1
    else return
    event.preventDefault()
    grid.current?.querySelector<HTMLButtonElement>(`[data-date="${enabled[next].date}"]`)?.focus()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="calendar-title" className="text-h2 text-fg">
            {capitalize(monthName(month))}
          </h2>
          <p className="text-sec text-fg-2">{SUMMARY_TEXT.calendarHint}</p>
        </div>
        {months.length > 1 && (
          <div className="flex items-center">
            <IconButton icon={ChevronLeft} label={SUMMARY_TEXT.calendarPrevious} size="sm" disabled={index <= 0} onClick={() => onMonthChange(months[index - 1])} />
            <IconButton icon={ChevronRight} label={SUMMARY_TEXT.calendarNext} size="sm" disabled={index >= months.length - 1} onClick={() => onMonthChange(months[index + 1])} />
          </div>
        )}
        {month === today.slice(0, 7) && months.length === 1 && (
          <p className="text-label text-fg-2 tabular-nums">{SUMMARY_TEXT.calendarDayOf(Number(today.slice(8)), calendar.days.length)}</p>
        )}
      </div>

      <div ref={grid} role="group" aria-labelledby="calendar-title" onKeyDown={move} className="grid grid-cols-7 gap-1.5">
        {SUMMARY_TEXT.calendarWeekdays.map((letter, position) => (
          <span key={letter + position} aria-hidden="true" className="text-center text-label text-fg-2">
            {letter}
          </span>
        ))}
        {Array.from({ length: calendar.leadingBlanks }, (_, position) => (
          <span key={`blank-${position}`} aria-hidden="true" />
        ))}
        {calendar.days.map((day) => {
          const chosen = day.date === selected
          const usable = day.kind === 'data'
          return (
            <button
              key={day.date}
              type="button"
              data-date={day.date}
              disabled={!usable}
              aria-pressed={usable ? chosen : undefined}
              aria-label={labelOf(day)}
              tabIndex={day.date === tabStop ? 0 : -1}
              onClick={() => onSelect(day.date)}
              className={cn(
                'relative flex min-h-11 aspect-square flex-col justify-between rounded-tile p-1.5 text-left md:p-2',
                usable ? cn('cursor-pointer', HEAT_LEVEL_CLASS[day.level], day.level === 5 ? 'text-on-accent' : 'text-fg') : 'cursor-default border border-dashed border-line text-fg-2',
                day.kind === 'outside' && 'opacity-45',
                chosen && 'outline-2 outline-offset-2 outline-fg',
              )}
            >
              <span aria-hidden="true" className="text-label font-bold tabular-nums">
                {day.day}
              </span>
              {usable && day.reservations > 0 && (
                <span aria-hidden="true" className="hidden text-label tabular-nums md:block">
                  {SUMMARY_TEXT.calendarShortReservations(day.reservations)}
                </span>
              )}
              {usable && day.checkIns > 0 && (
                <span aria-hidden="true" className="absolute top-1 right-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-ok px-1 text-label font-extrabold text-on-brand tabular-nums">
                  {day.checkIns}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <p aria-hidden="true" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-label text-fg-2">
        <span className="inline-flex items-center gap-1.5">
          {SUMMARY_TEXT.calendarLegendReservations} {SUMMARY_TEXT.calendarLegendLess}
          {HEAT_LEVEL_CLASS.map((tone) => (
            <span key={tone} className={cn('size-3 rounded-tile', tone)} />
          ))}
          {SUMMARY_TEXT.calendarLegendMore}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="grid h-4 min-w-4 place-items-center rounded-full bg-ok px-1 text-label font-extrabold text-on-brand">2</span>
          {SUMMARY_TEXT.calendarLegendCheckIns}
        </span>
      </p>
    </div>
  )
}
