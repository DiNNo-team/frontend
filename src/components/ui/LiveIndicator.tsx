import { cn } from '@/lib/cn'
import { formatTime12h } from '@/lib/format'
import { Button } from './Button'
import { StatusShape } from './StatusShape'

export type LiveIndicatorState = 'live' | 'reconnecting' | 'offline'

export interface LiveIndicatorProps {
  state: LiveIndicatorState
  /** Last fresh data, for «Actualizado 7:42 p. m.» while reconnecting. */
  updatedAt?: Date | null
  /** «Intentar de nuevo» when there is no connection. */
  onRetry?: () => void
  className?: string
}

const LABELS: Record<LiveIndicatorState, string> = {
  live: 'En vivo',
  reconnecting: 'Reconectando…',
  offline: 'Sin conexión',
}

function clock(date: Date): string {
  return formatTime12h(`${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`)
}

/**
 * Live connection of the dashboard (manual 12.2 LiveIndicator, 13.7): «En vivo» with the pulsing Active Dot,
 * «Reconectando…» with a dash and the last update, «Sin conexión» with the alert dot and «Intentar de nuevo». It sits in
 * the topbar left of the open/closed switch; on phones the words hide visually (they stay for screen readers).
 * The screen keeps working with the last data while it is not live.
 */
export function LiveIndicator({ state, updatedAt, onRetry, className }: LiveIndicatorProps) {
  const shape = state === 'live' ? 'live-dot' : state === 'reconnecting' ? 'dash' : 'dot-alert'
  const color = state === 'live' ? 'text-ok' : state === 'reconnecting' ? 'text-inactive' : 'text-error'
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <p role="status" className="flex items-center gap-1.5 text-sec font-bold text-fg">
        <StatusShape shape={shape} size={10} className={color} />
        <span className="sr-only sm:not-sr-only">{LABELS[state]}</span>
        {state === 'reconnecting' && updatedAt && (
          <span className="sr-only font-medium lg:not-sr-only">· Actualizado {clock(updatedAt)}</span>
        )}
      </p>
      {state === 'offline' && onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry} className="hidden px-2 sm:inline-flex">
          Intentar de nuevo
        </Button>
      )}
    </div>
  )
}
