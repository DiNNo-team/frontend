import { LiveIndicator } from '@/components/ui'
import { liveConnection, useLiveConnection } from './connection'

/** The kit's LiveIndicator fed by the restaurant socket. Nothing while there is no socket or it is still connecting. */
export function RestaurantLiveIndicator() {
  const { state, updatedAt } = useLiveConnection()
  if (state === 'idle' || state === 'connecting') return null
  return <LiveIndicator state={state} updatedAt={updatedAt} onRetry={() => liveConnection.retry()} />
}
