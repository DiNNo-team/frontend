import type { AdminActivityItem } from '../admin/panel-types'

// Texts and rules of the directory of restaurants (docs/admin-panel-contract.md §4).

export const RESTAURANTS_PAGE_SIZE = 20
/** The directory is asked whole (up to this many) and filtered and paged in the browser: the filter acts on every restaurant. */
export const DIRECTORY_FETCH_SIZE = 100

export const RESTAURANTS_TEXT = {
  title: 'Restaurantes',
  description: 'Los restaurantes que ya están en DiNNo: su actividad del mes y su estado.',
  filterLabel: 'Estado del restaurante',
  all: 'Todos',
  active: 'Activos',
  suspended: 'Suspendidos',
  tableCaption: 'Restaurantes en DiNNo',
  columnRestaurant: 'Restaurante',
  columnCategory: 'Categoría',
  columnState: 'Estado',
  columnOpen: 'Abierto o cerrado',
  columnCheckIns: 'Check-ins del mes',
  columnAmount: 'Monto del mes',
  columnPlan: 'Plano actualizado',
  columnSince: 'En DiNNo desde',
  openRestaurant: (name: string) => `Ver ${name}`,
  noCategory: 'Sin categoría',
  noPlanChanges: 'Sin cambios registrados',
  itemsLabel: 'restaurantes',
  emptyAll: 'Aún no hay restaurantes en DiNNo',
  emptyAllDescription: 'Cuando apruebes una solicitud, el restaurante aparecerá aquí.',
  emptySuspended: 'No hay restaurantes suspendidos',
  emptyActive: 'No hay restaurantes activos',
  loadError: 'No pudimos cargar los restaurantes. Revisa tu conexión e intenta de nuevo.',
  retry: 'Intentar de nuevo',
  detailLabel: 'Detalle del restaurante',
} as const

export type DirectoryFilter = 'all' | 'active' | 'suspended'

export const FILTER_BY_PARAM: Record<string, DirectoryFilter> = { todos: 'all', activos: 'active', suspendidos: 'suspended' }
export const PARAM_BY_FILTER: Record<DirectoryFilter, string> = { all: 'todos', active: 'activos', suspended: 'suspendidos' }

/** The restaurants a filter keeps: «Activos» are the approved ones, «Suspendidos» the suspended ones. */
export function filterDirectory(items: AdminActivityItem[], filter: DirectoryFilter): AdminActivityItem[] {
  if (filter === 'all') return items
  return items.filter((item) => (filter === 'suspended' ? item.approvalStatus === 'suspended' : item.approvalStatus === 'approved'))
}

/** «En DiNNo desde»: when the administrator approved it, or when the team created it if it never went through the review. */
export function memberSince(item: Pick<AdminActivityItem, 'approvedAt' | 'createdAt'>): string {
  return item.approvedAt ?? item.createdAt
}
