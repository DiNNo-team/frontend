import { Navigate, Outlet } from 'react-router'
import { OnboardingShell } from '@/components/layout'
import { Alert, Button } from '@/components/ui'
import { ACCESS_HOME, type AccessKind } from '@/features/account/access'
import { ACCESS_LOAD_ERROR, ACCESS_RETRY } from '@/features/account/messages'
import { useAccess } from '@/features/account/use-access'
import { useAuth } from '@/features/auth/auth-context'
import { AuthLoading } from './AuthRouteComponents'
import { EmailVerificationScreen } from './EmailVerificationScreen'
import { WrongAccountScreen } from './WrongAccountScreen'

interface AccessGuardProps {
  /** The states that may open the routes under this guard. Any other goes to its own home. */
  allow: AccessKind[]
}

/**
 * One guard for every signed-in route (replaces the per-layout checks): it asks who the account is and lets it through
 * only where its state belongs. Loading shows the same skeleton as the session check, so nothing flashes. A state
 * without a route of its own (CLAUDE.md §12.12) shows its account screen right where the person stands.
 */
export function AccessGuard({ allow }: AccessGuardProps) {
  const { authEvent } = useAuth()
  const access = useAccess()

  if (authEvent === 'email-not-verified') {
    return (
      <OnboardingShell>
        <EmailVerificationScreen />
      </OnboardingShell>
    )
  }
  if (access.status === 'loading') return <AuthLoading />
  if (access.status === 'error') {
    return (
      <OnboardingShell>
        <section className="flex flex-col gap-4" aria-labelledby="access-error-title">
          <h1 id="access-error-title" className="text-h2">
            No pudimos abrir tu cuenta
          </h1>
          <Alert type="error">{ACCESS_LOAD_ERROR}</Alert>
          <Button onClick={access.retry}>{ACCESS_RETRY}</Button>
        </section>
      </OnboardingShell>
    )
  }
  if (allow.includes(access.kind)) return <Outlet />
  const home = ACCESS_HOME[access.kind]
  if (home) return <Navigate to={home} replace />
  return (
    <OnboardingShell>
      <WrongAccountScreen kind={access.kind} />
    </OnboardingShell>
  )
}
