import { ApiError, getApiErrorMessage, isAccessError } from '@/lib/api-client'
import { REJECTION_REASON_LIMITS } from './types'

// Texts of the review panel (CLAUDE.md §12.9 and §12.12). Each `errorCode` has its own text; the backend one is never shown.

export const ADMIN_ERROR_CODES = { notPending: 'RESTAURANT_NOT_PENDING', notFound: 'RESTAURANT_NOT_FOUND' } as const

export const ADMIN_PAGE_SIZE = 20

export const ADMIN_TEXT = {
  tabsLabel: 'Estado de las solicitudes',
  tabPending: 'Pendientes',
  tabApproved: 'Aprobadas',
  tabRejected: 'Rechazadas',
  tableCaption: 'Solicitudes de restaurantes',
  columnRestaurant: 'Restaurante',
  columnCategory: 'Categoría',
  columnContact: 'Contacto',
  columnReceived: 'Recibida',
  columnReviewed: 'Revisada',
  columnStatus: 'Estado',
  itemsLabel: 'solicitudes',
  openRequest: (name: string) => `Ver la solicitud de ${name}`,
  back: 'Volver a solicitudes',
  detailTitleData: 'Datos',
  detailTitleLocation: 'Ubicación',
  detailTitleSchedule: 'Horarios',
  detailTitleReview: 'Revisión',
  seeOnMap: 'Ver en Google Maps',
  noLocation: 'Sin ubicación',
  notReviewed: 'Sin revisar',
  reasonLabel: 'Motivo',
  reasonField: 'Motivo del rechazo',
  reasonPlaceholder: 'Cuéntale al restaurante qué debe corregir',
  reasonHelp: 'El restaurante lo verá para corregir sus datos. Escribe de 10 a 300 caracteres.',
  draftsLabel: 'Insertar un motivo de ejemplo',
  rejecting: 'Rechazando…',
  approving: 'Aprobando…',
  cancel: 'Cancelar',
  loadingDetail: 'Cargando la solicitud',
  title: 'Solicitudes',
  description: 'Revisa los restaurantes que quieren estar en DiNNo.',
  listLoadError: 'No pudimos cargar las solicitudes. Revisa tu conexión e intenta de nuevo.',
  detailLoadError: 'No pudimos cargar esta solicitud. Revisa tu conexión e intenta de nuevo.',
  retry: 'Intentar de nuevo',
  emptyPending: 'No hay solicitudes pendientes',
  emptyPendingDescription: 'Cuando un restaurante pida entrar a DiNNo, aparecerá aquí.',
  emptyApproved: 'Todavía no hay restaurantes aprobados',
  emptyRejected: 'Todavía no hay solicitudes rechazadas',
  /** §12.9: someone else already reviewed it; the panel asks the detail again. */
  alreadyReviewed: 'Esta solicitud ya fue revisada.',
  notFound: 'No encontramos esta solicitud. Es posible que ya no exista.',
  approveTitle: 'Aprobar restaurante',
  approveBody: (name: string) =>
    `${name} podrá operar y aparecer a los comensales en DiNNo. No podrás deshacerlo desde aquí; el restaurante ve la decisión la próxima vez que entre.`,
  approveConfirm: 'Aprobar restaurante',
  approveSuccess: 'Restaurante aprobado',
  approveFailed: 'No pudimos aprobar el restaurante. Intenta de nuevo.',
  rejectTitle: 'Rechazar solicitud',
  rejectBody: 'Escribe el motivo. El restaurante lo verá para corregir sus datos y volver a enviar la solicitud. No podrás deshacerlo desde aquí.',
  rejectConfirm: 'Rechazar solicitud',
  rejectSuccess: 'Solicitud rechazada',
  rejectFailed: 'No pudimos rechazar la solicitud. Intenta de nuevo.',
} as const

/** Drafts the administrator can insert and edit (the field stays hers/his to change). */
export const REJECTION_DRAFTS = [
  { label: 'Dirección incorrecta', text: 'La dirección no coincide con la ubicación del mapa. Corrígela y vuelve a enviar la solicitud.' },
  { label: 'Teléfono inválido', text: 'No pudimos comunicarnos con el teléfono de contacto. Revísalo y vuelve a enviar la solicitud.' },
  { label: 'Horarios incompletos', text: 'Los horarios están incompletos o no son claros. Revísalos y vuelve a enviar la solicitud.' },
  { label: 'Datos poco claros', text: 'El nombre o la categoría no describen bien tu restaurante. Corrígelos y vuelve a enviar la solicitud.' },
] as const

export const REJECTION_REASON_MESSAGES = {
  required: 'Escribe el motivo del rechazo.',
  tooShort: `El motivo es muy corto. Usa al menos ${REJECTION_REASON_LIMITS.min} caracteres.`,
  tooLong: `El motivo es muy largo. Usa máximo ${REJECTION_REASON_LIMITS.max} caracteres.`,
} as const

/** Same rule as the backend: 10 to 300 characters, not counting the spaces at the ends. */
export function validateRejectionReason(reason: string): string | undefined {
  const length = reason.trim().length
  if (length === 0) return REJECTION_REASON_MESSAGES.required
  if (length < REJECTION_REASON_LIMITS.min) return REJECTION_REASON_MESSAGES.tooShort
  if (length > REJECTION_REASON_LIMITS.max) return REJECTION_REASON_MESSAGES.tooLong
  return undefined
}

export function isNotPendingError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409 && error.code === ADMIN_ERROR_CODES.notPending
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404 && error.code === ADMIN_ERROR_CODES.notFound
}

/** Text for a failed review call: by `errorCode`, then network and access texts, then the generic fallback. */
export function describeReviewError(error: unknown, fallback: string): string {
  if (isNotPendingError(error)) return ADMIN_TEXT.alreadyReviewed
  if (isNotFoundError(error)) return ADMIN_TEXT.notFound
  if (error instanceof ApiError && (error.isNetworkError || isAccessError(error))) return getApiErrorMessage(error)
  return fallback
}
