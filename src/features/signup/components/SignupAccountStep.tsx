import { useState, type FormEvent } from 'react'
import { Mail } from 'lucide-react'
import { useNavigate } from 'react-router'
import googleLogo from '@/assets/google/google-g.png'
import { Alert, Button, PageHeader, TextField } from '@/components/ui'
import { useAuth } from '@/features/auth/auth-context'
import { getFirebaseGoogleAuthErrorMessage } from '@/features/auth/auth-errors'
import { AuthLink } from '@/features/auth/components/AuthLink'
import { validateEmail } from '@/features/auth/auth-view'
import { SIGNUP_TEXT } from '../messages'
import { SignupProgress } from './SignupProgress'

const MIN_PASSWORD_LENGTH = 6

function validatePassword(value: string): string | undefined {
  if (value.length === 0) return SIGNUP_TEXT.passwordRequired
  return value.length < MIN_PASSWORD_LENGTH ? SIGNUP_TEXT.passwordTooShort : undefined
}

/**
 * Step 1 of the public registration: the Firebase account, with email and password or with Google. With email, the
 * verification email goes out right away and the next screen is the verification one (the session is already open).
 */
export function SignupAccountStep() {
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string>()
  const [passwordError, setPasswordError] = useState<string>()
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [googleSigningIn, setGoogleSigningIn] = useState(false)
  const busy = submitting || googleSigningIn

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setSubmitError(undefined)
    const nextEmailError = validateEmail(email, 'crear tu cuenta')
    const nextPasswordError = validatePassword(password)
    setEmailError(nextEmailError)
    setPasswordError(nextPasswordError)
    if (nextEmailError || nextPasswordError) return

    setSubmitting(true)
    try {
      await signUp(email.trim(), password)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No pudimos crear tu cuenta. Intenta de nuevo en un momento.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogle() {
    if (busy) return
    setSubmitError(undefined)
    setGoogleSigningIn(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : getFirebaseGoogleAuthErrorMessage(error))
    } finally {
      setGoogleSigningIn(false)
    }
  }

  return (
    <>
      <SignupProgress step={1} />
      <PageHeader title={SIGNUP_TEXT.accountTitle} description={SIGNUP_TEXT.accountDescription} />

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5" aria-label={SIGNUP_TEXT.accountTitle}>
        {submitError && <Alert type="error">{submitError}</Alert>}

        <TextField
          label={SIGNUP_TEXT.emailLabel}
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
          onBlur={() => email && setEmailError(validateEmail(email, 'crear tu cuenta'))}
        />
        <TextField
          label={SIGNUP_TEXT.passwordLabel}
          name="password"
          type="password"
          autoComplete="new-password"
          helperText={SIGNUP_TEXT.passwordHelp}
          value={password}
          error={passwordError}
          disabled={busy}
          onChange={(event) => {
            setPassword(event.target.value)
            if (passwordError) setPasswordError(undefined)
          }}
          onBlur={() => password && setPasswordError(validatePassword(password))}
        />

        <Button type="submit" fullWidth loading={submitting} disabled={googleSigningIn} loadingText={SIGNUP_TEXT.creatingAccount}>
          {SIGNUP_TEXT.createAccount}
        </Button>

        <div aria-hidden="true" className="flex items-center gap-3">
          <span className="h-px flex-1 bg-line" />
          <span className="text-label text-fg">{SIGNUP_TEXT.orWith}</span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <Button
          type="button"
          variant="outline"
          fullWidth
          loading={googleSigningIn}
          disabled={submitting}
          loadingText={SIGNUP_TEXT.connectingGoogle}
          onClick={() => void handleGoogle()}
        >
          {/* Official Google "G" (branding guidelines): its colors and shape never change. */}
          <img src={googleLogo} alt="" aria-hidden="true" width={20} height={20} className="size-5" />
          {SIGNUP_TEXT.continueWithGoogle}
        </Button>

        <p className="text-center text-sec text-fg">
          {SIGNUP_TEXT.alreadyHaveAccount} <AuthLink onClick={() => navigate('/login')}>{SIGNUP_TEXT.signIn}</AuthLink>
        </p>
        <p className="text-center text-sec text-fg">{SIGNUP_TEXT.diner}</p>
      </form>
    </>
  )
}
