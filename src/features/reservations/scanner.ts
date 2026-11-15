import { useEffect, useRef } from 'react'
import { toReservationCode } from './code'

/**
 * A USB barcode scanner is a keyboard (HID "keyboard wedge"): reading the QR of the app, it "types" the 6 characters of
 * the code very fast (a few ms per key) and presses Enter. A person types much slower, so the gap between keys tells
 * them apart: a burst of 6 code characters, each within MAX_KEY_GAP_MS of the previous one, ending in Enter, is a scan.
 */
export const MAX_KEY_GAP_MS = 60

export interface ScanBuffer {
  /** Feeds one `keydown` (`event.key` and its time); returns the scanned code when Enter closes a valid burst. */
  feed(key: string, at: number): string | null
}

export function createScanBuffer(): ScanBuffer {
  let chars = ''
  let lastAt = -Infinity
  return {
    feed(key, at) {
      // Shift arrives before each uppercase letter from the scanner: it is not a character and does not break a burst.
      if (key === 'Shift') return null
      const gapTooLong = at - lastAt > MAX_KEY_GAP_MS
      lastAt = at
      if (key === 'Enter') {
        const code = gapTooLong ? null : toReservationCode(chars)
        chars = ''
        return code
      }
      if (key.length !== 1) {
        chars = ''
        return null
      }
      chars = gapTooLong ? key : chars + key
      return null
    },
  }
}

/** Typing in a field goes to that field (the check-in field reads the scanner on its own with its Enter). */
function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

/**
 * Listens to the whole page for a scanner burst while `enabled`, outside of text fields, and calls `onScan` with the
 * normalized code. The dashboard runs on a fixed screen: the scanner works without anyone clicking anything first.
 */
export function useCodeScanner(onScan: (code: string) => void, enabled: boolean) {
  const onScanRef = useRef(onScan)
  useEffect(() => {
    onScanRef.current = onScan
  })

  useEffect(() => {
    if (!enabled) return
    const buffer = createScanBuffer()
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey || isEditable(event.target)) return
      const code = buffer.feed(event.key, event.timeStamp)
      if (code) {
        event.preventDefault()
        onScanRef.current(code)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled])
}
