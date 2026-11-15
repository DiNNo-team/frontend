import { Outlet, useNavigate } from 'react-router'
import { AppShell, NAV_ITEMS_ADMIN, OnboardingShell } from '@/components/layout'
import { useAuth } from '@/features/auth/auth-context'
import { EmailVerificationScreen } from './EmailVerificationScreen'
import { WrongAccountScreen } from './WrongAccountScreen'
import { RestaurantStatusBanner } from '@/features/restaurant-status/components/RestaurantStatusBanner'
import { RestaurantStatusControl } from '@/features/restaurant-status/components/RestaurantStatusControl'
import { LocationBanner } from '@/features/restaurant/components/LocationBanner'
import { useRestaurantQuery } from '@/features/restaurant/hooks'
import { useRestaurantStatusQuery } from '@/features/restaurant-status/hooks'
import { useToast } from '@/components/ui'
import { usePendingRestaurantsCount } from '@/features/admin/hooks'
import { useRestaurantRealtime } from '@/features/realtime/use-restaurant-realtime'
import { useWelcomeAfterApproval } from '@/features/signup/use-welcome'

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
  // Live dashboard (Sprint 3): only with a registered restaurant (the server rejects an admin without one), never with
  // the sample data. Keyed by the restaurant: rooms are fixed on connect.
  useWelcomeAfterApproval(restaurantQuery.data)
  // A pending or rejected restaurant is not let in either (§12.12): only an approved one connects.
  const approved = restaurantQuery.data?.approvalStatus === 'approved'
  const liveRestaurantId = import.meta.env.VITE_USE_MOCKS === 'true' || accountEvent || !user || !approved ? undefined : restaurantQuery.data?.id
  useRestaurantRealtime(liveRestaurantId)

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
      statusSlot={
        accountEvent ? undefined : <RestaurantStatusControl />
      }
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

/** Frame of the DiNNo administrator: the same shell, its own dock (Solicitudes, with the pending count), no restaurant switch. */
export function AdminLayout() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const toast = useToast()
  const pending = usePendingRestaurantsCount()

  function handleSignOut() {
    void signOut()
      .then(() => navigate('/login', { replace: true }))
      .catch(() => toast.show({ type: 'error', message: 'No pudimos cerrar sesión. Intenta de nuevo.' }))
  }

  return (
    <AppShell
      restaurantName="Administración de DiNNo"
      userEmail={user?.email ?? ''}
      onSignOut={handleSignOut}
      navItems={NAV_ITEMS_ADMIN}
      navBadges={{ '/admin': pending.data ?? 0 }}
    >
      <Outlet />
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
