import type { ReactNode } from 'react'
import { Dialog as RadixDialog } from 'radix-ui'
import { cn } from '@/lib/cn'
import { useReturnFocus } from './use-return-focus'

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Título 3. For confirmations, a short question: "¿Desactivar Mesa 04?". */
  title: ReactNode
  /** Explains the consequence. */
  description?: ReactNode
  children?: ReactNode
  /** Actions, bottom right on desktop; full width on mobile with the primary on top. Put the primary last. */
  footer?: ReactNode
  /** `sm` 480 (short forms, confirmations) · `md` 560. */
  size?: 'sm' | 'md'
  /** While saving: Esc and clicking outside do not close it. */
  preventClose?: boolean
}

/**
 * Modal dialog (manual 9 and 11.3). Solid, no glass. Focus is trapped inside and returns to
 * the element that opened it.
 */
export function Dialog({ open, onOpenChange, title, description, children, footer, size = 'sm', preventClose = false }: DialogProps) {
  const returnFocus = useReturnFocus()

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
        <RadixDialog.Overlay className="fixed inset-0 z-(--z-overlay) grid animate-fade-in place-items-center overflow-y-auto bg-(--overlay) p-4">
          <RadixDialog.Content
            // Without a description Radix expects an explicit `undefined` to skip its warning.
            {...(description ? {} : { 'aria-describedby': undefined })}
            onOpenAutoFocus={returnFocus.onOpenAutoFocus}
            onCloseAutoFocus={returnFocus.onCloseAutoFocus}
            onEscapeKeyDown={blockWhileSaving}
            onPointerDownOutside={blockWhileSaving}
            onInteractOutside={blockWhileSaving}
            className={cn(
              'relative z-(--z-modal) w-full animate-rise-in rounded-card bg-surface p-6 text-fg shadow-lifted',
              size === 'sm' ? 'max-w-120' : 'max-w-140',
            )}
          >
            <RadixDialog.Title className="text-h3 text-fg">{title}</RadixDialog.Title>
            {description && (
              <RadixDialog.Description className="mt-2 text-sec text-fg-2">{description}</RadixDialog.Description>
            )}
            {children && <div className="mt-6">{children}</div>}
            {footer && (
              <div className="mt-6 flex flex-col-reverse gap-3 *:w-full sm:flex-row sm:justify-end sm:*:w-auto">{footer}</div>
            )}
          </RadixDialog.Content>
        </RadixDialog.Overlay>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
