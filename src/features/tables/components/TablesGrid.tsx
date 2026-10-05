import { TableCard } from '@/components/ui'
import { formatTableName } from '@/lib/format'
import { tableMenuItems, type TableMenuActions } from '../table-menu'
import { getTableDisplayStatus } from '../table-status'
import type { Table } from '../types'

export interface TablesGridProps extends TableMenuActions {
  tables: Table[]
  selectedId: string | null
  onSelect: (table: Table) => void
  /** `id` of each card's selection button, so focus can return to it. */
  toggleIdFor: (tableId: string) => string
  /** `id` of each card's ⋯ button. */
  menuIdFor: (tableId: string) => string
  reactivatingId: string | null
}

/** Auto-fill grid of table cards, min 168 px, gap 12 (manual 12.3). */
export function TablesGrid({ tables, selectedId, onSelect, toggleIdFor, menuIdFor, reactivatingId, ...actions }: TablesGridProps) {
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
            menuItems={tableMenuItems(table, actions)}
            menuTriggerId={menuIdFor(table.id)}
            onReactivate={() => actions.onReactivate(table)}
            reactivating={reactivatingId === table.id}
            className="flex-1"
          />
        </li>
      ))}
    </ul>
  )
}
