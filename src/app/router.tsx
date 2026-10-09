import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import ActivityLogPage from '@/features/activity-log/ActivityLogPage'
import OnboardingPage from '@/features/restaurant/OnboardingPage'
import RestaurantPage from '@/features/restaurant/RestaurantPage'
import TablesPage from '@/features/tables/TablesPage'
import { AuthEventHandler, LoginRoute, RequireSession } from './AuthRouteComponents'
import { DashboardLayout, OnboardingLayout } from './layouts'

const KitPage = import.meta.env.DEV ? lazy(() => import('@/dev/kit/KitPage')) : null

export const routes: RouteObject[] = [
  {
    element: <AuthEventHandler />,
    children: [
      { path: '/login', element: <LoginRoute /> },
      {
        element: <RequireSession />,
        children: [
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
    ],
  },
]

export const router = createBrowserRouter(routes)
