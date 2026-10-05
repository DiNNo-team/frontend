import type { ReactNode } from 'react'
import { Alert } from './Alert'
import { Button } from './Button'
import { Dialog } from './Dialog'

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Short question: "¿Desactivar Mesa 04?". */
  title: ReactNode
  /** The consequence: "No aparecerá para los comensales. Puedes reactivarla cuando quieras." */
  description: ReactNode
  /** Concrete action, verb + object: "Desactivar mesa". */
  confirmLabel: string
  /** Gerund shown while confirming: "Desactivando…". */
  loadingText?: string
  confirmVariant?: 'danger' | 'primary'
  onConfirm: () => void
  loading?: boolean
  /** Shown inside the dialog as an error Alert; the dialog stays open. */
  error?: ReactNode
  cancelLabel?: string
}

/** Confirmation for destructive actions or actions that affect diners (manual 11.1 and 11.3). */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  loadingText,
  confirmVariant = 'danger',
  onConfirm,
  loading = false,
  error,
  cancelLabel = 'Cancelar',
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      preventClose={loading}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} loading={loading} loadingText={loadingText} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {error ? <Alert type="error">{error}</Alert> : null}
    </Dialog>
  )
}
