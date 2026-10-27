import { History, LayoutGrid, Store, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

/** Sections of the navigation dock (manual 12.2, v2.1). */
export const NAV_ITEMS: NavItem[] = [
  { to: '/mesas', label: 'Mesas', icon: LayoutGrid },
  { to: '/restaurante', label: 'Restaurante', icon: Store },
  { to: '/bitacora', label: 'Bitácora', icon: History },
]
