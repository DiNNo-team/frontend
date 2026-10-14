import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { renderWithProviders } from '@/test/render'
import LoginPage from './LoginPage'

const mocks = vi.hoisted(() => ({ signIn: vi.fn(), signUp: vi.fn(), sendPasswordReset: vi.fn() }))

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

// jsdom ignores `inert`, so queries are scoped to the panel of each view.
const signInPanel = () => within(screen.getByRole('tabpanel', { name: 'Iniciar sesión' }))
const signUpPanel = () => within(screen.getByRole('tabpanel', { name: 'Crear cuenta' }))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the login form with the kit password visibility control', () => {
    renderLoginPage()

    expect(screen.getByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Iniciar sesión' })).toHaveAttribute('aria-selected', 'true')
    expect(signInPanel().getByLabelText('Correo')).toHaveAttribute('type', 'email')
    expect(signInPanel().getByLabelText('Contraseña')).toHaveAttribute('type', 'password')
    expect(signInPanel().getByRole('button', { name: 'Mostrar contraseña' })).toBeInTheDocument()
    expect(signInPanel().getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(screen.getByRole('tabpanel', { name: 'Crear cuenta' })).toHaveAttribute('inert')
  })

  it('validates email format and requires a password without calling signIn', async () => {
    const { user } = renderLoginPage()
    await user.type(signInPanel().getByLabelText('Correo'), 'correo-invalido')
    await user.click(signInPanel().getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByText('Escribe un correo válido para iniciar sesión.')).toBeInTheDocument()
    expect(screen.getByText('Escribe tu contraseña para iniciar sesión.')).toBeInTheDocument()
    expect(mocks.signIn).not.toHaveBeenCalled()
  })

  it('shows the generic credentials error returned by auth-errors', async () => {
    mocks.signIn.mockRejectedValue(new Error('Correo o contraseña incorrectos. Revisa e intenta de nuevo.'))
    const { user } = renderLoginPage()
    await user.type(signInPanel().getByLabelText('Correo'), 'admin@restaurante.co')
    await user.type(signInPanel().getByLabelText('Contraseña'), 'incorrecta')
    await user.click(signInPanel().getByRole('button', { name: 'Iniciar sesión' }))

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
    await user.type(signInPanel().getByLabelText('Correo'), 'admin@restaurante.co')
    await user.type(signInPanel().getByLabelText('Contraseña'), 'correcta')
    await user.click(signInPanel().getByRole('button', { name: 'Iniciar sesión' }))

    expect(await signInPanel().findByRole('button', { name: 'Iniciando sesión…' })).toHaveAttribute('aria-busy', 'true')
    expect(signInPanel().getByLabelText('Correo')).toBeDisabled()
    expect(signInPanel().getByLabelText('Contraseña')).toBeDisabled()

    await act(async () => resolveSignIn())
    await waitFor(() => expect(signInPanel().getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled())
  })

  it('switches to sign up from the tab and back with the arrow keys', async () => {
    const { user } = renderLoginPage()
    await user.click(screen.getByRole('tab', { name: 'Crear cuenta' }))

    expect(screen.getByRole('tab', { name: 'Crear cuenta' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel', { name: 'Crear cuenta' })).not.toHaveAttribute('inert')
    expect(screen.getByRole('tabpanel', { name: 'Iniciar sesión' })).toHaveAttribute('inert')

    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('tab', { name: 'Iniciar sesión' })).toHaveFocus()
    expect(screen.getByRole('tab', { name: 'Iniciar sesión' })).toHaveAttribute('aria-selected', 'true')
  })

  it('moves focus to the sign-up email when switching from the inline link', async () => {
    const { user } = renderLoginPage()
    await user.click(signInPanel().getByRole('button', { name: 'Crear cuenta' }))

    expect(signUpPanel().getByLabelText('Correo')).toHaveFocus()
  })

  it('validates the sign-up fields and creates the account', async () => {
    mocks.signUp.mockResolvedValue(undefined)
    const { user } = renderLoginPage()
    await user.click(screen.getByRole('tab', { name: 'Crear cuenta' }))
    await user.type(signUpPanel().getByLabelText('Correo'), 'nuevo@restaurante.co')
    await user.type(signUpPanel().getByLabelText('Contraseña'), 'corta')
    await user.type(signUpPanel().getByLabelText('Confirma la contraseña'), 'otra')
    await user.click(signUpPanel().getByRole('button', { name: 'Crear cuenta' }))

    expect(signUpPanel().getAllByText('Usa al menos 8 caracteres.').length).toBeGreaterThan(0)
    expect(signUpPanel().getByText('Las contraseñas no coinciden. Escríbela igual en los dos campos.')).toBeInTheDocument()
    expect(mocks.signUp).not.toHaveBeenCalled()

    await user.clear(signUpPanel().getByLabelText('Contraseña'))
    await user.type(signUpPanel().getByLabelText('Contraseña'), 'segura123')
    await user.clear(signUpPanel().getByLabelText('Confirma la contraseña'))
    await user.type(signUpPanel().getByLabelText('Confirma la contraseña'), 'segura123')
    await user.click(signUpPanel().getByRole('button', { name: 'Crear cuenta' }))

    expect(mocks.signUp).toHaveBeenCalledWith('nuevo@restaurante.co', 'segura123')
  })

  it('asks for the email before sending the password reset, then confirms without revealing the account', async () => {
    mocks.sendPasswordReset.mockResolvedValue(undefined)
    const { user } = renderLoginPage()
    await user.click(signInPanel().getByRole('button', { name: '¿Olvidaste tu contraseña?' }))

    expect(signInPanel().getByText('Escribe un correo válido para cambiar tu contraseña.')).toBeInTheDocument()
    expect(mocks.sendPasswordReset).not.toHaveBeenCalled()

    await user.type(signInPanel().getByLabelText('Correo'), 'admin@restaurante.co')
    await user.click(signInPanel().getByRole('button', { name: '¿Olvidaste tu contraseña?' }))

    expect(mocks.sendPasswordReset).toHaveBeenCalledWith('admin@restaurante.co')
    expect(await signInPanel().findByText(/Si hay una cuenta con ese correo/)).toBeInTheDocument()
  })
})
