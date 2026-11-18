import { RefreshCw } from 'lucide-react'
import { Alert, Button, Card, EmptyState, PageHeader, Skeleton } from '@/components/ui'
import { useDelayedFlag } from '@/lib/use-delayed-flag'
import { NotEnoughData, WeekHeadline } from './components/WeekHeadline'
import { Recommendations } from './components/Recommendations'
import { ReliabilityScale } from './components/ReliabilityScale'
import { WeekChart } from './components/WeekChart'
import { useInsightsQuery, useMinuteClock, useRefreshInsights } from './hooks'
import { generatedAgoText, insightsScreenState, isRateLimited, type InsightsScreenState } from './insights-view'
import { INSIGHTS_TEXT } from './messages'
import type { RestaurantInsights } from './types'

function LoadingBlocks() {
  return (
    <div role="status" aria-label={INSIGHTS_TEXT.loading} className="flex flex-col gap-5">
      <Skeleton radius="card" className="h-72" />
      <Skeleton radius="card" className="h-96" />
      <Skeleton radius="card" className="h-48" />
    </div>
  )
}

function UpdatedAgo({ report, now }: { report: RestaurantInsights; now: Date }) {
  const ago = generatedAgoText(report.generatedAt, now)
  return ago === null ? null : <p className="text-label text-fg-2">{INSIGHTS_TEXT.updatedAgo(ago)}</p>
}

interface BodyProps {
  state: InsightsScreenState
  now: Date
  showSkeleton: boolean
  onRetry: () => void
}

/** What goes under the header, by state (insights-view.ts decides it from the fields, never from the text). */
function Body({ state, now, showSkeleton, onRetry }: BodyProps) {
  const retry = (
    <Button variant="secondary" onClick={onRetry}>
      {INSIGHTS_TEXT.retry}
    </Button>
  )
  switch (state.kind) {
    case 'loading':
      return showSkeleton ? <LoadingBlocks /> : null
    case 'access-error':
      return <EmptyState variant="error" title={state.message} />
    case 'rate-limited':
    case 'error':
      return <EmptyState variant="error" title={INSIGHTS_TEXT.errorTitle} description={state.message} action={retry} />
    case 'empty':
      return (
        <div className="flex flex-col items-center gap-2">
          <EmptyState title={INSIGHTS_TEXT.emptyTitle} description={INSIGHTS_TEXT.emptyDescription} />
          <UpdatedAgo report={state.report} now={now} />
        </div>
      )
    case 'insufficient': {
      const { report } = state
      return (
        <div className="flex flex-col gap-5">
          <Card as="section" aria-label={INSIGHTS_TEXT.insufficientTitle} className="flex flex-col gap-4">
            <NotEnoughData report={report} missing={state.missing} />
            <UpdatedAgo report={report} now={now} />
          </Card>
          <WeekChart metrics={report.metrics} today={report.period.to} />
        </div>
      )
    }
    case 'ready-llm':
    case 'ready-template': {
      const { report } = state
      return (
        <div className="flex flex-col gap-5">
          <Card as="section" aria-label={INSIGHTS_TEXT.checkInKicker} className="grid gap-6 lg:grid-cols-hero">
            <WeekHeadline report={report} />
            <div className="border-t border-line pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
              <ReliabilityScale reliability={report.reliability} />
            </div>
          </Card>
          <WeekChart metrics={report.metrics} today={report.period.to} />
          <Recommendations narrative={report.narrative} generatedAt={report.generatedAt} now={now} />
        </div>
      )
    }
  }
}

/**
 * «Informe de la semana» (Sprint 4, Task 2.1.2; contract in the backend CLAUDE.md §12.16): the last 7 days of the restaurant,
 * today included. Reads top to bottom as a story: what happened (check-in rate and its change) · how reliable the
 * availability is · day by day · what to do (the recommendations, marked as generated). «Actualizar informe» asks for a new
 * report and keeps the one on screen meanwhile; a failure keeps it too. Nothing is retried on its own after a 429.
 */
export default function InsightsPage() {
  const report = useInsightsQuery()
  const refresh = useRefreshInsights()
  const now = useMinuteClock()
  const state = insightsScreenState(report.data, report.error)
  const showSkeleton = useDelayedFlag(state.kind === 'loading')
  const period = report.data?.period

  return (
    <>
      <PageHeader
        title={INSIGHTS_TEXT.title}
        description={period ? INSIGHTS_TEXT.periodRange(period.from, period.to) : INSIGHTS_TEXT.description}
        actions={
          report.data && (
            <Button
              variant="outline"
              icon={RefreshCw}
              loading={refresh.isPending}
              loadingText={INSIGHTS_TEXT.refreshing}
              onClick={() => refresh.mutate()}
            >
              {INSIGHTS_TEXT.refresh}
            </Button>
          )
        }
      />
      {refresh.isError &&
        (isRateLimited(refresh.error) ? (
          <Alert type="warning">{INSIGHTS_TEXT.rateLimitedRefresh}</Alert>
        ) : (
          <Alert type="error">{INSIGHTS_TEXT.refreshError}</Alert>
        ))}
      <Body state={state} now={now} showSkeleton={showSkeleton} onRetry={() => void report.refetch()} />
    </>
  )
}
