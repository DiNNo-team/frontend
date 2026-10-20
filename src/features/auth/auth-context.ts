import { createContext, useContext } from 'react'
import type { User } from 'firebase/auth'

export type AccountEvent = 'account-not-enabled' | 'diner-account'
export type AuthEvent = 'session-expired' | 'email-not-verified' | AccountEvent | 'restaurant-required'

export interface AuthContextValue {
  user: User | null
  loading: boolean
  emailVerified: boolean
  authEvent: AuthEvent | null
  accountEvent: AccountEvent | null
  clearAuthEvent: () => void
  clearAccountEvent: () => void
  emailVerificationRetried: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<boolean>
  sendPasswordReset: (email: string) => Promise<void>
  signOut: () => Promise<void>
  reenviarVerificacion: () => Promise<void>
  refrescarSesion: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}