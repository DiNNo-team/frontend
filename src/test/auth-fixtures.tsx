import { useMemo, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { sessionActions } from './session-actions'
import { AuthContext, type AuthContextValue, type AuthEvent } from '@/features/auth/auth-context'

// A signed-in (or signed-out) session as the AuthProvider exposes it, with every action as a spy: tests of screens that
// only read the session do not need Firebase or the whole router.

export interface FakeSession {
  signedIn?: boolean
  emailVerified?: boolean
  authEvent?: AuthEvent | null
}

export function FakeAuth({ signedIn = true, emailVerified = true, authEvent = null, children }: FakeSession & { children: ReactNode }) {
  const value = useMemo<AuthContextValue>(
    () => ({
      user: signedIn ? ({ uid: 'u1', email: 'dueno@casa72.co' } as User) : null,
      loading: false,
      emailVerified,
      authEvent,
      accountEvent: null,
      emailVerificationRetried: false,
      ...sessionActions,
    }),
    [signedIn, emailVerified, authEvent],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
