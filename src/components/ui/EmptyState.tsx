import type { ReactNode } from 'react'
import symbolOutline from '@/assets/brand/symbol-outline.svg?raw'
import { cn } from '@/lib/cn'

export interface EmptyStateProps {
  title: ReactNode
  description?: ReactNode
  /** At most one button. On an empty screen it is the page's only primary. */
  action?: ReactNode
  /** Same layout for load errors ("No pudimos cargar tus mesas"); announced to screen readers. */
  variant?: 'empty' | 'error'
  className?: string
}

/** No data yet, or the data could not load (manual 9 and 11.4). Uses the DiNNo symbol, never a big icon. */
export function EmptyState({ title, description, action, variant = 'empty', className }: EmptyStateProps) {
  return (
    <div
      role={variant === 'error' ? 'alert' : undefined}
      className={cn('mx-auto flex max-w-90 flex-col items-center gap-4 py-12 text-center', className)}
    >
      {/* Brand file inlined so the outline follows `currentColor`. */}
      <span className="inline-flex h-12 text-fg-2 *:h-full *:w-auto" dangerouslySetInnerHTML={{ __html: symbolOutline }} />
      <div className="flex flex-col gap-2">
        <h2 className="text-h3 text-fg">{title}</h2>
        {description && <p className="text-sec text-fg-2">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
