import { describe, expect, it } from 'vitest'
import { isInsideBogota, roundCoordinate } from './location'

describe('restaurant location rules (same as the backend)', () => {
  it('accepts points inside Bogotá, edges included', () => {
    expect(isInsideBogota({ latitude: 4.655671, longitude: -74.057006 })).toBe(true)
    expect(isInsideBogota({ latitude: 4.45, longitude: -73.95 })).toBe(true)
    expect(isInsideBogota({ latitude: 4.85, longitude: -74.25 })).toBe(true)
  })

  it('rejects points outside Bogotá', () => {
    expect(isInsideBogota({ latitude: 4.449, longitude: -74.05 })).toBe(false)
    expect(isInsideBogota({ latitude: 4.851, longitude: -74.05 })).toBe(false)
    expect(isInsideBogota({ latitude: 4.65, longitude: -74.251 })).toBe(false)
    expect(isInsideBogota({ latitude: 4.65, longitude: -73.949 })).toBe(false)
  })

  it('rounds to the 6 decimals the backend keeps', () => {
    expect(roundCoordinate(4.65567149999)).toBe(4.655671)
    expect(roundCoordinate(-74.05700651234)).toBe(-74.057007)
  })
})
