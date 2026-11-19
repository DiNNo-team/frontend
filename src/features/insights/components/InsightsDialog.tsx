import { RefreshCw } from 'lucide-react'
import { Alert, Button, Card, Dialog, EmptyState, Skeleton } from '@/components/ui'
import { useDelayedFlag } from '@/lib/use-delayed-flag'
import { useInsightsQuery, useMinuteClock, useRefreshInsights } from '../hooks'
import { generatedAgoText, insightsScreenState, isRateLimited, type InsightsScreenState } from '../insights-view'
import { INSIGHTS_TEXT } from '../messages'
import type { RestaurantInsights } from '../types'
import { Recommendations } from './Recommendations'
import { ReliabilityScale } from './ReliabilityScale'
import { NotEnoughData, WeekHeadline } from './WeekHeadline'

function LoadingBlocks() {
  return (
    <div role="status" aria-label={INSIGHTS_TEXT.loading} className="flex flex-col gap-5">
      <Skeleton radius="card" className="h-72" />
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

/** What goes in the dialog, by state (insights-view.ts decides it from the fields, never from the text). */
function Body({ state, now, showSkeleton, onRetry }: BodyProps) {
  switch (state.kind) {
    case 'loading':
      return showSkeleton ? <LoadingBlocks /> : null
    case 'access-error':
      return <EmptyState variant="error" title={state.message} />
    case 'rate-limited':
    case 'error':
      return (
        <EmptyState
          variant="error"
          title={INSIGHTS_TEXT.errorTitle}
          description={state.message}
          action={
            <Button variant="secondary" onClick={onRetry}>
              {INSIGHTS_TEXT.retry}
            </Button>
          }
        />
      )
    case 'empty':
      return (
        <div className="flex flex-col items-center gap-2">
          <EmptyState title={INSIGHTS_TEXT.emptyTitle} description={INSIGHTS_TEXT.emptyDescription} />
          <UpdatedAgo report={state.report} now={now} />
        </div>
      )
    case 'insufficient':
      return (
        <Card as="section" aria-label={INSIGHTS_TEXT.insufficientTitle} className="flex flex-col gap-4">
          <NotEnoughData report={state.report} missing={state.missing} />
          <UpdatedAgo report={state.report} now={now} />
        </Card>
      )
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
          <Recommendations narrative={report.narrative} generatedAt={report.generatedAt} now={now} />
        </div>
      )
    }
  }
}

interface InsightsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * «Informe de la semana» (Sprint 4, contract §12.16) in a large dialog over Resumen, with the blurred veil: the check-in rate
 * with its four figures and the reliability, then the recommendations, marked as generated. The report is asked only while
 * the dialog is open (each GET counts for the limit of 10 per minute). «Actualizar informe» asks for a new one and keeps the
 * one on screen meanwhile; a failure keeps it too, and a 429 is never retried on its own.
 */
export function InsightsDialog({ open, onOpenChange }: InsightsDialogProps) {
  const report = useInsightsQuery({ enabled: open })
  const refresh = useRefreshInsights()
  const now = useMinuteClock()
  const state = insightsScreenState(report.data, report.error)
  const showSkeleton = useDelayedFlag(open && state.kind === 'loading')
  const period = report.data?.period

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // A failed «Actualizar» is old news the next time the dialog opens.
        if (!next) refresh.reset()
        onOpenChange(next)
      }}
      size="lg"
      veil="blur"
      title={INSIGHTS_TEXT.title}
      description={period ? INSIGHTS_TEXT.periodRange(period.from, period.to) : INSIGHTS_TEXT.description}
      closeLabel={INSIGHTS_TEXT.close}
      headerActions={
        report.data && (
          <Button variant="outline" icon={RefreshCw} loading={refresh.isPending} loadingText={INSIGHTS_TEXT.refreshing} onClick={() => refresh.mutate()}>
            {INSIGHTS_TEXT.refresh}
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-5">
        {refresh.isError &&
          (isRateLimited(refresh.error) ? (
            <Alert type="warning">{INSIGHTS_TEXT.rateLimitedRefresh}</Alert>
          ) : (
            <Alert type="error">{INSIGHTS_TEXT.refreshError}</Alert>
          ))}
        <Body state={state} now={now} showSkeleton={showSkeleton} onRetry={() => void report.refetch()} />
      </div>
    </Dialog>
  )
}
