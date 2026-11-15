import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api-client'
import { cancellationSentence, conversionSentence, describeReportError, noShowSentence, perTen, SUMMARY_TEXT } from './messages'

describe('rates in plain words, each with its own denominator', () => {
  it('says «de cada 10» to the nearest tenth, and does not hide the edges', () => {
    expect(perTen(0.4)).toBe('4')
    expect(perTen(0.3333)).toBe('3')
    expect(perTen(0)).toBe('0')
    expect(perTen(1)).toBe('10')
    expect(perTen(0.02)).toBe('menos de 1')
    expect(perTen(0.98)).toBe('más de 9')
  })

  it('conversion and cancellation are over the reservations created; no-show is over those that arrived or expired', () => {
    expect(conversionSentence(0.4)).toBe('De cada 10 reservas, 4 llegaron.')
    expect(cancellationSentence(0.2667)).toBe('De cada 10 reservas, 3 se cancelaron.')
    expect(noShowSentence(0.3333, 18)).toBe('De las 18 reservas que llegaron o vencieron, 3 de cada 10 no llegaron.')
    expect(noShowSentence(0.3333, 18)).not.toContain('De cada 10 reservas')
  })

  it('the help defines every denominator', () => {
    const help = SUMMARY_TEXT.ratesHelp.join(' ')
    expect(help).toContain('de todas las reservas creadas')
    expect(help).toContain('de las que ya se resolvieron por llegada o por vencimiento')
  })
})

describe('describeReportError', () => {
  it('uses the manual text for network and access errors and the given fallback otherwise', () => {
    expect(describeReportError(new ApiError({ status: 0, isNetworkError: true }), 'x')).toBe('No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.')
    expect(describeReportError(new ApiError({ status: 403, code: 'ACCOUNT_PENDING_APPROVAL' }), 'x')).toBe(
      'Tu solicitud está en revisión. Te avisaremos cuando tu cuenta esté aprobada.',
    )
    expect(describeReportError(new ApiError({ status: 400 }), 'Texto propio')).toBe('Texto propio')
  })
})
