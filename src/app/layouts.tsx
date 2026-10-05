import { Outlet, useNavigate } from 'react-router'
import { AppShell, OnboardingShell } from '@/components/layout'

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
      // TODO(Sergio): "Estado del restaurante" + Switch Abierto/Cerrado.
      statusSlot={undefined}
      // TODO(Sergio): Alert info cuando el restaurante está cerrado.
      banner={undefined}
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
