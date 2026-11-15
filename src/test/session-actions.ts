import { vi } from 'vitest'

// Spies for every action of the session (see auth-fixtures.tsx).

export const sessionActions = {
  signIn: vi.fn(async () => undefined),
  signUp: vi.fn(async (_email: string, _password: string) => undefined),
  signInWithGoogle: vi.fn(async () => true),
  sendPasswordReset: vi.fn(async () => undefined),
  signOut: vi.fn(async () => undefined),
  reenviarVerificacion: vi.fn(async () => undefined),
  refrescarSesion: vi.fn(async () => undefined),
  clearAuthEvent: vi.fn(),
  clearAccountEvent: vi.fn(),
}

export function resetSessionActions() {
  for (const action of Object.values(sessionActions)) action.mockClear()
}

