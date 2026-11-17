import { Card } from '@/components/ui'
import { MonthBars } from '@/features/admin-overview/components/MonthBars'
import { monthName } from '../../admin/month'
import { SUMMARY_TEXT } from '../messages'
import type { SummaryMonth } from '../types'
import { ChartTable } from './ChartTable'

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/**
 * «Comensales por mes»: the guests of the last six months, one bar each. The month in progress is striped (and says so in
 * words). The bars are the administrator's `MonthBars`, read only: here nothing is chosen.
 */
export function GuestsByMonth({ months }: { months: SummaryMonth[] }) {
  const current = months.find((entry) => entry.inProgress)
  return (
    <Card as="section" aria-labelledby="months-title" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id="months-title" className="text-h2 text-fg">
          {SUMMARY_TEXT.monthsTitle}
        </h2>
        <p className="text-sec text-fg-2">{SUMMARY_TEXT.monthsDescription}</p>
      </div>
      <MonthBars
        compact
        bars={months.map((entry) => ({ month: entry.month, value: entry.guests }))}
        current={current?.month ?? ''}
        formatValue={String}
        describe={(month, value, inProgress) => SUMMARY_TEXT.monthsBar(capitalize(month), Number(value), inProgress)}
        groupLabel={SUMMARY_TEXT.monthsGroup}
      />
      {current && <p className="text-label text-fg-2">{SUMMARY_TEXT.monthsNote(capitalize(monthName(current.month)))}</p>}
      <ChartTable
        caption={SUMMARY_TEXT.monthsTitle}
        headers={['Mes', 'Comensales']}
        rows={months.map((entry) => ({ label: capitalize(monthName(entry.month)), value: entry.guests }))}
      />
    </Card>
  )
}
