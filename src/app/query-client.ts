import { QueryClient } from '@tanstack/react-query'
import { retryUnlessAnswered } from '@/lib/api-client'

/** One retry for reads that fail by network or server (a flaky network should not show the error screen at once), none when the server answered on purpose (4xx: a 403 will not change); none for writes. */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: retryUnlessAnswered, staleTime: 30_000, refetchOnWindowFocus: true },
      mutations: { retry: 0 },
    },
  })
}
