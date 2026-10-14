import { useState, type FormEvent } from 'react'
import { Mail } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Alert, Button, TextField } from '@/components/ui'
import { getFirebaseSignUpErrorMessage } from '../auth-errors'
import { useAuth } from '../auth-context'
import { validateEmail } from '../auth-view'
import { AuthLink } from './AuthLink'

const MIN_PASSWORD_LENGTH = 8

interface SignUpErrors {
  email?: string
  password?: string
  confirmation?: string
}

function validate(email: string, password: string, confirmation: string): SignUpErrors {
  return {
    email: validateEmail(email, 'crear tu cuenta'),
    password: password.length >= MIN_PASSWORD_LENGTH ? undefined : `Usa al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    confirmation: confirmation === password ? undefined : 'Las contraseñas no coinciden. Escríbela igual en los dos campos.',
  }
}

/**
 * Creates the Firebase account and sends the verification email. The session starts right away, so the route
 * sends the person to the dashboard, where the verification screen and then onboarding take over.
 */
export function SignUpForm({ onSwitch }: { onSwitch: () => void }) {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [errors, setErrors] = useState<SignUpErrors>({})
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  function clearError(field: keyof SignUpErrors) {
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(undefined)

    const nextErrors = validate(email, password, confirmation)
    setErrors(nextErrors)
    if (nextErrors.email || nextErrors.password || nextErrors.confirmation) return

    setSubmitting(true)
    try {
      await signUp(email.trim(), password)
      navigate('/mesas', { replace: true })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : getFirebaseSignUpErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form aria-labelledby="signup-title" className="flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
      <p className="order-last text-center text-sec text-fg/60 md:order-first">
        ¿Ya tienes cuenta? <AuthLink onClick={onSwitch}>Inicia sesión</AuthLink>
      </p>

      <header className="flex flex-col gap-2 lg:sr-only">
        <h1 id="signup-title" className="text-h1">
          Crea tu cuenta
        </h1>
        <p className="text-sec text-fg">Después registras los datos de tu restaurante</p>
      </header>

      {submitError && <Alert type="error">{submitError}</Alert>}

      <div className="flex flex-col gap-4">
        <TextField
          label="Correo"
          name="email"
          type="email"
          icon={Mail}
          iconPosition="end"
          autoComplete="email"
          placeholder="nombre@restaurante.com"
          value={email}
          error={errors.email}
          disabled={submitting}
          onChange={(event) => {
            setEmail(event.target.value)
            clearError('email')
          }}
        />
        <TextField
          label="Contraseña"
          name="new-password"
          type="password"
          autoComplete="new-password"
          helperText={`Usa al menos ${MIN_PASSWORD_LENGTH} caracteres.`}
          value={password}
          error={errors.password}
          disabled={submitting}
          onChange={(event) => {
            setPassword(event.target.value)
            clearError('password')
          }}
        />
        <TextField
          label="Confirma la contraseña"
          name="password-confirmation"
          type="password"
          autoComplete="new-password"
          value={confirmation}
          error={errors.confirmation}
          disabled={submitting}
          onChange={(event) => {
            setConfirmation(event.target.value)
            clearError('confirmation')
          }}
        />
      </div>

      <Button type="submit" fullWidth loading={submitting} loadingText="Creando cuenta…">
        Crear cuenta
      </Button>
    </form>
  )
}
