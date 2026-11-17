import { describe, expect, it } from 'vitest'
import {
  buildMonth,
  closingDay,
  costPerGuest,
  dayValue,
  defaultDay,
  describeComparable,
  levelOf,
  monthsOfPeriod,
  percentChange,
  reservationShare,
  sharePercent,
  topHours,
  weekdayColumn,
} from './calendar'
import type { SummaryDay } from './types'

function day(date: string, reservationsCreated = 0, checkIns = 0, guests = 0, cancelled = 0, expired = 0): SummaryDay {
  return { date, reservationsCreated, checkIns, guests, cancelled, expired }
}

// 1–17 November 2026: the first is a Sunday.
const NOVEMBER = Array.from({ length: 17 }, (_, index) => day(`2026-11-${String(index + 1).padStart(2, '0')}`))

describe('weekdayColumn', () => {
  it('puts Monday first: Monday is 0 and Sunday is 6', () => {
    expect(weekdayColumn('2026-11-02')).toBe(0)
    expect(weekdayColumn('2026-11-01')).toBe(6)
    expect(weekdayColumn('2026-11-08')).toBe(6)
  })
})

describe('buildMonth', () => {
  const period = { from: '2026-11-01', to: '2026-11-17' }

  it('offsets day 1 to its weekday: November 2026 starts on a Sunday, six blanks', () => {
    expect(buildMonth('2026-11', NOVEMBER, period, '2026-11-17').leadingBlanks).toBe(6)
  })

  it('February 2027 starts on a Monday: no blanks and 28 days', () => {
    const february = buildMonth('2027-02', [], { from: '2027-02-01', to: '2027-02-28' }, '2027-03-01')
    expect(february.leadingBlanks).toBe(0)
    expect(february.days).toHaveLength(28)
  })

  it('February 2028 has 29 days', () => {
    expect(buildMonth('2028-02', [], { from: '2028-02-01', to: '2028-02-29' }, '2028-03-01').days).toHaveLength(29)
  })

  it('days after today are future and are not selectable; the rest of the period is data', () => {
    const { days } = buildMonth('2026-11', NOVEMBER, period, '2026-11-17')
    expect(days[16].kind).toBe('data')
    expect(days[17].kind).toBe('future')
    expect(days[29].kind).toBe('future')
  })

  it('days of the month outside a custom period are not data', () => {
    const custom = { from: '2026-11-05', to: '2026-11-08' }
    const { days } = buildMonth('2026-11', NOVEMBER.slice(4, 8), custom, '2026-11-17')
    expect(days[0].kind).toBe('outside')
    expect(days[4].kind).toBe('data')
    expect(days[8].kind).toBe('outside')
    expect(days[17].kind).toBe('future')
  })

  it('paints six tones: none, and 1 to 5 up to the busiest day of the period', () => {
    const data = [day('2026-11-01', 0), day('2026-11-02', 1), day('2026-11-03', 2), day('2026-11-04', 5)]
    const { days } = buildMonth('2026-11', data, { from: '2026-11-01', to: '2026-11-04' }, '2026-11-17')
    expect(days.slice(0, 4).map((entry) => entry.level)).toEqual([0, 1, 2, 5])
  })

  it('adds cancelled and expired as «canceladas o vencidas»', () => {
    const { days } = buildMonth('2026-11', [day('2026-11-08', 4, 2, 4, 2, 1)], { from: '2026-11-08', to: '2026-11-08' }, '2026-11-17')
    expect(days[7]).toMatchObject({ reservations: 4, checkIns: 2, guests: 4, cancelledOrExpired: 3 })
  })
})

describe('levelOf', () => {
  it('is 0 without reservations or without a maximum, and never above 5', () => {
    expect(levelOf(0, 4)).toBe(0)
    expect(levelOf(3, 0)).toBe(0)
    expect(levelOf(9, 4)).toBe(5)
    expect(levelOf(1, 100)).toBe(1)
  })
})

