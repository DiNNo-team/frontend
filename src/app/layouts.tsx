import { Outlet, useNavigate } from 'react-router'
import { AppShell, OnboardingShell } from '@/components/layout'
import { useAuth } from '@/features/auth/auth-context'
import { EmailVerificationScreen } from './EmailVerificationScreen'
import { RestaurantStatusBanner } from '@/features/restaurant-status/components/RestaurantStatusBanner'
import { RestaurantStatusControl } from '@/features/restaurant-status/components/RestaurantStatusControl'
import { useToast } from '@/components/ui'

export function DashboardLayout() {
  const navigate = useNavigate()
  const { user, authEvent, signOut } = useAuth()
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
      statusSlot={<RestaurantStatusControl />}
      banner={<RestaurantStatusBanner />}
    >
      {authEvent === 'email-not-verified' ? <EmailVerificationScreen /> : <Outlet />}
    </AppShell>
  )
}

export function OnboardingLayout() {
  return (
    <OnboardingShell>
      <Outlet />
    </OnboardingShell>
  )
}
