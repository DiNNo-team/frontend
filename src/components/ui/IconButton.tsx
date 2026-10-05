import type { ComponentPropsWithRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Tooltip } from 'radix-ui'
import { cn } from '@/lib/cn'
import { Icon } from '@/lib/icon'

export interface IconButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'children' | 'aria-label'> {
  icon: LucideIcon
  /** Required: becomes the `aria-label` and the tooltip ("Más acciones de Mesa 04"). */
  label: string
  /** `sm` 40 × 40 · `md` 44 × 44 (default, touch). */
  size?: 'sm' | 'md'
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left'
}

const SIZES = { sm: 'size-10', md: 'size-11' } as const

/** Icon-only button: ⋯ menu, close, show password. Icon color follows the text color around it. */
export function IconButton({
  icon,
  label,
  size = 'md',
  tooltipSide = 'top',
  type = 'button',
  className,
  ...props
}: IconButtonProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type={type}
          aria-label={label}
          className={cn(
            'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-input',
            'transition duration-(--dur-fast) ease-dinno enabled:hover:bg-surface-2',
            'disabled:cursor-not-allowed disabled:opacity-45',
            SIZES[size],
            className,
          )}
          {...props}
        >
          <Icon icon={icon} size={20} />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side={tooltipSide}
          sideOffset={8}
          className="z-(--z-toast) rounded-input bg-inverse px-2 py-1 text-sec text-on-inverse shadow-lifted"
        >
          {label}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
