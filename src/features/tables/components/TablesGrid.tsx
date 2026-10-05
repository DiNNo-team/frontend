import { TableCard } from '@/components/ui'
import { formatTableName } from '@/lib/format'
import { getTableDisplayStatus } from '../table-status'
import type { Table } from '../types'

export interface TablesGridProps {
  tables: Table[]
  selectedId: string | null
  onSelect: (table: Table) => void
  /** `id` of each card's selection button, so focus can return to it. */
  toggleIdFor: (tableId: string) => string
}

/** Auto-fill grid of table cards, min 168 px, gap 12 (manual 12.3). */
export function TablesGrid({ tables, selectedId, onSelect, toggleIdFor }: TablesGridProps) {
  return (
    <ul aria-label="Mesas" className="grid grid-tables gap-3">
      {tables.map((table) => (
        <li key={table.id} className="flex">
          <TableCard
            name={formatTableName(table.identifier)}
            capacity={table.capacity}
            status={getTableDisplayStatus(table)}
            selected={table.id === selectedId}
            onSelect={() => onSelect(table)}
            toggleId={toggleIdFor(table.id)}
            className="flex-1"
          />
        </li>
      ))}
    </ul>
  )
}
