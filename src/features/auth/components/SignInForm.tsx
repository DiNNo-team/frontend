import { useState, type FormEvent } from 'react'
import { Mail } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import { Alert, Button, TextField } from '@/components/ui'
import { getFirebaseAuthErrorMessage } from '../auth-errors'
import { getSafeReturnTo } from '../auth-navigation'
import { useAuth } from '../auth-context'
import { validateEmail } from '../auth-view'
import { AuthLink } from './AuthLink'

const RESET_SENT_MESSAGE =
  'Si hay una cuenta con ese correo, te enviamos un enlace para cambiar tu contraseña. Revisa tu bandeja de entrada.'

function validatePassword(value: string): string | undefined {
  return value.length > 0 ? undefined : 'Escribe tu contraseña para iniciar sesión.'
}

export function SignInForm({ onSwitch }: { onSwitch: () => void }) {
  const { signIn, sendPasswordReset } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string>()
  const [passwordError, setPasswordError] = useState<string>()
  const [submitError, setSubmitError] = useState<string>()
  const [resetNotice, setResetNotice] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [sendingReset, setSendingReset] = useState(false)
  const busy = submitting || sendingReset

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(undefined)
    setResetNotice(undefined)

    const nextEmailError = validateEmail(email, 'iniciar sesión')
    const nextPasswordError = validatePassword(password)
    setEmailError(nextEmailError)
    setPasswordError(nextPasswordError)
    if (nextEmailError || nextPasswordError) return

    setSubmitting(true)
    try {
      await signIn(email.trim(), password)
      navigate(getSafeReturnTo(location.state) ?? '/mesas', { replace: true })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : getFirebaseAuthErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleForgotPassword() {
    setSubmitError(undefined)
    setResetNotice(undefined)
    const nextEmailError = validateEmail(email, 'cambiar tu contraseña')
    setEmailError(nextEmailError)
    if (nextEmailError) return

    setSendingReset(true)
    try {
      await sendPasswordReset(email.trim())
      setResetNotice(RESET_SENT_MESSAGE)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No pudimos enviar el correo. Intenta de nuevo.')
    } finally {
      setSendingReset(false)
    }
  }

  return (
    <form aria-labelledby="signin-title" className="flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
      <p className="order-last text-center text-sec text-fg/60 md:order-first">
        ¿Aún no tienes cuenta? <AuthLink onClick={onSwitch}>Crear cuenta</AuthLink>
      </p>

      <header className="flex flex-col gap-2 lg:sr-only">
        <h1 id="signin-title" className="text-h1">
          Inicia sesión
        </h1>
        <p className="text-sec text-fg">Administra tu restaurante en DiNNo</p>
      </header>

      {submitError && <Alert type="error">{submitError}</Alert>}
      {resetNotice && <Alert type="success">{resetNotice}</Alert>}

      <div className="flex flex-col gap-4">
        <TextField
          label="Correo"
          name="email"
          type="email"
          icon={Mail}
          iconPosition="end"
          autoComplete="username"
          placeholder="nombre@restaurante.com"
          value={email}
          error={emailError}
          disabled={busy}
          onChange={(event) => {
            setEmail(event.target.value)
            if (emailError) setEmailError(undefined)
          }}
          onBlur={() => email && setEmailError(validateEmail(email, 'iniciar sesión'))}
        />
        <TextField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          error={passwordError}
          disabled={busy}
          onChange={(event) => {
            setPassword(event.target.value)
            if (passwordError) setPasswordError(undefined)
          }}
        />
        <AuthLink className="self-end text-sec" disabled={busy} onClick={() => void handleForgotPassword()}>
          {sendingReset ? 'Enviando correo…' : '¿Olvidaste tu contraseña?'}
        </AuthLink>
      </div>

      <Button type="submit" fullWidth loading={submitting} disabled={sendingReset} loadingText="Iniciando sesión…">
        Iniciar sesión
      </Button>
    </form>
  )
}
