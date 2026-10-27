// Sample tables for the /sistema preview (development only). Same seed as features/tables/api.mock.ts,
// plus worst cases (long identifier, 20 people, a table with no position yet).

export type DemoStatus = 'available' | 'reserved' | 'occupied'
export type DemoShape = 'square' | 'round' | 'rect'

export interface DemoTable {
  id: string
  identifier: string
  capacity: number
  status: DemoStatus
  isActive: boolean
  /** Grid cell of the top-left corner; null while the table has no place on the plan. */
  plan: { x: number; y: number } | null
  shape?: DemoShape
}

export const PLAN_COLS = 20
export const PLAN_ROWS = 14

export const DEMO_TABLES: DemoTable[] = [
  { id: 't1', identifier: '01', capacity: 4, status: 'available', isActive: true, plan: { x: 1, y: 1 } },
  { id: 't2', identifier: '02', capacity: 2, status: 'occupied', isActive: true, plan: { x: 5, y: 1 } },
  { id: 't3', identifier: '03', capacity: 4, status: 'reserved', isActive: true, plan: { x: 9, y: 1 }, shape: 'round' },
  { id: 't4', identifier: '04', capacity: 2, status: 'available', isActive: true, plan: { x: 13, y: 1 } },
  { id: 't5', identifier: '05', capacity: 6, status: 'occupied', isActive: true, plan: { x: 1, y: 5 } },
  { id: 't6', identifier: '06', capacity: 4, status: 'available', isActive: false, plan: { x: 6, y: 5 } },
  { id: 't7', identifier: '07', capacity: 2, status: 'available', isActive: true, plan: { x: 10, y: 5 }, shape: 'round' },
  { id: 't8', identifier: '08', capacity: 4, status: 'reserved', isActive: true, plan: { x: 14, y: 5 } },
  { id: 't9', identifier: 'Terraza 12A', capacity: 20, status: 'available', isActive: true, plan: { x: 1, y: 10 } },
  { id: 't10', identifier: '10', capacity: 8, status: 'available', isActive: true, plan: null },
]

/**
 * Cells a table takes on the plan (manual 12.2 TableNode): from its shape, or from its capacity. Never narrower
 * than 3 cells, so the status word always fits at the smallest cell.
 */
export function footprint(table: Pick<DemoTable, 'capacity' | 'shape'>): { w: number; h: number } {
  if (table.shape === 'round' || table.shape === 'square') return { w: 3, h: 3 }
  if (table.capacity <= 4) return { w: 3, h: 2 }
  if (table.capacity <= 8) return { w: 4, h: 2 }
  return { w: 5, h: 2 }
}

/** True when the table fits inside the plan and touches no other placed table. */
export function fitsAt(tables: DemoTable[], table: DemoTable, x: number, y: number): boolean {
  const { w, h } = footprint(table)
  if (x < 0 || y < 0 || x + w > PLAN_COLS || y + h > PLAN_ROWS) return false
  return tables.every((other) => {
    if (other.id === table.id || !other.plan) return true
    const size = footprint(other)
    return x + w <= other.plan.x || other.plan.x + size.w <= x || y + h <= other.plan.y || other.plan.y + size.h <= y
  })
}

/** First free spot, row by row, with one empty cell around it ("Ubicar automáticamente"). */
export function firstFreeSpot(tables: DemoTable[], table: DemoTable): { x: number; y: number } | null {
  const { w, h } = footprint(table)
  for (let y = 1; y + h < PLAN_ROWS; y += 1) {
    for (let x = 1; x + w < PLAN_COLS; x += 1) {
      const clear = tables.every((other) => {
        if (other.id === table.id || !other.plan) return true
        const size = footprint(other)
        return x + w + 1 <= other.plan.x || other.plan.x + size.w + 1 <= x || y + h + 1 <= other.plan.y || other.plan.y + size.h + 1 <= y
      })
      if (clear) return { x, y }
    }
  }
  return null
}

export const STATUS_KEYS: Record<string, DemoStatus> = { d: 'available', r: 'reserved', o: 'occupied' }
export const STATUS_KEY_LABEL: Record<DemoStatus, string> = { available: 'D', reserved: 'R', occupied: 'O' }
