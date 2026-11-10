import { describe, expect, it } from 'vitest'
import { filterTables, groupByArea, hasActiveFilters, matchesQuery, NO_FILTERS } from './table-filters'
import type { Table } from './types'

const table = (identifier: string, overrides: Partial<Table> = {}): Table => ({
  id: `t-${identifier}`,
  areaId: null,
  identifier,
  capacity: 4,
  status: 'available',
  isActive: true,
  planX: null,
  planY: null,
  planShape: null,
  ...overrides,
})

const TERRACE = { id: 'a-terraza', name: 'Terraza' }
const FLOOR_2 = { id: 'a-piso2', name: 'Piso 2' }

describe('matchesQuery', () => {
  it('finds a numeric table by its number, never another that contains it', () => {
    expect(matchesQuery(table('04'), '4')).toBe(true)
    expect(matchesQuery(table('04'), 'mesa 04')).toBe(true)
    expect(matchesQuery(table('14'), '4')).toBe(false)
  })

  it('matches text at the start of the identifier or inside the name, ignoring case', () => {
    expect(matchesQuery(table('T1'), 't')).toBe(true)
    expect(matchesQuery(table('T1'), 'Mesa T1')).toBe(true)
    expect(matchesQuery(table('Barra 1'), 'barra')).toBe(true)
    expect(matchesQuery(table('04'), 't')).toBe(false)
  })

  it('an empty search matches every table', () => {
    expect(matchesQuery(table('04'), '   ')).toBe(true)
  })
})

describe('filterTables', () => {
  const tables = [
    table('01', { areaId: TERRACE.id, capacity: 2 }),
    table('02', { areaId: TERRACE.id, capacity: 6, status: 'occupied' }),
    table('03', { areaId: FLOOR_2.id, capacity: 8 }),
    table('04', { capacity: 4, isActive: false }),
  ]

  it('combines zone, status and capacity', () => {
    const ids = (filters: Partial<typeof NO_FILTERS>) => filterTables(tables, { ...NO_FILTERS, ...filters }).map((item) => item.identifier)

    expect(ids({})).toEqual(['01', '02', '03', '04'])
    expect(ids({ area: TERRACE.id })).toEqual(['01', '02'])
    expect(ids({ area: 'none' })).toEqual(['04'])
    expect(ids({ area: TERRACE.id, status: 'available' })).toEqual(['01'])
    expect(ids({ minCapacity: 6 })).toEqual(['02', '03'])
    expect(ids({ status: 'inactive' })).toEqual(['04'])
    expect(ids({ query: '3' })).toEqual(['03'])
  })

  it('tells whether any filter is on', () => {
    expect(hasActiveFilters(NO_FILTERS)).toBe(false)
    expect(hasActiveFilters({ ...NO_FILTERS, query: ' 4 ' })).toBe(true)
    expect(hasActiveFilters({ ...NO_FILTERS, area: 'none' })).toBe(true)
  })
})

describe('groupByArea', () => {
  it('follows the order of the zones, leaves empty zones out and puts "Sin zona" last', () => {
    const groups = groupByArea(
      [table('01'), table('02', { areaId: FLOOR_2.id }), table('03', { areaId: 'deleted-elsewhere' })],
      [TERRACE, FLOOR_2],
    )

    expect(groups.map((group) => [group.area?.name ?? null, group.tables.map((item) => item.identifier)])).toEqual([
      ['Piso 2', ['02']],
      [null, ['01', '03']],
    ])
  })
})
