import { OnboardingShell } from '@/components/layout'
import { AccessGuard } from '@/app/AccessGuard'
import { AuthLoading } from '@/app/AuthRouteComponents'
import { EmailVerificationScreen } from '@/app/EmailVerificationScreen'
import { useAuth } from '@/features/auth/auth-context'
import { SignupAccountStep } from './components/SignupAccountStep'
import { SignupDetailsStep } from './components/SignupDetailsStep'
import { SignupProgress } from './components/SignupProgress'

/**
 * `/registro`: the public registration of a restaurant (CLAUDE.md §12.12), in two steps. Signed out, step 1 creates
 * the Firebase account. Signed in with the email still unverified, the verification screen. With the email verified
 * and no profile yet, step 2 sends the restaurant's data. An account that already has a profile goes where it
 * belongs (its request, its tables…) by the access guard.
 */
export default function SignupPage() {
  const { user, loading, emailVerified } = useAuth()

  if (loading) return <AuthLoading />
  if (!user) {
    return (
      <OnboardingShell>
        <SignupAccountStep />
      </OnboardingShell>
    )
  }
  if (!emailVerified) {
    return (
      <OnboardingShell>
        <SignupProgress step={1} />
        <EmailVerificationScreen />
      </OnboardingShell>
    )
  }
  return (
    <AccessGuard allow={['no-profile']}>
      <OnboardingShell>
        <SignupDetailsStep />
      </OnboardingShell>
    </AccessGuard>
  )
}
