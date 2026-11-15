import { useSearchParams } from 'react-router'
import { Button, EmptyState, PageHeader, Skeleton } from '@/components/ui'
import { useDelayedFlag } from '@/lib/use-delayed-flag'
import { BillingDetail } from './components/BillingDetail'
import { BillingHero } from './components/BillingHero'
import { PeriodSelector, type PeriodPreset } from './components/PeriodSelector'
import { ReservationsStory } from './components/ReservationsStory'
import { RhythmSection } from './components/RhythmSection'
import { useSummaryQuery } from './hooks'
import { describeReportError, SUMMARY_TEXT } from './messages'
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

function SummarySkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-8">
      <span role="status" className="sr-only">
        Cargando el resumen
      </span>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-14 w-72" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton radius="card" className="h-32" />
    </div>
  )
}

/**
 * `/resumen` (CLAUDE.md §12.12): what DiNNo brings the restaurant and what is owed for it, by period. One big figure
 * («A cobrar»), the story of the period's reservations in a bar and a few lines, the rhythm (peak hours, busiest days) and
 * the check-ins behind the figure. Sections are told apart by space and hairlines, not by a grid of cards.
 */
export default function SummaryPage() {
  const [params, setParams] = useSearchParams()
  const today = bogotaToday()
  const preset = PRESET_BY_PARAM[params.get('periodo') ?? ''] ?? 'month'
  const range = resolveRange(preset, today, params)
  const rangeProblem = preset === 'custom' ? validatePeriod(range, today) : undefined
  const period = rangeProblem ? null : range
  const summary = useSummaryQuery(period)
  const showSkeleton = useDelayedFlag(summary.isPending && period !== null)
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
    body = (
      <EmptyState
        variant="error"
        title={SUMMARY_TEXT.invalidPeriod}
        description={rangeProblem}
      />
    )
  } else if (data) {
    body = (
      <div className="flex flex-col gap-10 divide-y divide-line *:pt-10 first:*:pt-0">
        <BillingHero billing={data.billing} />
        <ReservationsStory summary={data} />
        <RhythmSection summary={data} />
        <BillingDetail key={`${period.from}-${period.to}`} period={period} />
      </div>
    )
  } else if (summary.isError) {
    body = (
      <EmptyState
        variant="error"
        title={describeReportError(summary.error, SUMMARY_TEXT.loadError)}
        action={
          <Button variant="secondary" onClick={() => void summary.refetch()}>
            {SUMMARY_TEXT.retry}
          </Button>
        }
      />
    )
  } else {
    body = showSkeleton ? <SummarySkeleton /> : <div aria-busy="true" className="min-h-64" />
  }

  return (
    <>
      <PageHeader title={SUMMARY_TEXT.title} description={SUMMARY_TEXT.description} />
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
