import { useEffect } from 'react'
import { useToast } from '@/components/ui'
import type { RestaurantProfile } from '@/features/restaurant/types'
import { REQUEST_TEXT } from './messages'

// «Bienvenido» shows once: the request screen leaves a mark while the restaurant waits, and the dashboard shows the
// message the first time it sees the restaurant approved and clears the mark. localStorage is only a convenience:
// without it (private window) the welcome is simply not shown.

const key = (restaurantId: string) => `dinno:awaiting-approval:${restaurantId}`

export function markAwaitingApproval(restaurantId: string): void {
  try {
    window.localStorage.setItem(key(restaurantId), '1')
  } catch {
    // No storage (private window, blocked data): the welcome message is skipped, nothing else depends on it.
  }
}

/** `true` once per mark: reading it clears it. */
export function takeAwaitingApproval(restaurantId: string): boolean {
  try {
    const marked = window.localStorage.getItem(key(restaurantId)) !== null
    if (marked) window.localStorage.removeItem(key(restaurantId))
    return marked
  } catch {
    return false
  }
}

/** Welcomes the restaurant the first time the dashboard opens after its approval. */
export function useWelcomeAfterApproval(restaurant: RestaurantProfile | undefined): void {
  const toast = useToast()
  const approvedId = restaurant?.approvalStatus === 'approved' ? restaurant.id : undefined
  useEffect(() => {
    if (approvedId && takeAwaitingApproval(approvedId)) toast.show({ type: 'success', message: REQUEST_TEXT.welcomeToast })
  }, [approvedId, toast])
}
