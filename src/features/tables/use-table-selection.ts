import { useCallback, useId, useState } from 'react'
import type { Table } from './types'

/**
 * The table whose status picker is open (manual 12.2): one at a time, active or inactive. The picker itself traps
 * Esc and returns focus to the card's button (`toggleIdFor`); ⋯ buttons have their own ids (`menuIdFor`).
 */
export function useTableSelection(tables: Table[]) {
  const baseId = useId()
  const [openId, setOpenId] = useState<string | null>(null)
  const toggleIdFor = useCallback((tableId: string) => `${baseId}-table-${tableId}`, [baseId])
  const menuIdFor = useCallback((tableId: string) => `${baseId}-menu-${tableId}`, [baseId])

  // A table that disappeared from the list (or changed meanwhile) closes its picker.
  const openTable = tables.find((table) => table.id === openId) ?? null

  const toggle = useCallback((table: Table) => setOpenId((current) => (current === table.id ? null : table.id)), [])
  const setOpen = useCallback((table: Table, open: boolean) => setOpenId((current) => (open ? table.id : current === table.id ? null : current)), [])
  const clear = useCallback(() => setOpenId(null), [])

  return { openId: openTable?.id ?? null, openTable, toggle, setOpen, clear, toggleIdFor, menuIdFor }
}
