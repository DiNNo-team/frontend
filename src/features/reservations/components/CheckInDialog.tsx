import { useId, useRef, useState, type FormEvent } from 'react'
import { Alert, Button, Dialog, TextField } from '@/components/ui'
import { codeProblem, normalizeCode } from '../code'
import { useCheckIn } from '../hooks'
import { checkInErrorText, checkInSuccessText, codeProblemText, RESERVATION_TEXT } from '../messages'

export interface CheckInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Outcome = { type: 'success' | 'error'; message: string }

/**
 * "Validar código" (Tasks 4.1.3–4.1.5, CLAUDE.md §12.6): the restaurant types or pastes the code the diner shows.
 * Uppercase and no spaces while typing; checked before sending. After each attempt the field clears and keeps the focus,
 * ready for the next diner. Each result stays visible until the next attempt.
 */
export function CheckInDialog({ open, onOpenChange }: CheckInDialogProps) {
  const formId = useId()
  const input = useRef<HTMLInputElement>(null)
  const checkIn = useCheckIn()
  const [code, setCode] = useState('')
  const [fieldError, setFieldError] = useState<string>()
  const [outcome, setOutcome] = useState<Outcome | null>(null)

  function handleOpenChange(next: boolean) {
    if (!next) {
      setCode('')
      setFieldError(undefined)
      setOutcome(null)
    }
    onOpenChange(next)
  }

  function readyForNext() {
    setCode('')
    window.requestAnimationFrame(() => input.current?.focus())
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (checkIn.isPending) return
    const normalized = normalizeCode(code)
    const problem = codeProblem(normalized)
    if (problem) {
      setOutcome(null)
      setFieldError(codeProblemText(problem))
      input.current?.focus()
      return
    }
    setFieldError(undefined)
    setOutcome(null)
    try {
      const result = await checkIn.mutateAsync(normalized)
      setOutcome({ type: 'success', message: checkInSuccessText(result) })
    } catch (caught) {
      setOutcome({ type: 'error', message: checkInErrorText(caught) })
    } finally {
      readyForNext()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      title={RESERVATION_TEXT.checkInTitle}
      description={RESERVATION_TEXT.checkInDescription}
      footer={
        <>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {RESERVATION_TEXT.close}
          </Button>
          <Button type="submit" form={formId} loading={checkIn.isPending} loadingText={RESERVATION_TEXT.validating}>
            {RESERVATION_TEXT.validateCode}
          </Button>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={(event) => void submit(event)} className="flex flex-col gap-4">
        <TextField
          ref={input}
          label={RESERVATION_TEXT.codeLabel}
          placeholder={RESERVATION_TEXT.codePlaceholder}
          value={code}
          onChange={(event) => {
            setCode(normalizeCode(event.target.value))
            if (fieldError) setFieldError(undefined)
          }}
          error={fieldError}
          autoComplete="off"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
        />
        {outcome && <Alert type={outcome.type}>{outcome.message}</Alert>}
      </form>
    </Dialog>
  )
}
