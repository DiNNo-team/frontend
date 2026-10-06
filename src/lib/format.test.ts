import { describe, expect, it } from 'vitest'
import {
  formatCapacity,
  formatDate,
  formatDateTime,
  formatTableName,
  formatTime12h,
  normalizeTableIdentifier,
} from './format'

describe('formatTime12h', () => {
  it.each([
    ['19:30', '7:30 p. m.'],
    ['00:00', '12:00 a. m.'],
    ['12:00', '12:00 p. m.'],
    ['09:05', '9:05 a. m.'],
    ['23:30', '11:30 p. m.'],
    ['11:59', '11:59 a. m.'],
  ])('%s → %s', (input, expected) => {
    expect(formatTime12h(input)).toBe(expected)
  })

  it('rejects malformed times', () => {
    expect(() => formatTime12h('7:30 pm')).toThrow()
    expect(() => formatTime12h('24:00')).toThrow()
  })
})

describe('formatDate', () => {
  it('uses the manual month abbreviations without a dot', () => {
    expect(formatDate(new Date(2026, 8, 30))).toBe('30 sept 2026')
    expect(formatDate(new Date(2026, 0, 1))).toBe('1 ene 2026')
    expect(formatDate(new Date(2026, 11, 31))).toBe('31 dic 2026')
  })

  it('accepts ISO strings', () => {
    expect(formatDate(new Date(2026, 4, 2).toISOString())).toBe('2 may 2026')
  })
})

describe('formatDateTime', () => {
  it('joins date and 12 h time with a middle dot', () => {
    expect(formatDateTime(new Date(2026, 8, 30, 19, 30))).toBe('30 sept · 7:30 p. m.')
    expect(formatDateTime(new Date(2026, 9, 4, 0, 5))).toBe('4 oct · 12:05 a. m.')
  })
})

describe('formatCapacity', () => {
  it('uses singular only for one person', () => {
    expect(formatCapacity(1)).toBe('1 persona')
    expect(formatCapacity(4)).toBe('4 personas')
    expect(formatCapacity(20)).toBe('20 personas')
  })
})

describe('formatTableName', () => {
  it.each([
    ['4', 'Mesa 04'],
    ['04', 'Mesa 04'],
    ['004', 'Mesa 04'],
    ['12', 'Mesa 12'],
    ['123', 'Mesa 123'],
    ['T1', 'Mesa T1'],
    [' 7 ', 'Mesa 07'],
    ['Mesa 4', 'Mesa 04'],
    ['mesa 12', 'Mesa 12'],
    ['Mesa T1', 'Mesa T1'],
    ['Mesa', 'Mesa Mesa'],
  ])('%s → %s', (input, expected) => {
    expect(formatTableName(input)).toBe(expected)
  })
})

describe('normalizeTableIdentifier', () => {
  it('makes numeric identifiers collide regardless of leading zeros', () => {
    expect(normalizeTableIdentifier('4')).toBe(normalizeTableIdentifier('004'))
    expect(normalizeTableIdentifier('04')).toBe('4')
  })

  it('treats the backend full name ("Mesa 4") as the same table as "4" or "04"', () => {
    expect(normalizeTableIdentifier('Mesa 4')).toBe(normalizeTableIdentifier('04'))
    expect(normalizeTableIdentifier('mesa T1')).toBe(normalizeTableIdentifier('t1'))
  })

  it('trims and lowercases text identifiers', () => {
    expect(normalizeTableIdentifier(' T1 ')).toBe('t1')
    expect(normalizeTableIdentifier('Terraza')).toBe(normalizeTableIdentifier('terraza'))
  })

  it('keeps different identifiers different', () => {
    expect(normalizeTableIdentifier('4')).not.toBe(normalizeTableIdentifier('40'))
    expect(normalizeTableIdentifier('T1')).not.toBe(normalizeTableIdentifier('T01'))
  })
})
