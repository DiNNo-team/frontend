import { Camera, CameraOff } from 'lucide-react'
import { lazy, Suspense, useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Alert, Button, Dialog, Spinner, TextField } from '@/components/ui'
import { codeProblem, normalizeCode } from '../code'
import { useCheckIn } from '../hooks'
import { checkInErrorText, checkInSuccessText, codeProblemText, RESERVATION_TEXT } from '../messages'
import { useCodeScanner } from '../scanner'

// The QR reader (jsqr) loads only when the camera is turned on: most check-ins use the scanner or the keyboard.
const QrCameraReader = lazy(() => import('./QrCameraReader').then((module) => ({ default: module.QrCameraReader })))

/** A code read by the scanner while the dialog was closed. `id` changes on every scan, so the same code twice counts twice. */
export interface ScannedCode {
  id: number
  code: string
}

export interface CheckInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Opens the dialog already validating this code (the USB scanner read a QR on the dashboard). */
  scanned?: ScannedCode | null
}

type Outcome = { type: 'success' | 'error'; message: string }

/**
 * "Validar código" (Tasks 4.1.3–4.1.5, CLAUDE.md §12.6; QR in Sprint 4): the restaurant scans the QR of the app with a
 * USB scanner (it types the code and Enter into the field, or anywhere in the dialog), reads it with the laptop camera,
 * or types or pastes the code. Uppercase and no spaces while typing; checked before sending. After each attempt the
 * field clears and keeps the focus, ready for the next diner. Each result stays visible until the next attempt.
 */
export function CheckInDialog({ open, onOpenChange, scanned = null }: CheckInDialogProps) {
  const formId = useId()
  const input = useRef<HTMLInputElement>(null)
  const checkIn = useCheckIn()
  const [code, setCode] = useState('')
  const [fieldError, setFieldError] = useState<string>()
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [cameraOn, setCameraOn] = useState(false)
  const handledScan = useRef<number | null>(null)

  function handleOpenChange(next: boolean) {
    if (!next) {
      setCode('')
      setFieldError(undefined)
      setOutcome(null)
      setCameraOn(false)
    }
    onOpenChange(next)
  }

  function readyForNext() {
    setCode('')
    window.requestAnimationFrame(() => input.current?.focus())
  }

  async function validate(raw: string) {
    if (checkIn.isPending) return
    const normalized = normalizeCode(raw)
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

  function submit(event: FormEvent) {
    event.preventDefault()
    void validate(code)
  }

  function readFromCamera(scannedCode: string) {
    setCameraOn(false)
    void validate(scannedCode)
  }

  // The latest validate, for the effect below: only a new scan triggers it, not every render.
  const validateRef = useRef(validate)
  useEffect(() => {
    validateRef.current = validate
  })

  // A scan made while the dialog was closed opens it already validating. `handledScan` keeps each scan to one
  // check-in, also when React runs the effect twice in development.
  useEffect(() => {
    if (!open || !scanned || handledScan.current === scanned.id) return
    handledScan.current = scanned.id
    void validateRef.current(scanned.code)
  }, [open, scanned])

  // With the focus on a button (after using the camera, or a click), the scanner still validates.
  useCodeScanner((scannedCode) => void validate(scannedCode), open)

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
      <form id={formId} noValidate onSubmit={submit} className="flex flex-col gap-4">
        {cameraOn && (
          <Suspense fallback={<Spinner size={20} />}>
            <QrCameraReader onCode={readFromCamera} />
          </Suspense>
        )}
        <Button
          type="button"
          variant="outline"
          icon={cameraOn ? CameraOff : Camera}
          onClick={() => setCameraOn((on) => !on)}
          aria-pressed={cameraOn}
        >
          {cameraOn ? RESERVATION_TEXT.closeCamera : RESERVATION_TEXT.scanWithCamera}
        </Button>
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
