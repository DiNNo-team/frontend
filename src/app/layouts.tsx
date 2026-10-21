import { Outlet, useNavigate } from 'react-router'
import { AppShell, OnboardingShell } from '@/components/layout'
import { useAuth } from '@/features/auth/auth-context'
import { EmailVerificationScreen } from './EmailVerificationScreen'
import { WrongAccountScreen } from './WrongAccountScreen'
import { RestaurantStatusBanner } from '@/features/restaurant-status/components/RestaurantStatusBanner'
import { RestaurantStatusControl } from '@/features/restaurant-status/components/RestaurantStatusControl'
import { useToast } from '@/components/ui'

export function DashboardLayout() {
  const navigate = useNavigate()
  const { user, authEvent, accountEvent, signOut } = useAuth()
  const toast = useToast()

  function handleSignOut() {
    void signOut()
      .then(() => navigate('/login', { replace: true }))
      .catch(() => toast.show({ type: 'error', message: 'No pudimos cerrar sesión. Intenta de nuevo.' }))
  }

  return (
    <AppShell
      restaurantName={user?.displayName ?? 'Restaurante'}
      userEmail={user?.email ?? ''}
      onSignOut={handleSignOut}
      statusSlot={accountEvent ? undefined : <RestaurantStatusControl />}
      banner={accountEvent ? undefined : <RestaurantStatusBanner />}
    >
      {authEvent === 'email-not-verified' ? (
        <EmailVerificationScreen />
      ) : accountEvent ? (
        <WrongAccountScreen />
      ) : (
        <Outlet />
      )}
    </AppShell>
  )
}

export function OnboardingLayout() {
  const { authEvent, accountEvent } = useAuth()

  return (
    <OnboardingShell>
      {authEvent === 'email-not-verified' ? (
        <EmailVerificationScreen />
      ) : accountEvent ? (
        <WrongAccountScreen />
      ) : (
        <Outlet />
      )}
    </OnboardingShell>
  )
}
