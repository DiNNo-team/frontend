import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api-client'
import { checkInErrorText, checkInSuccessText, closeWithReservationsText, dinerNameOf, tableProtectionMessage } from './messages'

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

describe('check-in texts (CLAUDE.md §12.6)', () => {
  it('success: table, people (singular) and «Comensal» without a name', () => {
    expect(checkInSuccessText({ tableIdentifier: '04', partySize: 2, dinerName: 'Laura' })).toBe('Check-in confirmado · Mesa 04 · 2 personas · Laura')
    expect(checkInSuccessText({ tableIdentifier: 'Mesa 4', partySize: 1, dinerName: null })).toBe('Check-in confirmado · Mesa 04 · 1 persona · Comensal')
  })

  it('maps each errorCode; expired and already used show the backend message (with the time)', () => {
    const error = (status: number, code: string, message?: string) => new ApiError({ status, code, message })
    expect(checkInErrorText(error(404, 'RESERVATION_CODE_NOT_FOUND', 'x'))).toBe('No encontramos una reserva con ese código en tu restaurante.')
    expect(checkInErrorText(error(409, 'RESERVATION_EXPIRED', 'Esta reserva se venció a las 12:41. La mesa ya se liberó.'))).toBe(
      'Esta reserva se venció a las 12:41. La mesa ya se liberó.',
    )
    expect(checkInErrorText(error(409, 'RESERVATION_ALREADY_USED', 'Este código ya se usó a las 12:35.'))).toBe('Este código ya se usó a las 12:35.')
    expect(checkInErrorText(error(409, 'RESERVATION_CANCELLED', 'texto del backend'))).toBe('El comensal canceló esta reserva.')
  })

  it('falls back without the time when the backend message is missing', () => {
    expect(checkInErrorText(new ApiError({ status: 409, code: 'RESERVATION_EXPIRED' }))).toBe('Esta reserva se venció. La mesa ya se liberó.')
    expect(checkInErrorText(new ApiError({ status: 409, code: 'RESERVATION_ALREADY_USED' }))).toBe('Este código ya se usó.')
  })

  it('network, session and unknown errors use the generic texts', () => {
    expect(checkInErrorText(new ApiError({ status: 0, isNetworkError: true }))).toBe('No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.')
    expect(checkInErrorText(new ApiError({ status: 401 }))).toBe('Tu sesión terminó. Inicia sesión de nuevo.')
    expect(checkInErrorText(new ApiError({ status: 500, message: 'boom' }))).toBe('No pudimos validar el código. Revisa tu conexión e intenta de nuevo.')
  })
})
