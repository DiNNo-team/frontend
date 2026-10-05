import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import ActivityLogPage from '@/features/activity-log/ActivityLogPage'
import LoginPage from '@/features/auth/LoginPage'
import OnboardingPage from '@/features/restaurant/OnboardingPage'
import RestaurantPage from '@/features/restaurant/RestaurantPage'
import TablesPage from '@/features/tables/TablesPage'
import { DashboardLayout, OnboardingLayout } from './layouts'

const KitPage = import.meta.env.DEV ? lazy(() => import('@/dev/kit/KitPage')) : null

export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  // TODO(Jacobo): la guarda de sesión envuelve estas dos ramas (sin sesión → /login; sin restaurante → /onboarding).
  {
    element: <OnboardingLayout />,
    children: [{ path: '/onboarding', element: <OnboardingPage /> }],
  },
  {
    element: <DashboardLayout />,
    children: [
      { path: '/mesas', element: <TablesPage /> },
      { path: '/restaurante', element: <RestaurantPage /> },
      { path: '/bitacora', element: <ActivityLogPage /> },
    ],
  },
  ...(KitPage
    ? [
        {
          path: '/kit',
          element: (
            <Suspense fallback={null}>
              <KitPage />
            </Suspense>
          ),
        },
      ]
    : []),
  { path: '/', element: <Navigate to="/mesas" replace /> },
  { path: '*', element: <Navigate to="/mesas" replace /> },
]

export const router = createBrowserRouter(routes)
