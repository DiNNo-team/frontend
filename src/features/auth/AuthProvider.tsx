import { useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import {
  EMAIL_NOT_VERIFIED_EVENT,
  RESTAURANT_REQUIRED_EVENT,
  SESSION_EXPIRED_EVENT,
  setAuthTokenProvider,
} from '@/lib/api-client'
import { AuthContext, type AuthEvent } from './auth-context'
import { getFirebaseActionErrorMessage, getFirebaseAuthErrorMessage } from './auth-errors'
import { auth } from './firebase'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailVerified, setEmailVerified] = useState(false)
  const [authEvent, setAuthEvent] = useState<AuthEvent | null>(null)
  const [emailVerificationRetried, setEmailVerificationRetried] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setEmailVerified(nextUser?.emailVerified ?? false)
      if (!nextUser) setEmailVerificationRetried(false)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    setAuthTokenProvider(async () => {
      await auth.authStateReady()
      const currentUser = auth.currentUser
      return currentUser ? currentUser.getIdToken() : null
    })
    return () => setAuthTokenProvider(null)
  }, [])

  useEffect(() => {
    const eventHandlers: [string, AuthEvent][] = [
      [SESSION_EXPIRED_EVENT, 'session-expired'],
      [EMAIL_NOT_VERIFIED_EVENT, 'email-not-verified'],
      [RESTAURANT_REQUIRED_EVENT, 'restaurant-required'],
    ]
    const listeners = eventHandlers.map(([eventName, eventValue]) => {
      const listener = () => setAuthEvent(eventValue)
      window.addEventListener(eventName, listener)
      return () => window.removeEventListener(eventName, listener)
    })
    return () => listeners.forEach((unsubscribe) => unsubscribe())
  }, [])

  async function signIn(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setEmailVerificationRetried(false)
    } catch (error) {
      throw new Error(getFirebaseAuthErrorMessage(error))
    }
  }

  async function signOut(): Promise<void> {
    await firebaseSignOut(auth)
    queryClient.clear()
    setEmailVerificationRetried(false)
    setAuthEvent(null)
  }

  async function reenviarVerificacion(): Promise<void> {
    if (!user) throw new Error('Inicia sesión de nuevo para reenviar el correo.')
    try {
      await sendEmailVerification(user)
    } catch (error) {
      throw new Error(getFirebaseActionErrorMessage(error, 'No pudimos reenviar el correo. Intenta de nuevo.'))
    }
  }

  async function refrescarSesion(): Promise<void> {
    if (!user) throw new Error('Inicia sesión de nuevo para continuar.')
    try {
      await reload(user)
      await user.getIdToken(true)
      const currentUser = auth.currentUser
      setUser(currentUser)
      setEmailVerified(currentUser?.emailVerified ?? false)
      setEmailVerificationRetried(true)
      setAuthEvent((currentEvent) => (currentEvent === 'email-not-verified' ? null : currentEvent))
      await queryClient.invalidateQueries()
    } catch (error) {
      throw new Error(getFirebaseActionErrorMessage(error, 'No pudimos actualizar tu sesión. Intenta de nuevo.'))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        emailVerified,
        authEvent,
        emailVerificationRetried,
        clearAuthEvent: () => setAuthEvent(null),
        signIn,
        signOut,
        reenviarVerificacion,
        refrescarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}