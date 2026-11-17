import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import ActivityLogPage from '@/features/activity-log/ActivityLogPage'
import OnboardingPage from '@/features/restaurant/OnboardingPage'
import RestaurantPage from '@/features/restaurant/RestaurantPage'
import TablesPage from '@/features/tables/TablesPage'
import { AccessGuard } from './AccessGuard'
import { AuthEventHandler, LoginRoute, RequireSession } from './AuthRouteComponents'
import { AdminLayout, DashboardLayout, OnboardingLayout } from './layouts'

/** Routes loaded on demand: the registration and the request screen are only for accounts that are not approved yet. */
const lazyPage = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({ Component: (await load()).default })

const KitPage = import.meta.env.DEV ? lazy(() => import('@/dev/kit/KitPage')) : null
// Preview of the identity manual v2.0 (docs/DiNNo_Manual_Identidad_v2_0.md), development only.
const SystemPage = import.meta.env.DEV ? lazy(() => import('@/dev/sistema/SystemPage')) : null

export const routes: RouteObject[] = [
  {
    element: <AuthEventHandler />,
    children: [
      { path: '/login', element: <LoginRoute /> },
      { path: '/registro', lazy: lazyPage(() => import('@/features/signup/SignupPage')) },
      {
        element: <RequireSession />,
        children: [
          {
            element: <AccessGuard allow={['restaurant-required']} />,
            children: [
              {
                element: <OnboardingLayout />,
                children: [{ path: '/onboarding', element: <OnboardingPage /> }],
              },
            ],
          },
          {
            element: <AccessGuard allow={['pending', 'rejected']} />,
            children: [
              {
                element: <OnboardingLayout />,
                children: [{ path: '/solicitud', lazy: lazyPage(() => import('@/features/signup/RequestStatusPage')) }],
              },
            ],
          },
          {
            element: <AccessGuard allow={['admin']} />,
            children: [
              {
                element: <AdminLayout />,
                children: [
                  { path: '/admin', lazy: lazyPage(() => import('@/features/admin-overview/OverviewPage')) },
                  { path: '/admin/solicitudes', lazy: lazyPage(() => import('@/features/admin/AdminPage')) },
                  { path: '/admin/restaurantes', lazy: lazyPage(() => import('@/features/admin-restaurants/RestaurantsPage')) },
                  { path: '/admin/cobros', lazy: lazyPage(() => import('@/features/admin-billing/BillingPage')) },
                  { path: '/admin/cobros/:restaurantId', lazy: lazyPage(() => import('@/features/admin-billing/BillingDetailPage')) },
                ],
              },
            ],
          },
          {
            element: <AccessGuard allow={['suspended']} />,
            children: [
              {
                element: <DashboardLayout />,
                children: [{ path: '/suspendido', lazy: lazyPage(() => import('@/features/suspended/SuspendedPage')) }],
              },
            ],
          },
          {
            element: <AccessGuard allow={['approved', 'suspended']} />,
            children: [
              {
                element: <DashboardLayout />,
                children: [{ path: '/resumen', lazy: lazyPage(() => import('@/features/summary/SummaryPage')) }],
              },
            ],
          },
          {
            element: <AccessGuard allow={['approved']} />,
            children: [
              {
                element: <DashboardLayout />,
                children: [
                  { path: '/mesas', element: <TablesPage /> },
                  { path: '/restaurante', element: <RestaurantPage /> },
                  { path: '/bitacora', element: <ActivityLogPage /> },
                ],
              },
            ],
          },
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
      ...(SystemPage
        ? [
            {
              path: '/sistema',
              element: (
                <Suspense fallback={null}>
                  <SystemPage />
                </Suspense>
              ),
            },
          ]
        : []),
      { path: '/', element: <Navigate to="/mesas" replace /> },
      { path: '*', element: <Navigate to="/mesas" replace /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
