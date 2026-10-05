import { useEffect, useState } from 'react'

/**
 * `true` only after `flag` has stayed `true` for `delayMs`. Avoids flashing skeletons
 * for loads shorter than 300 ms (manual 11.1).
 */
export function useDelayedFlag(flag: boolean, delayMs = 300): boolean {
  const [elapsed, setElapsed] = useState(false)

  useEffect(() => {
    if (!flag) return
    const timer = window.setTimeout(() => setElapsed(true), delayMs)
    return () => {
      window.clearTimeout(timer)
      setElapsed(false)
    }
  }, [flag, delayMs])

  return flag && elapsed
}
