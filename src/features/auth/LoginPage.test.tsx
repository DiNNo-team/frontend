import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { renderWithProviders } from '@/test/render'
import LoginPage from './LoginPage'

const mocks = vi.hoisted(() => ({ signIn: vi.fn() }))

vi.mock('./auth-context', () => ({
  useAuth: () => ({ signIn: mocks.signIn }),
}))

function renderLoginPage() {
  return renderWithProviders(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the login form with the kit password visibility control', () => {
    renderLoginPage()

    expect(screen.getByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
    expect(screen.getByLabelText('Correo')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: 'Mostrar contraseña' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })

  it('validates email format and requires a password without calling signIn', async () => {
    const { user } = renderLoginPage()
    await user.type(screen.getByLabelText('Correo'), 'correo-invalido')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByText('Escribe un correo válido para iniciar sesión.')).toBeInTheDocument()
    expect(screen.getByText('Escribe tu contraseña para iniciar sesión.')).toBeInTheDocument()
    expect(mocks.signIn).not.toHaveBeenCalled()
  })

  it('shows the generic credentials error returned by auth-errors', async () => {
    mocks.signIn.mockRejectedValue(new Error('Correo o contraseña incorrectos. Revisa e intenta de nuevo.'))
    const { user } = renderLoginPage()
    await user.type(screen.getByLabelText('Correo'), 'admin@restaurante.co')
    await user.type(screen.getByLabelText('Contraseña'), 'incorrecta')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

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
    await user.type(screen.getByLabelText('Correo'), 'admin@restaurante.co')
    await user.type(screen.getByLabelText('Contraseña'), 'correcta')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(await screen.findByRole('button', { name: 'Iniciando sesión…' })).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByLabelText('Correo')).toBeDisabled()
    expect(screen.getByLabelText('Contraseña')).toBeDisabled()

    await act(async () => resolveSignIn())
    await waitFor(() => expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled())
  })
})