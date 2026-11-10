import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api-client'
import { AREA_MESSAGES, describeAreaError, validateAreaName } from './area-form'

const areas = [{ id: 'a1', name: 'Terraza' }]

describe('validateAreaName', () => {
  it('asks for a name and limits it to 30 characters', () => {
    expect(validateAreaName('  ', areas)).toBe(AREA_MESSAGES.nameRequired)
    expect(validateAreaName('x'.repeat(31), areas)).toBe(AREA_MESSAGES.nameTooLong)
    expect(validateAreaName('x'.repeat(30), areas)).toBeUndefined()
  })

  it('treats names with other capitals or spaces as the same zone, except the one being renamed', () => {
    expect(validateAreaName(' TERRAZA ', areas)).toBe(AREA_MESSAGES.nameTaken('TERRAZA'))
    expect(validateAreaName('terraza', areas, 'a1')).toBeUndefined()
  })
})

describe('describeAreaError', () => {
  it('maps the backend answers to the texts of the web', () => {
    expect(describeAreaError(new ApiError({ status: 409, message: 'Ya tienes…' }), 'Bar')).toBe(AREA_MESSAGES.nameTaken('Bar'))
    expect(describeAreaError(new ApiError({ status: 409, message: 'Puedes tener máximo 20 zonas.' }), 'Bar')).toBe(AREA_MESSAGES.limit)
    expect(describeAreaError(new ApiError({ status: 404, message: 'x' }), 'Bar')).toBe(AREA_MESSAGES.notFound)
    expect(describeAreaError(new ApiError({ status: 0, isNetworkError: true, message: 'x' }), 'Bar')).toBe(AREA_MESSAGES.saveFailed)
  })
})
