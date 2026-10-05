import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { Table } from './types'

const INSIDE_OVERLAY = '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]'

/**
 * One selected (active) table at a time. Selecting moves focus to the status control's active
 * segment; Esc or selecting the same card again deselects, and Esc returns focus to the card.
 */
export function useTableSelection(tables: Table[]) {
  const baseId = useId()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const focusControlOnRender = useRef(false)
  const controlId = `${baseId}-status-control`
  const toggleIdFor = useCallback((tableId: string) => `${baseId}-table-${tableId}`, [baseId])

  const selectedTable = tables.find((table) => table.id === selectedId && table.isActive) ?? null

  const toggle = useCallback((table: Table) => {
    if (!table.isActive) return
    setSelectedId((current) => {
      const next = current === table.id ? null : table.id
      focusControlOnRender.current = next !== null
      return next
    })
  }, [])

  const clear = useCallback(() => setSelectedId(null), [])

  useEffect(() => {
    if (!selectedId || !focusControlOnRender.current) return
    focusControlOnRender.current = false
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(controlId)?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [selectedId, controlId])

  useEffect(() => {
    if (!selectedId) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      if (event.target instanceof Element && event.target.closest(INSIDE_OVERLAY)) return
      const toggleId = toggleIdFor(selectedId as string)
      setSelectedId(null)
      document.getElementById(toggleId)?.focus()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, toggleIdFor])

  return { selectedId: selectedTable?.id ?? null, selectedTable, toggle, clear, controlId, toggleIdFor }
}
