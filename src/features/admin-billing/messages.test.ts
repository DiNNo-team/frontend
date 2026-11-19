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
  const perGuest = [
    { partySize: 2, feeCop: 3000 },
    { partySize: 4, feeCop: 6000 },
  ] as never

  it('says guests × fee per guest when every check-in is on the page and the amount is exactly that', () => {
    expect(chargeFormula({ totalCheckIns: 2, amountCop: 9000, items: perGuest }, 1500)).toBe('6 comensales × $ 1.500 por comensal')
    expect(chargeFormula({ totalCheckIns: 1, amountCop: 1500, items: [{ partySize: 1, feeCop: 1500 }] as never }, 1500)).toBe('1 comensal × $ 1.500 por comensal')
  })

  it('only says each check-in kept the amount it was charged when the month has older check-ins (flat amount)', () => {
    const mixed = [{ partySize: 2, feeCop: 3000 }, { partySize: 4, feeCop: 2000 }] as never
    expect(chargeFormula({ totalCheckIns: 2, amountCop: 5000, items: mixed }, 1500)).toBe('2 check-ins, cada uno con el monto que se le cobró ese día')
  })

  it('does not claim a formula when the list is partial or the fee is unknown', () => {
    expect(chargeFormula({ totalCheckIns: 12, amountCop: 9000, items: perGuest }, 1500)).toMatch(/cada uno con el monto/)
    expect(chargeFormula({ totalCheckIns: 2, amountCop: 9000, items: perGuest })).toMatch(/cada uno con el monto/)
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
