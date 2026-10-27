import { Outlet, useNavigate } from 'react-router'
import { AppShell, OnboardingShell } from '@/components/layout'
import { useAuth } from '@/features/auth/auth-context'
import { EmailVerificationScreen } from './EmailVerificationScreen'
import { WrongAccountScreen } from './WrongAccountScreen'
import { RestaurantStatusBanner } from '@/features/restaurant-status/components/RestaurantStatusBanner'
import { RestaurantStatusControl } from '@/features/restaurant-status/components/RestaurantStatusControl'
import { LocationBanner } from '@/features/restaurant/components/LocationBanner'
import { useRestaurantQuery } from '@/features/restaurant/hooks'
import { useRestaurantStatusQuery } from '@/features/restaurant-status/hooks'
import { useToast } from '@/components/ui'

export function DashboardLayout() {
  const navigate = useNavigate()
  const { user, authEvent, accountEvent, signOut } = useAuth()
  const toast = useToast()
  // The topbar shows the restaurant's real name (manual 12.2); Firebase's displayName is the person, or empty.
  const restaurantQuery = useRestaurantQuery({ enabled: !accountEvent && authEvent !== 'email-not-verified' })
  const restaurantName = restaurantQuery.isPending && restaurantQuery.fetchStatus !== 'idle' ? undefined : (restaurantQuery.data?.name ?? '')
  // The room's light follows the restaurant (manual v2.1): warm while open or still loading, out once it is closed.
  const statusQuery = useRestaurantStatusQuery({ enabled: !accountEvent && authEvent !== 'email-not-verified' })
  const lit = statusQuery.data?.isOpen !== false

  function handleSignOut() {
    void signOut()
      .then(() => navigate('/login', { replace: true }))
      .catch(() => toast.show({ type: 'error', message: 'No pudimos cerrar sesión. Intenta de nuevo.' }))
  }

  return (
    <AppShell
      restaurantName={restaurantName}
      userEmail={user?.email ?? ''}
      onSignOut={handleSignOut}
      lit={lit}
      statusSlot={accountEvent ? undefined : <RestaurantStatusControl />}
      banner={
        accountEvent ? undefined : (
          // empty:hidden: with no notice to show, the wrapper takes no gap in the page.
          <div className="flex flex-col gap-3 empty:hidden">
            <RestaurantStatusBanner />
            <LocationBanner />
          </div>
        )
      }
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
