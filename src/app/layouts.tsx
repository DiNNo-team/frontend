import { Outlet, useNavigate } from 'react-router'
import { AppShell, OnboardingShell } from '@/components/layout'
import { RestaurantStatusBanner } from '@/features/restaurant-status/components/RestaurantStatusBanner'
import { RestaurantStatusControl } from '@/features/restaurant-status/components/RestaurantStatusControl'

// TODO(Jacobo): conectar con la sesión. Datos de ejemplo hasta que exista el login; cámbialos solo aquí.
const SAMPLE_SESSION = {
  restaurantName: 'Casa 72',
  userEmail: 'admin@casa72.co',
}

export function DashboardLayout() {
  const navigate = useNavigate()
  return (
    <AppShell
      restaurantName={SAMPLE_SESSION.restaurantName}
      userEmail={SAMPLE_SESSION.userEmail}
      // TODO(Jacobo): cerrar la sesión de Firebase antes de ir al login.
      onSignOut={() => navigate('/login')}
      statusSlot={<RestaurantStatusControl />}
      banner={<RestaurantStatusBanner />}
    >
      <Outlet />
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
