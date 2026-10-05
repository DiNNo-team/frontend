import type { ReactElement } from 'react'
import { QueryClient } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Providers } from '@/app/providers'

export function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity }, mutations: { retry: false } } })
}

/** Renders inside the app providers (fresh query client, no retries) and returns a ready `user`. */
export function renderWithProviders(ui: ReactElement, { queryClient = createTestQueryClient() } = {}) {
  return {
    user: userEvent.setup(),
    queryClient,
    ...render(ui, { wrapper: ({ children }) => <Providers queryClient={queryClient}>{children}</Providers> }),
  }
}