describe('defaultDay', () => {
  it('is today when it is in the period', () => {
    expect(defaultDay(NOVEMBER, '2026-11-17')).toBe('2026-11-17')
  })

  it('is the last day with reservations or check-ins when today is not in the period', () => {
    const october = [day('2026-10-29', 2), day('2026-10-30', 0, 1, 2), day('2026-10-31')]
    expect(defaultDay(october, '2026-11-17')).toBe('2026-10-30')
  })

  it('is the last day of the period when nothing happened', () => {
    expect(defaultDay([day('2026-10-30'), day('2026-10-31')], '2026-11-17')).toBe('2026-10-31')
  })

  it('is null with no days', () => {
    expect(defaultDay([], '2026-11-17')).toBeNull()
  })
})

describe('monthsOfPeriod', () => {
  it('lists every month the period touches', () => {
    expect(monthsOfPeriod({ from: '2026-11-01', to: '2026-11-17' })).toEqual(['2026-11'])
    expect(monthsOfPeriod({ from: '2026-09-20', to: '2026-11-05' })).toEqual(['2026-09', '2026-10', '2026-11'])
    expect(monthsOfPeriod({ from: '2025-12-30', to: '2026-01-02' })).toEqual(['2025-12', '2026-01'])
  })
})

describe('percentChange', () => {
  it('compares with the previous stretch: 13 against 9 is +44', () => {
    expect(percentChange(13, 9)).toBe(44)
    expect(percentChange(8, 10)).toBe(-20)
    expect(percentChange(5, 5)).toBe(0)
  })

  it('has no percentage when the previous is 0', () => {
    expect(percentChange(13, 0)).toBeNull()
  })
})

describe('costPerGuest', () => {
  it('divides the amount by the guests: $12.000 over 13 is $923', () => {
    expect(costPerGuest(12000, 13)).toBe(923)
  })

  it('is not shown with 0 guests', () => {
    expect(costPerGuest(0, 0)).toBeNull()
  })
})

describe('describeComparable', () => {
  it('names the month when both are the same stretch of two months', () => {
    expect(describeComparable({ from: '2026-11-01', to: '2026-11-17' }, { from: '2026-10-01', to: '2026-10-17', timezone: 'America/Bogota' })).toBe('octubre (mismo tramo)')
  })

  it('says the previous period otherwise', () => {
    expect(describeComparable({ from: '2026-11-03', to: '2026-11-10' }, { from: '2026-10-26', to: '2026-11-02', timezone: 'America/Bogota' })).toBe('el periodo anterior')
  })
})

describe('closingDay', () => {
  it('is the last day of the month', () => {
    expect(closingDay('2026-11')).toBe('30 nov')
    expect(closingDay('2028-02')).toBe('29 feb')
    expect(closingDay('2026-12')).toBe('31 dic')
  })
})

describe('topHours', () => {
  it('keeps the three busiest, a tie by the earlier hour, and drops hours without reservations', () => {
    const hours = [
      { hour: 15, reservations: 2 },
      { hour: 19, reservations: 6 },
      { hour: 22, reservations: 3 },
      { hour: 13, reservations: 2 },
      { hour: 8, reservations: 0 },
    ]
    expect(topHours(hours)).toEqual([
      { hour: 19, reservations: 6 },
      { hour: 22, reservations: 3 },
      { hour: 13, reservations: 2 },
    ])
  })

  it('is empty with no reservations', () => {
    expect(topHours([])).toEqual([])
  })
})

describe('shares', () => {
  it('splits the reservations in arrived, not arrived and cancelled, leaving the active ones out of the bar', () => {
    expect(reservationShare({ completed: 6, expired: 2, cancelled: 10, active: 0 })).toEqual({ arrived: 6, notArrived: 2, cancelled: 10, active: 0 })
  })

  it('shares are whole percents of the created ones, or null with none', () => {
    expect(sharePercent(6, 18)).toBe(33)
    expect(sharePercent(10, 18)).toBe(56)
    expect(sharePercent(2, 18)).toBe(11)
    expect(sharePercent(0, 0)).toBeNull()
  })
})

describe('dayValue', () => {
  it('adds the fee each check-in kept', () => {
    expect(dayValue([{ feeCop: 2000 }, { feeCop: 3500 }])).toBe(5500)
    expect(dayValue([])).toBe(0)
  })
})
