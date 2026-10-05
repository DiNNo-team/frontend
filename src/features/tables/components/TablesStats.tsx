import { StatTile } from '@/components/ui'
import type { TableCounts } from '../table-status'

function plural(count: number, singular: string, pluralWord: string) {
  return count === 1 ? singular : pluralWord
}

/** Row of four metrics (manual 12.3): 4 columns from 1024 px, 2 below. */
export function TablesStats({ counts }: { counts: TableCounts }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile value={counts.available} label={plural(counts.available, 'libre', 'libres')} />
      <StatTile value={counts.reserved} label={plural(counts.reserved, 'reservada', 'reservadas')} />
      <StatTile value={counts.occupied} label={plural(counts.occupied, 'ocupada', 'ocupadas')} />
      <StatTile value={counts.inactive} label={plural(counts.inactive, 'inactiva', 'inactivas')} />
    </div>
  )
}
