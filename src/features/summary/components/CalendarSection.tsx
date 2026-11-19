import { useState } from 'react'
import { Card } from '@/components/ui'
import { bogotaToday } from '../period'
import { buildMonth, defaultDay, monthOfDay, monthsOfPeriod } from '../calendar'
import type { RestaurantSummary } from '../types'
import { DayDetail } from './DayDetail'
import { MonthCalendar } from './MonthCalendar'

interface Choice {
  /** The period the choice was made in: another period starts over. */
  key: string
  day?: string
  month?: string
}

/**
 * Block 2: the calendar of the period and the detail of the chosen day. A period of several months has one calendar per month
 * with arrows to move between them. The day selected on opening is today (if it is in the period) or the last day with data;
 * on a narrow screen the detail goes below the calendar. A choice belongs to its period.
 */
export function CalendarSection({ summary }: { summary: RestaurantSummary }) {
  const today = bogotaToday()
  const period = { from: summary.period.from, to: summary.period.to }
  const key = `${period.from}|${period.to}`
  const [choice, setChoice] = useState<Choice>({ key })
  const own = choice.key === key ? choice : { key }
  const months = monthsOfPeriod(period)
  const selected = own.day && summary.byDate.some((entry) => entry.date === own.day) ? own.day : defaultDay(summary.byDate, today)
  const month = own.month && months.includes(own.month) ? own.month : selected ? monthOfDay(selected) : months[months.length - 1]
  const day = selected ? (buildMonth(monthOfDay(selected), summary.byDate, period, today).days.find((entry) => entry.date === selected) ?? null) : null

  return (
    <div className="grid items-start gap-5 lg:grid-cols-calendar">
      <Card as="section" aria-labelledby="calendar-title">
        <MonthCalendar
          month={month}
          months={months}
          byDate={summary.byDate}
          period={period}
          today={today}
          selected={selected}
          onSelect={(next) => setChoice({ key, day: next, month: monthOfDay(next) })}
          onMonthChange={(next) => setChoice({ key, day: own.day, month: next })}
        />
      </Card>
      <DayDetail day={day} feePerGuestCop={summary.billing.currentFeePerGuestCop} />
    </div>
  )
}
