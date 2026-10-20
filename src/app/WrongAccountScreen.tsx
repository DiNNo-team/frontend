import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Alert, Button } from '@/components/ui'
import { useAuth } from '@/features/auth/auth-context'

const ACCOUNT_MESSAGES = {
  'account-not-enabled': 'Esta cuenta no está habilitada como restaurante. Si eres comensal, encuentra mesa desde la app DiNNo.',
  'diner-account': 'Esta es una cuenta de comensal. Para buscar mesa, usa la app DiNNo.',
} as const

export function WrongAccountScreen() {
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

  if (!accountEvent) return null

  return (
    <section className="flex w-full max-w-100 flex-col gap-6" aria-labelledby="wrong-account-title">
      <div className="flex flex-col gap-2">
        <h1 id="wrong-account-title" className="text-h2">Cierra sesión para continuar.</h1>
        <p className="text-sec text-fg-2">{ACCOUNT_MESSAGES[accountEvent]}</p>
      </div>

      {signOutError && <Alert type="error">{signOutError}</Alert>}

      <Button variant="ghost" fullWidth disabled={signingOut} onClick={closeSession}>
        Cerrar sesión
      </Button>
    </section>
  )
}