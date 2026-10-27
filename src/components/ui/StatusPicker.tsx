import { useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { Dialog as RadixDialog, Popover } from 'radix-ui'
import { cn } from '@/lib/cn'
import { Icon } from '@/lib/icon'
import { useMediaQuery } from '@/lib/use-media-query'
import { Button } from './Button'
import { STATUS_META, TONE_SURFACE, TONE_TEXT, type Status } from './status'
import { StatusShape } from './StatusShape'

export interface StatusPickerOption<T extends string> {
  value: T
  status: Status
  /** Single-letter shortcut shown at the right ("D"); the owner of the anchor handles the key. */
  shortcut?: string
}

export interface StatusPickerProps<T extends string> {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Names the picker and its group: "Estado de Mesa 04". */
  title: string
  options: StatusPickerOption<T>[]
  value: T
  onValueChange: (value: T) => void
  /** `id` of the element that gets focus back when the picker closes (the table's toggle). */
  returnFocusId: string
  /** Replaces the options with a message and one action, e.g. an inactive table and "Reactivar mesa". */
  inactive?: { message: ReactNode; actionLabel: string; onAction: () => void; loading?: boolean; loadingText?: string }
  /** The element the popover sits next to. */
  children: ReactNode
  /** Layout of the anchor wrapper (it takes the place of the children in their parent). */
  anchorClassName?: string
  /** Position of the anchor wrapper, e.g. a table placed on the floor plan. */
  anchorStyle?: CSSProperties
  /** Real data of the item under the title: "4 personas · Redonda". */
  details?: ReactNode
  /** Secondary actions at the bottom, e.g. "Editar mesa" and "Desactivar" where there is no ⋯ menu. */
  actions?: ReactNode
}

const OPTION_BG: Partial<Record<Status, string>> = {
  available: TONE_SURFACE.ok,
  reserved: TONE_SURFACE.reserved,
  occupied: TONE_SURFACE.busy,
}

/**
 * Status picker (manual 12.2): glass popover next to the table from 768 px, bottom sheet below. The current status is
 * tinted and checked; arrows move, Enter or a tap applies and closes, Esc closes, and focus returns to the table.
 * Never offers "Inactiva": an inactive table shows `inactive` instead.
 */
export function StatusPicker<T extends string>({
  open,
  onOpenChange,
  title,
  options,
  value,
  onValueChange,
  returnFocusId,
  inactive,
  children,
  anchorClassName,
  anchorStyle,
  details,
  actions,
}: StatusPickerProps<T>) {
  const isSheet = useMediaQuery('(max-width: 767px)')
  const list = useRef<HTMLDivElement>(null)

  function focusInitial(event: Event) {
    event.preventDefault()
    const target = list.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]') ?? list.current?.querySelector<HTMLButtonElement>('button')
    target?.focus()
  }

  // Back to the table after Esc or a choice; never steal focus from another element the person just tapped.
  function returnFocus(event: Event) {
    event.preventDefault()
    const active = document.activeElement
    const focusMovedElsewhere = active && active !== document.body && !list.current?.contains(active)
    if (!focusMovedElsewhere) document.getElementById(returnFocusId)?.focus()
  }

  function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const items = [...(list.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? [])]
    const index = items.indexOf(document.activeElement as HTMLButtonElement)
    items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus()
  }

  const body = inactive ? (
    <div ref={list} className="flex flex-col gap-3 p-2">
      <p className="text-sec text-fg">{inactive.message}</p>
      <Button variant="outline" size="sm" icon={RotateCcw} loading={inactive.loading} loadingText={inactive.loadingText} onClick={inactive.onAction} className="self-start">
        {inactive.actionLabel}
      </Button>
    </div>
  ) : (
    <div ref={list} role="radiogroup" aria-label={title} className="flex flex-col gap-1" onKeyDown={moveFocus}>
      {options.map((option) => {
        const meta = STATUS_META[option.status]
        const current = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={current}
            onClick={() => onValueChange(option.value)}
            className={cn(
              'press flex h-12 cursor-pointer items-center gap-3 rounded-input border border-transparent px-3 text-left text-body font-bold text-fg',
              current ? OPTION_BG[option.status] : 'hover:bg-surface-2',
            )}
          >
            <StatusShape shape={meta.shape} size={10} className={TONE_TEXT[meta.tone]} />
            <span className="flex-1">{meta.label}</span>
            {current ? (
              <Icon icon={Check} size={16} />
            ) : (
              // Keys only help with a keyboard: hidden in the phone sheet.
              option.shortcut &&
              !isSheet && (
                <span aria-hidden="true" className="text-sec">
                  {option.shortcut}
                </span>
              )
            )}
          </button>
        )
      })}
    </div>
  )

  const detailsLine = details && <p className="px-3 pb-1 text-sec text-fg">{details}</p>
  const actionsRow = actions && <div className="mt-1 flex flex-wrap gap-2 border-t border-line px-1 pt-2">{actions}</div>

  if (isSheet) {
    return (
      <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
        <div className={anchorClassName} style={anchorStyle}>
          {children}
        </div>
        <RadixDialog.Portal>
          <RadixDialog.Overlay className="fixed inset-0 z-(--z-overlay) bg-(--overlay) data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
          <RadixDialog.Content
            aria-describedby={undefined}
            onOpenAutoFocus={focusInitial}
            onCloseAutoFocus={returnFocus}
            className="fixed inset-x-0 bottom-0 z-(--z-modal) flex flex-col gap-3 rounded-t-sheet bg-surface p-4 pb-8 text-fg shadow-lifted data-[state=closed]:animate-fade-out data-[state=open]:animate-sheet-in"
          >
            <span aria-hidden="true" className="mx-auto h-1 w-10 rounded-full bg-line-strong" />
            <RadixDialog.Title className="px-1 text-h3">{title}</RadixDialog.Title>
            {detailsLine}
            {body}
            {actionsRow}
          </RadixDialog.Content>
        </RadixDialog.Portal>
      </RadixDialog.Root>
    )
  }

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Anchor className={anchorClassName} style={anchorStyle}>
        {children}
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={16}
          aria-label={title}
          onOpenAutoFocus={focusInitial}
          onCloseAutoFocus={returnFocus}
          className="glass-panel z-(--z-dropdown) flex w-65 origin-(--radix-popover-content-transform-origin) flex-col gap-1 rounded-tile p-2 text-fg data-[state=closed]:animate-pop-out data-[state=open]:animate-pop-in"
        >
          <p className="px-3 pt-1 pb-1 text-label text-fg">{title}</p>
          {detailsLine}
          {body}
          {actionsRow}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
