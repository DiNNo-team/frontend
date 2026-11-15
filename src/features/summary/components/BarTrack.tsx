import { cn } from '@/lib/cn'

interface BarTrackProps {
  value: number
  /** The value that fills the track (the largest of the group). */
  max: number
  /** Fill color, a `fill-*` class of a token. */
  fillClassName: string
}

/**
 * One thin horizontal bar drawn in SVG: a track and a fill, in proportion to `max`. Decorative: the number and the word
 * always sit next to it (or in the table that backs it), so no one depends on seeing it.
 */
export function BarTrack({ value, max, fillClassName }: BarTrackProps) {
  const width = max > 0 && value > 0 ? Math.max(2, (value / max) * 100) : 0
  return (
    <svg viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true" className="h-2 w-full">
      <rect width="100" height="8" className="fill-line" />
      {width > 0 && <rect width={width} height="8" className={cn('animate-grow-x animate-grow-origin', fillClassName)} />}
    </svg>
  )
}
