import { useCallback, useState } from 'react'

export interface PageAlert {
  tableId: string
  /** Text for the error Alert above the content. */
  message: string
  /** Retries the same action. Missing when retrying makes no sense (inactive table). */
  retry?: () => void
}

/** The single error Alert of /mesas: the newest failure replaces the previous one. */
export function usePageAlert() {
  const [alert, setAlert] = useState<PageAlert | null>(null)
  const clearFor = useCallback((tableId: string) => setAlert((current) => (current?.tableId === tableId ? null : current)), [])
  return { alert, report: setAlert, clearFor }
}
