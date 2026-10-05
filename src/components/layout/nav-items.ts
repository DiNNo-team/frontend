import { History, LayoutGrid, Store, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

/** Sidebar entries of the restaurant dashboard (manual 12.1). */
export const NAV_ITEMS: NavItem[] = [
  { to: '/mesas', label: 'Mesas', icon: LayoutGrid },
  { to: '/restaurante', label: 'Restaurante', icon: Store },
  { to: '/bitacora', label: 'Bitácora', icon: History },
]
