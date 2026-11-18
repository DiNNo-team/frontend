import { useState, type FormEvent } from 'react'
import { Alert, Button, Dialog, DialogFooter, TextArea } from '@/components/ui'
import { ADMIN_TEXT, validateSuspensionReason } from '../messages'
import { REJECTION_REASON_LIMITS } from '../types'

interface SuspendDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  restaurantName: string
  saving: boolean
  /** Text of a failed suspension, shown inside; the dialog stays open and keeps what was written. */
  error?: string
  /** Receives the valid reason, already trimmed. */
  onSuspend: (reason: string) => void
}

/**
 * Suspending a restaurant (docs/admin-panel-contract.md §1): the question, what happens, and the reason the restaurant will
 * read (10 to 300 characters, checked when the field loses focus and when sending). The destructive button is the only one.
 */
export function SuspendDialog({ open, onOpenChange, restaurantName, saving, error, onSuspend }: SuspendDialogProps) {
  const [reason, setReason] = useState('')
  const [fieldError, setFieldError] = useState<string>()

  function handleOpenChange(next: boolean) {
    if (!next && saving) return
    if (!next) {
      setReason('')
      setFieldError(undefined)
    }
    onOpenChange(next)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    const problem = validateSuspensionReason(reason)
    setFieldError(problem)
    if (!problem) onSuspend(reason.trim())
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      title={ADMIN_TEXT.suspendTitle(restaurantName)}
      description={ADMIN_TEXT.suspendBody}
      preventClose={saving}
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <Alert type="error">{error}</Alert>}
        <TextArea
          label={ADMIN_TEXT.suspendReasonField}
          placeholder={ADMIN_TEXT.suspendReasonPlaceholder}
          helperText={ADMIN_TEXT.suspendReasonHelp}
          value={reason}
          error={fieldError}
          disabled={saving}
          counter={{ count: reason.trim().length, max: REJECTION_REASON_LIMITS.max }}
          onChange={(event) => {
            setReason(event.target.value)
            if (fieldError) setFieldError(validateSuspensionReason(event.target.value))
          }}
          onBlur={() => reason && setFieldError(validateSuspensionReason(reason))}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>
            {ADMIN_TEXT.cancel}
          </Button>
          <Button type="submit" variant="danger" loading={saving} loadingText={ADMIN_TEXT.suspending}>
            {ADMIN_TEXT.suspend}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
