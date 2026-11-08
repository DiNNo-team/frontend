import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import { useToast } from '@/components/ui'
import { restaurantReservationsQueryKey, type TimedReservation } from '@/features/reservations/hooks'
import { reservationClosedText, reservationCreatedText } from '@/features/reservations/messages'
import { restaurantQueryKey } from '@/features/restaurant/hooks'
import { tablesQueryKey } from '@/features/tables/hooks'
import type { Table } from '@/features/tables/types'
import { API_ORIGIN } from '@/lib/api'
import { getAuthToken } from '@/lib/api-client'
import { formatTableName } from '@/lib/format'
import { liveConnection } from './connection'
import {
  isReservationClosedEvent,
  isRestaurantReservation,
  isTableStatusChangedEvent,
  RESERVATION_CLOSED_EVENTS,
  RESERVATION_CREATED,
  SERVER_ERROR,
  TABLE_STATUS_CHANGED,
} from './events'
import { addReservation, removeReservation } from './reservation-cache'

/** Waits before a new try after a SERVER_ERROR rejection (§10: the client retries it by itself). */
const RETRY_DELAYS_MS = [5_000, 15_000, 30_000]
/** «Reconectando…» turns into «Sin conexión» if the cut lasts this long (manual 13.7). */
const OFFLINE_AFTER_MS = 30_000
/** Several table changes in a row (a check-in moves a reservation and a table) end in one refetch. */
const TABLES_REFETCH_DEBOUNCE_MS = 300

/**
 * Live dashboard (Tasks 5.1.4 and 3.2.4, CLAUDE.md §12.7): one Socket.IO connection per signed-in restaurant, with a
 * fresh Firebase token on every (re)connection. The server puts it in `restaurant:{id}`; rooms are fixed on connect, so
 * a new `restaurantId` reconnects. Events update the panel and the tables; each reconnection asks everything again, and
 * the 30 s refresh of the panel stays as backup. A dropped socket never shows an error by itself: the LiveIndicator does.
 * Pass `undefined` (signed out, no restaurant yet, sample data) to stay disconnected.
 */
