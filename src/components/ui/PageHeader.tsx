import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  /** The page's only primary button goes here. On mobile it drops below the title. */
  actions?: ReactNode
  /** `hero`: the big greeting that opens /mesas (manual v2.1), 36/40 with the description in ink. */
  variant?: 'page' | 'hero'
  className?: string
}

/**
 * Page header (manual 12.2): Título 1 + a line under it, actions on the right. It sits on the glass sheet, so the line
 * is ink, never secondary text (manual 7.3).
 */
export function PageHeader({ title, description, actions, variant = 'page', className }: PageHeaderProps) {
  const hero = variant === 'hero'
  return (
    <header className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className={cn('text-fg', hero ? 'text-hero' : 'text-h1')}>{title}</h1>
        {description && <p className={cn('text-fg', hero ? 'text-body' : 'text-sec')}>{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </header>
  )
}
