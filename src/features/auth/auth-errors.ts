const INVALID_CREDENTIALS_MESSAGE = 'Correo o contraseña incorrectos. Revisa e intenta de nuevo.'

function getErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) return undefined
  return typeof error.code === 'string' ? error.code : undefined
}

export function getFirebaseActionErrorMessage(error: unknown, fallback: string): string {
  switch (getErrorCode(error)) {
    case 'auth/too-many-requests':
      return 'Hay demasiados intentos. Espera un momento e inténtalo de nuevo.'
    case 'auth/network-request-failed':
      return 'No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.'
    default:
      return fallback
  }
}

export function getFirebaseAuthErrorMessage(error: unknown): string {
  switch (getErrorCode(error)) {
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return INVALID_CREDENTIALS_MESSAGE
    case 'auth/too-many-requests':
      return 'Hay demasiados intentos. Espera un momento e inténtalo de nuevo.'
    case 'auth/network-request-failed':
      return 'No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.'
    default:
      return 'No pudimos iniciar sesión. Revisa tu correo y contraseña e intenta de nuevo.'
  }
}