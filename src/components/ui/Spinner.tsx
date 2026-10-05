import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Icon } from '@/lib/icon'

export interface SpinnerProps {
  size?: 16 | 20
  /** Accessible name when the spinner stands alone. Inside a button leave it empty: the button says "Guardando…". */
  label?: string
  className?: string
}

/** Small in-place loader. Only inside buttons or small areas, never full screen (manual 11.5). */
export function Spinner({ size = 16, label, className }: SpinnerProps) {
  const icon = <Icon icon={LoaderCircle} size={size} className={cn('shrink-0 animate-spin', className)} />
  if (!label) return icon
  return (
    <span role="status" aria-label={label} className="inline-flex">
      {icon}
    </span>
  )
}
