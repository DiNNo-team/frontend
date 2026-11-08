import { useSyncExternalStore } from 'react'

// State of the restaurant's live connection, shared by the socket hook (writer) and the LiveIndicator (reader)
// without a React context. One socket per tab, so one store.

/** `idle`: no socket (signed out, no restaurant yet, sample data). */
export type LiveState = 'idle' | 'connecting' | 'live' | 'reconnecting' | 'offline'

interface Snapshot {
  state: LiveState
  /** Last moment the screen got fresh data from the socket, for «Actualizado 7:42 p. m.». */
  updatedAt: Date | null
}

let snapshot: Snapshot = { state: 'idle', updatedAt: null }
const listeners = new Set<() => void>()
let retry: (() => void) | null = null

function emit() {
  for (const listener of listeners) listener()
}

export const liveConnection = {
  set(state: LiveState) {
    if (snapshot.state === state) return
    snapshot = { state, updatedAt: state === 'live' ? new Date() : snapshot.updatedAt }
    emit()
  },
  /** Something arrived: the «Actualizado» time moves. */
  touch() {
    snapshot = { ...snapshot, updatedAt: new Date() }
    emit()
  },
  /** The socket hook registers how to try again («Intentar de nuevo» in «Sin conexión»). */
  setRetry(next: (() => void) | null) {
    retry = next
  },
  retry() {
    retry?.()
  },
  reset() {
    snapshot = { state: 'idle', updatedAt: null }
    retry = null
    emit()
  },
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useLiveConnection(): Snapshot {
  return useSyncExternalStore(subscribe, () => snapshot)
}
