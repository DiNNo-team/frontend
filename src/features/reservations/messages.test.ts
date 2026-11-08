import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api-client'
import { closeWithReservationsText, dinerNameOf, tableProtectionMessage } from './messages'

describe('tableProtectionMessage (CLAUDE.md §12.2)', () => {
  it('maps the two new 409s to their exact texts', () => {
    expect(tableProtectionMessage(new ApiError({ status: 409, code: 'TABLE_HAS_ACTIVE_RESERVATION' }))).toBe(
      'Esta mesa tiene una reserva de DiNNo en curso. Se libera sola cuando el comensal llegue, cancele o se venza la reserva.',
    )
    expect(tableProtectionMessage(new ApiError({ status: 409, code: 'TABLE_NOT_AVAILABLE_TO_DEACTIVATE' }))).toBe(
      'Para desactivar esta mesa, primero márcala como Disponible.',
    )
  })

  it('leaves the Sprint 1 409s (no errorCode) and other errors to the caller', () => {
    expect(tableProtectionMessage(new ApiError({ status: 409 }))).toBeUndefined()
    expect(tableProtectionMessage(new ApiError({ status: 409, code: 'TABLE_IDENTIFIER_TAKEN' }))).toBeUndefined()
    expect(tableProtectionMessage(new ApiError({ status: 404, code: 'TABLE_HAS_ACTIVE_RESERVATION' }))).toBeUndefined()
    expect(tableProtectionMessage(new Error('boom'))).toBeUndefined()
  })
})

describe('closeWithReservationsText', () => {
  it('agrees in singular and plural', () => {
    expect(closeWithReservationsText(1)).toBe('Tienes 1 reserva en curso; se mantendrá hasta que llegue o se venza.')
    expect(closeWithReservationsText(3)).toBe('Tienes 3 reservas en curso; se mantendrán hasta que lleguen o se venzan.')
  })
})

describe('dinerNameOf', () => {
  it('shows «Comensal» without a public name', () => {
    expect(dinerNameOf(null)).toBe('Comensal')
    expect(dinerNameOf('  ')).toBe('Comensal')
    expect(dinerNameOf('Laura')).toBe('Laura')
  })
})
