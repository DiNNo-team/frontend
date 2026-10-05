import { QueryClient } from '@tanstack/react-query'

/** One retry for reads (a flaky network should not show the error screen at once); none for writes. */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: true },
      mutations: { retry: 0 },
    },
  })
}
