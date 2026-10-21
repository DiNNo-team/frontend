import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
import type { User } from 'firebase/auth'
import { fireEvent } from '@testing-library/react'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './auth-context'
import {
  ACCOUNT_NOT_ENABLED_EVENT,
  DINER_ACCOUNT_EVENT,
  EMAIL_NOT_VERIFIED_EVENT,
  RESTAURANT_REQUIRED_EVENT,
  SESSION_EXPIRED_EVENT,
} from '@/lib/api-client'
import { renderWithProviders } from '@/test/render'

const OWNER = { uid: 'owner', email: 'admin@casa72.co', emailVerified: false } as User
const OTHER_OWNER = { uid: 'other-owner', email: 'otro@casa72.co', emailVerified: true } as User

const mocks = vi.hoisted(() => ({
  auth: { authStateReady: vi.fn(async () => undefined), currentUser: null },
  authListener: null as ((user: User | null) => void) | null,
  onAuthStateChanged: vi.fn(),
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
  const { user, loading, emailVerified, authEvent, accountEvent, clearAuthEvent, clearAccountEvent, signOut } = useAuth()
  return (
    <>
      <output data-testid="auth-state">{JSON.stringify({ email: user?.email ?? null, loading, emailVerified, authEvent, accountEvent })}</output>
      <button type="button" onClick={clearAuthEvent}>Limpiar evento</button>
      <button type="button" onClick={clearAccountEvent}>Limpiar cuenta</button>
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
    mocks.onAuthStateChanged.mockImplementation((_auth: unknown, listener: (user: User | null) => void) => {
      mocks.authListener = listener
      listener(OWNER)
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
    fireEvent(window, new Event(ACCOUNT_NOT_ENABLED_EVENT))
    expect(state).toHaveTextContent('"authEvent":"email-not-verified"')
    fireEvent(window, new Event(RESTAURANT_REQUIRED_EVENT))
    expect(state).toHaveTextContent('"authEvent":"email-not-verified"')
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar evento' }))
    expect(state).toHaveTextContent('"authEvent":null')
  })

  it('exposes and clears the active account event without stacking repeats', async () => {
    renderAuthProvider()
    const state = screen.getByTestId('auth-state')
    await waitFor(() => expect(state).toHaveTextContent('"loading":false'))

    fireEvent(window, new Event(ACCOUNT_NOT_ENABLED_EVENT))
    fireEvent(window, new Event(ACCOUNT_NOT_ENABLED_EVENT))
    expect(state).toHaveTextContent('"authEvent":"account-not-enabled"')
    expect(state).toHaveTextContent('"accountEvent":"account-not-enabled"')
    fireEvent(window, new Event(DINER_ACCOUNT_EVENT))
    expect(state).toHaveTextContent('"accountEvent":"diner-account"')
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar cuenta' }))
    expect(state).toHaveTextContent('"authEvent":null')
    expect(state).toHaveTextContent('"accountEvent":null')
  })

  it('applies the account precedence between API events', async () => {
    renderAuthProvider()
    const state = screen.getByTestId('auth-state')
    await waitFor(() => expect(state).toHaveTextContent('"loading":false'))

    fireEvent(window, new Event(RESTAURANT_REQUIRED_EVENT))
    expect(state).toHaveTextContent('"authEvent":"restaurant-required"')

    fireEvent(window, new Event(DINER_ACCOUNT_EVENT))
    expect(state).toHaveTextContent('"accountEvent":"diner-account"')
    fireEvent(window, new Event(RESTAURANT_REQUIRED_EVENT))
    expect(state).toHaveTextContent('"authEvent":"diner-account"')

    fireEvent(window, new Event(EMAIL_NOT_VERIFIED_EVENT))
    expect(state).toHaveTextContent('"authEvent":"email-not-verified"')
    expect(state).toHaveTextContent('"accountEvent":null')
    fireEvent(window, new Event(DINER_ACCOUNT_EVENT))
    expect(state).toHaveTextContent('"authEvent":"email-not-verified"')

    fireEvent(window, new Event(SESSION_EXPIRED_EVENT))
    expect(state).toHaveTextContent('"authEvent":"session-expired"')
  })

  it('clears the query cache after Firebase signs out', async () => {
    const { queryClient } = renderAuthProvider()
    const clear = vi.spyOn(queryClient, 'clear')

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    await waitFor(() => expect(mocks.signOut).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(clear).toHaveBeenCalledTimes(1))
  })

  it('clears every auth event inside signOut, without the account screen button', async () => {
    renderAuthProvider()
    const state = screen.getByTestId('auth-state')
    await waitFor(() => expect(state).toHaveTextContent('"loading":false'))

    fireEvent(window, new Event(ACCOUNT_NOT_ENABLED_EVENT))
    expect(state).toHaveTextContent('"accountEvent":"account-not-enabled"')
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    await waitFor(() => expect(state).toHaveTextContent('"authEvent":null'))
    expect(state).toHaveTextContent('"accountEvent":null')
  })

  it('ignores events from requests of a closed session that land after signOut', async () => {
    renderAuthProvider()
    const state = screen.getByTestId('auth-state')
    await waitFor(() => expect(state).toHaveTextContent('"loading":false'))

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    await waitFor(() => expect(mocks.signOut).toHaveBeenCalledTimes(1))
    fireEvent(window, new Event(DINER_ACCOUNT_EVENT))
    fireEvent(window, new Event(SESSION_EXPIRED_EVENT))
    act(() => mocks.authListener?.(OTHER_OWNER))

    expect(state).toHaveTextContent('"email":"otro@casa72.co"')
    expect(state).toHaveTextContent('"authEvent":null')
  })

  it.each([
    ['another account', OTHER_OWNER],
    ['no account', null],
  ])('drops the previous events when the authenticated user changes to %s', async (_label, nextUser) => {
    renderAuthProvider()
    const state = screen.getByTestId('auth-state')
    await waitFor(() => expect(state).toHaveTextContent('"loading":false'))

    fireEvent(window, new Event(DINER_ACCOUNT_EVENT))
    expect(state).toHaveTextContent('"accountEvent":"diner-account"')
    act(() => mocks.authListener?.(nextUser))

    expect(state).toHaveTextContent('"authEvent":null')
    expect(state).toHaveTextContent('"accountEvent":null')
  })

  it('keeps the events of the same user when Firebase refreshes it', async () => {
    renderAuthProvider()
    const state = screen.getByTestId('auth-state')
    await waitFor(() => expect(state).toHaveTextContent('"loading":false'))

    fireEvent(window, new Event(DINER_ACCOUNT_EVENT))
    act(() => mocks.authListener?.(OWNER))

    expect(state).toHaveTextContent('"accountEvent":"diner-account"')
  })
})
