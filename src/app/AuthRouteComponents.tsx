import { useEffect, useRef } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router'
import { Skeleton, useToast } from '@/components/ui'
import { useAuth } from '@/features/auth/auth-context'
import { getSafeCurrentPath, getSafeReturnTo, requiresFreshSignIn } from '@/features/auth/auth-navigation'
import LoginPage from '@/features/auth/LoginPage'

function AuthLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-4">
      <section aria-busy="true" className="flex w-full max-w-100 flex-col gap-6">
        <span role="status" className="sr-only">
          Comprobando tu sesión
        </span>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" radius="btn" />
      </section>
    </main>
  )
}

export function LoginRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoading />
  if (user && !requiresFreshSignIn(location.state)) {
    return <Navigate to={getSafeReturnTo(location.state) ?? '/mesas'} replace />
  }
  return <LoginPage />
}

export function RequireSession() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AuthLoading />
  if (!user) return <Navigate to="/login" replace state={{ from: getSafeCurrentPath(location) }} />
  return <Outlet />
}

export function AuthEventHandler() {
  const { authEvent, clearAuthEvent, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const sessionExpiryPending = useRef(false)

  useEffect(() => {
    if (authEvent === 'restaurant-required') {
      clearAuthEvent()
      if (location.pathname !== '/onboarding') navigate('/onboarding', { replace: true })
      return
    }

    if (authEvent !== 'session-expired' || sessionExpiryPending.current) return

    sessionExpiryPending.current = true
    const returnTo = getSafeCurrentPath(location)
    clearAuthEvent()
    toast.show({ type: 'warning', message: 'Tu sesión terminó. Inicia sesión de nuevo.' })
    void signOut()
      .catch(() => {
        toast.show({ type: 'error', message: 'No pudimos cerrar sesión. Vuelve a iniciar sesión.' })
      })
      .finally(() => {
        navigate('/login', { replace: true, state: { from: returnTo, forceSignIn: true } })
        sessionExpiryPending.current = false
      })
  }, [authEvent, clearAuthEvent, location, navigate, signOut, toast])

  return <Outlet />
}