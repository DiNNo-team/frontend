import { useQuery } from '@tanstack/react-query'
import { accountApi } from './api'

export const meQueryKey = ['me'] as const

/** GET /me: the role of the session. Refreshed when the window gets focus, like the rest of the data. */
export function useMeQuery({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({ queryKey: meQueryKey, queryFn: () => accountApi.getMe(), enabled })
}
