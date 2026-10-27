import { cn } from '@/lib/cn'
import { STATUS_META, TONE_TEXT, type Status } from './status'
import { StatusShape } from './StatusShape'

export interface StatusLineProps {
  status: Status
  /** Overrides the default word. Keep glossary words. */
  label?: string
  /** `md` 14/20 (cards, rows) · `sm` 12/16 (plan nodes). */
  size?: 'md' | 'sm'
  className?: string
}

/**
 * Status without the pill (manual 3.6): 10 px shape in its color + the word in ink. For surfaces that already carry
 * the status tint (table cards, plan nodes), where a chip would repeat the color.
 */
export function StatusLine({ status, label, size = 'md', className }: StatusLineProps) {
  const meta = STATUS_META[status]
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-1.5 font-bold text-fg', size === 'sm' ? 'text-label' : 'text-sec', className)}>
      <StatusShape shape={meta.shape} size={10} className={TONE_TEXT[meta.tone]} />
      <span className="min-w-0 truncate">{label ?? meta.label}</span>
    </span>
  )
}
