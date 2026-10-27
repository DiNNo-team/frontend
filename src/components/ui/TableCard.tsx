import { useId, type KeyboardEvent } from 'react'
import { Ellipsis, Users } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatCapacity } from '@/lib/format'
import { Icon } from '@/lib/icon'
import { DropdownMenu, type DropdownMenuItem } from './DropdownMenu'
import { IconButton } from './IconButton'
import { STATUS_META, TONE_SURFACE, TONE_TEXT } from './status'
import { StatusLine } from './StatusLine'

export type TableCardStatus = 'available' | 'reserved' | 'occupied' | 'inactive'
export type TableCardShortcutStatus = Exclude<TableCardStatus, 'inactive'>

const SURFACE: Record<TableCardStatus, string> = {
  available: TONE_SURFACE.ok,
  reserved: TONE_SURFACE.reserved,
  occupied: TONE_SURFACE.busy,
  inactive: 'border-dashed border-field border-line-strong text-fg-2',
}

/** Status shortcuts on a focused card (manual 12.2): D · R · O. */
const SHORTCUTS: Record<string, TableCardShortcutStatus> = { d: 'available', r: 'reserved', o: 'occupied' }

export interface TableCardProps {
  /** Display name, already formatted: "Mesa 04". */
  name: string
  capacity: number
  status: TableCardStatus
  /** Its status picker is open: 2 px selection border, raised. */
  selected?: boolean
  /** Click, Enter or Space on the card: opens its picker (inactive tables too, to offer "Reactivar mesa"). */
  onSelect?: () => void
  /** D, R or O on the focused card. Not called for inactive tables. */
  onShortcut?: (status: TableCardShortcutStatus) => void
  /** `id` of the card's button, to move focus back to it. */
  toggleId?: string
  /** Items of the ⋯ menu. Without items the menu is not shown. */
  menuItems?: DropdownMenuItem[]
  /** `id` of the ⋯ button, to move focus to it (e.g. after the card becomes inactive). */
  menuTriggerId?: string
  /** A new value plays the "changed from another device" ring once (manual 11.3). */
  highlight?: number
  /** Heading level of the name, so the page outline never skips one (`h2` right under the page's `h1`). */
  headingAs?: 'h2' | 'h3'
  className?: string
}

/**
 * Table card (manual 12.2). The status is the surface: tint + edge (+ hatch for Ocupada), with the shape and the word in
 * ink. Inactive: no tint, dashed border, secondary text (no opacity). Visual piece only: data and the picker live in
 * `features/tables`. The card is an <article>; its name is a button whose hit area covers the card, and ⋯ sits on top.
 */
export function TableCard({
  name,
  capacity,
  status,
  selected = false,
  onSelect,
  onShortcut,
  toggleId,
  menuItems,
  menuTriggerId,
  highlight,
  headingAs: Heading = 'h3',
  className,
}: TableCardProps) {
  const baseId = useId()
  const capacityId = `${baseId}-capacity`
  const statusId = `${baseId}-status`
  const inactive = status === 'inactive'
  const tone = STATUS_META[status].tone

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const next = SHORTCUTS[event.key.toLowerCase()]
    if (!next || inactive || !onShortcut || event.metaKey || event.ctrlKey || event.altKey) return
    event.preventDefault()
    onShortcut(next)
  }

  return (
    <article
      className={cn(
        'relative flex min-w-42 flex-col justify-between gap-3 rounded-tile border p-4 text-fg',
        'press hover:shadow-card',
        SURFACE[status],
        selected && 'border-selection shadow-card ring-1 ring-selection ring-inset',
        className,
      )}
    >
      {highlight !== undefined && (
        <span
          key={highlight}
          aria-hidden="true"
          className={cn('pointer-events-none absolute -inset-0.5 animate-remote-change rounded-tile border-2 border-current', TONE_TEXT[tone])}
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <Heading className="line-clamp-2 min-w-0 text-h3 break-words">
          {onSelect ? (
            <button
              id={toggleId}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={selected}
              aria-describedby={`${capacityId} ${statusId}`}
              onClick={onSelect}
              onKeyDown={handleKeyDown}
              className="cursor-pointer text-left outline-none after:absolute after:inset-0 after:rounded-tile focus-visible:shadow-none focus-visible:after:shadow-(--focus-ring)"
            >
              {name}
            </button>
          ) : (
            name
          )}
        </Heading>
        {menuItems && menuItems.length > 0 && (
          <DropdownMenu
            items={menuItems}
            trigger={
              <IconButton id={menuTriggerId} icon={Ellipsis} label={`Más acciones de ${name}`} size="sm" className="relative z-1 -mt-2 -mr-2" />
            }
          />
        )}
      </div>
      <p id={capacityId} className="flex items-center gap-2 text-sec">
        <Icon icon={Users} size={16} />
        {formatCapacity(capacity)}
      </p>
      <span id={statusId} className="flex">
        <StatusLine status={status} className={cn(inactive && 'text-fg-2')} />
      </span>
    </article>
  )
}
