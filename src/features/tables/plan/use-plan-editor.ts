import { useCallback, useMemo, useState } from 'react'
import type { Table, TablePlanItem, TableShape } from '../types'
import { firstFreeSpot, fitsAt, placementOf, planConflicts, type PlacedTable, type Placement } from './plan-geometry'

/** Placement of every table while editing, by id; `null` = in "Sin ubicar". */
type Draft = Record<string, Placement | null>

function samePlacement(a: Placement | null, b: Placement | null): boolean {
  if (!a || !b) return a === b
  return a.x === b.x && a.y === b.y && a.shape === b.shape
}

function snapshot(tables: Table[]): Draft {
  return Object.fromEntries(tables.map((table) => [table.id, placementOf(table)]))
}

/**
 * Edit mode of the floor plan (manual 13.10): a local draft over the live tables, so statuses keep arriving while the
 * positions wait for "Guardar plano". Nothing is stored in the browser; the draft only becomes the plan when the
 * backend saves it.
 */
export function usePlanEditor(tables: Table[]) {
  const [draft, setDraft] = useState<Draft | null>(null)
  /** Positions from the server when editing started: to tell "dirty" and whether another device saved meanwhile. */
  const [baseline, setBaseline] = useState<Draft>({})
  const editing = draft !== null

  const placementFor = useCallback(
    (table: Table): Placement | null => (draft && table.id in draft ? draft[table.id] : placementOf(table)),
    [draft],
  )

  const placed: PlacedTable[] = useMemo(
    () => tables.map((table) => ({ id: table.id, capacity: table.capacity, placement: placementFor(table) })),
    [tables, placementFor],
  )
  const conflicts = useMemo(() => planConflicts(placed), [placed])
  const dirty = editing && tables.some((table) => !samePlacement(placementFor(table), baseline[table.id] ?? null))
  const unplaced = tables.filter((table) => placementFor(table) === null)

  const update = useCallback((id: string, placement: Placement | null) => {
    setDraft((current) => (current ? { ...current, [id]: placement } : current))
  }, [])

  function start() {
    const current = snapshot(tables)
    setBaseline(current)
    setDraft(current)
  }

  function stop() {
    setDraft(null)
    setBaseline({})
  }

  function find(id: string) {
    return placed.find((item) => item.id === id)
  }

  /** Moves a table if it fits there; answers whether it moved. */
  function move(id: string, x: number, y: number): boolean {
    const table = find(id)
    const shape = table?.placement?.shape ?? null
    if (!table || !fitsAt(placed, table, { x, y, shape })) return false
    update(id, { x, y, shape })
    return true
  }

  /** Changes the shape in place; if the new size does not fit there, the table is marked until it is moved. */
  function setShape(id: string, shape: TableShape | null) {
    const placement = find(id)?.placement
    if (placement) update(id, { ...placement, shape })
  }

  /** Puts a table from "Sin ubicar" in the first free spot; answers false when the plan has no room. */
  function place(id: string): boolean {
    const table = find(id)
    const spot = table && firstFreeSpot(placed, table)
    if (!spot) return false
    update(id, spot)
    return true
  }

  function unplace(id: string) {
    update(id, null)
  }

  /** "Ubicar automáticamente": every unplaced table, in identifier order, where it fits. Answers how many stayed out. */
  function autoPlace(order: Table[]): number {
    let next = placed
    const placements: Draft = {}
    let left = 0
    for (const table of order) {
      const item = next.find((candidate) => candidate.id === table.id)
      if (!item || item.placement) continue
      const spot = firstFreeSpot(next, item)
      if (!spot) {
        left += 1
        continue
      }
      placements[table.id] = spot
      next = next.map((candidate) => (candidate.id === table.id ? { ...candidate, placement: spot } : candidate))
    }
    setDraft((current) => (current ? { ...current, ...placements } : current))
    return left
  }

  /** Body of `PUT /v1/tables/plan`: every placed table. */
  function items(): TablePlanItem[] {
    return placed.flatMap(({ id, placement }) => (placement ? [{ id, x: placement.x, y: placement.y, shape: placement.shape }] : []))
  }

  /** True when `latest` (fresh from the server) has a plan other than the one this editor started from. */
  function savedElsewhere(latest: Table[]): boolean {
    return latest.some((table) => !samePlacement(placementOf(table), baseline[table.id] ?? null))
  }

  return { editing, dirty, conflicts, unplaced, placed, placementFor, start, stop, move, setShape, place, unplace, autoPlace, items, savedElsewhere }
}

export type PlanEditor = ReturnType<typeof usePlanEditor>
