import { cn } from '@/lib/cn'

export interface SkeletonProps {
  /** Radius of the real element it stands for. */
  radius?: 'card' | 'tile' | 'btn' | 'input' | 'full'
  /** Size and layout classes (`h-6 w-24`). */
  className?: string
}

const RADII = {
  card: 'rounded-card',
  tile: 'rounded-tile',
  btn: 'rounded-btn',
  input: 'rounded-input',
  full: 'rounded-full',
} as const

/**
 * Placeholder block with the shape of the real content (manual 11.5). Pair it with
 * `useDelayedFlag(isLoading)` so loads under 300 ms show nothing.
 */
export function Skeleton({ radius = 'input', className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('block animate-skeleton bg-surface-2 motion-reduce:animate-none', RADII[radius], className)}
    />
  )
}
