import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api-client'
import { NAV_ITEMS_RESTAURANT, NAV_ITEMS_SUSPENDED } from '@/components/layout'
import { STATUS_META } from '@/components/ui/status'
import { changeText, describeReportError, SUMMARY_TEXT } from './messages'

/** Every text of the screen, functions called with a sample, flattened: what a person could read. */
function allTexts(): string[] {
  const out: string[] = []
  const visit = (value: unknown) => {
    if (typeof value === 'string') out.push(value)
    else if (typeof value === 'function') out.push(String((value as (...args: number[]) => unknown)(2, 3, 4)))
    else if (Array.isArray(value)) value.forEach(visit)
    else if (value && typeof value === 'object') Object.values(value).forEach(visit)
  }
  visit(SUMMARY_TEXT)
  return out
}

describe('the restaurant pays: its screen never says «cobrar»', () => {
  it('no text of Resumen says «A cobrar», «cobro», «cobrado» or «cobra»', () => {
    for (const text of allTexts()) expect(text).not.toMatch(/cobr/i)
  })

  it('the payment words are «Total a pagar a DiNNo» and «Pagado»', () => {
    expect(SUMMARY_TEXT.paymentKicker).toBe('Total a pagar a DiNNo')
    expect(STATUS_META['payment-paid'].label).toBe('Pagado')
    expect(STATUS_META['payment-pending'].label).toBe('Pendiente')
    expect(STATUS_META['payment-in-progress'].label).toBe('En curso')
  })

  it('the restaurant dock and the suspended dock have no «cobro» either', () => {
    for (const item of [...NAV_ITEMS_RESTAURANT, ...NAV_ITEMS_SUSPENDED]) expect(item.label).not.toMatch(/cobr/i)
  })

  it('the payment states of the restaurant keep the shape and tone of the administrator\'s billing ones', () => {
    for (const [payment, billing] of [
      ['payment-in-progress', 'billing-in-progress'],
      ['payment-pending', 'billing-pending'],
      ['payment-paid', 'billing-paid'],
    ] as const) {
      expect(STATUS_META[payment].shape).toBe(STATUS_META[billing].shape)
      expect(STATUS_META[payment].tone).toBe(STATUS_META[billing].tone)
    }
  })
})

describe('the percentage of a change', () => {
  it('says it in words, up, down or the same, and nothing when there is nothing to compare', () => {
    expect(changeText(44)).toBe('Subió 44 %')
    expect(changeText(-20)).toBe('Bajó 20 %')
    expect(changeText(0)).toBe('Sin cambio')
    expect(changeText(null)).toBeNull()
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
