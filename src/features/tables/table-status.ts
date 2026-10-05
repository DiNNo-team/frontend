import { STATUS_META } from '@/components/ui'
import type { Table, TableStatus } from './types'

// Single source of table statuses in the front. The activity log (Sergio) maps its codes with `toTableDisplayStatus`.

export type TableDisplayStatus = 'available' | 'reserved' | 'occupied' | 'inactive'

const DISPLAY_STATUSES: readonly TableDisplayStatus[] = ['available', 'reserved', 'occupied', 'inactive']

/** `inactive` when the table is deactivated; otherwise its operational status (same word as the API). */
export function getTableDisplayStatus(table: Pick<Table, 'status' | 'isActive'>): TableDisplayStatus {
  return table.isActive ? table.status : 'inactive'
}

/**
 * Tolerant mapping for status codes coming from other modules: "occupied", "OCCUPIED" and the
 * activity log's "inactive" (deactivations) all map to the display status. Unknown codes → undefined.
 */
export function toTableDisplayStatus(code: string): TableDisplayStatus | undefined {
  const normalized = code.trim().toLowerCase() as TableDisplayStatus
  return DISPLAY_STATUSES.includes(normalized) ? normalized : undefined
}

/** Options of the status control, in the manual order: Disponible · Reservada · Ocupada. Never Inactiva. */
export const TABLE_STATUS_OPTIONS: { value: TableStatus; label: string; status: TableStatus }[] = (
  ['available', 'reserved', 'occupied'] as const
).map((value) => ({ value, label: STATUS_META[value].label, status: value }))

export interface TableCounts {
  available: number
  reserved: number
  occupied: number
  inactive: number
}

/** Available, reserved and occupied count only active tables; inactive ones count apart. */
export function countTables(tables: Table[]): TableCounts {
  const counts: TableCounts = { available: 0, reserved: 0, occupied: 0, inactive: 0 }
  for (const table of tables) counts[getTableDisplayStatus(table)] += 1
  return counts
}

/** Natural order by identifier ("2" before "10"); inactive tables keep their place. */
export function sortTables(tables: Table[]): Table[] {
  return [...tables].sort((a, b) => a.identifier.localeCompare(b.identifier, 'es', { numeric: true, sensitivity: 'base' }))
}
