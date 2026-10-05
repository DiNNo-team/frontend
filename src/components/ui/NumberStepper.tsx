import { useState, type KeyboardEvent, type ReactNode } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import { FieldWrapper } from './FieldWrapper'
import { describedBy, useFieldIds } from './field-ids'
import { IconButton } from './IconButton'

export interface NumberStepperProps {
  label: ReactNode
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  /** Accessible name of − ("Quitar una persona"). */
  decrementLabel?: string
  /** Accessible name of + ("Agregar una persona"). */
  incrementLabel?: string
  optional?: boolean
  helperText?: ReactNode
  error?: string
  disabled?: boolean
  id?: string
  name?: string
  className?: string
  onBlur?: () => void
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/**
 * Number with − / + (manual 9), e.g. table capacity 1–20. The value can also be typed:
 * it is validated and clamped when the field loses focus. Keys: ↑ ↓ Inicio Fin.
 */
export function NumberStepper({
  label,
  value,
  onValueChange,
  min = 1,
  max = 20,
  decrementLabel = 'Disminuir',
  incrementLabel = 'Aumentar',
  optional,
  helperText,
  error,
  disabled,
  id,
  name,
  className,
  onBlur,
}: NumberStepperProps) {
  const ids = useFieldIds(id)
  const [draft, setDraft] = useState<string | null>(null)
  const hasError = Boolean(error)

  function commit(next: number) {
    setDraft(null)
    const clamped = clamp(next, min, max)
    if (clamped !== value) onValueChange(clamped)
  }

  function handleBlur() {
    if (draft !== null) {
      const parsed = Number.parseInt(draft, 10)
      if (Number.isNaN(parsed)) setDraft(null)
      else commit(parsed)
    }
    onBlur?.()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const actions: Record<string, () => void> = {
      ArrowUp: () => commit(value + 1),
      ArrowDown: () => commit(value - 1),
      Home: () => commit(min),
      End: () => commit(max),
    }
    const action = actions[event.key]
    if (action) {
      event.preventDefault()
      action()
    } else if (event.key === 'Enter' && draft !== null) {
      event.preventDefault()
      handleBlur()
    }
  }

  return (
    <FieldWrapper ids={ids} label={label} optional={optional} helperText={helperText} error={error} className={className}>
      <div
        className={cn(
          'inline-flex h-12 w-fit items-center rounded-input border-field bg-surface',
          // The input hides its own ring: the whole control shows the focus ring instead.
          'transition duration-(--dur-fast) ease-dinno has-focus-visible:shadow-(--focus-ring)',
          hasError ? 'border-error' : 'border-line-strong hover:border-fg-2 focus-within:border-accent',
          disabled && 'bg-surface-2 text-fg-2',
        )}
      >
        <IconButton
          icon={Minus}
          label={decrementLabel}
          disabled={disabled || value <= min}
          onClick={() => commit(value - 1)}
          tabIndex={-1}
        />
        <input
          id={ids.id}
          name={name}
          type="text"
          inputMode="numeric"
          role="spinbutton"
          autoComplete="off"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy(ids, Boolean(helperText), hasError)}
          disabled={disabled}
          value={draft ?? String(value)}
          onChange={(event) => setDraft(event.target.value.replace(/\D/g, ''))}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={(event) => event.target.select()}
          className="h-full w-12 bg-transparent text-center text-body font-bold text-fg tabular-nums outline-none focus-visible:shadow-none disabled:cursor-not-allowed disabled:text-fg-2"
        />
        <IconButton
          icon={Plus}
          label={incrementLabel}
          disabled={disabled || value >= max}
          onClick={() => commit(value + 1)}
          tabIndex={-1}
        />
      </div>
    </FieldWrapper>
  )
}
