import { useCallback, useRef } from 'react'

/**
 * Focus return for Radix dialogs opened without `Dialog.Trigger` (controlled `open`).
 * Radix only knows how to return focus to its own trigger; this remembers whatever had focus
 * when the dialog opened (a button, the ⋯ menu trigger…) and focuses it again on close.
 */
export function useReturnFocus() {
  const previous = useRef<HTMLElement | null>(null)

  const onOpenAutoFocus = useCallback(() => {
    previous.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
  }, [])

  const onCloseAutoFocus = useCallback((event: Event) => {
    const target = previous.current
    previous.current = null
    if (target?.isConnected) {
      event.preventDefault()
      target.focus()
    }
  }, [])

  return { onOpenAutoFocus, onCloseAutoFocus }
}
