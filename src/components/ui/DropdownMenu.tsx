import { Fragment, type ReactElement } from 'react'
import type { LucideIcon } from 'lucide-react'
import { DropdownMenu as RadixDropdownMenu } from 'radix-ui'
import { cn } from '@/lib/cn'
import { Icon } from '@/lib/icon'

export interface DropdownMenuItem {
  label: string
  icon: LucideIcon
  onSelect: () => void
  /** Red item, separated from the rest by a line ("Desactivar"). */
  destructive?: boolean
  disabled?: boolean
}

export interface DropdownMenuProps {
  /** The button that opens the menu, usually `<IconButton icon={Ellipsis} label="Más acciones de Mesa 04" />`. */
  trigger: ReactElement
  items: DropdownMenuItem[]
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
}

/** Actions menu (manual 9): 40 px items with a 16 px icon; destructive items go last, after a divider. */
export function DropdownMenu({ trigger, items, align = 'end', side = 'bottom' }: DropdownMenuProps) {
  const firstDestructive = items.findIndex((item) => item.destructive)

  return (
    <RadixDropdownMenu.Root>
      <RadixDropdownMenu.Trigger asChild>{trigger}</RadixDropdownMenu.Trigger>
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          align={align}
          side={side}
          sideOffset={4}
          className="z-(--z-dropdown) min-w-48 animate-fade-in-fast rounded-input border border-line bg-surface p-1 shadow-lifted"
        >
          {items.map((item, index) => (
            <Fragment key={item.label}>
              {index === firstDestructive && index > 0 && <RadixDropdownMenu.Separator className="mx-1 my-1 h-px bg-line" />}
              <RadixDropdownMenu.Item
                onSelect={item.onSelect}
                disabled={item.disabled}
                className={cn(
                  'flex h-10 cursor-pointer items-center gap-2 rounded-input px-3 text-sec outline-none select-none',
                  'focus-visible:shadow-none data-disabled:cursor-not-allowed data-disabled:opacity-45 data-highlighted:bg-surface-2',
                  item.destructive ? 'text-error' : 'text-fg',
                )}
              >
                <Icon icon={item.icon} size={16} />
                {item.label}
              </RadixDropdownMenu.Item>
            </Fragment>
          ))}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  )
}
