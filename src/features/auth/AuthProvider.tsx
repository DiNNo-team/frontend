import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import {
  EMAIL_NOT_VERIFIED_EVENT,
  ACCOUNT_NOT_ENABLED_EVENT,
  DINER_ACCOUNT_EVENT,
  RESTAURANT_REQUIRED_EVENT,
  SESSION_EXPIRED_EVENT,
  setAuthTokenProvider,
} from '@/lib/api-client'
import { AuthContext, type AccountEvent, type AuthEvent } from './auth-context'
import {
  getFirebaseActionErrorMessage,
  getFirebaseAuthErrorMessage,
  getFirebaseErrorCode,
  getFirebaseGoogleAuthErrorMessage,
} from './auth-errors'
import { auth } from './firebase'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailVerified, setEmailVerified] = useState(false)
  const [authEvent, setAuthEvent] = useState<AuthEvent | null>(null)
  const [emailVerificationRetried, setEmailVerificationRetried] = useState(false)
  // Uid of the session that API events belong to; null while signed out, so late events of a closed session are ignored.
  const sessionUidRef = useRef<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      const nextUid = nextUser?.uid ?? null
      if (nextUid === null || nextUid !== sessionUidRef.current) setAuthEvent(null)
      sessionUidRef.current = nextUid
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
      [ACCOUNT_NOT_ENABLED_EVENT, 'account-not-enabled'],
      [DINER_ACCOUNT_EVENT, 'diner-account'],
      [RESTAURANT_REQUIRED_EVENT, 'restaurant-required'],
    ]
    const listeners = eventHandlers.map(([eventName, eventValue]) => {
      const listener = () => {
        if (!sessionUidRef.current) return
        setAuthEvent((currentEvent) => {
          if (eventValue === 'email-not-verified' || eventValue === 'session-expired') return eventValue
          if (currentEvent === 'email-not-verified') return currentEvent
          if (eventValue === 'restaurant-required' && (currentEvent === 'account-not-enabled' || currentEvent === 'diner-account')) {
            return currentEvent
          }
          return eventValue
        })
      }
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

  async function signInWithGoogle(): Promise<boolean> {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      setEmailVerificationRetried(false)
      return true
    } catch (error) {
      const code = getFirebaseErrorCode(error)
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return false
      throw new Error(getFirebaseGoogleAuthErrorMessage(error))
    }
  }

  async function sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      // Never reveal whether an account exists for that email.
      if (getFirebaseErrorCode(error) === 'auth/user-not-found') return
      throw new Error(getFirebaseActionErrorMessage(error, 'No pudimos enviar el correo. Intenta de nuevo.'))
    }
  }

  async function signOut(): Promise<void> {
    await firebaseSignOut(auth)
    sessionUidRef.current = null
    queryClient.clear()
    setEmailVerificationRetried(false)
    setAuthEvent(null)
  }

  function clearAccountEvent(): void {
    setAuthEvent((currentEvent) =>
      currentEvent === 'account-not-enabled' || currentEvent === 'diner-account' ? null : currentEvent,
    )
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
        accountEvent: authEvent === 'account-not-enabled' || authEvent === 'diner-account' ? authEvent as AccountEvent : null,
        emailVerificationRetried,
        clearAuthEvent: () => setAuthEvent(null),
        clearAccountEvent,
        signIn,
        signInWithGoogle,
        sendPasswordReset,
        signOut,
        reenviarVerificacion,
        refrescarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}