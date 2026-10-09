import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Alert, Button, Logo, TextField } from '@/components/ui'
import { getFirebaseAuthErrorMessage } from './auth-errors'
import { getSafeReturnTo } from './auth-navigation'
import { useAuth } from './auth-context'

export default function LoginPage() {
  const { signIn } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string>()
  const [passwordError, setPasswordError] = useState<string>()
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  function validateEmail(value: string): string | undefined {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
      ? undefined
      : 'Escribe un correo válido para iniciar sesión.'
  }

  function validatePassword(value: string): string | undefined {
    return value.length > 0 ? undefined : 'Escribe tu contraseña para iniciar sesión.'
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(undefined)

    const nextEmailError = validateEmail(email)
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

  return (
    <main className="grid min-h-screen bg-bg lg:grid-cols-2">
      <section className="hidden items-center justify-center bg-(--grad-petrol) px-8 py-12 text-on-brand lg:flex">
        <div className="flex max-w-120 flex-col items-center gap-8 text-center">
          <Logo variant="onDark" className="w-24" />
          <div className="flex flex-col gap-4">
            <h1 className="text-display">Dile no a la espera.</h1>
            <p className="text-body">Microreservas de mesas con disponibilidad inmediata.</p>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-100 flex-col gap-8">
          <Logo variant="auto" className="w-24 lg:hidden" />
          <header className="flex flex-col gap-2">
            <h1 className="text-h1">Inicia sesión</h1>
            <p className="text-sec text-fg-2">Administra tu restaurante en DiNNo</p>
          </header>

          {submitError && <Alert type="error">{submitError}</Alert>}

          <form className="flex flex-col gap-6" noValidate onSubmit={handleSubmit}>
            <TextField
              label="Correo"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="nombre@restaurante.com"
              value={email}
              error={emailError}
              disabled={submitting}
              onChange={(event) => {
                setEmail(event.target.value)
                if (emailError) setEmailError(undefined)
              }}
              onBlur={() => setEmailError(validateEmail(email))}
            />
            <TextField
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              error={passwordError}
              disabled={submitting}
              onChange={(event) => {
                setPassword(event.target.value)
                if (passwordError) setPasswordError(undefined)
              }}
              onBlur={() => setPasswordError(validatePassword(password))}
            />
            <Button type="submit" fullWidth loading={submitting} loadingText="Iniciando sesión…">
              Iniciar sesión
            </Button>
          </form>
        </div>
      </section>
    </main>
  )
}
