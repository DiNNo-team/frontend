import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './auth-context'
import { EMAIL_NOT_VERIFIED_EVENT, RESTAURANT_REQUIRED_EVENT, SESSION_EXPIRED_EVENT } from '@/lib/api-client'
import { renderWithProviders } from '@/test/render'

const mocks = vi.hoisted(() => ({
  auth: { authStateReady: vi.fn(async () => undefined), currentUser: null },
  onAuthStateChanged: vi.fn((_auth: unknown, listener: (user: null) => void) => {
    listener(null)
    return vi.fn()
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('./firebase', () => ({ auth: mocks.auth }))
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: mocks.onAuthStateChanged,
  signInWithEmailAndPassword: mocks.signIn,
  signOut: mocks.signOut,
}))

function AuthStateProbe() {
  const { user, loading, emailVerified, authEvent, clearAuthEvent, signOut } = useAuth()
  return (
    <>
      <output data-testid="auth-state">{JSON.stringify({ email: user?.email ?? null, loading, emailVerified, authEvent })}</output>
      <button type="button" onClick={clearAuthEvent}>Limpiar evento</button>
      <button type="button" onClick={() => void signOut()}>Cerrar sesión</button>
    </>
  )
}

function renderAuthProvider() {
  return renderWithProviders(
    <AuthProvider>
      <AuthStateProbe />
    </AuthProvider>,
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.onAuthStateChanged.mockImplementation((_auth, listener) => {
      listener(null)
      return vi.fn()
    })
    mocks.signOut.mockResolvedValue(undefined)
  })

  it('exposes initial session state and API auth events without navigating', async () => {
    renderAuthProvider()
    const state = screen.getByTestId('auth-state')
    await waitFor(() => expect(state).toHaveTextContent('"loading":false'))
    expect(state).toHaveTextContent('"emailVerified":false')

    fireEvent(window, new Event(SESSION_EXPIRED_EVENT))
    expect(state).toHaveTextContent('"authEvent":"session-expired"')
    fireEvent(window, new Event(EMAIL_NOT_VERIFIED_EVENT))
    expect(state).toHaveTextContent('"authEvent":"email-not-verified"')
    fireEvent(window, new Event(RESTAURANT_REQUIRED_EVENT))
    expect(state).toHaveTextContent('"authEvent":"restaurant-required"')
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar evento' }))
    expect(state).toHaveTextContent('"authEvent":null')
  })

  it('clears the query cache after Firebase signs out', async () => {
    const { queryClient } = renderAuthProvider()
    const clear = vi.spyOn(queryClient, 'clear')

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    await waitFor(() => expect(mocks.signOut).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(clear).toHaveBeenCalledTimes(1))
  })
})