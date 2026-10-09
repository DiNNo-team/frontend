import { useMemo } from 'react'
import { Select } from '@/components/ui'
import type { Table } from '@/features/tables/types'
import { sortTables } from '@/features/tables/table-status'
import { formatTableName } from '@/lib/format'
import { TABLE_LOG_TEXT } from '../messages'

export const ALL_TABLES = 'all'

interface TableLogFilterProps {
  /** `ALL_TABLES` or a table id. */
  value: string
  onValueChange: (value: string) => void
  /** Every table of the restaurant, inactive ones included. `undefined` while loading or if they failed. */
  tables: Table[] | undefined
}

/** "Mesa" filter: "Todas las mesas" + each table. Disabled (only "Todas las mesas") until the tables load. */
export function TableLogFilter({ value, onValueChange, tables }: TableLogFilterProps) {
  const options = useMemo(
    () => [
      { value: ALL_TABLES, label: TABLE_LOG_TEXT.allTables },
      ...sortTables(tables ?? []).map((table) => ({ value: table.id, label: formatTableName(table.identifier) })),
    ],
    [tables],
  )
  return (
    <Select
      label={TABLE_LOG_TEXT.filterLabel}
      options={options}
      value={tables ? value : ALL_TABLES}
      onValueChange={onValueChange}
      disabled={!tables}
      className="w-full max-w-100"
    />
  )
}
