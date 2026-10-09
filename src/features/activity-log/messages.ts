// Texts of the table log screen. From the manual (12.4 and 11.4) unless marked "approved"
// (proposed by Sergio following 11 and 14, approved for PBI 9). Session and permission errors
// come from `getApiErrorMessage` (@/lib/api-client).

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
  limitNotice: 'Ves los 200 cambios más recientes. Filtra por mesa para ver cambios anteriores de esa mesa.',
} as const

/** Approved. Empty state while one table is selected: "Mesa 04 todavía no tiene cambios de estado." */
export function tableWithoutChangesText(tableName: string): string {
  return `${tableName} todavía no tiene cambios de estado.`
}
