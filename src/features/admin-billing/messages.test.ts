import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api-client'
import { chargeAction, chargeFormula, describeBillingError, isBillingConflict, markedText } from './messages'

describe('the action a month offers', () => {
  it('marks only a pending month with something to bill', () => {
    expect(chargeAction({ status: 'pending', amountCop: 24000 })).toBe('mark-paid')
    expect(chargeAction({ status: 'pending', amountCop: 0 })).toBe('nothing')
  })

  it('undoes only a paid month, and offers nothing while the month is running', () => {
    expect(chargeAction({ status: 'paid', amountCop: 24000 })).toBe('undo')
    expect(chargeAction({ status: 'in_progress', amountCop: 24000 })).toBe('in-progress')
  })
})

describe('the formula under the amount', () => {
  it('says N × fee when every check-in has the same fee and it adds up', () => {
    const items = [{ feeCop: 2000 }, { feeCop: 2000 }] as never
    expect(chargeFormula({ totalCheckIns: 12, amountCop: 24000, items })).toBe('12 check-ins × $ 2.000')
    expect(chargeFormula({ totalCheckIns: 1, amountCop: 2000, items: [{ feeCop: 2000 }] as never })).toBe('1 check-in × $ 2.000')
  })

  it('says each check-in kept its own fee when they differ or do not add up', () => {
    expect(chargeFormula({ totalCheckIns: 2, amountCop: 3500, items: [{ feeCop: 2000 }, { feeCop: 1500 }] as never })).toMatch(/cada uno con la tarifa/)
    expect(chargeFormula({ totalCheckIns: 12, amountCop: 25000, items: [{ feeCop: 2000 }] as never })).toMatch(/cada uno con la tarifa/)
  })
})

describe('errors of billing', () => {
  const conflict = (code: string) => new ApiError({ status: 409, code })

  it('has the contract text for each 409 and treats it as a conflict', () => {
    expect(describeBillingError(conflict('PERIOD_NOT_CLOSED'), 'x')).toMatch(/desde el día 1 del mes siguiente/)
    expect(describeBillingError(conflict('NOTHING_TO_BILL'), 'x')).toMatch(/no hay nada que cobrar/)
    expect(describeBillingError(conflict('PERIOD_ALREADY_PAID'), 'x')).toBe('Este mes ya estaba marcado como cobrado.')
    expect(describeBillingError(conflict('PERIOD_NOT_PAID'), 'x')).toBe('Este mes ya no estaba marcado como cobrado.')
    expect(isBillingConflict(conflict('PERIOD_ALREADY_PAID'))).toBe(true)
  })

  it('uses the manual texts for the limit and the network, and the fallback for the rest', () => {
    expect(describeBillingError(new ApiError({ status: 429 }), 'x')).toMatch(/muchas solicitudes/)
    expect(describeBillingError(new ApiError({ status: 0, isNetworkError: true }), 'x')).toMatch(/No pudimos conectarnos/)
    expect(describeBillingError(new ApiError({ status: 500 }), 'No pudimos marcar el cobro.')).toBe('No pudimos marcar el cobro.')
    expect(isBillingConflict(new ApiError({ status: 409 }))).toBe(false)
  })

  it('writes the toast with the capitalised month', () => {
    expect(markedText('2026-11', 'Casa 72')).toBe('Noviembre de Casa 72 marcado como cobrado')
  })
})
