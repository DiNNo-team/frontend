import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  /** The page's only primary button goes here. On mobile it drops below the title. */
  actions?: ReactNode
  className?: string
}

/** Page header (manual 9): Título 1 + secondary text, actions on the right. */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-h1 text-fg">{title}</h1>
        {description && <p className="text-sec text-fg-2">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </header>
  )
}
