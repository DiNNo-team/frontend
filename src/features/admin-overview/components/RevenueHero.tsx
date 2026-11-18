import { Card, StatusChip } from '@/components/ui'
import { cn } from '@/lib/cn'
import { formatAdminCop, formatChange } from '../../admin/format'
import { daysInMonth, monthName, monthTitle } from '../../admin/month'
import type { MonthView } from '../data'
import { OVERVIEW_TEXT } from '../messages'

export interface BillingSummary {
  paidCop: number
  pendingCop: number
  paidRestaurants: number
  pendingRestaurants: number
}

interface RevenueHeroProps {
  view: MonthView
  /** Day of the month in Bogotá by the server clock, for «día 17 de 30». */
  dayOfMonth: number
  /** The closed month's collection (from its billing); `null` while it loads or failed. */
  billing: BillingSummary | null
  /** Pending of every closed month (overview) and how many restaurants owe it. */
  pendingClosedCop: number
  pendingClosedRestaurants: number | null
}

function Figure({ label, shape, amount, note, tone }: { label: string; shape: 'paid' | 'pending' | 'running'; amount: string; note: string; tone: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="flex items-center gap-2 text-sec font-bold text-fg">
        <span
          aria-hidden="true"
          className={cn(
            'inline-block size-2.5 shrink-0',
            shape === 'paid' && 'rounded-full bg-ok',
            shape === 'pending' && 'rotate-45 bg-limited',
            shape === 'running' && 'rounded-full border-2 border-fg',
          )}
        />
        {label}
      </p>
      <p className={cn('text-h2 tabular-nums', tone)}>{amount}</p>
      <p className="text-label font-medium text-fg-2">{note}</p>
    </div>
  )
}

/**
 * The protagonist: the month's income as one huge figure, how it compares with the month before, and how much of it is
 * collected. A closed month shows its collection (cobrado / pendiente); the month in progress cannot be collected yet, so it
 * says what is pending from the closed ones instead. No percentage when the month before had no income.
 */
export function RevenueHero({ view, dayOfMonth, billing, pendingClosedCop, pendingClosedRestaurants }: RevenueHeroProps) {
  const running = view.status === 'in_progress'
  const change = view.previousRevenueCop === null ? null : formatChange(view.revenueCop, view.previousRevenueCop)
  const previousName = view.previousMonth ? monthName(view.previousMonth) : ''
  const parts = [OVERVIEW_TEXT.checkIns(view.checkIns)]
  if (running) parts.push(OVERVIEW_TEXT.dayOf(dayOfMonth, daysInMonth(view.month)))
  if (running && view.previousRevenueCop) parts.push(OVERVIEW_TEXT.previousClosed(previousName, formatAdminCop(view.previousRevenueCop)))
  else if (change) parts.push(OVERVIEW_TEXT.versus(change, previousName))

  const total = billing ? billing.paidCop + billing.pendingCop : 0
  const paidShare = total > 0 && billing ? (billing.paidCop / total) * 100 : 0

  return (
    <Card as="section" aria-label={OVERVIEW_TEXT.heroKicker(monthTitle(view.month))} className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-kicker text-fg-2">{OVERVIEW_TEXT.heroKicker(monthName(view.month))}</h2>
        {running ? <StatusChip status="billing-in-progress" /> : <StatusChip status="inactive" label={OVERVIEW_TEXT.monthClosed} />}
      </div>
      <p className="text-figure text-fg tabular-nums md:text-display" aria-label={formatAdminCop(view.revenueCop)}>
        <span aria-hidden="true" className="text-accent">$</span>
        <span aria-hidden="true">{formatAdminCop(view.revenueCop).replace("$ ", "")}</span>
      </p>
      <p className="text-body text-fg tabular-nums">
        <span className="font-bold">{parts[0]}</span>
        {parts.slice(1).map((part) => (
          <span key={part} className="text-fg-2">
            {' · '}
            {part}
          </span>
        ))}
      </p>

      {running ? (
        <div role="img" aria-label={OVERVIEW_TEXT.inProgress} className="hatch-busy mt-2 h-2.5 w-full rounded-full bg-line" />
      ) : (
        total > 0 &&
        billing && (
          <div
            role="img"
            aria-label={OVERVIEW_TEXT.billingBarLabel(formatAdminCop(billing.paidCop), formatAdminCop(billing.pendingCop))}
            className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-line"
          >
            <span style={{ width: `${paidShare}%` }} className="bg-ok" />
            <span className="hatch-busy flex-1 bg-limited/40" />
          </div>
        )
      )}

      <div className="grid grid-cols-2 gap-4 border-t border-line pt-4">
        {running ? (
          <>
            <Figure label={OVERVIEW_TEXT.inProgressLabel} shape="running" amount={formatAdminCop(view.revenueCop)} note={OVERVIEW_TEXT.inProgressNote} tone="text-fg" />
            <Figure
              label={OVERVIEW_TEXT.pendingClosedLabel}
              shape="pending"
              amount={formatAdminCop(pendingClosedCop)}
              note={
                pendingClosedCop === 0
                  ? OVERVIEW_TEXT.allPaid
                  : pendingClosedRestaurants === null
                    ? ''
                    : OVERVIEW_TEXT.restaurantsCount(pendingClosedRestaurants)
              }
              tone="text-fg"
            />
          </>
        ) : billing ? (
          <>
            <Figure
              label={OVERVIEW_TEXT.collectedLabel}
              shape="paid"
              amount={formatAdminCop(billing.paidCop)}
              note={OVERVIEW_TEXT.restaurantsCount(billing.paidRestaurants)}
              tone="text-fg"
            />
            <Figure
              label={OVERVIEW_TEXT.pendingLabel}
              shape="pending"
              amount={formatAdminCop(billing.pendingCop)}
              note={billing.pendingCop === 0 ? OVERVIEW_TEXT.allPaid : OVERVIEW_TEXT.restaurantsCount(billing.pendingRestaurants)}
              tone="text-fg"
            />
          </>
        ) : (
          <p className="col-span-2 text-sec text-fg-2">{OVERVIEW_TEXT.loadingFirst}</p>
        )}
      </div>
    </Card>
  )
}
