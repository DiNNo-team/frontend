import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { FieldWrapper } from './FieldWrapper'
import { describedBy, useFieldIds } from './field-ids'

export interface TextAreaProps extends ComponentPropsWithRef<'textarea'> {
  /** Always visible above the field. */
  label: ReactNode
  /** Adds " (opcional)" to the label. */
  optional?: boolean
  helperText?: ReactNode
  /** What to do to fix it. Replaces the helper text and marks the field invalid. */
  error?: string
  /** Characters written and the limit, shown under the field: «42 de 300 caracteres». Passing the limit does not block typing. */
  counter?: { count: number; max: number }
  /** Layout classes for the whole field (label + field + texts). */
  className?: string
}

/**
 * Multi-line text field (manual 9 and 10), the same label, helper and error as `TextField`. The counter tells how many
 * characters are left without blocking the typing: the error says what to do when the text is too long or too short.
 */
export function TextArea({ label, optional, helperText, error, counter, className, id, rows = 4, 'aria-describedby': ownDescribedBy, disabled, readOnly, ...props }: TextAreaProps) {
  const ids = useFieldIds(id)
  const hasError = Boolean(error)
  const counterId = `${ids.id}-counter`

  return (
    <FieldWrapper ids={ids} label={label} optional={optional} helperText={helperText} error={error} className={className}>
      <textarea
        id={ids.id}
        rows={rows}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy(ids, Boolean(helperText), hasError, [ownDescribedBy, counter ? counterId : undefined].filter(Boolean).join(' ') || undefined)}
        className={cn(
          'w-full resize-y rounded-input border-field bg-surface px-4 py-3 text-body text-fg placeholder:text-fg-2',
          'transition duration-(--dur-fast) ease-dinno',
          hasError ? 'border-error' : 'border-line-strong hover:border-fg-2 focus:border-accent',
          'disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-fg-2 disabled:hover:border-line-strong',
        )}
        {...props}
      />
      {counter && (
        <p id={counterId} className={cn('text-right text-label tabular-nums', counter.count > counter.max ? 'text-error' : 'text-fg-2')}>
          {counter.count} de {counter.max} caracteres
        </p>
      )}
    </FieldWrapper>
  )
}
