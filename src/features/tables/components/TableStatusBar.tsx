import { Ellipsis } from 'lucide-react'
import { DropdownMenu, FloatingBar, IconButton, SegmentedControl, type DropdownMenuItem } from '@/components/ui'
import { formatCapacity, formatTableName } from '@/lib/format'
import { TABLE_STATUS_OPTIONS } from '../table-status'
import type { Table, TableStatus } from '../types'

export interface TableStatusBarProps {
  table: Table
  /** `id` of the status control, to focus its active segment when a table gets selected. */
  controlId: string
  onChangeStatus: (table: Table, status: TableStatus) => void
  menuItems: DropdownMenuItem[]
}

/** Bar shown while a table is selected: "Mesa 04 · 2 personas" + Disponible · Reservada · Ocupada + ⋯. */
export function TableStatusBar({ table, controlId, onChangeStatus, menuItems }: TableStatusBarProps) {
  const name = formatTableName(table.identifier)
  return (
    <FloatingBar title={name} description={formatCapacity(table.capacity)}>
      <SegmentedControl
        id={controlId}
        aria-label={`Estado de ${name}`}
        options={TABLE_STATUS_OPTIONS}
        value={table.status}
        onValueChange={(status) => onChangeStatus(table, status)}
        fullWidth
        className="md:w-fit"
      />
      <DropdownMenu side="top" items={menuItems} trigger={<IconButton icon={Ellipsis} label={`Más acciones de ${name}`} />} />
    </FloatingBar>
  )
}
