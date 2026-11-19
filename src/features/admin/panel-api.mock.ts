import { ApiError } from '@/lib/api-client'
import { mockFailIfAsked, mockParams, mockWait } from '@/lib/mock-env'
import { bogotaToday } from '@/features/summary/period'
import { bogotaDayOfMonth, bogotaMonthOf, daysInMonth, FIRST_MONTH, lastMonths, monthPeriod, shiftMonth, weekdayOf } from './month'
import { mockApprovalOf } from './api.mock'
import { MOCK_PANEL_ROWS, MOCK_SUSPENDED_INDEX, mockRestaurantId } from './mock-restaurants'
import type { PanelApi } from './panel-api'
import type {
  AdminActivityItem,
  AdminBillingCheckIn,
  AdminBillingDetail,
  AdminBillingItem,
  AdminOverview,
  BillingStatus,
  PlatformMetrics,
} from './panel-types'

// Stand-in for the administrator's reads with VITE_USE_MOCKS=true, with numbers like the design reference: 16 restaurants
// (one suspended), six months of growth, a month with pending charges and one paid month whose amount no longer matches.
// Empty: ?mockEmpty · errors: ?mockError=admin-overview, admin-metrics, admin-billing, admin-detail, admin-activity or
// admin-mark · somebody marked it first: ?mockConflict · slower: ?mockLatency=3000 (shared).

const FEE_PER_GUEST = 1500

/** People of the check-in at `position` of a restaurant: the same one in the list, the totals and the detail. */
const guestsOf = (index: number, position: number) => 1 + ((position * 3 + index) % 6)
/** What the first `checkIns` check-ins of a restaurant kept: people × the fee per guest, each. */
const amountOf = (index: number, checkIns: number) => Array.from({ length: checkIns }, (_, position) => guestsOf(index, position) * FEE_PER_GUEST).reduce((a, b) => a + b, 0)
const ROWS = MOCK_PANEL_ROWS
const SUSPENDED_INDEX = MOCK_SUSPENDED_INDEX
/** Month factor by how long ago it was: 0 is the month in progress. */
const FACTORS = [0.8, 1, 0.75, 0.55, 0.35, 0.2]

const restaurantId = mockRestaurantId
const isSuspended = (index: number) => (mockApprovalOf(restaurantId(index)) ?? (index === SUSPENDED_INDEX ? 'suspended' : 'approved')) === 'suspended'
const indexOf = (id: string) => ROWS.findIndex((_, index) => restaurantId(index) === id)

const currentMonth = () => bogotaMonthOf()
const monthsAgo = (month: string) => {
  const [year, index] = month.split('-').map(Number)
  const [currentYear, currentIndex] = currentMonth().split('-').map(Number)
  return (currentYear - year) * 12 + (currentIndex - index)
}

function checkInsOf(index: number, month: string): number {
  if (mockParams().has('mockEmpty')) return 0
  const factor = FACTORS[monthsAgo(month)] ?? 0
  return Math.round(ROWS[index][2] * factor * (index === SUSPENDED_INDEX && monthsAgo(month) === 0 ? 0 : 1))
}

interface Payment {
  paidAt: string
  snapshot: { amountCop: number; checkIns: number }
}

const key = (index: number, month: string) => `${index}:${month}`
let payments = new Map<string, Payment>()

/** The paid months at the start: the old ones, the last one for the first three restaurants, and one that no longer matches. */
function seedPayments(): Map<string, Payment> {
  const map = new Map<string, Payment>()
  const now = currentMonth()
  for (let index = 0; index < ROWS.length; index += 1) {
    for (const month of lastMonths(shiftMonth(now, -1), 12)) {
      if (month < FIRST_MONTH || monthsAgo(month) < 1) continue
      const amount = amountOf(index, checkInsOf(index, month))
      const last = monthsAgo(month) === 1
      if (amount === 0 || (last && index >= 3)) continue
      const mismatch = index === 1 && monthsAgo(month) === 2
      map.set(key(index, month), {
        paidAt: new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 3, 16)).toISOString(),
        snapshot: { amountCop: amount + (mismatch ? FEE_PER_GUEST : 0), checkIns: checkInsOf(index, month) + (mismatch ? 1 : 0) },
      })
    }
  }
  return map
}
payments = seedPayments()

