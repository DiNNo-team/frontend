import { describe, expect, it } from 'vitest'
import { formatCountdown, remainingMs, spokenCountdown } from './countdown'

const SERVER = '2026-11-08T17:00:00.000Z'
const EXPIRES = '2026-11-08T17:12:34.000Z'

describe('remainingMs (the server clock rules)', () => {
  it('is expiresAt − serverTime at the answer, minus the monotonic time since then', () => {
    expect(remainingMs(EXPIRES, SERVER, 1_000, 1_000)).toBe(754_000)
    expect(remainingMs(EXPIRES, SERVER, 1_000, 61_000)).toBe(694_000)
  })

  it('ignores the device clock: only server times and the monotonic clock take part', () => {
    // The device could be minutes ahead or behind: nothing here reads Date.now().
    expect(remainingMs(EXPIRES, SERVER, 50_000, 50_000)).toBe(754_000)
  })

  it('never goes below 0 and an already expired reservation reads 0', () => {
    expect(remainingMs(EXPIRES, SERVER, 0, 900_000)).toBe(0)
    expect(remainingMs(SERVER, EXPIRES, 0, 0)).toBe(0)
  })

  it('reads 0 for an unreadable date', () => {
    expect(remainingMs('nope', SERVER, 0, 0)).toBe(0)
  })
})

describe('formatCountdown', () => {
  it('shows mm:ss, counting partial seconds up', () => {
    expect(formatCountdown(754_000)).toBe('12:34')
    expect(formatCountdown(900_000)).toBe('15:00')
    expect(formatCountdown(200)).toBe('00:01')
    expect(formatCountdown(0)).toBe('00:00')
  })
})

describe('spokenCountdown', () => {
  it('reads minutes and seconds with singular', () => {
    expect(spokenCountdown(754_000)).toBe('12 minutos y 34 segundos')
    expect(spokenCountdown(61_000)).toBe('1 minuto y 1 segundo')
    expect(spokenCountdown(120_000)).toBe('2 minutos')
    expect(spokenCountdown(0)).toBe('0 segundos')
  })
})
