import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { renderWithProviders } from '@/test/render'
import LoginPage from './LoginPage'

const mocks = vi.hoisted(() => ({ signIn: vi.fn(), signInWithGoogle: vi.fn(), sendPasswordReset: vi.fn() }))

vi.mock('./auth-context', () => ({
  useAuth: () => mocks,
}))

function renderLoginPage() {
  return renderWithProviders(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

const signInForm = () => within(screen.getByRole('form', { name: 'Inicia sesión' }))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the login form with the kit password visibility control', () => {
    renderLoginPage()

    expect(screen.getByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
    expect(signInForm().getByLabelText('Correo')).toHaveAttribute('type', 'email')
    expect(signInForm().getByLabelText('Contraseña')).toHaveAttribute('type', 'password')
    expect(signInForm().getByRole('button', { name: 'Mostrar contraseña' })).toBeInTheDocument()
    expect(signInForm().getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continuar con Google' })).toBeInTheDocument()
    expect(screen.queryByText(/crear cuenta|regístrate/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
  })

  it('validates email format and requires a password without calling signIn', async () => {
    const { user } = renderLoginPage()
    await user.type(signInForm().getByLabelText('Correo'), 'correo-invalido')
    await user.click(signInForm().getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByText('Escribe un correo válido para iniciar sesión.')).toBeInTheDocument()
    expect(screen.getByText('Escribe tu contraseña para iniciar sesión.')).toBeInTheDocument()
    expect(mocks.signIn).not.toHaveBeenCalled()
  })

  it('shows the generic credentials error returned by auth-errors', async () => {
    mocks.signIn.mockRejectedValue(new Error('Correo o contraseña incorrectos. Revisa e intenta de nuevo.'))
    const { user } = renderLoginPage()
    await user.type(signInForm().getByLabelText('Correo'), 'admin@restaurante.co')
    await user.type(signInForm().getByLabelText('Contraseña'), 'incorrecta')
    await user.click(signInForm().getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Correo o contraseña incorrectos. Revisa e intenta de nuevo.',
    )
    expect(mocks.signIn).toHaveBeenCalledWith('admin@restaurante.co', 'incorrecta')
  })

  it('disables fields and shows button loading while signIn is pending', async () => {
    let resolveSignIn!: () => void
    mocks.signIn.mockReturnValue(new Promise<void>((resolve) => {
      resolveSignIn = resolve
    }))
    const { user } = renderLoginPage()
    await user.type(signInForm().getByLabelText('Correo'), 'admin@restaurante.co')
    await user.type(signInForm().getByLabelText('Contraseña'), 'correcta')
    await user.click(signInForm().getByRole('button', { name: 'Iniciar sesión' }))

    expect(await signInForm().findByRole('button', { name: 'Iniciando sesión…' })).toHaveAttribute('aria-busy', 'true')
    expect(signInForm().getByLabelText('Correo')).toBeDisabled()
    expect(signInForm().getByLabelText('Contraseña')).toBeDisabled()
    expect(signInForm().getByRole('button', { name: 'Continuar con Google' })).toBeDisabled()

    await act(async () => resolveSignIn())
    await waitFor(() => expect(signInForm().getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled())
  })

  it('signs in with Google when the popup succeeds', async () => {
    mocks.signInWithGoogle.mockResolvedValue(true)
    const { user } = renderLoginPage()
    await user.click(screen.getByRole('button', { name: 'Continuar con Google' }))

    expect(mocks.signInWithGoogle).toHaveBeenCalledOnce()
  })

  it('does not show an error when the Google popup is closed', async () => {
    mocks.signInWithGoogle.mockResolvedValue(false)
    const { user } = renderLoginPage()
    await user.click(screen.getByRole('button', { name: 'Continuar con Google' }))

    expect(mocks.signInWithGoogle).toHaveBeenCalledOnce()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows the Google sign-in message returned by auth', async () => {
    mocks.signInWithGoogle.mockRejectedValue(new Error('No pudimos abrir la ventana de Google. Permite las ventanas emergentes e intenta de nuevo.'))
    const { user } = renderLoginPage()
    await user.click(screen.getByRole('button', { name: 'Continuar con Google' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos abrir la ventana de Google.')
  })

  it('disables email controls while Google sign-in is pending', async () => {
    let resolveGoogleSignIn!: (signedIn: boolean) => void
    mocks.signInWithGoogle.mockReturnValue(new Promise<boolean>((resolve) => {
      resolveGoogleSignIn = resolve
    }))
    const { user } = renderLoginPage()
    await user.click(screen.getByRole('button', { name: 'Continuar con Google' }))

    expect(await screen.findByRole('button', { name: 'Conectando con Google…' })).toHaveAttribute('aria-busy', 'true')
    expect(signInForm().getByLabelText('Correo')).toBeDisabled()
    expect(signInForm().getByLabelText('Contraseña')).toBeDisabled()
    expect(signInForm().getByRole('button', { name: 'Iniciar sesión' })).toBeDisabled()

    await act(async () => resolveGoogleSignIn(false))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continuar con Google' })).toBeEnabled())
  })

  it('asks for the email before sending the password reset, then confirms without revealing the account', async () => {
    mocks.sendPasswordReset.mockResolvedValue(undefined)
    const { user } = renderLoginPage()
    await user.click(signInForm().getByRole('button', { name: '¿Olvidaste tu contraseña?' }))

    expect(signInForm().getByText('Escribe un correo válido para cambiar tu contraseña.')).toBeInTheDocument()
    expect(mocks.sendPasswordReset).not.toHaveBeenCalled()

    await user.type(signInForm().getByLabelText('Correo'), 'admin@restaurante.co')
    await user.click(signInForm().getByRole('button', { name: '¿Olvidaste tu contraseña?' }))

    expect(mocks.sendPasswordReset).toHaveBeenCalledWith('admin@restaurante.co')
    expect(await signInForm().findByText(/Si hay una cuenta con ese correo/)).toBeInTheDocument()
  })
})
