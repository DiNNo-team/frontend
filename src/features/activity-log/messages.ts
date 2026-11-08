// Texts of the table log screen. From the manual (12.4 and 11.4) unless marked "approved"
// (proposed by Sergio following 11 and 14, approved for PBI 9). Session and permission errors
// come from `getApiErrorMessage` (@/lib/api-client).

import type { TableLog } from './types'

export const TABLE_LOG_TEXT = {
  title: 'Bitácora',
  description: 'Cambios de estado de tus mesas',
  emptyTitle: 'Aún no hay cambios',
  emptyDescription: 'Aquí verás cada cambio de estado de tus mesas.',
  retry: 'Intentar de nuevo',
  columnDate: 'Fecha y hora',
  columnTable: 'Mesa',
  columnChange: 'Cambio',
  columnUser: 'Usuario',
  // Approved.
  filterLabel: 'Mesa',
  allTables: 'Todas las mesas',
  caption: 'Bitácora de cambios de mesas',
  loading: 'Cargando la bitácora',
  loadErrorTitle: 'No pudimos cargar la bitácora',
  loadErrorDescription: 'Revisa tu conexión e intenta de nuevo.',
  // CLAUDE.md §12.3 (Sprint 3).
  authorDiner: 'Comensal',
  authorSystem: 'Automático',
  limitNotice: 'Ves los 200 cambios más recientes. Filtra por mesa para ver cambios anteriores de esa mesa.',
} as const

/** Approved. Empty state while one table is selected: "Mesa 04 todavía no tiene cambios de estado." */
export function tableWithoutChangesText(tableName: string): string {
  return `${tableName} todavía no tiene cambios de estado.`
}

/**
 * Author of a change, by `source` (CLAUDE.md §12.3): `manual` → the admin's email · `reservation` without email →
 * «Comensal» · `reservation` with email (the check-in) → the admin's email · `system` → «Automático».
 * A row without email outside those cases (should not happen) reads «Automático» rather than an empty cell.
 */
export function logAuthor(log: Pick<TableLog, 'source' | 'userEmail'>): string {
  if (log.source === 'system') return TABLE_LOG_TEXT.authorSystem
  if (log.userEmail) return log.userEmail
  return log.source === 'reservation' ? TABLE_LOG_TEXT.authorDiner : TABLE_LOG_TEXT.authorSystem
}
