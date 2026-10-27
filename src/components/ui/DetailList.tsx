import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface DetailItem {
  label: string
  value: ReactNode
}

export interface DetailListProps {
  items: DetailItem[]
  className?: string
}

/**
 * Label + value rows (manual 12.2): label in secondary text, value in body text, 12 px above and below and a hairline
 * between rows. From 768 px the label sits on the left (160 px).
 */
export function DetailList({ items, className }: DetailListProps) {
  return (
    <dl className={cn('flex flex-col divide-y divide-line', className)}>
      {items.map((item) => (
        <div key={item.label} className="flex min-w-0 flex-col gap-1 py-3 first:pt-0 last:pb-0 md:flex-row md:items-baseline md:gap-6">
          <dt className="text-sec text-fg-2 md:w-40 md:shrink-0">{item.label}</dt>
          <dd className="min-w-0 text-body break-words text-fg">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
