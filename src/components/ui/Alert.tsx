import type { ReactNode } from 'react'
import { CircleAlert, CircleCheck, Info, TriangleAlert, X, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Icon } from '@/lib/icon'
import { IconButton } from './IconButton'

export type AlertType = 'success' | 'info' | 'warning' | 'error'

export interface AlertProps {
  type: AlertType
  /** Bold lead-in before the text. */
  title?: ReactNode
  children?: ReactNode
  /** One small button on the right: `<Button size="sm" variant="secondary">Intentar de nuevo</Button>`. */
  action?: ReactNode
  /** Shows a close button. Errors usually stay until fixed: an error never disappears on its own. */
  onClose?: () => void
  className?: string
}

const TYPES: Record<AlertType, { icon: LucideIcon; iconColor: string; background: string }> = {
  success: { icon: CircleCheck, iconColor: 'text-ok', background: 'bg-ok/12' },
  info: { icon: Info, iconColor: 'text-info', background: 'bg-info/12' },
  warning: { icon: TriangleAlert, iconColor: 'text-limited', background: 'bg-limited/12' },
  error: { icon: CircleAlert, iconColor: 'text-error', background: 'bg-error/12' },
}

/** Inline notice (manual 3.5 and 11): what happened + what to do. Solid and flat (it does not float). */
export function Alert({ type, title, children, action, onClose, className }: AlertProps) {
  const config = TYPES[type]
  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-btn p-4 text-sec text-fg sm:items-center', config.background, className)}
    >
      <Icon icon={config.icon} size={20} className={cn('shrink-0', config.iconColor)} />
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0">
          {title && <span className="font-bold">{title} </span>}
          {children}
        </p>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {onClose && <IconButton icon={X} label="Cerrar aviso" size="sm" onClick={onClose} className="-my-2.5 -mr-2" />}
    </div>
  )
}
