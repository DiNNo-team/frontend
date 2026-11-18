import { BarTrack } from '@/features/summary/components/BarTrack'
import { formatDecimal } from '@/features/summary/format'
import { checkInDeltaPoints, checkInDeltaText, toPercent } from '../insights-view'
import { INSIGHTS_TEXT } from '../messages'
import type { RestaurantInsights } from '../types'

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse justify-end gap-1 rounded-tile bg-surface-2 p-3">
      <dt className="text-label text-fg-2">{label}</dt>
      <dd className="text-metric text-fg tabular-nums">{value}</dd>
    </div>
  )
}

const percentText = (rate: number | null) => {
  const percent = toPercent(rate)
  return percent === null ? INSIGHTS_TEXT.noData : `${percent} %`
}

/**
 * The headline of the week: the check-in rate (over RESOLVED reservations) as the biggest number of the screen, the change
 * against the week before in points, and four smaller figures. Numbers do not move (manual 11.4).
 */
export function WeekHeadline({ report }: { report: RestaurantInsights }) {
  const { metrics } = report
  const details = [
    INSIGHTS_TEXT.completedOfResolved(metrics.completed, metrics.resolved),
    metrics.medianMinutesToCheckIn === null ? null : INSIGHTS_TEXT.medianToCheckIn(metrics.medianMinutesToCheckIn),
  ].filter(Boolean)

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-kicker text-fg-2">{INSIGHTS_TEXT.checkInKicker}</p>
        <p className="text-display text-fg tabular-nums">{percentText(metrics.checkInRate)}</p>
        <p className="text-body text-fg">{INSIGHTS_TEXT.checkInRateLabel}</p>
        <p className="mt-2 text-sec font-bold text-fg">{checkInDeltaText(checkInDeltaPoints(report))}</p>
        <p className="text-sec text-fg-2">{details.join(' · ')}</p>
      </div>
      <dl aria-label={INSIGHTS_TEXT.tilesLabel} className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <Tile label={INSIGHTS_TEXT.noShowRateLabel} value={percentText(metrics.noShowRate)} />
        <Tile label={INSIGHTS_TEXT.cancellationRateLabel} value={percentText(metrics.cancellationRate)} />
        <Tile label={INSIGHTS_TEXT.reservationsCreatedLabel} value={String(metrics.reservationsCreated)} />
        <Tile
          label={INSIGHTS_TEXT.averagePartySizeLabel}
          value={metrics.averagePartySize === null ? INSIGHTS_TEXT.noData : formatDecimal(metrics.averagePartySize)}
        />
      </dl>
      {metrics.active > 0 && <p className="text-label text-fg-2">{INSIGHTS_TEXT.activeNow(metrics.active)}</p>}
    </div>
  )
}

/**
 * Fewer than `minResolved` resolved reservations: no rates, level or recommendations (never «0 %»). It says how many are
 * missing and shows the progress, plus the counts the week does have.
 */
export function NotEnoughData({ report, missing }: { report: RestaurantInsights; missing: number }) {
  const { metrics, minResolved } = report
  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="text-h2 text-fg">{INSIGHTS_TEXT.insufficientTitle}</h2>
        <p className="text-body text-fg">{INSIGHTS_TEXT.insufficientMissing(missing)}</p>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sec font-bold text-fg tabular-nums">{INSIGHTS_TEXT.insufficientProgress(metrics.resolved, minResolved)}</p>
        <BarTrack value={Math.min(metrics.resolved, minResolved)} max={minResolved} fillClassName="fill-ok" />
        <p className="text-label text-fg-2">{INSIGHTS_TEXT.resolvedHelp}</p>
      </div>
      <dl aria-label={INSIGHTS_TEXT.tilesLabel} className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Tile label={INSIGHTS_TEXT.reservationsCreatedLabel} value={String(metrics.reservationsCreated)} />
        <Tile label={INSIGHTS_TEXT.completedLabel} value={String(metrics.completed)} />
        <Tile label={INSIGHTS_TEXT.cancelledLabel} value={String(metrics.cancelled)} />
        <Tile label={INSIGHTS_TEXT.expiredLabel} value={String(metrics.expired)} />
      </dl>
    </div>
  )
}