export const mockPanelControl = {
  reset() {
    payments = seedPayments()
  },
}

function statusOf(index: number, month: string): BillingStatus {
  if (month === currentMonth()) return 'in_progress'
  return payments.has(key(index, month)) ? 'paid' : 'pending'
}

function billingItem(index: number, month: string): AdminBillingItem {
  const checkIns = checkInsOf(index, month)
  return {
    restaurantId: restaurantId(index),
    name: ROWS[index][0],
    approvalStatus: isSuspended(index) ? 'suspended' : 'approved',
    checkIns,
    amountCop: amountOf(index, checkIns),
    status: statusOf(index, month),
    paidAt: payments.get(key(index, month))?.paidAt ?? null,
  }
}

function sortedBilling(month: string): AdminBillingItem[] {
  return ROWS.map((_, index) => billingItem(index, month)).sort((a, b) => b.amountCop - a.amountCop || a.name.localeCompare(b.name))
}

function assertMonth(month: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || month < FIRST_MONTH || month > currentMonth()) {
    throw new ApiError({ status: 400, message: 'month inválido' })
  }
}

async function simulate(operation: string, wait = 450) {
  await mockWait(wait)
  mockFailIfAsked(operation)
}

function totalsOf(month: string) {
  const items = sortedBilling(month)
  const sum = (pick: (item: AdminBillingItem) => boolean, value: (item: AdminBillingItem) => number) =>
    items.filter(pick).reduce((total, item) => total + value(item), 0)
  return {
    checkIns: sum(() => true, (item) => item.checkIns),
    amountCop: sum(() => true, (item) => item.amountCop),
    paidCop: sum((item) => item.status === 'paid', (item) => payments.get(key(indexOf(item.restaurantId), month))?.snapshot.amountCop ?? 0),
    pendingCop: sum((item) => item.status === 'pending', (item) => item.amountCop),
  }
}

function periodOf(month: string) {
  const period = monthPeriod(month)
  return { ...period, timezone: 'America/Bogota' as const }
}

function detailOf(index: number, month: string, page: number, pageSize: number): AdminBillingDetail {
  const item = billingItem(index, month)
  const days = month === currentMonth() ? bogotaDayOfMonth(new Date()) : daysInMonth(month)
  const all: AdminBillingCheckIn[] = Array.from({ length: item.checkIns }, (_, position) => {
    const day = 1 + ((position * 7 + index) % days)
    const hour = 12 + ((position * 5 + index) % 10)
    const checkedInAt = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, day, hour + 5, (position * 13) % 60)).toISOString()
    return { checkInId: `mock-check-in-${index}-${month}-${position}`, checkedInAt, partySize: guestsOf(index, position), feeCop: guestsOf(index, position) * FEE_PER_GUEST }
  }).sort((a, b) => Date.parse(b.checkedInAt) - Date.parse(a.checkedInAt))
  const payment = payments.get(key(index, month))
  return {
    restaurant: { id: item.restaurantId, name: item.name, approvalStatus: item.approvalStatus },
    month,
    period: periodOf(month),
    status: item.status,
    totalCheckIns: item.checkIns,
    amountCop: item.amountCop,
    paidAt: item.paidAt,
    snapshot: payment?.snapshot ?? null,
    amountMismatch: payment !== undefined && payment.snapshot.amountCop !== item.amountCop,
    items: all.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageSize,
    serverTime: new Date().toISOString(),
  }
}

function findIndex(id: string): number {
  const index = indexOf(id)
  if (index < 0) throw new ApiError({ status: 404, code: 'RESTAURANT_NOT_FOUND' })
  return index
}

/** A small deterministic noise so the days are not a smooth curve. */
const noise = (seed: number) => ((seed * 9301 + 49297) % 233280) / 233280

