import { describe, expect, it } from 'vitest'
import { createScanBuffer, MAX_KEY_GAP_MS } from './scanner'

/** Types `text` + Enter starting at `start`, one key every `gap` ms (Shift before each uppercase letter, like a scanner). */
function type(buffer: ReturnType<typeof createScanBuffer>, text: string, gap: number, start = 0): string | null {
  let at = start
  for (const char of text) {
    if (/[A-Z]/.test(char)) buffer.feed('Shift', at)
    buffer.feed(char, at)
    at += gap
  }
  return buffer.feed('Enter', at)
}

describe('createScanBuffer', () => {
  it('a fast burst of a valid code ending in Enter is a scan', () => {
    expect(type(createScanBuffer(), 'K7M4QX', 8)).toBe('K7M4QX')
  })

  it('normalizes the code like the check-in field (lowercase from a scanner set to lowercase)', () => {
    expect(type(createScanBuffer(), 'k7m4qx', 8)).toBe('K7M4QX')
  })

  it('a person typing (slower than the gap) is not a scan', () => {
    expect(type(createScanBuffer(), 'K7M4QX', MAX_KEY_GAP_MS + 40)).toBeNull()
  })

  it('a fast burst that is not a DiNNo code (wrong length or letters out of the alphabet) is ignored', () => {
    expect(type(createScanBuffer(), '7701234567890', 8)).toBeNull()
    expect(type(createScanBuffer(), 'K7M40X', 8)).toBeNull()
  })

  it('stray keys typed before the burst do not stick to the code', () => {
    const buffer = createScanBuffer()
    buffer.feed('a', 0)
    buffer.feed('b', 20)
    expect(type(buffer, 'P3R8TW', 8, 1000)).toBe('P3R8TW')
  })

  it('a non-character key (an arrow) in the middle breaks the burst', () => {
    const buffer = createScanBuffer()
    buffer.feed('K', 0)
    buffer.feed('7', 8)
    buffer.feed('ArrowLeft', 16)
    expect(type(buffer, 'M4QX', 8, 24)).toBeNull()
  })

  it('reads two scans in a row', () => {
    const buffer = createScanBuffer()
    expect(type(buffer, 'K7M4QX', 8)).toBe('K7M4QX')
    expect(type(buffer, 'P3R8TW', 8, 2000)).toBe('P3R8TW')
  })
})
