import { formatCop } from '../format'
import { SUMMARY_TEXT } from '../messages'
import type { RestaurantSummary } from '../types'
import { HelpToggle } from './HelpToggle'

/**
 * The protagonist of the screen: what is owed for the period, as one big figure, and the sum behind it in a short phrase.
 * Each check-in keeps the fee of its moment, so «N × tarifa» is only said when it is exactly the total; otherwise the
 * phrase says each one has its own. With no check-ins it says, kindly, when DiNNo charges.
 */
export function BillingHero({ billing }: { billing: RestaurantSummary['billing'] }) {
  const { checkIns, amountCop, currentFeeCop } = billing
  const exact = checkIns * currentFeeCop === amountCop

  return (
    <section aria-labelledby="billing-kicker" className="flex flex-col gap-3">
      <h2 id="billing-kicker" className="text-kicker text-fg-2">
        {SUMMARY_TEXT.billingKicker}
      </h2>
      <p className="text-figure text-fg tabular-nums" aria-label={`${SUMMARY_TEXT.billingKicker}: ${formatCop(amountCop)}`}>
        {formatCop(amountCop)}
      </p>
      {checkIns > 0 ? (
        <p className="text-body text-fg tabular-nums">{exact ? SUMMARY_TEXT.billingFormula(checkIns, currentFeeCop) : SUMMARY_TEXT.billingMixedFees(checkIns)}</p>
      ) : (
        <div className="flex max-w-120 flex-col gap-1">
          <p className="text-h3 text-fg">{SUMMARY_TEXT.billingEmptyTitle}</p>
          <p className="text-sec text-fg">{SUMMARY_TEXT.billingEmpty}</p>
        </div>
      )}
      <HelpToggle label={SUMMARY_TEXT.feeHelpLabel}>{SUMMARY_TEXT.feeHelp}</HelpToggle>
    </section>
  )
}
