import { Card, EmptyState, StatusShape, TONE_TEXT } from '@/components/ui'
import { cn } from '@/lib/cn'
import { reservationShare, sharePercent } from '../calendar'
import { SUMMARY_TEXT } from '../messages'
import type { RestaurantSummary } from '../types'
import { ChartTable } from './ChartTable'
import { HelpToggle } from './HelpToggle'

function Share({ value, label }: { value: number | null; label: string }) {
  return (
    <div className="flex flex-col rounded-tile bg-surface-2 p-3">
      <dd className="text-h2 text-fg tabular-nums">{value === null ? SUMMARY_TEXT.noData : `${value} %`}</dd>
      <dt className="text-label text-fg-2">{label}</dt>
    </div>
  )
}

/**
 * «Estado de las reservas»: how the reservations created ended, in one segmented bar: arrived (green dot), did not arrive
 * (striped square) and cancelled (dash). The shape and the word go with the color; there is no orange here. The active ones
 * are not part of the bar; they are said in a line. Percents are over the reservations created.
 */
export function ReservationStatus({ reservations }: { reservations: RestaurantSummary['reservations'] }) {
  const { created } = reservations
  const share = reservationShare(reservations)
  const bar = share.arrived + share.notArrived + share.cancelled
  const width = (part: number) => `${bar > 0 ? (part / bar) * 100 : 0}%`
  return (
    <Card as="section" aria-labelledby="status-title" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id="status-title" className="text-h2 text-fg">
          {SUMMARY_TEXT.statusTitle}
        </h2>
        <p className="text-sec text-fg-2">{SUMMARY_TEXT.statusDescription(created)}</p>
      </div>
      {created === 0 ? (
        <EmptyState title={SUMMARY_TEXT.statusEmpty} description={SUMMARY_TEXT.statusEmptyDescription} />
      ) : (
        <>
          <div role="img" aria-label={SUMMARY_TEXT.statusBarLabel(share.arrived, share.notArrived, share.cancelled)} className="flex h-3.5 gap-0.5 overflow-hidden rounded-tile">
            <span style={{ width: width(share.arrived) }} className={cn('bg-ok', share.arrived === 0 && 'hidden')} />
            <span style={{ width: width(share.notArrived) }} className={cn('hatch-busy bg-line-strong', share.notArrived === 0 && 'hidden')} />
            <span style={{ width: width(share.cancelled) }} className={cn('bg-line', share.cancelled === 0 && 'hidden')} />
          </div>
          <ul aria-hidden="true" className="flex flex-wrap gap-x-5 gap-y-2 text-sec text-fg">
            <li className="flex items-center gap-2">
              <span className={TONE_TEXT.ok}>
                <StatusShape shape="dot" />
              </span>
              <strong className="tabular-nums">{share.arrived}</strong> {SUMMARY_TEXT.statusArrived}
            </li>
            <li className="flex items-center gap-2">
              <span className={TONE_TEXT.busy}>
                <StatusShape shape="striped-square" />
              </span>
              <strong className="tabular-nums">{share.notArrived}</strong> {SUMMARY_TEXT.statusNotArrived}
            </li>
            <li className="flex items-center gap-2">
              <span className={TONE_TEXT.inactive}>
                <StatusShape shape="dash" />
              </span>
              <strong className="tabular-nums">{share.cancelled}</strong> {SUMMARY_TEXT.statusCancelled}
            </li>
          </ul>
          <dl className="grid grid-cols-3 gap-2">
            <Share value={sharePercent(share.arrived, created)} label={SUMMARY_TEXT.statusShareArrived} />
            <Share value={sharePercent(share.cancelled, created)} label={SUMMARY_TEXT.statusShareCancelled} />
            <Share value={sharePercent(share.notArrived, created)} label={SUMMARY_TEXT.statusShareNotArrived} />
          </dl>
          {share.active > 0 && <p className="text-label text-fg-2">{SUMMARY_TEXT.statusActive(share.active)}</p>}
          <HelpToggle label={SUMMARY_TEXT.statusHelpLabel} title={SUMMARY_TEXT.statusHelpTitle}>
            <ul className="flex list-disc flex-col gap-1 pl-5">
              {SUMMARY_TEXT.statusHelp.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </HelpToggle>
          <ChartTable
            caption={SUMMARY_TEXT.statusTitle}
            headers={[SUMMARY_TEXT.chartTableHeaders.state, SUMMARY_TEXT.chartTableHeaders.count]}
            rows={[
              { label: SUMMARY_TEXT.statusArrived, value: share.arrived },
              { label: SUMMARY_TEXT.statusNotArrived, value: share.notArrived },
              { label: SUMMARY_TEXT.statusCancelled, value: share.cancelled },
            ]}
          />
        </>
      )}
    </Card>
  )
}
