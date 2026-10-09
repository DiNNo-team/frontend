import { useState } from 'react'
import { Alert, Button, useToast } from '@/components/ui'
import { useAuth } from '@/features/auth/auth-context'
import { getFirebaseActionErrorMessage } from '@/features/auth/auth-errors'

export function EmailVerificationScreen() {
  const { emailVerificationRetried, reenviarVerificacion, refrescarSesion, signOut } = useAuth()
  const toast = useToast()
  const [sending, setSending] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [actionError, setActionError] = useState<string>()

  async function resendVerification() {
    setSending(true)
    setActionError(undefined)
    try {
      await reenviarVerificacion()
      toast.show({ type: 'success', message: 'Correo de verificación enviado. Revisa tu bandeja de entrada y la carpeta de spam.' })
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : getFirebaseActionErrorMessage(error, 'No pudimos reenviar el correo. Intenta de nuevo.'),
      )
    } finally {
      setSending(false)
    }
  }

  async function retryVerification() {
    setRefreshing(true)
    setActionError(undefined)
    try {
      await refrescarSesion()
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : getFirebaseActionErrorMessage(error, 'No pudimos actualizar tu sesión. Intenta de nuevo.'),
      )
    } finally {
      setRefreshing(false)
    }
  }

  async function closeSession() {
    setSigningOut(true)
    setActionError(undefined)
    try {
      await signOut()
    } catch {
      setActionError('No pudimos cerrar sesión. Intenta de nuevo.')
    } finally {
      setSigningOut(false)
    }
  }

  const busy = sending || refreshing || signingOut

  return (
    <section className="flex w-full max-w-100 flex-col gap-6" aria-labelledby="email-verification-title">
      <div className="flex flex-col gap-2">
        <h1 id="email-verification-title" className="text-h2">Verifica tu correo para continuar.</h1>
        <p className="text-sec text-fg-2">
          Revisa tu bandeja de entrada y la carpeta de spam. Cuando lo verifiques, vuelve aquí.
        </p>
      </div>

      {emailVerificationRetried && <Alert type="warning">Todavía no vemos tu correo verificado.</Alert>}
      {actionError && <Alert type="error">{actionError}</Alert>}

      <div className="flex flex-col gap-3">
        <Button variant="secondary" fullWidth disabled={busy} loading={sending} loadingText="Enviando correo…" onClick={resendVerification}>
          Reenviar correo
        </Button>
        <Button fullWidth disabled={busy} loading={refreshing} loadingText="Comprobando…" onClick={retryVerification}>
          Ya lo verifiqué
        </Button>
        <Button variant="ghost" fullWidth disabled={busy} onClick={closeSession}>
          Cerrar sesión
        </Button>
      </div>
    </section>
  )
}