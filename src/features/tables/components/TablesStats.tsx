import { StatStrip } from '@/components/ui'
import type { TableCounts, TableDisplayStatus } from '../table-status'

const WORDS: Record<TableDisplayStatus, [singular: string, plural: string]> = {
  available: ['Disponible', 'Disponibles'],
  reserved: ['Reservada', 'Reservadas'],
  occupied: ['Ocupada', 'Ocupadas'],
  inactive: ['Inactiva', 'Inactivas'],
}

const ORDER: TableDisplayStatus[] = ['available', 'reserved', 'occupied', 'inactive']

export interface TablesStatsProps {
  counts: TableCounts
  /** Status the grid is filtered by. */
  filter: TableDisplayStatus | null
  /** Without it the strip only sums up (the plan never hides tables: it would break the room's layout). */
  onFilterChange?: (filter: TableDisplayStatus | null) => void
}

/** Summary cards (manual v2.1, 12.2 StatStrip): one card per status, all alike, that also filters the grid. */
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