const WEEKDAY_WEIGHT = [13, 15, 14, 17, 25, 20, 17]
const HOUR_WEIGHT: Record<number, number> = { 8: 1, 9: 1, 10: 1, 11: 3, 12: 6, 13: 6, 14: 4, 15: 2, 16: 1, 17: 2, 18: 3, 19: 6, 20: 6, 21: 3, 22: 1 }

function distribute(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0)
  if (total === 0 || sum === 0) return weights.map(() => 0)
  const raw = weights.map((weight) => (weight / sum) * total)
  const base = raw.map(Math.floor)
  let left = total - base.reduce((a, b) => a + b, 0)
  const order = raw.map((value, index) => ({ index, rest: value - Math.floor(value) })).sort((a, b) => b.rest - a.rest)
  for (const { index } of order) {
    if (left-- <= 0) break
    base[index] += 1
  }
  return base
}

function buildMetrics(from: string, to: string): PlatformMetrics {
  const empty = mockParams().has('mockEmpty')
  const dates: string[] = []
  for (let day = new Date(`${from}T00:00:00Z`); day <= new Date(`${to}T00:00:00Z`); day = new Date(day.getTime() + 86_400_000)) {
    dates.push(day.toISOString().slice(0, 10))
  }
  const byDate = dates.map((date, position) => ({
    date,
    reservations: empty ? 0 : Math.round(WEEKDAY_WEIGHT[weekdayOf(date) - 1] * (0.7 + noise(position + 3) * 0.8) * 0.9),
  }))
  const grid = Array.from({ length: 7 * 24 }, () => 0)
  for (const { date, reservations } of byDate) {
    const hours = distribute(reservations, Array.from({ length: 24 }, (_, hour) => HOUR_WEIGHT[hour] ?? 0))
    hours.forEach((count, hour) => (grid[(weekdayOf(date) - 1) * 24 + hour] += count))
  }
  const created = byDate.reduce((total, entry) => total + entry.reservations, 0)
  const cancelled = Math.round(created * 0.12)
  const expired = Math.round(created * 0.17)
  const active = created > 0 && to === bogotaToday() ? 3 : 0
  const completed = Math.max(0, created - cancelled - expired - active)
  const ratio = (top: number, bottom: number) => (bottom === 0 ? null : Math.round((top / bottom) * 10000) / 10000)
  return {
    period: { from, to, timezone: 'America/Bogota' },
    basis: 'reservations_created_at',
    reservations: { created, completed, cancelled, expired, active },
    rates: { conversion: ratio(completed, created), noShow: ratio(expired, completed + expired), cancellation: ratio(cancelled, created) },
    averagePartySize: created === 0 ? null : 2.88,
    peakHours: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      reservations: grid.reduce((total, count, index) => (index % 24 === hour ? total + count : total), 0),
    })),
    byDayOfWeek: Array.from({ length: 7 }, (_, day) => ({
      dayOfWeek: day + 1,
      reservations: grid.slice(day * 24, day * 24 + 24).reduce((a, b) => a + b, 0),
    })),
    byDate,
    byDayHour: grid.map((reservations, index) => ({ dayOfWeek: Math.floor(index / 24) + 1, hour: index % 24, reservations })),
    serverTime: new Date().toISOString(),
  }
}

function activityItem(index: number, month: string): AdminActivityItem {
  const checkIns = checkInsOf(index, month)
  return {
    id: restaurantId(index),
    name: ROWS[index][0],
    category: ROWS[index][1],
    approvalStatus: isSuspended(index) ? 'suspended' : 'approved',
    isOpen: index % 5 !== 4,
    approvedAt: index % 3 === 0 ? null : new Date(Date.now() - (40 + index * 9) * 86_400_000).toISOString(),
    createdAt: new Date(Date.now() - (60 + index * 9) * 86_400_000).toISOString(),
    checkIns,
    amountCop: amountOf(index, checkIns),
    lastTableActivityAt: index % 6 === 5 ? null : new Date(Date.now() - (index + 1) * 3_600_000 * 7).toISOString(),
  }
}

