import { STATUS_META } from '@/components/ui'
import type { Table, TableStatus } from './types'

// Single source of table statuses in the front. The activity log (Sergio) maps its codes with `toTableDisplayStatus`.

export type TableDisplayStatus = 'available' | 'reserved' | 'occupied' | 'inactive'

/** Codes as they come from the API, plus `INACTIVE`, which the activity log uses for deactivations. */
export type TableStatusCode = TableStatus | 'INACTIVE'

export const TABLE_STATUS_CODE_TO_DISPLAY: Record<TableStatusCode, TableDisplayStatus> = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  OCCUPIED: 'occupied',
  INACTIVE: 'inactive',
}

export const TABLE_DISPLAY_TO_STATUS: Record<Exclude<TableDisplayStatus, 'inactive'>, TableStatus> = {
  available: 'AVAILABLE',
  reserved: 'RESERVED',
  occupied: 'OCCUPIED',
}

/** `inactive` when the table is deactivated; otherwise its operational status. */
export function getTableDisplayStatus(table: Pick<Table, 'status' | 'isActive'>): TableDisplayStatus {
  return table.isActive ? TABLE_STATUS_CODE_TO_DISPLAY[table.status] : 'inactive'
}

/** Tolerant mapping for codes coming from other modules ("OCCUPIED", "occupied", "INACTIVE"). */
export function toTableDisplayStatus(code: string): TableDisplayStatus | undefined {
  return TABLE_STATUS_CODE_TO_DISPLAY[code.toUpperCase() as TableStatusCode]
}

/** Options of the status control, in the manual order: Disponible · Reservada · Ocupada. */
export const TABLE_STATUS_OPTIONS = (['AVAILABLE', 'RESERVED', 'OCCUPIED'] as const).map((value) => {
  const display = TABLE_STATUS_CODE_TO_DISPLAY[value]
  return { value, label: STATUS_META[display].label, status: display }
})

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
