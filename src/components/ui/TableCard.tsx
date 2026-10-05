import { useId } from 'react'
import { Ellipsis, RotateCcw, Users } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatCapacity } from '@/lib/format'
import { Icon } from '@/lib/icon'
import { Button } from './Button'
import { DropdownMenu, type DropdownMenuItem } from './DropdownMenu'
import { IconButton } from './IconButton'
import { StatusChip } from './StatusChip'

export type TableCardStatus = 'available' | 'reserved' | 'occupied' | 'inactive'

export interface TableCardProps {
  /** Display name, already formatted: "Mesa 04". */
  name: string
  capacity: number
  status: TableCardStatus
  /** Orange 2 px border. Inactive tables cannot be selected. */
  selected?: boolean
  /** Click, Enter or Space on the card. Not called for inactive tables. */
  onSelect?: () => void
  /** Items of the ⋯ menu. Without items the menu is not shown. */
  menuItems?: DropdownMenuItem[]
  /** Inactive tables show "Reactivar" at full opacity. */
  onReactivate?: () => void
  reactivating?: boolean
  className?: string
}

/**
 * Table card (manual 9 and 12.3). Visual piece only: selection, menus and data live in `features/tables`.
 * No nested buttons: the card is an <article>, the name is a toggle button whose hit area covers the
 * card, and ⋯ is a separate button on top.
 */
export function TableCard({
  name,
  capacity,
  status,
  selected = false,
  onSelect,
  menuItems,
  onReactivate,
  reactivating,
  className,
}: TableCardProps) {
  const baseId = useId()
  const capacityId = `${baseId}-capacity`
  const statusId = `${baseId}-status`
  const inactive = status === 'inactive'
  const selectable = !inactive && Boolean(onSelect)

  return (
    <article
      className={cn(
        'relative flex min-w-42 flex-col gap-3 rounded-tile border p-4',
        'transition duration-(--dur-base) ease-dinno',
        inactive ? 'border-dashed border-line-strong' : 'border-line bg-surface shadow-card',
        selected && !inactive && 'border-accent ring-1 ring-accent ring-inset',
        className,
      )}
    >
      <div className={cn('flex flex-col gap-3', inactive && 'opacity-55')}>
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 truncate text-h3 text-fg">
            {selectable ? (
              <button
                type="button"
                aria-pressed={selected}
                aria-describedby={`${capacityId} ${statusId}`}
                onClick={onSelect}
                className="cursor-pointer text-left outline-none after:absolute after:inset-0 after:rounded-tile focus-visible:shadow-none focus-visible:after:shadow-(--focus-ring)"
              >
                {name}
              </button>
            ) : (
              name
            )}
          </h3>
          {menuItems && menuItems.length > 0 && (
            <DropdownMenu
              items={menuItems}
              trigger={
                <IconButton icon={Ellipsis} label={`Más acciones de ${name}`} size="sm" className="relative z-1 -mt-2 -mr-2 text-fg-2" />
              }
            />
          )}
        </div>
        <p id={capacityId} className="flex items-center gap-2 text-sec text-fg-2">
          <Icon icon={Users} size={16} />
          {formatCapacity(capacity)}
        </p>
        <div id={statusId}>
          <StatusChip status={status} />
        </div>
      </div>
      {inactive && onReactivate && (
        <div>
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onReactivate} loading={reactivating} className="px-0">
            Reactivar
          </Button>
        </div>
      )}
    </article>
  )
}
