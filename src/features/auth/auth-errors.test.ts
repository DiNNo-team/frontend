import { describe, expect, it } from 'vitest'
import { getFirebaseAuthErrorMessage } from './auth-errors'

describe('getFirebaseAuthErrorMessage', () => {
  it('uses one generic message for invalid credentials', () => {
    const message = 'Correo o contraseña incorrectos. Revisa e intenta de nuevo.'
    for (const code of ['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password']) {
      expect(getFirebaseAuthErrorMessage({ code })).toBe(message)
    }
  })

  it('explains rate limits and network errors in Spanish', () => {
    expect(getFirebaseAuthErrorMessage({ code: 'auth/too-many-requests' })).toBe(
      'Hay demasiados intentos. Espera un momento e inténtalo de nuevo.',
    )
    expect(getFirebaseAuthErrorMessage({ code: 'auth/network-request-failed' })).toBe(
      'No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.',
    )
  })

  it('does not expose technical details for unknown errors', () => {
    expect(getFirebaseAuthErrorMessage({ code: 'auth/unknown', message: 'private detail' })).toBe(
      'No pudimos iniciar sesión. Revisa tu correo y contraseña e intenta de nuevo.',
    )
  })
})