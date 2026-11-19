import { ChartNoAxesColumn, CirclePause, ClipboardCheck, History, LayoutGrid, Store, Wallet, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Active only on this exact route (the administrator's Resumen is `/admin`, the parent of the other sections). */
  end?: boolean
  /** Words for a count shown on the item, for the screen reader: «4 solicitudes pendientes». */
  badgeLabel?: (count: number) => string
}

/** Sections of the restaurant's navigation dock (manual 12.2, v2.1). */
export const NAV_ITEMS_RESTAURANT: NavItem[] = [
  { to: '/mesas', label: 'Mesas', icon: LayoutGrid },
  { to: '/resumen', label: 'Resumen', icon: ChartNoAxesColumn },
  { to: '/restaurante', label: 'Restaurante', icon: Store },
  { to: '/bitacora', label: 'Bitácora', icon: History },
]

/** The DiNNo administrator's dock (Sprint 4): Resumen is `/admin`; Solicitudes carries the pending count. */
export const NAV_ITEMS_ADMIN: NavItem[] = [
  { to: '/admin', label: 'Resumen', icon: ChartNoAxesColumn, end: true },
  {
    to: '/admin/solicitudes',
    label: 'Solicitudes',
    icon: ClipboardCheck,
    badgeLabel: (count) => `${count} ${count === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}`,
  },
  { to: '/admin/restaurantes', label: 'Restaurantes', icon: Store },
  { to: '/admin/cobros', label: 'Cobros', icon: Wallet },
]

/** A suspended restaurant keeps its account page (reservations and check-in) and the read-only summary (§12.15). */
export const NAV_ITEMS_SUSPENDED: NavItem[] = [
  { to: '/suspendido', label: 'Cuenta', icon: CirclePause },
  { to: '/resumen', label: 'Resumen', icon: ChartNoAxesColumn },
]

/** Kept for the code that still asks for the restaurant's items by their old name. */
export const NAV_ITEMS = NAV_ITEMS_RESTAURANT
