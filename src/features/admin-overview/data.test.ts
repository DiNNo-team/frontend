import { describe, expect, it } from 'vitest'
import { dailySeries, heatGrid, heatIndex, monthView, pulseSummary, restaurantsWithPending, sparklineValues, topRestaurants, weekdayStats } from './data'
import type { AdminBillingItem, AdminBillingPage, AdminOverview } from '../admin/panel-types'

const overview = {
  month: '2026-11',
  monthStatus: 'in_progress',
  revenueCop: 374000,
  checkIns: 187,
  previousMonth: '2026-10',
  previousRevenueCop: 476000,
  monthly: [
    { month: '2026-09', revenueCop: 302000, checkIns: 151 },
    { month: '2026-10', revenueCop: 476000, checkIns: 238 },
    { month: '2026-11', revenueCop: 374000, checkIns: 187 },
  ],
} as unknown as AdminOverview

describe('monthView', () => {
  it('reads the current month as the overview says it', () => {
    expect(monthView(overview, '2026-11', '2026-11')).toMatchObject({ status: 'in_progress', revenueCop: 374000, previousRevenueCop: 476000 })
  })

  it('takes a past month and its previous one out of the twelve months', () => {
    expect(monthView(overview, '2026-10', '2026-11')).toMatchObject({ status: 'closed', revenueCop: 476000, previousMonth: '2026-09', previousRevenueCop: 302000 })
  })

  it('has no previous month for the oldest one', () => {
    expect(monthView(overview, '2026-09', '2026-11').previousRevenueCop).toBeNull()
  })
})

describe('weekdayStats', () => {
  it('orders from the busiest and divides by how many times the weekday appears', () => {
    // 2026-11-01 is a Sunday; 1 to 9 Nov: Sun×2 (1, 8), Mon×2 (2, 9), Tue..Sat×1.
    const byDate = Array.from({ length: 9 }, (_, index) => ({ date: `2026-11-${String(index + 1).padStart(2, '0')}`, reservations: 1 }))
    const byDayOfWeek = [
      { dayOfWeek: 1, reservations: 10 },
      { dayOfWeek: 2, reservations: 4 },
      { dayOfWeek: 3, reservations: 0 },
      { dayOfWeek: 4, reservations: 0 },
      { dayOfWeek: 5, reservations: 4 },
      { dayOfWeek: 6, reservations: 0 },
      { dayOfWeek: 7, reservations: 20 },
    ]
    const stats = weekdayStats({ byDate, byDayOfWeek })
    expect(stats.map((stat) => stat.name)).toEqual(['Domingo', 'Lunes', 'Martes', 'Viernes', 'Miércoles', 'Jueves', 'Sábado'])
    expect(stats[0]).toMatchObject({ total: 20, average: 10 })
    expect(stats[1].average).toBe(5)
    expect(stats[2].average).toBe(4)
  })
})

describe('dailySeries', () => {
  it('marks one best day, the days over the average, the ones below, and the days to come', () => {
    const byDate = [
      { date: '2026-11-01', reservations: 2 },
      { date: '2026-11-02', reservations: 10 },
      { date: '2026-11-03', reservations: 6 },
      { date: '2026-11-04', reservations: 0 },
    ]
    const { bars, average, best } = dailySeries(byDate, '2026-11')
    expect(bars).toHaveLength(30)
    expect(average).toBe(4.5)
    expect(bars.slice(0, 4).map((bar) => bar.kind)).toEqual(['below', 'best', 'above', 'below'])
    expect(bars[4].kind).toBe('future')
    expect(bars[29].kind).toBe('future')
    expect(best?.day).toBe(2)
  })

  it('has no best day when nothing was reserved', () => {
    const { best, bars } = dailySeries([{ date: '2026-10-01', reservations: 0 }], '2026-10')
    expect(best).toBeNull()
    expect(bars[0].kind).toBe('below')
  })

  it('keeps the first of two equal best days', () => {
    const { best } = dailySeries([{ date: '2026-10-01', reservations: 5 }, { date: '2026-10-02', reservations: 5 }], '2026-10')
    expect(best?.day).toBe(1)
  })
})