export const mockPanelApi: PanelApi = {
  async overview(month) {
    await simulate('admin-overview')
    assertMonth(month)
    const monthly = lastMonths(month, 12).map((entry) => {
      const items = ROWS.map((_, index) => checkInsOf(index, entry))
      const checkIns = entry < FIRST_MONTH ? 0 : items.reduce((a, b) => a + b, 0)
      const revenueCop = entry < FIRST_MONTH ? 0 : ROWS.reduce((total, _, index) => total + amountOf(index, checkInsOf(index, entry)), 0)
      return { month: entry, revenueCop, checkIns }
    })
    const current = monthly[monthly.length - 1]
    let collectedCop = 0
    let pendingCop = 0
    for (const closed of lastMonths(shiftMonth(currentMonth(), -1), 12)) {
      if (closed < FIRST_MONTH) continue
      const totals = totalsOf(closed)
      collectedCop += totals.paidCop
      pendingCop += totals.pendingCop
    }
    return {
      month,
      monthStatus: month === currentMonth() ? 'in_progress' : 'closed',
      revenueCop: current.revenueCop,
      checkIns: current.checkIns,
      previousMonth: shiftMonth(month, -1),
      previousRevenueCop: monthly[monthly.length - 2].revenueCop,
      monthly,
      collectedCop,
      pendingCop,
      restaurants: { pending: 4, approved: ROWS.length - 1, suspended: 1, rejected: 1 },
      currentFeePerGuestCop: FEE_PER_GUEST,
      serverTime: new Date().toISOString(),
    } satisfies AdminOverview
  },
  async metrics({ from, to }) {
    await simulate('admin-metrics')
    return buildMetrics(from, to)
  },
  async billing(month, page, pageSize) {
    await simulate('admin-billing')
    assertMonth(month)
    const items = sortedBilling(month)
    return {
      month,
      monthStatus: month === currentMonth() ? 'in_progress' : 'closed',
      period: periodOf(month),
      totals: totalsOf(month),
      items: items.slice((page - 1) * pageSize, page * pageSize),
      total: items.length,
      page,
      pageSize,
      serverTime: new Date().toISOString(),
    }
  },
  async billingDetail(id, month, page, pageSize) {
    await simulate('admin-detail')
    assertMonth(month)
    return detailOf(findIndex(id), month, page, pageSize)
  },
  async markPaid(id, month) {
    await simulate('admin-mark')
    const index = findIndex(id)
    if (month === currentMonth()) throw new ApiError({ status: 409, code: 'PERIOD_NOT_CLOSED' })
    const amount = amountOf(index, checkInsOf(index, month))
    if (amount === 0) throw new ApiError({ status: 409, code: 'NOTHING_TO_BILL' })
    if (payments.has(key(index, month)) || mockParams().has('mockConflict')) throw new ApiError({ status: 409, code: 'PERIOD_ALREADY_PAID' })
    payments.set(key(index, month), { paidAt: new Date().toISOString(), snapshot: { amountCop: amount, checkIns: checkInsOf(index, month) } })
    return detailOf(index, month, 1, 50)
  },
  async markPending(id, month) {
    await simulate('admin-mark')
    const index = findIndex(id)
    if (!payments.has(key(index, month)) || mockParams().has('mockConflict')) throw new ApiError({ status: 409, code: 'PERIOD_NOT_PAID' })
    payments.delete(key(index, month))
    return detailOf(index, month, 1, 50)
  },
  async activity(month, page, pageSize) {
    await simulate('admin-activity')
    assertMonth(month)
    const items = ROWS.map((_, index) => activityItem(index, month)).sort((a, b) => a.name.localeCompare(b.name))
    return {
      month,
      period: periodOf(month),
      items: items.slice((page - 1) * pageSize, page * pageSize),
      total: items.length,
      page,
      pageSize,
      serverTime: new Date().toISOString(),
    }
  },
}
