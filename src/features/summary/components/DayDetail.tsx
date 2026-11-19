import { Alert, Button, Card, Skeleton } from '@/components/ui'
import { formatTableName } from '@/lib/format'
import { matchesPerGuestFee } from '@/lib/per-guest-fee'
import { useDelayedFlag } from '@/lib/use-delayed-flag'
import { dayValue, type CalendarDay } from '../calendar'
import { formatBogotaTime, formatCop, formatLongDay } from '../format'
import { useBillingQuery } from '../hooks'
import { describeReportError, SUMMARY_TEXT } from '../messages'

/** One day has at most a few hundred check-ins; the API gives 200 per page, more than a restaurant can seat in a day. */
const DAY_PAGE_SIZE = 200

function Tile({ value, label, tone }: { value: number; label: string; tone?: 'ok' }) {
  return (
    <div className="flex flex-col rounded-tile bg-surface-2 p-3">
      <dd className={tone === 'ok' ? 'text-h2 text-ok tabular-nums' : 'text-h2 text-fg tabular-nums'}>{value}</dd>
      <dt className="text-label text-fg-2">{label}</dt>
    </div>
  )
}

/**
 * «Detalle del día»: the figures of the chosen day (they come with the summary) and its check-ins (hour, table, people, fee),
 * asked on their own so that a failing list never takes the rest down. The region is announced when the day changes
 * (`aria-live`). It never shows who the diner was. «Valor del día» is the sum of the fees the check-ins kept.
 */
export function DayDetail({ day, feePerGuestCop }: { day: CalendarDay | null; feePerGuestCop?: number }) {
  const query = useBillingQuery(day ? { from: day.date, to: day.date } : null, 1, DAY_PAGE_SIZE)
  const showSkeleton = useDelayedFlag(query.isPending && day !== null)
  const items = query.data?.items ?? []
  // Oldest first: the day reads from morning to night.
  const ordered = [...items].sort((a, b) => a.checkedInAt.localeCompare(b.checkedInAt))

  return (
    <Card as="section" aria-labelledby="day-title" className="flex flex-col gap-4">
      <div aria-live="polite" className="flex flex-col gap-1">
        <h2 id="day-title" className="text-kicker text-fg-2 uppercase">
          {SUMMARY_TEXT.dayTitle}
        </h2>
        <p className="text-h1 text-fg">{day ? formatLongDay(day.date) : SUMMARY_TEXT.dayNone}</p>
      </div>
      {day && (
        <>
          <dl className="grid grid-cols-2 gap-2">
            <Tile value={day.reservations} label={SUMMARY_TEXT.dayReservations} />
            <Tile value={day.guests} label={SUMMARY_TEXT.dayGuests} />
            <Tile value={day.checkIns} label={SUMMARY_TEXT.dayCheckIns} tone="ok" />
            <Tile value={day.cancelledOrExpired} label={SUMMARY_TEXT.dayCancelledOrExpired} />
          </dl>
          <div className="flex flex-col gap-1">
            <h3 className="text-body font-bold text-fg">{SUMMARY_TEXT.dayCheckInsTitle}</h3>
            {query.isError && !query.data ? (
              <Alert
                type="error"
                action={
                  <Button size="sm" variant="outline" onClick={() => void query.refetch()}>
                    {SUMMARY_TEXT.retry}
                  </Button>
                }
              >
                {describeReportError(query.error, SUMMARY_TEXT.dayLoadError)}
              </Alert>
            ) : query.isPending ? (
              <div aria-busy="true" role="status">
                <span className="sr-only">{SUMMARY_TEXT.dayCheckInsTitle}</span>
                {showSkeleton && <Skeleton className="h-16 w-full" />}
              </div>
            ) : ordered.length === 0 ? (
              <p className="text-sec text-fg-2">{SUMMARY_TEXT.dayCheckInsEmpty}</p>
            ) : (
              <ul className="flex flex-col divide-y divide-line">
                {ordered.map((item) => (
                  <li key={item.checkInId} className="flex flex-wrap items-baseline justify-between gap-x-3 py-2.5 text-body text-fg tabular-nums">
                    <span>{SUMMARY_TEXT.dayCheckInLine(formatBogotaTime(item.checkedInAt), formatTableName(item.tableIdentifier))}</span>
                    <span className="flex gap-3">
                      <span className="text-fg-2">
                        {matchesPerGuestFee(item, feePerGuestCop)
                          ? SUMMARY_TEXT.feeFormula(item.partySize, feePerGuestCop ?? 0)
                          : item.partySize === 1
                            ? '1 persona'
                            : `${item.partySize} personas`}
                      </span>
                      <span>{formatCop(item.feeCop)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="flex items-center justify-between gap-3 text-body text-fg">
            <span>{SUMMARY_TEXT.dayValue}</span>
            <strong className="tabular-nums">{query.data ? formatCop(dayValue(items)) : '—'}</strong>
          </p>
        </>
      )}
    </Card>
  )
}
