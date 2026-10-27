import { StatStrip } from '@/components/ui'
import type { TableCounts, TableDisplayStatus } from '../table-status'

const WORDS: Record<TableDisplayStatus, [singular: string, plural: string]> = {
  available: ['disponible', 'disponibles'],
  reserved: ['reservada', 'reservadas'],
  occupied: ['ocupada', 'ocupadas'],
  inactive: ['inactiva', 'inactivas'],
}

const ORDER: TableDisplayStatus[] = ['available', 'reserved', 'occupied', 'inactive']

export interface TablesStatsProps {
  counts: TableCounts
  /** Status the grid is filtered by. */
  filter: TableDisplayStatus | null
  /** Without it the strip only sums up (the plan never hides tables: it would break the room's layout). */
  onFilterChange?: (filter: TableDisplayStatus | null) => void
}

/** Summary strip (manual 12.2 StatStrip): one cell per status that also filters the grid. */
export function TablesStats({ counts, filter, onFilterChange }: TablesStatsProps) {
  return (
    <StatStrip
      aria-label="Resumen de mesas"
      selected={filter}
      onSelectedChange={onFilterChange}
      items={ORDER.map((status) => ({
        value: status,
        status,
        count: counts[status],
        label: WORDS[status][counts[status] === 1 ? 0 : 1],
      }))}
    />
  )
}
