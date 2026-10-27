import { cn } from '@/lib/cn'

export interface AmbientGroundProps {
  /** The restaurant is open: warm light. Closed: the orange glow goes out and the room cools down. */
  lit?: boolean
}

/**
 * The light of the room behind the whole dashboard (manual v2.1, 7 and 8): the two brand shapes of the login turned
 * into diffuse light, with no edge to read as a circle. It sits fixed behind everything and never takes pointer
 * events. Opening or closing the restaurant crossfades it in `--dur-highlight`: the background says the state.
 */
export function AmbientGround({ lit = true }: AmbientGroundProps) {
  return (
    <div aria-hidden="true" className="app-ambient amb-closed">
      <div
        className={cn(
          'amb-open absolute inset-0 transition-opacity duration-(--dur-highlight) ease-dinno',
          lit ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  )
}
