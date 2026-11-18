import { describe, expect, it } from 'vitest'
import { daysInMonth, lastMonths, monthName, monthPeriod, monthShort, monthTitle, parseMonth, shiftMonth, weekdayOf, bogotaDayOfMonth, bogotaMonthOf } from './month'
import { formatAdminCop, formatAverage, formatChange, formatRate } from './format'

describe('months of the panel', () => {
  it('shifts across years and lists the last six ending at the month', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
    expect(shiftMonth('2026-11', 2)).toBe('2027-01')
    expect(lastMonths('2026-11', 6)).toEqual(['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'])
  })

  it('writes them in Spanish', () => {
    expect(monthName('2026-11')).toBe('noviembre')
    expect(monthTitle('2026-03')).toBe('marzo de 2026')
    expect(monthShort('2026-09')).toBe('Sep')
  })

  it('accepts only valid months between the first and the current one', () => {
    expect(parseMonth('2026-10', '2026-11')).toBe('2026-10')
    expect(parseMonth('2026-12', '2026-11')).toBe('2026-11')
    expect(parseMonth('2025-12', '2026-11')).toBe('2026-11')
    expect(parseMonth('2026-13', '2026-11')).toBe('2026-11')
    expect(parseMonth(null, '2026-11')).toBe('2026-11')
  })

  it('knows the days of a month and the period the metrics ask for', () => {
    expect(daysInMonth('2026-02')).toBe(28)
    expect(daysInMonth('2026-11')).toBe(30)
    expect(monthPeriod('2026-10', '2026-11-17')).toEqual({ from: '2026-10-01', to: '2026-10-31' })
    expect(monthPeriod('2026-11', '2026-11-17')).toEqual({ from: '2026-11-01', to: '2026-11-17' })
    expect(monthPeriod('2026-11', '2026-11-30')).toEqual({ from: '2026-11-01', to: '2026-11-30' })
  })

  it('numbers the weekday like the API (1 = Monday)', () => {
    expect(weekdayOf('2026-11-13')).toBe(5)
    expect(weekdayOf('2026-11-15')).toBe(7)
    expect(weekdayOf('2026-11-16')).toBe(1)
  })

  it('reads a moment in Bogotá, not in the device zone', () => {
    // 03:30 UTC of the 1st is still the 31st (22:30) in Bogotá.
    expect(bogotaMonthOf('2026-11-01T03:30:00.000Z')).toBe('2026-10')
    expect(bogotaDayOfMonth('2026-11-17T15:00:00.000Z')).toBe(17)
  })
})

describe('number texts of the panel', () => {
  it('writes pesos with the dot and a space', () => {
    expect(formatAdminCop(374000)).toBe('$ 374.000')
    expect(formatAdminCop(0)).toBe('$ 0')
  })

  it('compares with the previous month, and says nothing when it was zero', () => {
    expect(formatChange(52000, 48000)).toBe('+8 %')
    expect(formatChange(40000, 48000)).toBe('-17 %')
    expect(formatChange(52000, 0)).toBeNull()
  })

  it('says «Sin datos» for a missing rate', () => {
    expect(formatRate(0.7114)).toBe('71 %')
    expect(formatRate(null)).toBe('Sin datos')
    expect(formatAverage(15.43)).toBe('15,4')
  })
})
