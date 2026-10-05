import { cn } from '@/lib/cn'
import { STATUS_META, TONE_CHIP_BG, TONE_TEXT, type Status } from './status'
import { StatusShape } from './StatusShape'

export interface StatusChipProps {
  status: Status
  /** Overrides the default word ("Disponible", "Abierto"…). Keep glossary words. */
  label?: string
  className?: string
}

/** Status pill: color + shape + word, always the three (manual 3 and 9). */
export function StatusChip({ status, label, className }: StatusChipProps) {
  const meta = STATUS_META[status]
  return (
    <span
      className={cn(
        'inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold whitespace-nowrap text-fg',
        TONE_CHIP_BG[meta.tone],
        className,
      )}
    >
      <StatusShape shape={meta.shape} className={TONE_TEXT[meta.tone]} />
      {label ?? meta.label}
    </span>
  )
}
