import type { ReactNode } from 'react'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import { Select as RadixSelect } from 'radix-ui'
import { cn } from '@/lib/cn'
import { Icon } from '@/lib/icon'
import { FieldWrapper } from './FieldWrapper'
import { describedBy, useFieldIds } from './field-ids'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  label: ReactNode
  options: SelectOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Example text while nothing is chosen ("Elige una categoría"). */
  placeholder?: string
  optional?: boolean
  /** Label only for screen readers (e.g. the hour pickers inside HoursEditor). */
  hideLabel?: boolean
  helperText?: ReactNode
  error?: string
  /** Marks the field invalid when the error message is shown elsewhere (one message per HoursEditor row). */
  invalid?: boolean
  'aria-describedby'?: string
  disabled?: boolean
  name?: string
  required?: boolean
  id?: string
  /** Lucide icon on the left, 20 px. */
  icon?: LucideIcon
  /** Layout classes for the whole field. */
  className?: string
  onBlur?: () => void
}

/** Dropdown list with the same shell as TextField (manual 9). Built on Radix Select. */
export function Select({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  optional,
  hideLabel,
  helperText,
  error,
  invalid,
  'aria-describedby': ownDescribedBy,
  disabled,
  name,
  required,
  id,
  icon,
  className,
  onBlur,
}: SelectProps) {
  const ids = useFieldIds(id)
  const hasError = Boolean(error) || Boolean(invalid)

  return (
    <FieldWrapper ids={ids} label={label} optional={optional} hideLabel={hideLabel} helperText={helperText} error={error} className={className}>
      <RadixSelect.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        name={name}
        required={required}
      >
        <RadixSelect.Trigger
          id={ids.id}
          onBlur={onBlur}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy(ids, Boolean(helperText), Boolean(error), ownDescribedBy)}
          className={cn(
            'inline-flex h-12 w-full cursor-pointer items-center gap-3 rounded-input border-field bg-surface px-4 text-left text-body text-fg',
            'transition duration-(--dur-fast) ease-dinno data-placeholder:text-fg-2',
            hasError
              ? 'border-error'
              : 'border-line-strong hover:border-fg-2 focus-visible:border-accent data-[state=open]:border-accent',
            'disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-fg-2',
          )}
        >
          {icon && <Icon icon={icon} size={20} className="shrink-0 text-fg-2" />}
          <span className="min-w-0 flex-1 truncate whitespace-nowrap">
            <RadixSelect.Value placeholder={placeholder} />
          </span>
          <RadixSelect.Icon className="shrink-0 text-fg-2">
            <Icon icon={ChevronDown} size={20} />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            className={cn(
              'z-(--z-dropdown) min-w-(--radix-select-trigger-width) overflow-hidden rounded-input border border-line bg-surface p-1 shadow-lifted',
              // Radix measures the free space below the trigger; long lists (TimeSelect) scroll inside it.
              'max-h-(--radix-select-content-available-height) animate-fade-in-fast',
            )}
          >
            <RadixSelect.Viewport>
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  className={cn(
                    'flex h-10 cursor-pointer items-center rounded-input px-3 text-sec whitespace-nowrap text-fg outline-none select-none',
                    'focus-visible:shadow-none data-highlighted:bg-surface-2 data-[state=checked]:font-bold',
                  )}
                >
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </FieldWrapper>
  )
}
