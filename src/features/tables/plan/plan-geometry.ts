import type { Table, TableShape } from '../types'

// Floor plan grid (manual 13.10). The backend keeps the same rules in tables/table-plan.ts and rejects a plan that
// breaks them; plan-geometry.test.ts pins the values both sides share.

export const PLAN_COLUMNS = 20
/** Rows shown when the plan is empty or short; it grows with the tables up to PLAN_MAX_ROWS. */
export const PLAN_MIN_ROWS = 14
export const PLAN_MAX_ROWS = 30

/** Where a table sits: top-left cell and shape. `null` = not on the plan. */
export interface Placement {
  x: number
  y: number
  shape: TableShape | null
}

export interface Footprint {
  w: number
  h: number
}

/** Cells a table takes: square and round are 3 × 3; a rectangle grows with the capacity. Never narrower than 3 cells. */
export function footprint(capacity: number, shape: TableShape | null): Footprint {
  if (shape === 'square' || shape === 'round') return { w: 3, h: 3 }
  if (capacity <= 4) return { w: 3, h: 2 }
  if (capacity <= 8) return { w: 4, h: 2 }
  return { w: 5, h: 2 }
}

export function placementOf(table: Pick<Table, 'planX' | 'planY' | 'planShape'>): Placement | null {
  return table.planX === null || table.planY === null ? null : { x: table.planX, y: table.planY, shape: table.planShape }
}

interface Box {
  id: string
  x: number
  y: number
  w: number
  h: number
}

/** A placed table as a box of cells, or null when it is not on the plan. */
export type PlacedTable = Pick<Table, 'id' | 'capacity'> & { placement: Placement | null }

function boxOf({ id, capacity, placement }: PlacedTable): Box | null {
  if (!placement) return null
  return { id, x: placement.x, y: placement.y, ...footprint(capacity, placement.shape) }
}

function apart(a: Box, b: Box, gap = 0): boolean {
  return a.x + a.w + gap <= b.x || b.x + b.w + gap <= a.x || a.y + a.h + gap <= b.y || b.y + b.h + gap <= a.y
}

function inside(box: Box): boolean {
  return box.x >= 0 && box.y >= 0 && box.x + box.w <= PLAN_COLUMNS && box.y + box.h <= PLAN_MAX_ROWS
}

/** True when `table` fits at `spot`: inside the grid and on top of no other placed table. */
export function fitsAt(tables: PlacedTable[], table: PlacedTable, spot: Placement): boolean {
  const box = boxOf({ ...table, placement: spot })
  if (!box || !inside(box)) return false
  return tables.every((other) => {
    if (other.id === table.id) return true
    const otherBox = boxOf(other)
    return !otherBox || apart(box, otherBox)
  })
}

/**
 * Tables that break the plan: outside the grid or overlapping another. It happens when the capacity of a placed table
 * grows (a wider rectangle) after the plan was saved; the backend refuses to save until it is fixed.
 */
export function planConflicts(tables: PlacedTable[]): Set<string> {
  const boxes = tables.map(boxOf).filter((box): box is Box => box !== null)
  const conflicts = new Set<string>()
  for (const [index, box] of boxes.entries()) {
    if (!inside(box)) conflicts.add(box.id)
    for (const other of boxes.slice(index + 1)) {
      if (!apart(box, other)) {
        conflicts.add(box.id)
        conflicts.add(other.id)
      }
    }
  }
  return conflicts
}

/** First free spot, row by row, with an empty cell around it so tables never touch ("Ubicar automáticamente"). */
export function firstFreeSpot(tables: PlacedTable[], table: PlacedTable, shape: TableShape | null = null): Placement | null {
  const { w, h } = footprint(table.capacity, shape)
  const others = tables.filter((other) => other.id !== table.id).map(boxOf).filter((box): box is Box => box !== null)
  for (let y = 1; y + h < PLAN_MAX_ROWS; y += 1) {
    for (let x = 1; x + w < PLAN_COLUMNS; x += 1) {
      const box = { id: table.id, x, y, w, h }
      if (others.every((other) => apart(box, other, 1))) return { x, y, shape }
    }
  }
  return null
}

/** Rows drawn: enough for the lowest table plus `room` empty rows (more while editing, to drag down). */
export function planRows(tables: PlacedTable[], room: number): number {
  const bottom = Math.max(0, ...tables.map(boxOf).map((box) => (box ? box.y + box.h : 0)))
  return Math.min(PLAN_MAX_ROWS, Math.max(PLAN_MIN_ROWS, bottom + room))
}
