import { describe, expect, it } from 'vitest'
import {
  firstFreeSpot,
  fitsAt,
  footprint,
  PLAN_COLUMNS,
  PLAN_MAX_ROWS,
  PLAN_MIN_ROWS,
  planConflicts,
  planRows,
  type PlacedTable,
} from './plan-geometry'

const table = (id: string, capacity: number, placement: PlacedTable['placement']): PlacedTable => ({ id, capacity, placement })

describe('plan geometry', () => {
  // The backend keeps the same values (backend: restaurant-operations/tables/table-plan.ts).
  it('uses the grid the backend validates: 20 columns, up to 30 rows', () => {
    expect([PLAN_COLUMNS, PLAN_MAX_ROWS]).toEqual([20, 30])
  })

  it.each([
    [2, null, { w: 3, h: 2 }],
    [4, null, { w: 3, h: 2 }],
    [5, null, { w: 4, h: 2 }],
    [8, 'rect', { w: 4, h: 2 }],
    [9, null, { w: 5, h: 2 }],
    [20, 'rect', { w: 5, h: 2 }],
    [2, 'square', { w: 3, h: 3 }],
    [12, 'round', { w: 3, h: 3 }],
  ] as const)('sizes a table of %i people with shape %s as %o', (capacity, shape, size) => {
    expect(footprint(capacity, shape)).toEqual(size)
  })

  it('lets a table sit next to another but not on top of it, nor outside the grid', () => {
    const placed = [table('a', 4, { x: 0, y: 0, shape: null }), table('b', 4, null)]
    expect(fitsAt(placed, placed[1], { x: 3, y: 0, shape: null })).toBe(true)
    expect(fitsAt(placed, placed[1], { x: 2, y: 1, shape: null })).toBe(false)
    expect(fitsAt(placed, placed[1], { x: PLAN_COLUMNS - 2, y: 0, shape: null })).toBe(false)
    expect(fitsAt(placed, placed[1], { x: 0, y: -1, shape: null })).toBe(false)
  })

  it('ignores the table itself when it moves one cell', () => {
    const placed = [table('a', 4, { x: 0, y: 0, shape: null })]
    expect(fitsAt(placed, placed[0], { x: 1, y: 0, shape: null })).toBe(true)
  })

  it('flags both tables when a wider capacity makes them overlap, and a table that leaves the grid', () => {
    const conflicts = planConflicts([
      table('a', 8, { x: 0, y: 0, shape: null }),
      table('b', 4, { x: 3, y: 0, shape: null }),
      table('c', 12, { x: 17, y: 5, shape: null }),
      table('d', 2, { x: 10, y: 10, shape: null }),
      table('e', 2, null),
    ])
    expect([...conflicts].sort()).toEqual(['a', 'b', 'c'])
  })

  it('finds the first free spot with one empty cell around it', () => {
    const placed = [table('a', 4, { x: 1, y: 1, shape: null }), table('b', 4, null)]
    expect(firstFreeSpot(placed, placed[1])).toEqual({ x: 5, y: 1, shape: null })
  })

  it('answers null when the plan is full', () => {
    const full: PlacedTable[] = []
    for (let y = 0; y < PLAN_MAX_ROWS; y += 2) {
      for (let x = 0; x + 3 <= PLAN_COLUMNS; x += 3) full.push(table(`${x}-${y}`, 2, { x, y, shape: null }))
    }
    expect(firstFreeSpot(full, table('new', 2, null))).toBeNull()
  })

  it('grows the rows with the lowest table, between 14 and 30', () => {
    expect(planRows([], 2)).toBe(PLAN_MIN_ROWS)
    expect(planRows([table('a', 4, { x: 0, y: 20, shape: null })], 2)).toBe(24)
    expect(planRows([table('a', 4, { x: 0, y: 28, shape: null })], 6)).toBe(PLAN_MAX_ROWS)
  })
})
