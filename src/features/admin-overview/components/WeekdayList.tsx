import { Card, EmptyState } from '@/components/ui'
import { cn } from '@/lib/cn'
import { BarTrack } from '@/features/summary/components/BarTrack'
import { ChartTable } from '@/features/summary/components/ChartTable'
import { formatAverage } from '../../admin/format'
import { monthName } from '../../admin/month'
import type { WeekdayStat } from '../data'
import { OVERVIEW_TEXT } from '../messages'

/** «Días de la semana»: from the busiest to the quietest, with the total and the average per day. Only the first is orange. */
export function WeekdayList({ stats, month }: { stats: WeekdayStat[]; month: string }) {
  const max = Math.max(1, ...stats.map((stat) => stat.total))
  const empty = stats.every((stat) => stat.total === 0)
  return (
    <Card as="section" aria-labelledby="weekdays-title" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id="weekdays-title" className="text-h2 text-fg">
          {OVERVIEW_TEXT.weekdaysTitle}
        </h2>
        <p className="text-sec text-fg-2">{OVERVIEW_TEXT.weekdaysDescription(monthName(month))}</p>
      </div>
      {empty ? (
        <EmptyState title={OVERVIEW_TEXT.dailyEmpty} />
      ) : (
        <>
          <ol aria-hidden="true" className="flex flex-col gap-3">
            {stats.map((stat, index) => (
              <li key={stat.dayOfWeek} className="grid grid-weekday-row items-center gap-3">
                <span className={cn('text-sec font-bold', index === 0 ? 'text-accent-text' : 'text-fg')}>{stat.name}</span>
                <BarTrack value={stat.total} max={max} fillClassName={index === 0 ? 'fill-accent' : 'fill-fg'} />
                <span className="flex flex-col items-end leading-tight tabular-nums">
                  <span className="text-sec font-bold text-fg">{stat.total}</span>
                  <span className="whitespace-nowrap text-label font-medium text-fg-2">{OVERVIEW_TEXT.average(formatAverage(stat.average))}</span>
                </span>
              </li>
            ))}
          </ol>
          <ChartTable
            caption={OVERVIEW_TEXT.weekdaysTitle}
            headers={['Día', 'Reservas (promedio por día)']}
            rows={stats.map((stat) => ({ label: stat.name, value: `${stat.total} (${formatAverage(stat.average)})` }))}
          />
        </>
      )}
    </Card>
  )
}
