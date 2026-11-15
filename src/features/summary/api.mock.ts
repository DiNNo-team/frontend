import { mockFailIfAsked, mockParams, mockWait } from '@/lib/mock-env'
import type { SummaryApi } from './api'
import type { BillingItem, BillingStatement, PeriodRange, RestaurantSummary } from './types'

// Stand-in for the reports with VITE_USE_MOCKS=true: fixed numbers, whatever the period. Empty month: ?mockEmpty ·
// errors: ?mockError=summary-load or billing-load · slower: ?mockLatency=3000 (shared).

async function simulate(operation: 'summary-load' | 'billing-load') {
  await mockWait(500)
  mockFailIfAsked(operation)
}

const FEE = 2000
const CHECK_INS = 12
const RESERVATIONS_BY_DAY = [4, 5, 7, 6, 13, 9, 3]
const TWO_HOURS_MS = 7_200_000

function period(range: PeriodRange) {
  return { from: range.from, to: range.to, timezone: 'America/Bogota' as const }
}

export const mockSummaryApi: SummaryApi = {
  async getSummary(range): Promise<RestaurantSummary> {
    await simulate('summary-load')
    if (mockParams().has('mockEmpty')) {
      return {
        period: period(range),
        billing: { checkIns: 0, amountCop: 0, currentFeeCop: FEE },
        reservations: { created: 0, completed: 0, cancelled: 0, expired: 0, active: 0 },
        rates: { conversion: null, noShow: null, cancellation: null },
        averagePartySize: null,
        peakHours: [],
        byDayOfWeek: [1, 2, 3, 4, 5, 6, 7].map((dayOfWeek) => ({ dayOfWeek, reservations: 0 })),
        serverTime: new Date().toISOString(),
      }
    }
    return {
      period: period(range),
      billing: { checkIns: CHECK_INS, amountCop: CHECK_INS * FEE, currentFeeCop: FEE },
      reservations: { created: 30, completed: 12, cancelled: 8, expired: 6, active: 4 },
      rates: { conversion: 0.4, noShow: 0.3333, cancellation: 0.2667 },
      averagePartySize: 3.2,
      peakHours: [
        { hour: 19, reservations: 9 },
        { hour: 20, reservations: 7 },
        { hour: 13, reservations: 5 },
      ],
      byDayOfWeek: RESERVATIONS_BY_DAY.map((reservations, index) => ({ dayOfWeek: index + 1, reservations })),
      serverTime: new Date().toISOString(),
    }
  },
  async getBilling(range, page, pageSize): Promise<BillingStatement> {
    await simulate('billing-load')
    const total = mockParams().has('mockEmpty') ? 0 : CHECK_INS
    const all: BillingItem[] = Array.from({ length: total }, (_, index) => ({
      checkInId: `mock-check-in-${index + 1}`,
      reservationId: `mock-reservation-${index + 1}`,
      checkedInAt: new Date(Date.parse(`${range.to}T23:30:00-05:00`) - index * TWO_HOURS_MS).toISOString(),
      partySize: 2 + (index % 4),
      tableIdentifier: String(1 + (index % 8)).padStart(2, '0'),
      feeCop: FEE,
    }))
    const start = (page - 1) * pageSize
    return {
      period: period(range),
      totalCheckIns: total,
      amountCop: total * FEE,
      items: all.slice(start, start + pageSize),
      page,
      pageSize,
      serverTime: new Date().toISOString(),
    }
  },
}
