import { describe, expect, it } from 'vitest'
import { codeProblem, normalizeCode } from './code'

describe('normalizeCode', () => {
  it('uppercases and drops every space, also when pasted', () => {
    expect(normalizeCode('k7m 4qx')).toBe('K7M4QX')
    expect(normalizeCode('  K7M\t4Q X \n')).toBe('K7M4QX')
  })
})

describe('codeProblem', () => {
  it('accepts exactly 6 characters of the alphabet', () => {
    expect(codeProblem('K7M4QX')).toBeNull()
  })

  it('flags an empty code', () => {
    expect(codeProblem('')).toBe('empty')
  })

  it('flags a wrong length or a confusable character (0 O 1 I L)', () => {
    expect(codeProblem('K7M4Q')).toBe('format')
    expect(codeProblem('K7M4QXZ')).toBe('format')
    for (const confusable of ['0', 'O', '1', 'I', 'L']) expect(codeProblem(`K7M4Q${confusable}`)).toBe('format')
    expect(codeProblem('K7M-QX')).toBe('format')
  })
})
