import jsQR from 'jsqr'
import { useEffect, useRef, useState } from 'react'
import { Alert, Spinner } from '@/components/ui'
import { toReservationCode } from '../code'
import { RESERVATION_TEXT } from '../messages'

export interface QrCameraReaderProps {
  /** Called once with the normalized code when a DiNNo QR is read; the camera turns off right after. */
  onCode: (code: string) => void
}

type CameraState = 'starting' | 'reading' | 'denied' | 'unavailable' | 'unsupported'

/** Frames are read every READ_EVERY_MS, scaled to at most READ_WIDTH px wide: enough for a phone held in front. */
const READ_EVERY_MS = 150
const READ_WIDTH = 640

/** What a camera failure means for the restaurant: no permission, or no camera to use. */
function cameraFailure(error: unknown): CameraState {
  if (error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'SecurityError')) return 'denied'
  return 'unavailable'
}

/**
 * «Escanear con cámara» (Sprint 4, QR check-in): the laptop's camera reads the QR the diner shows on the app, with
 * `jsqr` over the video frames. The camera turns on only while this is shown and off when it closes or reads a code.
 * The front camera of a laptop is mirrored, like a mirror, so aiming the phone feels natural.
 */
export function QrCameraReader({ onCode }: QrCameraReaderProps) {
  const video = useRef<HTMLVideoElement>(null)
  const onCodeRef = useRef(onCode)
  const supported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
  const [state, setState] = useState<CameraState>(supported ? 'starting' : 'unsupported')
  const [mirrored, setMirrored] = useState(true)

  useEffect(() => {
    onCodeRef.current = onCode
  })

  useEffect(() => {
    if (!supported) return
    let stream: MediaStream | null = null
    let timer: number | undefined
    let stopped = false
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d', { willReadFrequently: true })

    function stop() {
      stopped = true
      window.clearTimeout(timer)
      stream?.getTracks().forEach((track) => track.stop())
    }

    function readFrame() {
      const element = video.current
      if (stopped || !element || !context) return
      if (element.readyState >= element.HAVE_CURRENT_DATA && element.videoWidth > 0) {
        const scale = Math.min(1, READ_WIDTH / element.videoWidth)
        canvas.width = Math.round(element.videoWidth * scale)
        canvas.height = Math.round(element.videoHeight * scale)
        context.drawImage(element, 0, 0, canvas.width, canvas.height)
        const frame = context.getImageData(0, 0, canvas.width, canvas.height)
        const result = jsQR(frame.data, frame.width, frame.height, { inversionAttempts: 'attemptBoth' })
        // The QR of the app holds only the code: any other QR (a menu, a link) is ignored and the camera keeps reading.
        const code = result ? toReservationCode(result.data) : null
        if (code) {
          stop()
          onCodeRef.current(code)
          return
        }
      }
      timer = window.setTimeout(readFrame, READ_EVERY_MS)
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(async (opened) => {
        if (stopped) {
          opened.getTracks().forEach((track) => track.stop())
          return
        }
        stream = opened
        setMirrored(opened.getVideoTracks()[0]?.getSettings().facingMode !== 'environment')
        const element = video.current
        if (!element) return
        element.srcObject = opened
        await element.play()
        setState('reading')
        readFrame()
      })
      .catch((error: unknown) => {
        if (!stopped) setState(cameraFailure(error))
      })

    return stop
  }, [supported])

  if (state === 'denied' || state === 'unavailable' || state === 'unsupported') {
    const message = state === 'denied' ? RESERVATION_TEXT.cameraDenied : RESERVATION_TEXT.cameraUnavailable
    return <Alert type="error">{message}</Alert>
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-video overflow-hidden rounded-card bg-surface-2">
        <video
          ref={video}
          muted
          playsInline
          aria-label={RESERVATION_TEXT.cameraLabel}
          className={mirrored ? 'h-full w-full -scale-x-100 object-cover' : 'h-full w-full object-cover'}
        />
        {state === 'starting' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner size={20} />
          </div>
        )}
      </div>
      <p role="status" className="text-sec text-fg-2">
        {state === 'starting' ? RESERVATION_TEXT.cameraStarting : RESERVATION_TEXT.cameraHint}
      </p>
    </div>
  )
}
