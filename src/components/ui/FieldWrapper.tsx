import type { ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Icon } from '@/lib/icon'
import type { FieldIds } from './field-ids'

export interface FieldWrapperProps {
  ids: FieldIds
  label: ReactNode
  /** Adds " (opcional)" to the label. Required fields carry no mark (never asterisks). */
  optional?: boolean
  /** Keeps the label for screen readers only (rows where the context already names the field). */
  hideLabel?: boolean
  helperText?: ReactNode
  /** Says what to do: "Escribe el identificador de la mesa". Replaces the helper text. */
  error?: string
  className?: string
  children: ReactNode
}

/**
 * Shared shell of every form field (manual 10): label on top, helper or error below.
 * Internal to the kit: used by TextField, Select, TimeSelect and NumberStepper.
 */
export function FieldWrapper({ ids, label, optional, hideLabel, helperText, error, className, children }: FieldWrapperProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={ids.id} className={cn('text-sec font-bold text-fg', hideLabel && 'sr-only')}>
        {label}
        {optional && <span className="font-medium text-fg-2"> (opcional)</span>}
      </label>
      {children}
      {error ? (
        <p id={ids.errorId} className="flex items-start gap-2 text-sec text-error">
          <Icon icon={CircleAlert} size={16} className="mt-0.5 shrink-0" />
          {error}
        </p>
      ) : (
        helperText && (
          <p id={ids.helperId} className="text-sec text-fg-2">
            {helperText}
          </p>
        )
      )}
    </div>
  )
}
