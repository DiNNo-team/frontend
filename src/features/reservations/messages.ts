import { ApiError, getApiErrorMessage, isAccessError } from '@/lib/api-client'
import { formatCapacity, formatTableName } from '@/lib/format'
import type { CodeProblem } from './code'
import type { CheckInResult } from './types'

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
  // Panel and check-in (reparto 9.2 and §12.6).
  panelTitle: 'Reservas DiNNo',
  panelEmpty: 'No hay reservas en este momento',
  panelEmptyDescription: 'Cuando un comensal reserve desde la app, aparecerá aquí sin recargar.',
  panelLoading: 'Cargando las reservas',
  panelLoadError: 'No pudimos cargar las reservas. Revisa tu conexión e intenta de nuevo.',
  panelExpiring: 'Venciendo…',
  retry: 'Intentar de nuevo',
  validateCode: 'Validar código',
  validating: 'Validando…',
  checkInTitle: 'Validar código',
  checkInDescription: 'Escribe el código de 6 caracteres que te muestra el comensal en la app.',
  codeLabel: 'Código de la reserva',
  codePlaceholder: 'Ej.: K7M4QX',
  close: 'Cerrar',
  // Own texts (approved with the decisions of the sprint's Phase 0), following manual 14.
  codeEmpty: 'Escribe el código que te muestra el comensal.',
  codeFormat: 'El código tiene 6 letras y números. Revísalo con el comensal.',
  checkInFailed: 'No pudimos validar el código. Revisa tu conexión e intenta de nuevo.',
  /** The table of a DiNNo reservation, in the tooltip and the status picker. */
  lockedReason: 'Reserva de DiNNo en curso: se libera sola cuando el comensal llegue, cancele o se venza la reserva.',
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

/** «Check-in confirmado · Mesa 04 · 2 personas · Laura» (§12.6; «Comensal» without a name, «1 persona» in singular). */
export function checkInSuccessText(result: Pick<CheckInResult, 'tableIdentifier' | 'partySize' | 'dinerName'>): string {
  return `Check-in confirmado · ${formatTableName(result.tableIdentifier)} · ${formatCapacity(result.partySize)} · ${dinerNameOf(result.dinerName)}`
}

/** Text of a failed check-in (§12.6). EXPIRED and ALREADY_USED show the backend `message`: it carries the Bogotá time. */
export function checkInErrorText(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case RESERVATION_ERROR_CODES.reservationCodeNotFound:
        return RESERVATION_TEXT.codeNotFound
      case RESERVATION_ERROR_CODES.reservationExpired:
        return backendText(error) ?? RESERVATION_TEXT.expiredFallback
      case RESERVATION_ERROR_CODES.reservationAlreadyUsed:
        return backendText(error) ?? RESERVATION_TEXT.alreadyUsedFallback
      case RESERVATION_ERROR_CODES.reservationCancelled:
        return RESERVATION_TEXT.cancelled
    }
    if (isAccessError(error) || error.isNetworkError) return getApiErrorMessage(error)
  }
  return RESERVATION_TEXT.checkInFailed
}

/** The backend's final text, only when it is a real sentence (ApiError fills a technical one when the body had none). */
function backendText(error: ApiError): string | undefined {
  const message = error.message.trim()
  return message && !message.startsWith('API error') ? message : undefined
}

/** Text for a code the web does not send (checked before the request). */
export function codeProblemText(problem: CodeProblem): string {
  return problem === 'empty' ? RESERVATION_TEXT.codeEmpty : RESERVATION_TEXT.codeFormat
}

/** «Mesa 04 · 2 personas», the second line of a panel row. */
export function reservationDetailsText(reservation: { tableIdentifier: string; partySize: number }): string {
  return `${formatTableName(reservation.tableIdentifier)} · ${formatCapacity(reservation.partySize)}`
}
