import { useState, type ComponentPropsWithRef, type ReactNode } from 'react'
import { Eye, EyeOff, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Icon } from '@/lib/icon'
import { FieldWrapper } from './FieldWrapper'
import { describedBy, useFieldIds } from './field-ids'
import { IconButton } from './IconButton'

export interface TextFieldProps extends Omit<ComponentPropsWithRef<'input'>, 'size'> {
  /** Always visible above the field. */
  label: ReactNode
  /** Adds " (opcional)" to the label. */
  optional?: boolean
  helperText?: ReactNode
  /** What to do to fix it. Replaces the helper text and marks the field invalid. */
  error?: string
  /** Lucide icon on the left, 20 px. */
  icon?: LucideIcon
  /** Layout classes for the whole field (label + input + texts). */
  className?: string
}

/**
 * Text field (manual 9 and 10). Native input props and `ref` go to the `<input>`,
 * so it works with react-hook-form's `register`. `type="password"` adds the show/hide button.
 */
export function TextField({
  label,
  optional,
  helperText,
  error,
  icon,
  className,
  id,
  type = 'text',
  readOnly,
  disabled,
  'aria-describedby': ownDescribedBy,
  ...props
}: TextFieldProps) {
  const ids = useFieldIds(id)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const isPassword = type === 'password'
  const hasError = Boolean(error)

  return (
    <FieldWrapper ids={ids} label={label} optional={optional} helperText={helperText} error={error} className={className}>
      <div className="relative">
        {icon && (
          <Icon icon={icon} size={20} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-fg-2" />
        )}
        <input
          id={ids.id}
          type={isPassword && passwordVisible ? 'text' : type}
          readOnly={readOnly}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy(ids, Boolean(helperText), hasError, ownDescribedBy)}
          className={cn(
            'h-12 w-full rounded-input border-field bg-surface px-4 text-body text-fg placeholder:text-fg-2',
            'transition duration-(--dur-fast) ease-dinno',
            hasError
              ? 'border-error'
              : readOnly
                ? 'border-transparent'
                : 'border-line-strong hover:border-fg-2 focus:border-accent',
            'disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-fg-2 disabled:hover:border-line-strong',
            icon && 'pl-12',
            isPassword && 'pr-12',
          )}
          {...props}
        />
        {isPassword && (
          <IconButton
            icon={passwordVisible ? EyeOff : Eye}
            label={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-controls={ids.id}
            disabled={disabled}
            onClick={() => setPasswordVisible((visible) => !visible)}
            className="absolute top-0.5 right-0.5 text-fg-2"
          />
        )}
      </div>
    </FieldWrapper>
  )
}