export function useRestaurantRealtime(restaurantId: string | undefined) {
  const queryClient = useQueryClient()
  const toast = useToast()
  // The socket lives across renders; it reads the latest toast API through a ref updated after each render.
  const toastRef = useRef(toast)
  useEffect(() => {
    toastRef.current = toast
  }, [toast])

  useEffect(() => {
    if (!restaurantId) {
      liveConnection.reset()
      return
    }

    const socket = io(API_ORIGIN, {
      transports: ['websocket'],
      autoConnect: false,
      // A function, so every reconnection sends a valid token (a fixed object would reuse an expired one).
      auth: (send) => {
        getAuthToken()
          .then((token) => send({ token }))
          .catch(() => send({}))
      },
    })

    let connectedBefore = false
    let retryAttempt = 0
    let retryTimer: number | undefined
    let offlineTimer: number | undefined
    let tablesTimer: number | undefined

    const clearTimers = () => {
      window.clearTimeout(retryTimer)
      window.clearTimeout(offlineTimer)
      window.clearTimeout(tablesTimer)
    }
    const refreshTables = () => {
      window.clearTimeout(tablesTimer)
      tablesTimer = window.setTimeout(() => void queryClient.invalidateQueries({ queryKey: tablesQueryKey }), TABLES_REFETCH_DEBOUNCE_MS)
    }
    const refreshAll = () => {
      void queryClient.invalidateQueries({ queryKey: restaurantReservationsQueryKey })
      void queryClient.invalidateQueries({ queryKey: tablesQueryKey })
      void queryClient.invalidateQueries({ queryKey: restaurantQueryKey })
    }
    const startOfflineCountdown = () => {
      window.clearTimeout(offlineTimer)
      offlineTimer = window.setTimeout(() => liveConnection.set('offline'), OFFLINE_AFTER_MS)
    }
    const tableNameOf = (tableId: string, row?: TimedReservation): string | null => {
      if (row) return formatTableName(row.tableIdentifier)
      const table = queryClient.getQueryData<Table[]>(tablesQueryKey)?.find((item) => item.id === tableId)
      return table ? formatTableName(table.identifier) : null
    }

    socket.on('connect', () => {
      retryAttempt = 0
      window.clearTimeout(offlineTimer)
      liveConnection.set('live')
      // Back after a cut: whatever changed meanwhile arrives with a refetch.
      if (connectedBefore) refreshAll()
      connectedBefore = true
    })

    socket.on('disconnect', (reason) => {
      if (reason === 'io client disconnect') return
      liveConnection.set('reconnecting')
      startOfflineCountdown()
    })

    // Network problems: Socket.IO retries by itself (`socket.active`). A rejected handshake is final; only SERVER_ERROR
    // deserves new tries. Session codes (UNAUTHORIZED, RESTAURANT_REQUIRED…) are handled by the session flow over HTTP.
    socket.on('connect_error', (error) => {
      if (socket.active) {
        if (connectedBefore) liveConnection.set('reconnecting')
        startOfflineCountdown()
        return
      }
      if (error.message === SERVER_ERROR) {
        liveConnection.set('reconnecting')
        startOfflineCountdown()
        window.clearTimeout(retryTimer)
        retryTimer = window.setTimeout(() => socket.connect(), RETRY_DELAYS_MS[Math.min(retryAttempt, RETRY_DELAYS_MS.length - 1)])
        retryAttempt += 1
        return
      }
      liveConnection.set('offline')
    })

    socket.on(RESERVATION_CREATED, (payload: unknown) => {
      if (!isRestaurantReservation(payload)) return
      const before = queryClient.getQueryData<TimedReservation[]>(restaurantReservationsQueryKey)
      const known = before?.some((item) => item.id === payload.id)
      queryClient.setQueryData<TimedReservation[]>(restaurantReservationsQueryKey, (list) => addReservation(list, payload, performance.now()))
      if (!before) void queryClient.invalidateQueries({ queryKey: restaurantReservationsQueryKey })
      void queryClient.invalidateQueries({ queryKey: restaurantQueryKey })
      liveConnection.touch()
      if (!known) toastRef.current.show({ type: 'info', message: reservationCreatedText(payload) })
    })

    for (const event of RESERVATION_CLOSED_EVENTS) {
      socket.on(event, (payload: unknown) => {
        if (!isReservationClosedEvent(payload)) return
        const row = queryClient.getQueryData<TimedReservation[]>(restaurantReservationsQueryKey)?.find((item) => item.id === payload.reservationId)
        queryClient.setQueryData<TimedReservation[]>(restaurantReservationsQueryKey, (list) => removeReservation(list, payload.reservationId))
        void queryClient.invalidateQueries({ queryKey: restaurantQueryKey })
        refreshTables()
        liveConnection.touch()
        // A check-in made here already removed its row and shows its own result: no second notice.
        if (payload.status === 'completed' && !row) return
        toastRef.current.show({ type: 'info', message: reservationClosedText(payload.status, tableNameOf(payload.tableId, row)) })
      })
    }

    socket.on(TABLE_STATUS_CHANGED, (payload: unknown) => {
      if (!isTableStatusChangedEvent(payload)) return
      // Asked again (not patched): the list from the server plays the "changed from another device" ring (manual 11.3).
      refreshTables()
      liveConnection.touch()
    })

    liveConnection.setRetry(() => {
      window.clearTimeout(retryTimer)
      retryAttempt = 0
      liveConnection.set('connecting')
      socket.connect()
    })
    liveConnection.set('connecting')
    socket.connect()

    return () => {
      clearTimers()
      socket.removeAllListeners()
      socket.disconnect()
      liveConnection.reset()
    }
  }, [restaurantId, queryClient])
}
