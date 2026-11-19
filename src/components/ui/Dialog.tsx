import type { ReactNode } from 'react'
import { Dialog as RadixDialog } from 'radix-ui'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { IconButton } from './IconButton'
import { useReturnFocus } from './use-return-focus'

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Título 3. For confirmations, a short question: "¿Desactivar Mesa 04?". */
  title: ReactNode
  /** Explains the consequence (`lg`: the line under the title, e.g. the period of a report). */
  description?: ReactNode
  children?: ReactNode
  /** Actions, bottom right on desktop; full width on mobile with the primary on top. Put the primary last. */
  footer?: ReactNode
  /**
   * `sm` 480 (short forms, confirmations) · `md` 560 · `lg` ~960, for content to read (Sprint 4, the weekly report): the
   * header (title, description, `headerActions` and «Cerrar») stays in place and the body scrolls inside the panel; on a
   * phone the panel takes almost the whole screen.
   */
  size?: 'sm' | 'md' | 'lg'
  /** `lg` only: buttons next to the close button in the header («Actualizar informe»). */
  headerActions?: ReactNode
  /** `lg` only: words of the close button (its aria-label and tooltip). */
  closeLabel?: string
  /**
   * The layer behind the panel. `solid` (default) is the `--overlay` of always; `blur` adds a fixed blur of the page behind
   * (`veil-blur`), which falls back to `solid` with reduced transparency, more contrast or no backdrop-filter. The panel is
   * solid in both (manual 7.2 and 12.2).
   */
  veil?: 'solid' | 'blur'
  /** While saving: Esc and clicking outside do not close it. */
  preventClose?: boolean
}

/**
 * Modal dialog (manual 12.2 and 11.3). Solid, no glass; enters with a rise and leaves the same way, faster. Focus is trapped inside and returns to
 * the element that opened it.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'sm',
  headerActions,
  closeLabel = 'Cerrar',
  veil = 'solid',
  preventClose = false,
}: DialogProps) {
  const returnFocus = useReturnFocus()
  const large = size === 'lg'

  function blockWhileSaving(event: Event) {
    if (preventClose) event.preventDefault()
  }

  return (
    <RadixDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next && preventClose) return
        onOpenChange(next)
      }}
    >
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className={cn(
            'fixed inset-0 z-(--z-overlay) bg-(--overlay) data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in',
            veil === 'blur' && 'veil-blur',
            // `lg` is a flex box with a definite height, so the panel can cap itself at it and scroll inside.
            large ? 'flex items-center justify-center p-2 sm:p-6' : 'grid place-items-center overflow-y-auto p-4',
          )}
        >
          <RadixDialog.Content
            // Without a description Radix expects an explicit `undefined` to skip its warning.
            {...(description ? {} : { 'aria-describedby': undefined })}
            onOpenAutoFocus={(event) => {
              returnFocus.onOpenAutoFocus()
              // lg: start on the panel, not on its first button: focusing «Cerrar» would open its tooltip, and the first
              // Esc would only close the tooltip. Tab still goes to the header actions and the close button.
              if (large) {
                event.preventDefault()
                ;(event.currentTarget as HTMLElement | null)?.focus()
              }
            }}
            onCloseAutoFocus={returnFocus.onCloseAutoFocus}
            onEscapeKeyDown={blockWhileSaving}
            onPointerDownOutside={blockWhileSaving}
            onInteractOutside={blockWhileSaving}
            className={cn(
              'relative z-(--z-modal) w-full rounded-card bg-surface text-fg shadow-lifted data-[state=closed]:animate-sink-out data-[state=open]:animate-rise-in',
              large ? 'flex h-full max-h-full max-w-240 flex-col sm:h-auto' : 'p-6',
              size === 'sm' && 'max-w-120',
              size === 'md' && 'max-w-140',
            )}
          >
            {large ? (
              <>
                {/* One row on desktop: title · actions · close. On a phone the actions drop to their own line and the close
                    button stays next to the title, always visible (the body scrolls, the header does not). */}
                <div className="flex shrink-0 flex-wrap items-start gap-x-3 gap-y-4 border-b border-line p-4 md:items-center md:p-6">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <RadixDialog.Title className="text-h2 text-fg">{title}</RadixDialog.Title>
                    {description && <RadixDialog.Description className="text-sec text-fg">{description}</RadixDialog.Description>}
                  </div>
                  {headerActions && <div className="order-last flex w-full flex-wrap items-center gap-3 md:order-none md:w-auto">{headerActions}</div>}
                  <RadixDialog.Close asChild>
                    <IconButton icon={X} label={closeLabel} className="shrink-0" />
                  </RadixDialog.Close>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 md:p-6">
                  {children}
                  {footer && <DialogFooter>{footer}</DialogFooter>}
                </div>
              </>
            ) : (
              <>
                <RadixDialog.Title className="text-h3 text-fg">{title}</RadixDialog.Title>
                {description && (
                  <RadixDialog.Description className="mt-2 text-sec text-fg-2">{description}</RadixDialog.Description>
                )}
                {children && <div className="mt-6">{children}</div>}
                {footer && <DialogFooter>{footer}</DialogFooter>}
              </>
            )}
          </RadixDialog.Content>
        </RadixDialog.Overlay>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

/**
 * Dialog actions row. Use it directly when the actions live inside your own `<form>` (children);
 * otherwise pass them to `footer`. Put the primary last: right on desktop, on top on mobile.
 */
export function DialogFooter({ children }: { children: ReactNode }) {
  return <div className="mt-6 flex flex-col-reverse gap-3 *:w-full sm:flex-row sm:justify-end sm:*:w-auto">{children}</div>
}
