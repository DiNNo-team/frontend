import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api-client'
import { ADMIN_TEXT, describeReviewError, isNotFoundError, isNotPendingError, REJECTION_DRAFTS, validateRejectionReason } from './messages'

describe('validateRejectionReason (10 to 300 characters, ends trimmed)', () => {
  it('asks for the reason when it is empty or only spaces', () => {
    expect(validateRejectionReason('')).toBe('Escribe el motivo del rechazo.')
    expect(validateRejectionReason('          ')).toBe('Escribe el motivo del rechazo.')
  })

  it('does not count the spaces at the ends', () => {
    expect(validateRejectionReason('  corto   ')).toBe('El motivo es muy corto. Usa al menos 10 caracteres.')
    expect(validateRejectionReason(`  ${'a'.repeat(10)}  `)).toBeUndefined()
  })

  it('accepts the limits and rejects one more than 300', () => {
    expect(validateRejectionReason('a'.repeat(300))).toBeUndefined()
    expect(validateRejectionReason('a'.repeat(301))).toBe('El motivo es muy largo. Usa máximo 300 caracteres.')
  })

  it('every draft is valid by itself', () => {
    for (const draft of REJECTION_DRAFTS) expect(validateRejectionReason(draft.text)).toBeUndefined()
  })
})

describe('describeReviewError', () => {
  it('RESTAURANT_NOT_PENDING says it was already reviewed, by code', () => {
    const error = new ApiError({ status: 409, code: 'RESTAURANT_NOT_PENDING', message: 'texto del backend' })
    expect(isNotPendingError(error)).toBe(true)
    expect(describeReviewError(error, 'x')).toBe('Esta solicitud ya fue revisada.')
  })

  it('RESTAURANT_NOT_FOUND says the request no longer exists', () => {
    const error = new ApiError({ status: 404, code: 'RESTAURANT_NOT_FOUND' })
    expect(isNotFoundError(error)).toBe(true)
    expect(describeReviewError(error, 'x')).toBe(ADMIN_TEXT.notFound)
  })

  it('network and access errors use the manual texts, anything else the fallback', () => {
    expect(describeReviewError(new ApiError({ status: 0, isNetworkError: true }), 'x')).toBe('No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.')
    expect(describeReviewError(new ApiError({ status: 403, code: 'RESTAURANT_ACCOUNT' }), 'x')).toBe('No tienes acceso a esta sección.')
    expect(describeReviewError(new ApiError({ status: 500, message: 'boom' }), 'Texto propio')).toBe('Texto propio')
  })
})
