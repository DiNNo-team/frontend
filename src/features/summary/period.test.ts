import { describe, expect, it } from 'vitest'
import { formatCop, formatDecimal, formatHour } from './format'
import { bogotaToday, countDays, describePeriod, PERIOD_MESSAGES, previousMonth, thisMonth, validatePeriod } from './period'

describe('periods (Bogotá days, inclusive)', () => {
  it('takes today in Bogotá, not the UTC day: 9 p. m. of the 14th in Bogotá is already the 15th in UTC', () => {
    expect(bogotaToday(new Date('2026-11-15T02:00:00Z'))).toBe('2026-11-14')
    expect(bogotaToday(new Date('2026-11-15T05:00:00Z'))).toBe('2026-11-15')
  })

  it('this month runs from the 1st to today', () => {
    expect(thisMonth('2026-11-15')).toEqual({ from: '2026-11-01', to: '2026-11-15' })
  })

  it('the previous month is whole, also across the year and in a leap February', () => {
    expect(previousMonth('2026-11-15')).toEqual({ from: '2026-10-01', to: '2026-10-31' })
    expect(previousMonth('2026-01-03')).toEqual({ from: '2025-12-01', to: '2025-12-31' })
    expect(previousMonth('2028-03-10')).toEqual({ from: '2028-02-01', to: '2028-02-29' })
  })

  it('counts both ends', () => {
    expect(countDays({ from: '2026-11-15', to: '2026-11-15' })).toBe(1)
    expect(countDays({ from: '2026-01-01', to: '2026-12-31' })).toBe(365)
  })

  describe('validatePeriod', () => {
    const today = '2026-11-15'
    it('accepts a valid range and a single day', () => {
      expect(validatePeriod({ from: '2026-11-01', to: today }, today)).toBeUndefined()
      expect(validatePeriod({ from: today, to: today }, today)).toBeUndefined()
    })
    it('asks for each missing date', () => {
      expect(validatePeriod({ from: '', to: today }, today)).toBe(PERIOD_MESSAGES.fromRequired)
      expect(validatePeriod({ from: today, to: '' }, today)).toBe(PERIOD_MESSAGES.toRequired)
      expect(validatePeriod({ from: '2026-02-30', to: today }, today)).toBe(PERIOD_MESSAGES.fromRequired)
    })
    it('rejects an end before the start, in the future, or longer than 366 days', () => {
      expect(validatePeriod({ from: '2026-11-10', to: '2026-11-09' }, today)).toBe(PERIOD_MESSAGES.toBeforeFrom)
      expect(validatePeriod({ from: '2026-11-01', to: '2026-11-16' }, today)).toBe(PERIOD_MESSAGES.toInFuture)
      expect(validatePeriod({ from: '2025-11-14', to: today }, today)).toBe(PERIOD_MESSAGES.tooLong)
      expect(validatePeriod({ from: '2025-11-15', to: today }, today)).toBeUndefined()
    })
  })

  it('writes the period in words', () => {
    expect(describePeriod({ from: '2026-11-01', to: '2026-11-15' })).toBe('Del 1 al 15 de noviembre de 2026')
    expect(describePeriod({ from: '2026-11-15', to: '2026-11-15' })).toBe('15 de noviembre de 2026')
    expect(describePeriod({ from: '2026-10-28', to: '2026-11-05' })).toBe('Del 28 de octubre al 5 de noviembre de 2026')
    expect(describePeriod({ from: '2025-12-20', to: '2026-01-05' })).toBe('Del 20 de diciembre de 2025 al 5 de enero de 2026')
  })
})

describe('number texts', () => {
  it('formats pesos with a dot for thousands and no cents', () => {
    expect(formatCop(0)).toBe('$0')
    expect(formatCop(2000)).toBe('$2.000')
    expect(formatCop(24000)).toBe('$24.000')
    expect(formatCop(1234567)).toBe('$1.234.567')
  })
  it('formats decimals with a comma and hours with a. m. / p. m.', () => {
    expect(formatDecimal(3.2)).toBe('3,2')
    expect(formatDecimal(4)).toBe('4')
    expect(formatDecimal(3.456)).toBe('3,46')
    expect(formatHour(0)).toBe('12:00 a. m.')
    expect(formatHour(13)).toBe('1:00 p. m.')
    expect(formatHour(19)).toBe('7:00 p. m.')
  })
})

describe('Bogotá clock', () => {
  it('writes a moment as Bogotá shows it, not as the device does', async () => {
    const { formatBogotaDateTime } = await import('./format')
    // 02:30 UTC of the 16th is 9:30 p. m. of the 15th in Bogotá.
    expect(formatBogotaDateTime('2026-11-16T02:30:00Z')).toBe('15 nov · 9:30 p. m.')
    expect(formatBogotaDateTime('2026-11-15T05:00:00Z')).toBe('15 nov · 12:00 a. m.')
    expect(formatBogotaDateTime('2026-09-30T17:05:00Z')).toBe('30 sept · 12:05 p. m.')
  })
})
