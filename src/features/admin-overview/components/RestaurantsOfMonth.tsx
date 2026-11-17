import { useNavigate } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Card, EmptyState, StatusChip, BILLING_STATUS } from '@/components/ui'
import { cn } from '@/lib/cn'
import { Icon } from '@/lib/icon'
import { formatAdminCop } from '../../admin/format'
import { monthName, monthShort } from '../../admin/month'
import { sparklineValues, type TopRestaurants } from '../data'
import type { AdminBillingPage } from '../../admin/panel-types'
import { OVERVIEW_TEXT } from '../messages'

interface SparklineProps {
  values: number[]
  /** Which of the points is the chosen month: the one drawn as a dot. */
  chosen: number
}

/** The check-ins of six months as a line. Decorative (the numbers are in the row and in the table of the chart). */
function Sparkline({ values, chosen }: SparklineProps) {
  const max = Math.max(1, ...values)
  const points = values.map((value, index) => [(index / Math.max(1, values.length - 1)) * 100, 22 - (value / max) * 20] as const)
  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true" className="h-6 w-full overflow-visible">
      <polyline points={points.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" strokeWidth="1.75" vectorEffect="non-scaling-stroke" className="stroke-fg" />
      {points[chosen] && <circle cx={points[chosen][0]} cy={points[chosen][1]} r="1.8" className="fill-accent" />}
    </svg>
  )
}

interface RestaurantsOfMonthProps {
  month: string
  months: string[]
  top: TopRestaurants
  billingByMonth: Map<string, AdminBillingPage | undefined>
}

/**
 * «Restaurantes del mes»: the five with most income and the rest in one line. Each row has its ranking, a six-month line of
 * check-ins (from the billing of those months, already in the cache), its check-ins and amount, the state of the charge and
 * the way to its detail in Cobros.
 */
export function RestaurantsOfMonth({ month, months, top, billingByMonth }: RestaurantsOfMonthProps) {
  const navigate = useNavigate()
  const chosen = months.indexOf(month)
  const empty = top.rows.length === 0 || top.rows.every((row) => row.checkIns === 0)
  return (
    <Card as="section" aria-labelledby="restaurants-title" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="restaurants-title" className="text-h2 text-fg">
          {OVERVIEW_TEXT.restaurantsTitle(monthName(month))}
        </h2>
        <p className="text-sec text-fg-2">{OVERVIEW_TEXT.restaurantsHint}</p>
      </div>
      {empty ? (
        <EmptyState title={OVERVIEW_TEXT.restaurantsEmpty} description={OVERVIEW_TEXT.restaurantsEmptyDescription} />
      ) : (
        <ol className="flex flex-col divide-y divide-line">
          {top.rows.map((row, index) => (
            <li key={row.restaurantId} className="grid grid-rank-row items-center gap-x-3 gap-y-1 py-3">
              <span className={cn('text-h3 font-extrabold tabular-nums', index === 0 ? 'text-accent-text' : 'text-fg-2')}>{String(index + 1).padStart(2, '0')}</span>
              <span className="min-w-0 truncate text-body font-bold text-fg">
                {row.name}
                {row.suspended && <span className="ml-2 text-label font-medium text-fg-2">· {OVERVIEW_TEXT.suspended}</span>}
              </span>
              <span className="hidden md:block">
                <Sparkline values={sparklineValues(row.restaurantId, months, billingByMonth)} chosen={chosen} />
              </span>
              <span className="hidden text-sec text-fg-2 tabular-nums md:block">{OVERVIEW_TEXT.checkIns(row.checkIns)}</span>
              <span className="text-body font-bold text-fg tabular-nums md:text-right">{formatAdminCop(row.amountCop)}</span>
              <span className="hidden md:block">
                <StatusChip status={BILLING_STATUS[row.status]} />
              </span>
              <button
                type="button"
                aria-label={OVERVIEW_TEXT.seeDetailOf(row.name)}
                onClick={() => navigate(`/admin/cobros/${encodeURIComponent(row.restaurantId)}?mes=${month}`)}
                className="inline-flex min-h-11 cursor-pointer items-center justify-end gap-1 rounded-tile text-sec font-bold text-accent-text hover:underline"
              >
                <span className="hidden sm:inline">{OVERVIEW_TEXT.seeDetail}</span>
                <Icon icon={ArrowRight} size={16} />
              </button>
            </li>
          ))}
          {top.others && (
            <li className="grid grid-rank-row items-center gap-x-3 py-3">
              <span className="text-h3 font-extrabold text-fg-2 tabular-nums">{String(top.rows.length + 1).padStart(2, '0')}</span>
              <span className="min-w-0 truncate text-body font-bold text-fg">{OVERVIEW_TEXT.others(top.others.count)}</span>
              <span className="hidden md:block" />
              <span className="hidden text-sec text-fg-2 tabular-nums md:block">{OVERVIEW_TEXT.checkIns(top.others.checkIns)}</span>
              <span className="text-body font-bold text-fg tabular-nums md:text-right">{formatAdminCop(top.others.amountCop)}</span>
              <span className="hidden md:block">
                <StatusChip status={BILLING_STATUS[top.others.status]} />
              </span>
              <span />
            </li>
          )}
        </ol>
      )}
      <p className="sr-only">{months.map(monthShort).join(', ')}</p>
    </Card>
  )
}
