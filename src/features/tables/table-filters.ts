import { formatTableName, normalizeTableIdentifier } from '@/lib/format'
import { getTableDisplayStatus, type TableDisplayStatus } from './table-status'
import type { Table, TableArea } from './types'

/** Zone filter of /mesas: every zone, the tables without zone, or one zone by id. */
export type AreaFilter = 'all' | 'none' | string
export const ALL_AREAS = 'all'
export const NO_AREA = 'none'

export interface TableFilters {
  area: AreaFilter
  /** Free text: "4", "04", "mesa 4" and "T1" find their table. */
  query: string
  status: TableDisplayStatus | null
  /** "Para cuántas personas": tables with at least this capacity; null = any. */
  minCapacity: number | null
}

export const NO_FILTERS: TableFilters = { area: ALL_AREAS, query: '', status: null, minCapacity: null }

export function inArea(table: Table, area: AreaFilter): boolean {
  if (area === ALL_AREAS) return true
  if (area === NO_AREA) return table.areaId === null
  return table.areaId === area
}

/**
 * Whether a table matches what was typed in "Buscar mesa". A number is the same table, like the identifier rule ("4"
 * and "04" find Mesa 04, never Mesa 14). Any other text matches the start of the identifier or part of the name
 * ("t" finds Mesa T1 and Mesa T2; "barra" finds Mesa Barra 1).
 */
export function matchesQuery(table: Table, query: string): boolean {
  const typed = query.trim().toLowerCase().replace(/^mesa\s*/, '')
  if (!typed) return true
  if (/^\d+$/.test(typed)) return normalizeTableIdentifier(table.identifier) === normalizeTableIdentifier(typed)
  return normalizeTableIdentifier(table.identifier).startsWith(typed) || formatTableName(table.identifier).toLowerCase().includes(typed)
}

export function filterTables(tables: Table[], filters: TableFilters): Table[] {
  return tables.filter(
    (table) =>
      inArea(table, filters.area) &&
      matchesQuery(table, filters.query) &&
      (filters.status === null || getTableDisplayStatus(table) === filters.status) &&
      (filters.minCapacity === null || table.capacity >= filters.minCapacity),
  )
}

export function hasActiveFilters(filters: TableFilters): boolean {
  return filters.area !== ALL_AREAS || filters.query.trim() !== '' || filters.status !== null || filters.minCapacity !== null
}

export interface TableGroup {
  /** null = tables without zone. */
  area: TableArea | null
  tables: Table[]
}

/**
 * The tables split by zone, in the order of the zones, with "Sin zona" last. Zones without tables (after filtering)
 * are left out. Keeps the order of `tables` inside each group.
 */
export function groupByArea(tables: Table[], areas: TableArea[]): TableGroup[] {
  const known = new Set(areas.map((area) => area.id))
  const groups: TableGroup[] = areas.map((area) => ({ area, tables: tables.filter((table) => table.areaId === area.id) }))
  // A table whose zone is not loaded (deleted from another device) reads as without zone until the next refetch.
  groups.push({ area: null, tables: tables.filter((table) => table.areaId === null || !known.has(table.areaId)) })
  return groups.filter((group) => group.tables.length > 0)
}
