import { useSearchParams } from 'react-router'
import { EmptyState, PageHeader } from '@/components/ui'
import { BlockState } from '@/features/admin-overview/components/BlockState'
import { InsightsLauncher } from '@/features/insights/InsightsLauncher'
import { CalendarSection } from './components/CalendarSection'
import { DemandBlock } from './components/DemandBlock'
import { GuestsAndPayment } from './components/GuestsAndPayment'
import { GuestsByMonth } from './components/GuestsByMonth'
import { PaymentDetail } from './components/PaymentDetail'
import { PeriodSelector, type PeriodPreset } from './components/PeriodSelector'
import { ReservationStatus } from './components/ReservationStatus'
import { useSummaryQuery } from './hooks'
import { SUMMARY_TEXT } from './messages'
import { bogotaToday, previousMonth, thisMonth, validatePeriod } from './period'
import type { PeriodRange } from './types'

// The period lives in the URL (?periodo=anterior, ?periodo=personalizado&desde=…&hasta=…): «back», a reload and a link keep it.
const PRESET_BY_PARAM: Record<string, PeriodPreset> = { mes: 'month', anterior: 'previous', personalizado: 'custom' }
const PARAM_BY_PRESET: Record<PeriodPreset, string> = { month: 'mes', previous: 'anterior', custom: 'personalizado' }

function resolveRange(preset: PeriodPreset, today: string, params: URLSearchParams): PeriodRange {
  if (preset === 'month') return thisMonth(today)
  if (preset === 'previous') return previousMonth(today)
  return { from: params.get('desde') ?? '', to: params.get('hasta') ?? '' }
}

/**
 * `/resumen` (CLAUDE.md §12.12 and docs/restaurant-summary-contract.md): what DiNNo brought the restaurant, how the reservations
 * went and what it pays, by period. Five blocks in this order: guests and payment · calendar and the day · guests by month and
 * the state of the reservations · hours of most demand · detail of the payment. The first four read the same answer
 * (`/summary`), so they load and fail together; the detail of the payment and the check-ins of a day ask on their own and fail
 * on their own. Sections are cards on the sheet, as in the rest of the dashboard.
 */
export default function SummaryPage() {
  const [params, setParams] = useSearchParams()
  const today = bogotaToday()
  const preset = PRESET_BY_PARAM[params.get('periodo') ?? ''] ?? 'month'
  const range = resolveRange(preset, today, params)
  const rangeProblem = preset === 'custom' ? validatePeriod(range, today) : undefined
  const period = rangeProblem ? null : range
  const summary = useSummaryQuery(period)
  const data = summary.data

  function changePreset(next: PeriodPreset) {
    const nextParams = new URLSearchParams()
    nextParams.set('periodo', PARAM_BY_PRESET[next])
    if (next === 'custom') {
      const start = thisMonth(today)
      nextParams.set('desde', start.from)
      nextParams.set('hasta', start.to)
    }
    setParams(nextParams)
  }

  let body
  if (period === null) {
    body = <EmptyState variant="error" title={SUMMARY_TEXT.invalidPeriod} description={rangeProblem} />
  } else {
    body = (
      <div className="flex flex-col gap-5">
        <BlockState query={summary} skeleton="h-96" loadingLabel={SUMMARY_TEXT.loading}>
          {data && (
            <>
              <GuestsAndPayment summary={data} />
              <CalendarSection summary={data} />
              <div className="grid items-start gap-5 lg:grid-cols-2">
                <GuestsByMonth months={data.monthly} />
                <ReservationStatus reservations={data.reservations} />
              </div>
              <DemandBlock summary={data} />
            </>
          )}
        </BlockState>
        <PaymentDetail key={`${period.from}-${period.to}`} period={period} />
      </div>
    )
  }

  return (
    <>
      {/* «Ver informe de la semana» (Sergio, Sprint 4): the button and its dialog live in features/insights. */}
      <PageHeader title={SUMMARY_TEXT.title} description={SUMMARY_TEXT.description} actions={<InsightsLauncher />} />
      <PeriodSelector
        key={PARAM_BY_PRESET[preset]}
        preset={preset}
        range={range}
        today={today}
        updating={Boolean(data) && summary.isFetching}
        onPresetChange={changePreset}
        onApplyCustom={(next) => setParams({ periodo: 'personalizado', desde: next.from, hasta: next.to })}
      />
      {body}
    </>
  )
}
