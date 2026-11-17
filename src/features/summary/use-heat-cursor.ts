import { useState } from 'react'
import type { HeatCell, HeatCursor } from './heat'

/** The cell under the pointer or the keyboard, to read it in words next to the map (`HeatGrid`). */
export function useHeatCursor(grid: HeatCell[][]) {
  const [active, setActive] = useState<HeatCursor>(null)
  const shown = active ? grid[active[0]]?.[active[1]] : undefined
  return { active, setActive, shown }
}
