import { describe, expect, it } from 'vitest'
import { logAuthor } from './messages'

describe('logAuthor (CLAUDE.md §12.3)', () => {
  it('manual → the admin email', () => {
    expect(logAuthor({ source: 'manual', userEmail: 'admin@casa72.co' })).toBe('admin@casa72.co')
  })

  it('reservation without email → «Comensal» (a diner email never reaches the restaurant)', () => {
    expect(logAuthor({ source: 'reservation', userEmail: null })).toBe('Comensal')
  })

  it('reservation with email (the check-in) → the admin email', () => {
    expect(logAuthor({ source: 'reservation', userEmail: 'admin@casa72.co' })).toBe('admin@casa72.co')
  })

  it('system → «Automático», even if an email came', () => {
    expect(logAuthor({ source: 'system', userEmail: null })).toBe('Automático')
    expect(logAuthor({ source: 'system', userEmail: 'admin@casa72.co' })).toBe('Automático')
  })

  it('never an empty cell: manual without email reads «Automático»', () => {
    expect(logAuthor({ source: 'manual', userEmail: null })).toBe('Automático')
  })
})
