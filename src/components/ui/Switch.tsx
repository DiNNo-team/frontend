import { useId, useState, type ReactNode } from 'react'
import { Switch as RadixSwitch } from 'radix-ui'
import { cn } from '@/lib/cn'
import { STATUS_META, TONE_TEXT, type Status } from './status'
import { StatusShape } from './StatusShape'

export interface SwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  /** Word shown next to the track when on ("Abierto"). Always visible (manual 9). */
  onLabel: string
  /** Word shown when off ("Cerrado"). */
  offLabel: string
  /** Status shape drawn before the word when on (`'open'`: pulsing dot in `ok`). Without it, no shape. */
  onStatus?: Status
  /** Status shape drawn before the word when off (`'closed'`: dash in `inactive`). Without it, no shape. */
  offStatus?: Status
  /** Visible name before the switch ("Estado del restaurante"). */
  label?: ReactNode
  /** Accessible name when there is no visible `label` ("Lunes"). One of the two is required for screen readers. */
  'aria-label'?: string
  disabled?: boolean
  id?: string
  name?: string
  className?: string
}

/**
 * On/off switch: 44 × 26 track, green when on, with the state word always beside it.
 * The track and the word form one button, so the touch target is ≥ 44 px tall.
 */
export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  onLabel,
  offLabel,
  onStatus,
  offStatus,
  label,
  'aria-label': ariaLabel,
  disabled,
  id,
  name,
  className,
}: SwitchProps) {
  const generatedId = useId()
  const switchId = id ?? generatedId
  const labelId = `${switchId}-label`
  const wordId = `${switchId}-state`
  const [innerChecked, setInnerChecked] = useState(defaultChecked)
  const isOn = checked ?? innerChecked
  const status = isOn ? onStatus : offStatus

  function handleChange(next: boolean) {
    if (checked === undefined) setInnerChecked(next)
    onCheckedChange?.(next)
  }

  const word = (
    <span id={wordId} className="text-sec font-bold whitespace-nowrap text-fg">
      {isOn ? onLabel : offLabel}
    </span>
  )

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      {label && (
        <label id={labelId} htmlFor={switchId} className="text-sec text-fg-2">
          {label}
        </label>
      )}
      <RadixSwitch.Root
        id={switchId}
        name={name}
        checked={isOn}
        onCheckedChange={handleChange}
        disabled={disabled}
        // The state word is part of what screen readers hear: "Estado del restaurante Abierto".
        aria-label={label ? undefined : ariaLabel}
        aria-labelledby={label ? `${labelId} ${wordId}` : undefined}
        aria-describedby={label ? undefined : wordId}
        className="group inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-3 rounded-input disabled:cursor-not-allowed disabled:opacity-45"
      >
        <span className="inline-flex h-6.5 w-11 shrink-0 items-center rounded-full bg-line-strong transition-colors duration-(--dur-fast) ease-dinno group-data-[state=checked]:bg-ok">
          <RadixSwitch.Thumb className="block size-5 translate-x-0.75 rounded-full bg-(--white) shadow-card transition-transform duration-(--dur-fast) ease-dinno data-[state=checked]:translate-x-5.25" />
        </span>
        {status ? (
          // Color + shape + word (manual 3.3), spaced like StatusChip. The shape is decorative: the word is what screen readers hear.
          <span className="inline-flex items-center gap-1.5">
            <StatusShape shape={STATUS_META[status].shape} className={TONE_TEXT[STATUS_META[status].tone]} />
            {word}
          </span>
        ) : (
          word
        )}
      </RadixSwitch.Root>
    </div>
  )
}
