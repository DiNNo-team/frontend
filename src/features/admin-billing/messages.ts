import { ApiError, getApiErrorMessage } from '@/lib/api-client'
import { matchesPerGuestTotal } from '@/lib/per-guest-fee'
import { formatAdminCop } from '../admin/format'
import { capitalize, monthName } from '../admin/month'
import type { AdminBillingDetail } from '../admin/panel-types'

// Texts of the administrator's billing screens. Each `errorCode` has the contract's text (docs/admin-panel-contract.md §0);
// the backend `message` is never shown.

export const BILLING_PAGE_SIZE = 20
export const CHECK_INS_PAGE_SIZE = 50

export const BILLING_TEXT = {
  title: 'Cobros',
  description: 'Lo que se cobra a cada restaurante por los check-ins de cada mes.',
  retry: 'Intentar de nuevo',
  listLoadError: 'No pudimos cargar los cobros. Revisa tu conexión e intenta de nuevo.',
  detailLoadError: 'No pudimos cargar este cobro. Revisa tu conexión e intenta de nuevo.',
  notFound: 'No encontramos ese restaurante.',
  backToList: 'Volver a cobros',
  monthPicker: 'Mes de cobro',
  totalsLabel: 'Totales del mes',
  totalCheckIns: 'Check-ins',
  totalAmount: 'Monto',
  totalPaid: 'Cobrado',
  totalPending: 'Pendiente',
  tableCaption: 'Cobro de cada restaurante en el mes',
  columnRestaurant: 'Restaurante',
  columnState: 'Estado',
  columnCheckIns: 'Check-ins',
  columnAmount: 'Monto',
  columnCharge: 'Cobro',
  seeDetail: 'Ver detalle',
  seeDetailOf: (name: string) => `Ver el cobro de ${name}`,
  itemsLabel: 'restaurantes',
  emptyTitle: 'Aún no hay check-ins este mes',
  emptyDescription: 'Cuando los restaurantes reciban comensales con reserva, su cobro aparecerá aquí.',
  // Detail
  chargeFormula: (guests: number, fee: string) => `${guests} ${guests === 1 ? 'comensal' : 'comensales'} × ${fee} por comensal`,
  chargeMixed: (count: number) => `${count} ${count === 1 ? 'check-in' : 'check-ins'}, cada uno con el monto que se le cobró ese día`,
  feePerGuest: (fee: string) => `Tarifa por comensal: ${fee}`,
  /** «2 personas × $ 1.500»: shown beside the amount of a check-in charged per guest. */
  feeFormula: (people: number, fee: string) => `${people} ${people === 1 ? 'persona' : 'personas'} × ${fee}`,
  whyTitle: 'Cómo se calcula el cobro',
  why: 'Cada check-in cobra las personas de la reserva por la tarifa por comensal que había ese día. Los check-ins anteriores a esa tarifa conservan el monto que se les cobró. Las reservas canceladas o vencidas no se cobran.',
  checkInsTitle: 'Check-ins del mes',
  checkInsCaption: 'Check-ins del mes',
  columnWhen: 'Fecha y hora',
  columnParty: 'Personas',
  columnFee: 'Monto cobrado',
  checkInsEmpty: 'Aún no hay check-ins este mes',
  checkInsEmptyDescription: 'Un check-in aparece aquí cuando el restaurante valida el código de un comensal.',
  checkInsLabel: 'check-ins',
  markPaid: 'Marcar como cobrado',
  undoPaid: 'Deshacer cobro',
  marking: 'Marcando…',
  undoing: 'Deshaciendo…',
  paidOn: (date: string) => `Cobrado el ${date}`,
  inProgressNote: 'Podrás marcarlo desde el día 1 del mes siguiente',
  nothingToBillNote: 'No hay nada que cobrar este mes',
  markTitle: (month: string, name: string, amount: string) => `¿Marcar ${month} de ${name} como cobrado por ${amount}?`,
  markBody: 'Se guarda el monto y los check-ins de este momento. Si te equivocas, puedes deshacerlo.',
  undoTitle: (month: string, name: string) => `¿Deshacer el cobro de ${month} de ${name}?`,
  undoBody: 'El mes volverá a quedar pendiente y se borran los datos del pago.',
  markedToast: (month: string, name: string) => `${month} de ${name} marcado como cobrado`,
  undoneToast: 'Cobro deshecho',
  markFailed: 'No pudimos marcar el cobro. Intenta de nuevo.',
  undoFailed: 'No pudimos deshacer el cobro. Intenta de nuevo.',
  mismatch: (current: string, saved: string) => `El monto actual (${current}) no coincide con el cobrado (${saved}). Revísalo antes de hacer cambios.`,
  mismatchTitle: 'El monto cambió',
  suspendedNote: 'Restaurante suspendido',
} as const

const ERROR_TEXT: Record<string, string> = {
  PERIOD_NOT_CLOSED: 'Este mes todavía no termina. Podrás marcarlo como cobrado desde el día 1 del mes siguiente.',
  NOTHING_TO_BILL: 'Este restaurante no tiene check-ins en ese mes: no hay nada que cobrar.',
  PERIOD_ALREADY_PAID: 'Este mes ya estaba marcado como cobrado.',
  PERIOD_NOT_PAID: 'Este mes ya no estaba marcado como cobrado.',
  RESTAURANT_NOT_FOUND: BILLING_TEXT.notFound,
}

/** A 409 of billing: the month is not what the screen thought, so the detail is asked again and shows what it is now. */
export function isBillingConflict(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409 && error.code !== undefined && error.code in ERROR_TEXT
}

export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404 && error.code === 'RESTAURANT_NOT_FOUND'
}

/** The text of a failed billing call: by `errorCode`, then the manual's access, network and limit texts, then the fallback. */
export function describeBillingError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.code && ERROR_TEXT[error.code]) return ERROR_TEXT[error.code]
    if (error.isNetworkError || error.status === 401 || error.status === 403 || error.status === 429) return getApiErrorMessage(error)
  }
  return fallback
}

export type ChargeAction = 'mark-paid' | 'undo' | 'in-progress' | 'nothing'

/** Which action the detail offers: only a pending month with something to bill can be marked, only a paid one undone. */
export function chargeAction(detail: Pick<AdminBillingDetail, 'status' | 'amountCop'>): ChargeAction {
  if (detail.status === 'in_progress') return 'in-progress'
  if (detail.status === 'paid') return 'undo'
  return detail.amountCop > 0 ? 'mark-paid' : 'nothing'
}

/**
 * «30 comensales × $ 1.500 por comensal» only when every check-in of the month is in `items` and the amount is exactly
 * their people × today's fee per guest; otherwise (older check-ins kept a flat amount, or the list is partial) it only says
 * each check-in kept the amount it was charged.
 */
export function chargeFormula(detail: Pick<AdminBillingDetail, 'totalCheckIns' | 'amountCop' | 'items'>, feePerGuestCop?: number): string {
  const guests = detail.items.reduce((total, item) => total + item.partySize, 0)
  const complete = detail.items.length === detail.totalCheckIns
  return complete && feePerGuestCop !== undefined && matchesPerGuestTotal(guests, detail.amountCop, feePerGuestCop)
    ? BILLING_TEXT.chargeFormula(guests, formatAdminCop(feePerGuestCop))
    : BILLING_TEXT.chargeMixed(detail.totalCheckIns)
}

export const markedText = (month: string, name: string) => BILLING_TEXT.markedToast(capitalize(monthName(month)), name)
