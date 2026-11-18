import { Card, EmptyState, StatusShape, TONE_TEXT } from '@/components/ui'
import { formatRate } from '../../admin/format'
import { ChartTable } from '@/features/summary/components/ChartTable'
import type { PlatformMetrics } from '../../admin/panel-types'
import { OVERVIEW_TEXT } from '../messages'

/**
 * «Resultado de las reservas»: the reservations created, and how they ended: arrived (green, the ones that are charged),
 * expired (striped) and cancelled (plain). The widths follow the counts. A missing rate reads «Sin datos», never 0 %.
 */
export function ReservationFlow({ metrics }: { metrics: Pick<PlatformMetrics, 'reservations' | 'rates'> }) {
  const { created, completed, expired, cancelled } = metrics.reservations
  const share = (count: number) => (created > 0 ? (count / created) * 100 : 0)
  return (
    <Card as="section" aria-labelledby="flow-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="flow-title" className="text-h2 text-fg">
          {OVERVIEW_TEXT.flowTitle}
        </h2>
        <p className="text-sec text-fg-2">
          {OVERVIEW_TEXT.conversion} <span className="text-h3 font-extrabold text-fg tabular-nums">{formatRate(metrics.rates.conversion)}</span>
        </p>
      </div>
      {created === 0 ? (
        <EmptyState title={OVERVIEW_TEXT.flowEmpty} />
      ) : (
        <>
          <div role="img" aria-label={`${OVERVIEW_TEXT.created(created)}. ${OVERVIEW_TEXT.arrived(completed)}, ${expired} vencidas, ${cancelled} canceladas`} className="flex flex-col gap-2">
            <div className="flex h-11 items-center rounded-tile bg-info px-4 text-sec font-bold text-on-brand tabular-nums">{OVERVIEW_TEXT.created(created)}</div>
            <div className="flex h-11 gap-2">
              <div style={{ width: `${share(completed)}%` }} className="flex min-w-0 items-center rounded-tile bg-ok px-4 text-sec font-bold text-on-brand tabular-nums">
                {completed > 0 && OVERVIEW_TEXT.arrived(completed)}
              </div>
              <div style={{ width: `${share(expired)}%` }} className="hatch-busy flex min-w-0 items-center justify-center rounded-tile bg-line-strong text-sec font-bold text-fg tabular-nums">
                {expired > 0 && <span className="rounded-full bg-surface px-2">{expired}</span>}
              </div>
              <div style={{ width: `${share(cancelled)}%` }} className="flex min-w-0 items-center justify-center rounded-tile bg-surface-2 text-sec font-bold text-fg tabular-nums">
                {cancelled > 0 && cancelled}
              </div>
            </div>
          </div>
          <ul aria-hidden="true" className="flex flex-wrap gap-x-5 gap-y-2 text-label text-fg">
            <li className="flex items-center gap-2"><span className={TONE_TEXT.ok}><StatusShape shape="dot" /></span>{OVERVIEW_TEXT.legendArrived}</li>
            <li className="flex items-center gap-2"><span className={TONE_TEXT.busy}><StatusShape shape="striped-square" /></span>{OVERVIEW_TEXT.legendExpired}</li>
            <li className="flex items-center gap-2"><span className={TONE_TEXT.inactive}><StatusShape shape="dash" /></span>{OVERVIEW_TEXT.legendCancelled}</li>
          </ul>
          <ChartTable
            caption={OVERVIEW_TEXT.flowTitle}
            headers={['Estado', 'Reservas']}
            rows={[
              { label: 'Creadas', value: created },
              { label: 'Llegaron', value: completed },
              { label: 'Vencidas', value: expired },
              { label: 'Canceladas', value: cancelled },
              { label: 'Conversión', value: formatRate(metrics.rates.conversion) },
            ]}
          />
        </>
      )}
    </Card>
  )
}
