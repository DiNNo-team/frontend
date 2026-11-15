import { describe, expect, it } from 'vitest'
import { formatSince } from './relative-time'

const NOW = new Date('2026-11-15T12:00:00Z')
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString()
const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

describe('formatSince', () => {
  it.each([
    [10_000, 'hace un momento'],
    [MINUTE, 'hace 1 minuto'],
    [45 * MINUTE, 'hace 45 minutos'],
    [HOUR, 'hace 1 hora'],
    [5 * HOUR, 'hace 5 horas'],
    [DAY, 'hace 1 día'],
    [2 * DAY, 'hace 2 días'],
    [29 * DAY, 'hace 29 días'],
    [30 * DAY, 'hace 1 mes'],
    [75 * DAY, 'hace 2 meses'],
  ])('%i ms ago is «%s»', (elapsed, text) => {
    expect(formatSince(ago(elapsed), NOW)).toBe(text)
  })

  it('a date in the future counts as just now, never as a negative time', () => {
    expect(formatSince(new Date(NOW.getTime() + HOUR), NOW)).toBe('hace un momento')
  })
})
