import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Alert, Button } from '@/components/ui'
import type { AccessKind } from '@/features/account/access'
import { ACCESS_SCREEN_TEXT, accessScreenKind } from '@/features/account/messages'
import { useAuth } from '@/features/auth/auth-context'

const EVENT_KIND = { 'account-not-enabled': 'no-profile', 'diner-account': 'diner' } as const

/**
 * Account that cannot use the screen it opened. `kind` comes from the access guard; without it, from the auth event
 * (the API answered ACCOUNT_NOT_ENABLED or DINER_ACCOUNT). Texts: contract, section 10.
 */
export function WrongAccountScreen({ kind }: { kind?: AccessKind }) {
  const { accountEvent, clearAccountEvent, signOut } = useAuth()
  const navigate = useNavigate()
  const [signOutError, setSignOutError] = useState<string>()
  const [signingOut, setSigningOut] = useState(false)

  async function closeSession() {
    setSigningOut(true)
    setSignOutError(undefined)
    try {
      await signOut()
      clearAccountEvent()
      navigate('/login', { replace: true })
    } catch {
      setSignOutError('No pudimos cerrar sesión. Intenta de nuevo.')
      setSigningOut(false)
    }
  }

  const screenKind = kind ? accessScreenKind(kind) : accountEvent ? EVENT_KIND[accountEvent] : null
  if (!screenKind) return null
  const { title, description } = ACCESS_SCREEN_TEXT[screenKind]

  return (
    <section className="flex w-full max-w-100 flex-col gap-6" aria-labelledby="wrong-account-title">
      <div className="flex flex-col gap-2">
        <h1 id="wrong-account-title" className="text-h2">{title}</h1>
        <p className="text-sec text-fg-2">{description}</p>
      </div>

      {signOutError && <Alert type="error">{signOutError}</Alert>}

      <Button variant="ghost" fullWidth disabled={signingOut} onClick={closeSession}>
        Cerrar sesión
      </Button>
    </section>
  )
}
