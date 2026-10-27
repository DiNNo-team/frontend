import { CircleAlert } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Icon } from '@/lib/icon'
import type { StatusShapeName } from './status'

export interface StatusShapeProps {
  shape: StatusShapeName
  /** 8 px in chips (default), 10 px in status lines (manual 3.6). */
  size?: 8 | 10
  /** Set the color with a `text-*` class: the shape paints with `currentColor`. */
  className?: string
}

function ShapeSvg({ shape, size = 8 }: { shape: Exclude<StatusShapeName, 'dot-alert' | 'live-dot'>; size?: 8 | 10 }) {
  return (
    <svg viewBox="0 0 8 8" className={cn('shrink-0', size === 10 ? 'size-2.5' : 'size-2')} aria-hidden="true" focusable="false">
      {shape === 'dot' && <circle cx="4" cy="4" r="4" fill="currentColor" />}
      {shape === 'square' && <rect width="8" height="8" rx="1" fill="currentColor" />}
      {shape === 'striped-square' && (
        <g fill="none" stroke="currentColor" strokeWidth="1.25">
          <rect x="0.625" y="0.625" width="6.75" height="6.75" rx="1" />
          <path d="M1.5 6.5 6.5 1.5" />
        </g>
      )}
      {shape === 'diamond' && <path d="M4 0 8 4 4 8 0 4Z" fill="currentColor" />}
      {shape === 'dash' && <rect y="3" width="8" height="2" rx="1" fill="currentColor" />}
    </svg>
  )
}

/**
 * 8 px status shape (manual 3.1). Decorative: the status word next to it is the accessible text.
 * Shapes stay distinguishable without color: dot · square · striped square · diamond · dash.
 */
export function StatusShape({ shape, size = 8, className }: StatusShapeProps) {
  if (shape === 'live-dot') {
    return (
      <span className={cn('relative inline-flex shrink-0', size === 10 ? 'size-2.5' : 'size-2', className)} aria-hidden="true">
        <span className="absolute -inset-0.5 animate-live-pulse rounded-full bg-current/30 motion-reduce:animate-none" />
        <ShapeSvg shape="dot" size={size} />
      </span>
    )
  }

  if (shape === 'dot-alert') {
    return (
      <span className={cn('inline-flex shrink-0 items-center gap-1', className)} aria-hidden="true">
        <ShapeSvg shape="dot" size={size} />
        <Icon icon={CircleAlert} size={16} />
      </span>
    )
  }

  return (
    <span className={cn('inline-flex shrink-0', className)} aria-hidden="true">
      <ShapeSvg shape={shape} size={size} />
    </span>
  )
}
