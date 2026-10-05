import { ToggleGroup } from 'radix-ui'
import { cn } from '@/lib/cn'
import { STATUS_META, TONE_TEXT, type Status } from './status'
import { StatusShape } from './StatusShape'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
  /** Shows the status shape in its color next to the label. */
  status?: Status
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onValueChange: (value: T) => void
  /** Required: names the group ("Estado de Mesa 04"). */
  'aria-label': string
  disabled?: boolean
  /** Segments share the full width (mobile status bar). */
  fullWidth?: boolean
  className?: string
}

/**
 * Segmented control (manual 9). Never orange: it shows a status, not an action.
 * Arrows only move focus between segments; Enter or Space applies, so each backend call is deliberate.
 * Pressing the active segment keeps it selected.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  'aria-label': ariaLabel,
  disabled,
  fullWidth,
  className,
}: SegmentedControlProps<T>) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next) onValueChange(next as T)
      }}
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(
        'h-11 items-stretch gap-1 rounded-btn bg-surface-2 p-1',
        fullWidth ? 'flex w-full' : 'inline-flex w-fit',
        className,
      )}
    >
      {options.map((option) => {
        const meta = option.status ? STATUS_META[option.status] : undefined
        return (
          <ToggleGroup.Item
            key={option.value}
            value={option.value}
            className={cn(
              'inline-flex cursor-pointer items-center justify-center gap-2 rounded-input px-3 text-sec whitespace-nowrap text-fg-2',
              'transition-colors duration-(--dur-base) ease-dinno enabled:hover:text-fg',
              'data-[state=on]:bg-surface data-[state=on]:font-bold data-[state=on]:text-fg data-[state=on]:shadow-card',
              'disabled:cursor-not-allowed disabled:opacity-45',
              fullWidth && 'flex-1',
            )}
          >
            {meta && <StatusShape shape={meta.shape} className={TONE_TEXT[meta.tone]} />}
            {option.label}
          </ToggleGroup.Item>
        )
      })}
    </ToggleGroup.Root>
  )
}
