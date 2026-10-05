import { TableCard } from '@/components/ui'
import { formatTableName } from '@/lib/format'
import { getTableDisplayStatus } from '../table-status'
import type { Table } from '../types'

/** Auto-fill grid of table cards, min 168 px, gap 12 (manual 12.3). */
export function TablesGrid({ tables }: { tables: Table[] }) {
  return (
    <ul aria-label="Mesas" className="grid grid-tables gap-3">
      {tables.map((table) => (
        <li key={table.id} className="flex">
          <TableCard
            name={formatTableName(table.identifier)}
            capacity={table.capacity}
            status={getTableDisplayStatus(table)}
            className="flex-1"
          />
        </li>
      ))}
    </ul>
  )
}
