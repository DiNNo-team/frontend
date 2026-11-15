import { useState, type FormEvent } from 'react'
import { Alert, Button, Dialog, DialogFooter, TextArea } from '@/components/ui'
import { ADMIN_TEXT, REJECTION_DRAFTS, validateRejectionReason } from '../messages'
import { REJECTION_REASON_LIMITS } from '../types'

interface RejectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  restaurantName: string
  saving: boolean
  /** Text of a failed rejection, shown inside; the dialog stays open and keeps what was written. */
  error?: string
  /** Receives the valid reason, already trimmed. */
  onReject: (reason: string) => void
}

/**
 * Rejecting a request: the reason is required (10 to 300 characters, the backend's rule) and the restaurant sees it.
 * Drafts of common reasons can be inserted and edited. The decision cannot be undone from here, and the dialog says so.
 */
export function RejectDialog({ open, onOpenChange, restaurantName, saving, error, onReject }: RejectDialogProps) {
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
    const problem = validateRejectionReason(reason)
    setFieldError(problem)
    if (!problem) onReject(reason.trim())
  }

  function insertDraft(text: string) {
    const next = reason.trim() ? `${reason.trimEnd()} ${text}` : text
    setReason(next)
    if (fieldError) setFieldError(validateRejectionReason(next))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      title={`${ADMIN_TEXT.rejectTitle}: ${restaurantName}`}
      description={ADMIN_TEXT.rejectBody}
      preventClose={saving}
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <Alert type="error">{error}</Alert>}
        <TextArea
          label={ADMIN_TEXT.reasonField}
          placeholder={ADMIN_TEXT.reasonPlaceholder}
          helperText={ADMIN_TEXT.reasonHelp}
          value={reason}
          error={fieldError}
          disabled={saving}
          counter={{ count: reason.trim().length, max: REJECTION_REASON_LIMITS.max }}
          onChange={(event) => {
            setReason(event.target.value)
            if (fieldError) setFieldError(validateRejectionReason(event.target.value))
          }}
          onBlur={() => reason && setFieldError(validateRejectionReason(reason))}
        />
        <div role="group" aria-label={ADMIN_TEXT.draftsLabel} className="flex flex-col gap-2">
          <p className="text-label text-fg-2">{ADMIN_TEXT.draftsLabel}</p>
          <div className="flex flex-wrap gap-2">
            {REJECTION_DRAFTS.map((draft) => (
              <Button key={draft.label} variant="outline" size="sm" disabled={saving} onClick={() => insertDraft(draft.text)}>
                {draft.label}
              </Button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>
            {ADMIN_TEXT.cancel}
          </Button>
          <Button type="submit" variant="danger" loading={saving} loadingText={ADMIN_TEXT.rejecting}>
            {ADMIN_TEXT.rejectConfirm}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
