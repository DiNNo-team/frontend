import { describe, expect, it } from 'vitest'
import { matchesPerGuestFee, matchesPerGuestTotal } from './per-guest-fee'

describe('matchesPerGuestFee', () => {
  it.each([
    [1, 1500],
    [2, 3000],
    [4, 6000],
    [5, 7500],
  ])('%i people kept %i: matches the per-guest fee', (partySize, feeCop) => {
    expect(matchesPerGuestFee({ partySize, feeCop }, 1500)).toBe(true)
  })

  it('does not match a check-in that kept a flat amount (before the per-guest fee)', () => {
    expect(matchesPerGuestFee({ partySize: 4, feeCop: 2000 }, 1500)).toBe(false)
    expect(matchesPerGuestFee({ partySize: 1, feeCop: 2000 }, 1500)).toBe(false)
  })

  it('does not match while the fee is unknown or zero', () => {
    expect(matchesPerGuestFee({ partySize: 2, feeCop: 3000 }, undefined)).toBe(false)
    expect(matchesPerGuestFee({ partySize: 2, feeCop: 0 }, 0)).toBe(false)
  })
})

describe('matchesPerGuestTotal', () => {
  it('matches a period of per-guest check-ins only', () => {
    expect(matchesPerGuestTotal(12, 18000, 1500)).toBe(true)
    expect(matchesPerGuestTotal(12, 18500, 1500)).toBe(false)
    expect(matchesPerGuestTotal(0, 0, 1500)).toBe(false)
    expect(matchesPerGuestTotal(4, 6000, undefined)).toBe(false)
  })
})
