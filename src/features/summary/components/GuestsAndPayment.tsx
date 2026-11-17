import { Card, StatusChip } from '@/components/ui'
import { PAYMENT_STATUS } from '@/components/ui/status'
import { monthName } from '../../admin/month'
import { closingDay, costPerGuest, describeComparable, percentChange } from '../calendar'
import { formatCop, formatDecimal } from '../format'
import { changeText, SUMMARY_TEXT } from '../messages'
import type { RestaurantSummary } from '../types'

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
const percent = (rate: number | null) => (rate === null ? SUMMARY_TEXT.noData : `${Math.round(rate * 100)} %`)

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <dd className="text-h2 text-fg tabular-nums">{value}</dd>
      <dt className="text-label text-fg-2">{label}</dt>
    </div>
  )
}

/** How the guests compare with the same stretch before: an arrow (shape), the words and the percentage; none if there was nothing before. */
function Comparison({ summary }: { summary: RestaurantSummary }) {
  const change = percentChange(summary.billing.guests, summary.previousComparable.guests)
  const text = changeText(change)
  if (change === null || text === null) return null
  const up = change > 0
  return (
    <span className="tabular-nums">
      {' · '}
      <span className={up ? 'font-bold text-ok' : change < 0 ? 'font-bold text-accent-text' : 'font-bold text-fg'}>
        <span aria-hidden="true">{up ? '▲ +' : change < 0 ? '▼ ' : ''}</span>
        {change === 0 ? '' : <span aria-hidden="true">{`${change} %`}</span>}
        <span className="sr-only">{text}</span>
      </span>{' '}
      <span className="text-fg-2">{SUMMARY_TEXT.versus(describeComparable(summary.period, summary.previousComparable.period))}</span>
    </span>
  )
}

/**
 * Block 1: the guests DiNNo brought (the big figure) and, beside it, what the restaurant pays for them. The restaurant
 * pays: it never reads «cobro». Every figure has its words; a missing rate reads «Sin datos», never 0 or NaN.
 */
export function GuestsAndPayment({ summary }: { summary: RestaurantSummary }) {
  const { billing, reservations, rates, payment } = summary
  const { guests, checkIns, amountCop, currentFeeCop } = billing
  const exact = checkIns * currentFeeCop === amountCop
  const perGuest = costPerGuest(amountCop, guests)
  const previous = payment.previousMonth
  return (
    <Card as="section" aria-labelledby="guests-title" className="grid gap-6 lg:grid-cols-hero lg:gap-8">
      <div className="flex flex-col justify-center gap-4">
        <h2 id="guests-title" className="text-kicker text-fg-2 uppercase">
          {SUMMARY_TEXT.guestsKicker}
        </h2>
        <p className="flex items-baseline gap-3 text-fg">
          <span className="text-figure tabular-nums">{guests}</span>
          <span className="text-h2">{SUMMARY_TEXT.guestsUnit(guests)}</span>
        </p>
        <p className="text-body text-fg">
          <strong>{SUMMARY_TEXT.checkInsCount(checkIns)}</strong> {SUMMARY_TEXT.ofReservations(reservations.created)}
          <Comparison summary={summary} />
        </p>
        <dl className="flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-4">
          <Stat value={String(reservations.created)} label={SUMMARY_TEXT.reservationsCreated} />
          <Stat value={percent(rates.conversion)} label={SUMMARY_TEXT.arrivalRate} />
          <Stat value={summary.averagePartySize === null ? SUMMARY_TEXT.noData : formatDecimal(summary.averagePartySize)} label={SUMMARY_TEXT.partyPerReservation} />
        </dl>
      </div>

      <div className="flex flex-col gap-3 rounded-tile bg-surface-2 p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-kicker text-fg-2 uppercase">{SUMMARY_TEXT.paymentKicker}</h3>
          {payment.period && <StatusChip status={PAYMENT_STATUS[payment.period.status]} />}
        </div>
        <p className="text-h1 text-fg tabular-nums">{formatCop(amountCop)}</p>
        {checkIns > 0 ? (
          <p className="text-sec text-fg-2 tabular-nums">{exact ? SUMMARY_TEXT.paymentFormula(checkIns, currentFeeCop) : SUMMARY_TEXT.paymentMixedFees(checkIns)}</p>
        ) : (
          <p className="text-sec text-fg-2">{SUMMARY_TEXT.paymentNone}</p>
        )}
        <dl className="flex flex-col gap-2 border-t border-line pt-3 text-body text-fg">
          {perGuest !== null && (
            <div className="flex items-center justify-between gap-3">
              <dt>{SUMMARY_TEXT.costPerGuest}</dt>
              <dd className="font-bold tabular-nums">{formatCop(perGuest)}</dd>
            </div>
          )}
          {payment.period && (
            <div className="flex items-center justify-between gap-3">
              <dt>{SUMMARY_TEXT.periodClose}</dt>
              <dd className="font-bold">{closingDay(payment.period.month)}</dd>
            </div>
          )}
          {previous && (
            <div className="flex items-center justify-between gap-3">
              <dt className="tabular-nums">
                {previous.checkIns > 0 ? SUMMARY_TEXT.previousMonthPayment(capitalize(monthName(previous.month)), previous.amountCop) : SUMMARY_TEXT.previousMonthNone(capitalize(monthName(previous.month)))}
              </dt>
              <dd>{previous.checkIns > 0 && <StatusChip status={PAYMENT_STATUS[previous.status]} />}</dd>
            </div>
          )}
        </dl>
        <p className="text-label text-fg-2">{SUMMARY_TEXT.paymentNote}</p>
      </div>
    </Card>
  )
}
