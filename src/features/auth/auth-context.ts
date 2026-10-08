import { createContext, useContext } from 'react'
import type { User } from 'firebase/auth'

export type AuthEvent = 'session-expired' | 'email-not-verified' | 'restaurant-required'

export interface AuthContextValue {
  user: User | null
  loading: boolean
  emailVerified: boolean
  authEvent: AuthEvent | null
  clearAuthEvent: () => void
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}