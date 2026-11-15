import { STATUS_META, StatusShape, TONE_TEXT, type Status } from '@/components/ui'
import { cn } from '@/lib/cn'
import {
  cancellationSentence,
  conversionSentence,
  noShowSentence,
  SUMMARY_TEXT,
} from '../messages'
import type { RestaurantSummary } from '../types'
import { ChartTable } from './ChartTable'
import { HelpToggle } from './HelpToggle'

type Reservations = RestaurantSummary['reservations']

interface Segment {
  key: keyof typeof SUMMARY_TEXT.legend
  count: number
  /** The kit status whose shape and tone tell the state (never orange). */
  status: Status
  fill: string
}

function segmentsOf({ completed, cancelled, expired, active }: Reservations): Segment[] {
  return [
    { key: 'arrived', count: completed, status: 'reservation-completed', fill: 'fill-fg' },
    { key: 'cancelled', count: cancelled, status: 'reservation-cancelled', fill: 'fill-inactive' },
    { key: 'expired', count: expired, status: 'reservation-expired', fill: 'fill-line-strong' },
    { key: 'active', count: active, status: 'reservation-active', fill: 'fill-ok' },
  ]
}

/** One bar that splits the reservations created in the period by how they ended. Decorative: the legend and the table say it. */
function StackedBar({ segments, total }: { segments: Segment[]; total: number }) {
  const gap = 0.6
  const visible = segments.filter((segment) => segment.count > 0)
  // Each segment starts where the ones before it end: the running sum of their shares.
  const placed = visible.map((segment, index) => ({
    segment,
    x: (visible.slice(0, index).reduce((sum, before) => sum + before.count, 0) / total) * 100,
    width: (segment.count / total) * 100,
  }))
  return (
    <svg viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true" className="h-3 w-full">
      {placed.map(({ segment, x, width }) => (
        <rect
          key={segment.key}
          x={x}
          width={Math.max(0, width - (visible.length > 1 ? gap : 0))}
          height="12"
          className={cn('animate-grow-x animate-grow-origin', segment.fill)}
        />
      ))}
    </svg>
  )
}

/** A rate as its own line: its phrase with its own denominator, and the exact counts behind it; `null` is «Sin datos». */
function RateLine({ rate, label, sentence, detail }: { rate: number | null; label: string; sentence: (rate: number) => string; detail: string }) {
  return (
    <li className="flex flex-col gap-0.5">
      {rate === null ? (
        <>
          <p className="text-body text-fg">
            <span aria-hidden="true">— </span>
            {SUMMARY_TEXT.noData}
          </p>
          <p className="text-sec text-fg-2">{label}</p>
        </>
      ) : (
        <>
          <p className="text-body text-fg">{sentence(rate)}</p>
          <p className="text-sec text-fg-2 tabular-nums">{detail}</p>
        </>
      )}
    </li>
  )
}

/**
 * How the period's reservations ended, told with one bar and a few short lines instead of a grid of cards. Every rate has
 * its own sentence with its own denominator (they are not the same one), and a help explains each definition.
 */
export function ReservationsStory({ summary }: { summary: RestaurantSummary }) {
  const { reservations, rates, averagePartySize } = summary
  const segments = segmentsOf(reservations)
  const resolved = reservations.completed + reservations.expired

  if (reservations.created === 0) {
    return (
      <section aria-labelledby="story-title" className="flex flex-col gap-3">
        <h2 id="story-title" className="text-h2 text-fg">
          {SUMMARY_TEXT.storyTitle}
        </h2>
        <p className="text-body text-fg">{SUMMARY_TEXT.storyEmpty}</p>
      </section>
    )
  }

  return (
    <section aria-labelledby="story-title" className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 id="story-title" className="text-h2 text-fg">
          {SUMMARY_TEXT.storyTitle}
        </h2>
        <p className="text-sec text-fg tabular-nums">{SUMMARY_TEXT.storyCreated(reservations.created)}</p>
      </header>

      <div className="flex flex-col gap-3">
        <div aria-hidden="true">
          <StackedBar segments={segments} total={reservations.created} />
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2" aria-hidden="true">
          {segments.map((segment) => (
            <li key={segment.key} className="inline-flex items-center gap-2 text-sec text-fg tabular-nums">
              <StatusShape shape={STATUS_META[segment.status].shape} className={TONE_TEXT[STATUS_META[segment.status].tone]} />
              <span className="font-bold">{segment.count}</span>
              {SUMMARY_TEXT.legend[segment.key]}
            </li>
          ))}
        </ul>
        <ChartTable
          caption={SUMMARY_TEXT.chartTableCaption.story}
          headers={[SUMMARY_TEXT.chartTableHeaders.state, SUMMARY_TEXT.chartTableHeaders.count]}
          rows={segments.map((segment) => ({ label: SUMMARY_TEXT.legend[segment.key], value: segment.count }))}
        />
      </div>

      <ul className="flex flex-col gap-4">
        <RateLine rate={rates.conversion} label={SUMMARY_TEXT.legend.arrived} sentence={conversionSentence} detail={`${reservations.completed} de ${reservations.created} reservas`} />
        <RateLine rate={rates.cancellation} label={SUMMARY_TEXT.legend.cancelled} sentence={cancellationSentence} detail={`${reservations.cancelled} de ${reservations.created} reservas`} />
        <RateLine
          rate={rates.noShow}
          label={SUMMARY_TEXT.noShowLabel}
          sentence={(rate) => noShowSentence(rate, resolved)}
          detail={`${reservations.expired} vencidas de ${resolved} que llegaron o vencieron`}
        />
        <li className="flex flex-col gap-0.5">
          {averagePartySize === null ? (
            <>
              <p className="text-body text-fg">
                <span aria-hidden="true">— </span>
                {SUMMARY_TEXT.noData}
              </p>
              <p className="text-sec text-fg-2">{SUMMARY_TEXT.averagePartyLabel}</p>
            </>
          ) : (
            <p className="text-body text-fg tabular-nums">{SUMMARY_TEXT.averageParty(averagePartySize)}</p>
          )}
        </li>
      </ul>

      <HelpToggle label={SUMMARY_TEXT.ratesHelpLabel} title={SUMMARY_TEXT.ratesHelpTitle}>
        <ul className="flex list-disc flex-col gap-1 pl-5">
          {SUMMARY_TEXT.ratesHelp.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </HelpToggle>
    </section>
  )
}
