import { Ban, Pencil, RotateCcw } from 'lucide-react'
import type { DropdownMenuItem } from '@/components/ui'
import type { Table } from './types'

export interface TableMenuActions {
  onEdit: (table: Table) => void
  onDeactivate: (table: Table) => void
  onReactivate: (table: Table) => void
}

/**
 * ⋯ menu (PBI 7): active → Editar · Desactivar (destructive, after a divider); inactive → Editar · Reactivar.
 * A table held by a DiNNo reservation (`locked`) only offers Editar: it cannot be deactivated (CLAUDE.md §12.2).
 */
export function tableMenuItems(table: Table, actions: TableMenuActions, { locked = false }: { locked?: boolean } = {}): DropdownMenuItem[] {
  const edit: DropdownMenuItem = { label: 'Editar', icon: Pencil, onSelect: () => actions.onEdit(table) }
  if (locked) return [edit]
  return table.isActive
    ? [edit, { label: 'Desactivar', icon: Ban, destructive: true, onSelect: () => actions.onDeactivate(table) }]
    : [edit, { label: 'Reactivar', icon: RotateCcw, onSelect: () => actions.onReactivate(table) }]
}
