import { ApiError } from '@/lib/api-client'

// The single map `errorCode → text` of the web for Sprint 3 (CLAUDE.md §12.2, §12.6 and §12.9). Each screen asks
// here; never write these strings in a component. The backend `message` is never shown, except for the two
// check-in codes whose final text the backend builds with the Bogotá time (§12.6).

/** `errorCode` values of Sprint 3 the web branches on. */
export const RESERVATION_ERROR_CODES = {
  tableHasActiveReservation: 'TABLE_HAS_ACTIVE_RESERVATION',
  tableNotAvailableToDeactivate: 'TABLE_NOT_AVAILABLE_TO_DEACTIVATE',
  reservationCodeNotFound: 'RESERVATION_CODE_NOT_FOUND',
  reservationExpired: 'RESERVATION_EXPIRED',
  reservationAlreadyUsed: 'RESERVATION_ALREADY_USED',
  reservationCancelled: 'RESERVATION_CANCELLED',
} as const

export const RESERVATION_TEXT = {
  /** §12.2, agreed in the reparto (2.1). */
  tableHasActiveReservation:
    'Esta mesa tiene una reserva de DiNNo en curso. Se libera sola cuando el comensal llegue, cancele o se venza la reserva.',
  tableNotAvailableToDeactivate: 'Para desactivar esta mesa, primero márcala como Disponible.',
  /** §12.6. */
  codeNotFound: 'No encontramos una reserva con ese código en tu restaurante.',
  cancelled: 'El comensal canceló esta reserva.',
  /** Fallbacks for RESERVATION_EXPIRED / RESERVATION_ALREADY_USED if the backend `message` ever comes empty. */
  expiredFallback: 'Esta reserva se venció. La mesa ya se liberó.',
  alreadyUsedFallback: 'Este código ya se usó.',
  /** `dinerName: null` (§12.8). */
  dinerFallback: 'Comensal',
} as const

/** `errorCode` of an API error, or undefined. */
export function errorCodeOf(error: unknown): string | undefined {
  return error instanceof ApiError ? error.code : undefined
}

/**
 * Text of the two new table 409s (§12.2), or undefined for any other error. The old 409s of tables (already
 * inactive, repeated identifier) still come without `errorCode`, so they never match here.
 */
export function tableProtectionMessage(error: unknown): string | undefined {
  if (!(error instanceof ApiError) || error.status !== 409) return undefined
  if (error.code === RESERVATION_ERROR_CODES.tableHasActiveReservation) return RESERVATION_TEXT.tableHasActiveReservation
  if (error.code === RESERVATION_ERROR_CODES.tableNotAvailableToDeactivate) return RESERVATION_TEXT.tableNotAvailableToDeactivate
  return undefined
}

/** «Comensal» when the diner has no public name. */
export function dinerNameOf(name: string | null | undefined): string {
  const trimmed = name?.trim()
  return trimmed ? trimmed : RESERVATION_TEXT.dinerFallback
}

/**
 * §12.2 with N = `activeReservationsCount`: «Tienes 3 reservas en curso; se mantendrán hasta que lleguen o se venzan.»
 * The singular agrees in full: «Tienes 1 reserva en curso; se mantendrá hasta que llegue o se venza.»
 */
export function closeWithReservationsText(count: number): string {
  if (count === 1) return 'Tienes 1 reserva en curso; se mantendrá hasta que llegue o se venza.'
  return `Tienes ${count} reservas en curso; se mantendrán hasta que lleguen o se venzan.`
}
