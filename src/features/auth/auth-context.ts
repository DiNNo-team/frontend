import { createContext, useContext } from 'react'
import type { User } from 'firebase/auth'

export type AuthEvent = 'session-expired' | 'email-not-verified' | 'restaurant-required'

export interface AuthContextValue {
  user: User | null
  loading: boolean
  emailVerified: boolean
  authEvent: AuthEvent | null
  clearAuthEvent: () => void
  emailVerificationRetried: boolean
  signIn: (email: string, password: string) => Promise<void>
  /** Creates the Firebase account and sends the verification email. The backend creates the user on the first verified request. */
  signUp: (email: string, password: string) => Promise<void>
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