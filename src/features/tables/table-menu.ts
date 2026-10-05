import { Ban, Pencil, RotateCcw } from 'lucide-react'
import type { DropdownMenuItem } from '@/components/ui'
import type { Table } from './types'

export interface TableMenuActions {
  onEdit: (table: Table) => void
  onDeactivate: (table: Table) => void
  onReactivate: (table: Table) => void
}

/** ⋯ menu (PBI 7): active → Editar · Desactivar (destructive, after a divider); inactive → Editar · Reactivar. */
export function tableMenuItems(table: Table, actions: TableMenuActions): DropdownMenuItem[] {
  const edit: DropdownMenuItem = { label: 'Editar', icon: Pencil, onSelect: () => actions.onEdit(table) }
  return table.isActive
    ? [edit, { label: 'Desactivar', icon: Ban, destructive: true, onSelect: () => actions.onDeactivate(table) }]
    : [edit, { label: 'Reactivar', icon: RotateCcw, onSelect: () => actions.onReactivate(table) }]
}
