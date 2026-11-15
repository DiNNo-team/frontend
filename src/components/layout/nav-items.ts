import { ClipboardCheck, History, LayoutGrid, Store, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Words for a count shown on the item, for the screen reader: «4 solicitudes pendientes». */
  badgeLabel?: (count: number) => string
}

/** Sections of the restaurant's navigation dock (manual 12.2, v2.1). */
export const NAV_ITEMS_RESTAURANT: NavItem[] = [
  { to: '/mesas', label: 'Mesas', icon: LayoutGrid },
  { to: '/restaurante', label: 'Restaurante', icon: Store },
  { to: '/bitacora', label: 'Bitácora', icon: History },
]

/** The DiNNo administrator's dock (Sprint 4): one section, with the pending count; approved and rejected are views inside it. */
export const NAV_ITEMS_ADMIN: NavItem[] = [
  {
    to: '/admin',
    label: 'Solicitudes',
    icon: ClipboardCheck,
    badgeLabel: (count) => `${count} ${count === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}`,
  },
]

/** Kept for the code that still asks for the restaurant's items by their old name. */
export const NAV_ITEMS = NAV_ITEMS_RESTAURANT
