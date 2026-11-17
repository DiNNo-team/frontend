import { Navigate, useLocation, useSearchParams } from 'react-router'
import { Card, PageHeader } from '@/components/ui'
import { bogotaDayOfMonth, bogotaMonthOf, lastMonths, monthPeriod, parseMonth } from '../admin/month'
import { useAdminBillingMonthsQueries, useAdminMetricsQuery, useAdminOverviewQuery } from '../admin/panel-hooks'
import type { AdminBillingPage, AdminOverview } from '../admin/panel-types'
import { BlockState } from './components/BlockState'
import { DailyReservations } from './components/DailyReservations'
import { HourHeatmap } from './components/HourHeatmap'
import { MonthBars } from './components/MonthBars'
import { ReservationFlow } from './components/ReservationFlow'
import { RestaurantsOfMonth } from './components/RestaurantsOfMonth'
import { RevenueHero, type BillingSummary } from './components/RevenueHero'
import { WeekdayList } from './components/WeekdayList'
import { dailySeries, heatGrid, monthView, pulseSummary, restaurantsWithPending, topRestaurants, weekdayStats } from './data'
import { OVERVIEW_TEXT } from './messages'

const MONTHS_SHOWN = 6

/** The bars: the last six months up to the current one; if an old month's overview was asked, the six that end at it. */
function barsOf(overview: AdminOverview, shown: string[]) {
  const inWindow = overview.monthly.filter((entry) => shown.includes(entry.month))
  return inWindow.length === MONTHS_SHOWN ? inWindow : overview.monthly.slice(-MONTHS_SHOWN)
}

function summaryOf(page: AdminBillingPage | undefined): BillingSummary | null {
  if (!page) return null
  return {
    paidCop: page.totals.paidCop,
    pendingCop: page.totals.pendingCop,
    paidRestaurants: page.items.filter((item) => item.status === 'paid').length,
    pendingRestaurants: page.items.filter((item) => item.status === 'pending' && item.amountCop > 0).length,
  }
}

/** The addresses that held the requests before the panel had its own sections: `/admin?estado=…` still opens them. */
function LegacyRequestsRedirect() {
  const { search } = useLocation()
  return <Navigate to={`/admin/solicitudes${search}`} replace />
}

/**
 * `/admin` (docs/admin-panel-contract.md §2 to §5): the summary of the platform. Picking a month in «Ingresos por mes» changes
 * the whole page and is kept in the URL (`?mes=AAAA-MM`). The overview is asked once (its twelve months serve any recent
 * one); billing and metrics are asked by month and kept, so going back to a month already seen asks for nothing. Each block
 * has its own loading, empty and error state: one that fails does not take the others with it.
 */
export default function OverviewPage() {
  const [params, setParams] = useSearchParams()
  const legacy = ['estado', 'pagina', 'solicitud'].some((name) => params.has(name))
  const current = bogotaMonthOf()
  const month = parseMonth(params.get('mes'), current)
  const shown = lastMonths(current, MONTHS_SHOWN)

  const overview = useAdminOverviewQuery(month)
  const metrics = useAdminMetricsQuery(monthPeriod(month))
  const billingMonths = useAdminBillingMonthsQueries([...new Set([...shown, month])])
  const billing = billingMonths.pages
  const monthQuery = billingMonths.queries.get(month)

  if (legacy) return <LegacyRequestsRedirect />

  const view = overview.data ? monthView(overview.data, month, current) : null
  const monthBilling = billing.get(month)
  const closedBilling = new Map([...billing].filter(([key]) => key < current))

  return (
    <>
      <PageHeader title={OVERVIEW_TEXT.title} description={OVERVIEW_TEXT.description} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-5">
          <BlockState query={overview} skeleton="h-80" loadingLabel="Cargando los ingresos">
            {view && overview.data && (
              <RevenueHero
                view={view}
                dayOfMonth={bogotaDayOfMonth(overview.data.serverTime)}
                billing={summaryOf(monthBilling)}
                pendingClosedCop={overview.data.pendingCop}
                pendingClosedRestaurants={[...closedBilling.values()].every(Boolean) ? restaurantsWithPending(closedBilling) : null}
              />
            )}
          </BlockState>
        </div>
        <div className="lg:col-span-7">
          <BlockState query={overview} skeleton="h-80" loadingLabel="Cargando los meses">
            {overview.data && (
              <Card as="section" aria-labelledby="months-title" className="flex h-full flex-col gap-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 id="months-title" className="text-h2 text-fg">
                    {OVERVIEW_TEXT.monthsTitle}
                  </h2>
                  <p className="text-sec text-fg-2">{OVERVIEW_TEXT.monthsHint}</p>
                </div>
                <MonthBars
                  bars={barsOf(overview.data, shown)}
                  selected={month}
                  current={current}
                  onSelect={(next) => {
                    const nextParams = new URLSearchParams(params)
                    nextParams.set('mes', next)
                    setParams(nextParams)
                  }}
                />
              </Card>
            )}
          </BlockState>
        </div>

        <p className="text-sec text-fg-2 lg:col-span-12">{OVERVIEW_TEXT.basis}</p>

        <div className="lg:col-span-8">
          <BlockState query={metrics} skeleton="h-80" loadingLabel="Cargando las reservas por día">
            {metrics.data && <DailyReservations series={dailySeries(metrics.data.byDate, month)} month={month} />}
          </BlockState>
        </div>
        <div className="lg:col-span-4">
          <BlockState query={metrics} skeleton="h-80" loadingLabel="Cargando los días de la semana">
            {metrics.data && <WeekdayList stats={weekdayStats(metrics.data)} month={month} />}
          </BlockState>
        </div>
        <div className="lg:col-span-7">
          <BlockState query={metrics} skeleton="h-56" loadingLabel="Cargando el recorrido de las reservas">
            {metrics.data && <ReservationFlow metrics={metrics.data} />}
          </BlockState>
        </div>
        <div className="lg:col-span-5">
          <BlockState query={metrics} skeleton="h-56" loadingLabel="Cargando el pulso por hora">
            {metrics.data && <HourHeatmap grid={heatGrid(metrics.data.byDayHour)} summary={pulseSummary(metrics.data.peakHours)} />}
          </BlockState>
        </div>
        <div className="lg:col-span-12">
          <BlockState query={monthQuery ?? overview} skeleton="h-96" loadingLabel="Cargando los restaurantes">
            {monthBilling && <RestaurantsOfMonth month={month} months={shown} top={topRestaurants(monthBilling)} billingByMonth={billing} />}
          </BlockState>
        </div>
      </div>
    </>
  )
}
