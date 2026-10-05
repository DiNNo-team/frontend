import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface StatTileProps {
  value: ReactNode
  /** Secondary label under the figure: "libres". */
  label: ReactNode
  /** Figure in orange text. Only for "what's next", such as the next arrival (manual 9). */
  highlight?: boolean
  className?: string
}

/** Dashboard metric (manual 9): 32/36 800 tabular figure + secondary label. */
export function StatTile({ value, label, highlight = false, className }: StatTileProps) {
  return (
    <div className={cn('flex flex-col rounded-tile border border-line bg-surface p-4 shadow-card', className)}>
      <span className={cn('text-h1 tabular-nums', highlight ? 'text-accent-text' : 'text-fg')}>{value}</span>
      <span className="text-sec text-fg-2">{label}</span>
    </div>
  )
}