describe('heat map', () => {
  const byDayHour = Array.from({ length: 168 }, (_, index) => ({ dayOfWeek: Math.floor(index / 24) + 1, hour: index % 24, reservations: 0 }))

  it('finds a cell by (dayOfWeek − 1) × 24 + hour', () => {
    expect(heatIndex(1, 0)).toBe(0)
    expect(heatIndex(5, 13)).toBe(109)
    expect(heatIndex(7, 23)).toBe(167)
  })

  it('shows 7 a. m. to 10 p. m. and scales the tone from 0 to 5', () => {
    byDayHour[heatIndex(5, 13)].reservations = 10
    byDayHour[heatIndex(5, 14)].reservations = 5
    byDayHour[heatIndex(1, 8)].reservations = 1
    byDayHour[heatIndex(1, 3)].reservations = 99 // outside the hours shown: it must not stretch the scale
    const grid = heatGrid(byDayHour)
    expect(grid).toHaveLength(7)
    expect(grid[0]).toHaveLength(16)
    expect(grid[0][0].hour).toBe(7)
    expect(grid[0][15].hour).toBe(22)
    expect(grid[4].find((cell) => cell.hour === 13)).toMatchObject({ reservations: 10, level: 5 })
    expect(grid[4].find((cell) => cell.hour === 14)?.level).toBe(3)
    expect(grid[0].find((cell) => cell.hour === 8)?.level).toBe(1)
    expect(grid[2][0].level).toBe(0)
  })

  it('says lunch and dinner when those are the busiest hours', () => {
    const peaks = Array.from({ length: 24 }, (_, hour) => ({ hour, reservations: [12, 13, 19, 20].includes(hour) ? 9 : 1 }))
    expect(pulseSummary(peaks)).toBe('Almuerzo y cena, como se espera')
    expect(pulseSummary(peaks.map((entry) => ({ ...entry, reservations: 0 })))).toBeNull()
  })
})

const item = (id: string, amountCop: number, status: AdminBillingItem['status'] = 'in_progress'): AdminBillingItem => ({
  restaurantId: id,
  name: id,
  approvalStatus: 'approved',
  checkIns: amountCop / 2000,
  amountCop,
  status,
  paidAt: null,
})

describe('restaurants of the month', () => {
  it('keeps the top five and sums the rest into «Otros N restaurantes»', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((id, index) => item(id, (10 - index) * 2000))
    const { rows, others } = topRestaurants({ items, total: 16 })
    expect(rows.map((row) => row.restaurantId)).toEqual(['a', 'b', 'c', 'd', 'e'])
    expect(others).toMatchObject({ count: 11, amountCop: (5 + 4) * 2000 })
  })

  it('has no «Otros» when everything fits', () => {
    expect(topRestaurants({ items: [item('a', 2000)], total: 1 }).others).toBeNull()
  })

  it('gives each restaurant the check-ins of every month, and 0 where it is missing', () => {
    const page = (id: string, checkIns: number) => ({ items: [{ ...item(id, 0), checkIns }] }) as unknown as AdminBillingPage
    const byMonth = new Map<string, AdminBillingPage | undefined>([['2026-09', page('a', 3)], ['2026-10', page('b', 5)], ['2026-11', undefined]])
    expect(sparklineValues('a', ['2026-09', '2026-10', '2026-11'], byMonth)).toEqual([3, 0, 0])
  })

  it('counts the different restaurants that still owe a closed month', () => {
    const page = (...items: AdminBillingItem[]) => ({ items }) as unknown as AdminBillingPage
    const byMonth = new Map([
      ['2026-09', page(item('a', 2000, 'pending'), item('b', 2000, 'paid'))],
      ['2026-10', page(item('a', 4000, 'pending'), item('c', 0, 'pending'))],
    ])
    expect(restaurantsWithPending(byMonth)).toBe(1)
  })
})
