import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { ApiError } from '@/lib/api-client'
import { renderWithProviders } from '@/test/render'
import { restaurantApi } from './api'
import OnboardingPage from './OnboardingPage'
import type { RestaurantProfile } from './types'

vi.mock('./api', () => ({ restaurantApi: { register: vi.fn() } }))

const register = vi.mocked(restaurantApi.register)

const CREATED: RestaurantProfile = {
  id: 'restaurant-1',
  name: 'Casa 72',
  category: 'colombian',
  address: 'Calle 72 # 10-34, Bogotá',
  schedules: [{ dayOfWeek: 1, isOpen24h: false, opensAt: '12:00', closesAt: '21:00' }],
}

beforeEach(() => {
  register.mockReset()
})

function renderOnboarding() {
  const router = createMemoryRouter(
    [
      { path: '/onboarding', element: <OnboardingPage /> },
      { path: '/mesas', element: <p>Pantalla de mesas</p> },
    ],
    { initialEntries: ['/onboarding'] },
  )
  return { router, ...renderWithProviders(<RouterProvider router={router} />) }
}

type User = ReturnType<typeof renderOnboarding>['user']

async function fillValidForm(user: User) {
  await user.type(screen.getByLabelText('Nombre'), '  Casa 72 ')
  await user.click(screen.getByRole('combobox', { name: 'Categoría' }))
  await user.click(screen.getByRole('option', { name: 'Colombiana' }))
  await user.type(screen.getByLabelText('Dirección'), 'Calle 72 # 10-34, Bogotá')
  await user.click(screen.getByRole('switch', { name: 'Lunes' }))
}

const submitButton = () => screen.getByRole('button', { name: /Guardar y continuar|Guardando…/ })

describe('OnboardingPage · registro del restaurante', () => {
  it('shows the three groups, every day closed and one primary button', () => {
    renderOnboarding()
    expect(screen.getByRole('heading', { level: 1, name: 'Configura tu restaurante' })).toBeInTheDocument()
    for (const group of ['Tu restaurante', 'Ubicación', 'Horarios']) {
      expect(screen.getByRole('heading', { name: group })).toBeInTheDocument()
    }
    expect(screen.getAllByRole('switch').every((day) => day.getAttribute('aria-checked') === 'false')).toBe(true)
    expect(screen.getByRole('button', { name: 'Guardar y continuar' })).toHaveAttribute('type', 'submit')
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()
  })

  it('opening a day brings the suggested 12:00 p. m. – 9:00 p. m.', async () => {
    const { user } = renderOnboarding()
    await user.click(screen.getByRole('switch', { name: 'Lunes' }))
    expect(screen.getByRole('combobox', { name: 'Apertura del lunes' })).toHaveTextContent('12:00 p. m.')
    expect(screen.getByRole('combobox', { name: 'Cierre del lunes' })).toHaveTextContent('9:00 p. m.')
  })

  it('empty form: every error, the review alert, focus on the name and nothing sent', async () => {
    const { user } = renderOnboarding()
    await user.click(submitButton())

    expect(screen.getByText('Revisa los 4 campos marcados.')).toBeInTheDocument()
    const name = screen.getByLabelText('Nombre')
    expect(name).toHaveAccessibleDescription('Escribe el nombre de tu restaurante.')
    expect(name).toHaveFocus()
    expect(screen.getByRole('combobox', { name: 'Categoría' })).toHaveAccessibleDescription(
      'Elige la categoría de tu restaurante de la lista.',
    )
    expect(screen.getByLabelText('Dirección')).toHaveAccessibleDescription('Escribe la dirección de tu restaurante.')
    expect(screen.getByText('Indica al menos un día en que abre tu restaurante.')).toBeInTheDocument()
    expect(register).not.toHaveBeenCalled()
  })

  it('validates the name on blur, not on every key', async () => {
    const { user } = renderOnboarding()
    const name = screen.getByLabelText('Nombre')
    await user.type(name, 'a'.repeat(121))
    expect(screen.queryByText(/muy largo/)).not.toBeInTheDocument()
    await user.tab()
    expect(name).toHaveAccessibleDescription('El nombre del restaurante es muy largo. Usa máximo 120 caracteres.')
  })

  it('only the hours fail: focus on the failing day and the error follows the fix', async () => {
    const { user } = renderOnboarding()
    await fillValidForm(user)
    await user.click(screen.getByRole('combobox', { name: 'Cierre del lunes' }))
    await user.click(screen.getByRole('option', { name: '12:00 p. m.' }))
    await user.click(submitButton())

    const sameHours = 'El lunes: la hora de cierre debe ser distinta de la de apertura. Si abres todo el día, marca Abierto 24 horas.'
    const opening = screen.getByRole('combobox', { name: 'Apertura del lunes' })
    expect(opening).toHaveAccessibleDescription(sameHours)
    expect(opening).toHaveFocus()
    expect(screen.queryByText(/Revisa los/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('combobox', { name: 'Cierre del lunes' }))
    await user.click(screen.getByRole('option', { name: '1:00 a. m.' }))
    expect(screen.queryByText(sameHours)).not.toBeInTheDocument()
    expect(screen.getByText('(día siguiente)')).toBeInTheDocument()
  })

  it('saves: sends exactly the contract, shows "Guardando…", toasts and goes to the tables', async () => {
    let finish: (profile: RestaurantProfile) => void = () => undefined
    register.mockReturnValue(new Promise((resolve) => (finish = resolve)))
    const { user, router, queryClient } = renderOnboarding()
    await fillValidForm(user)
    await user.click(submitButton())

    expect(register).toHaveBeenCalledWith({
      name: 'Casa 72',
      category: 'colombian',
      address: 'Calle 72 # 10-34, Bogotá',
      schedules: [{ dayOfWeek: 1, isOpen24h: false, opensAt: '12:00', closesAt: '21:00' }],
    })
    expect(submitButton()).toHaveTextContent('Guardando…')
    await user.click(submitButton())
    expect(register).toHaveBeenCalledTimes(1)

    finish(CREATED)
    expect(await screen.findByText('Pantalla de mesas')).toBeInTheDocument()
    expect(screen.getAllByText('Cambios guardados').length).toBeGreaterThan(0)
    expect(router.state.historyAction).toBe('REPLACE')
    // /restaurante (Jacobo) starts with the registered restaurant, without another request.
    expect(queryClient.getQueryData(['restaurant'])).toEqual(CREATED)
  })

  it('409: the user already has a restaurant: info toast and to the tables', async () => {
    register.mockRejectedValue(new ApiError({ status: 409 }))
    const { user } = renderOnboarding()
    await fillValidForm(user)
    await user.click(submitButton())

    expect(await screen.findByText('Pantalla de mesas')).toBeInTheDocument()
    expect(
      screen.getAllByText('Ya registraste tu restaurante. Para cambiar sus datos, entra a Restaurante.').length,
    ).toBeGreaterThan(0)
  })

  it('400 the web rules do not catch: friendly alert, never the backend text, and nothing typed is lost', async () => {
    register.mockRejectedValue(new ApiError({ status: 400, message: 'property foo should not exist' }))
    const { user } = renderOnboarding()
    await fillValidForm(user)
    await user.click(submitButton())

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(
      'No pudimos guardar tu restaurante. Revisa el nombre, la categoría, la dirección y los horarios e intenta de nuevo.',
    )
    expect(screen.queryByText(/property foo/)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Nombre')).toHaveValue('  Casa 72 ')
    expect(screen.getByRole('combobox', { name: 'Categoría' })).toHaveTextContent('Colombiana')
    expect(screen.getByRole('switch', { name: 'Lunes' })).toHaveAttribute('aria-checked', 'true')
  })

  it.each([
    ['403 without errorCode (role)', new ApiError({ status: 403 }), 'No tienes acceso a esta sección.'],
    ['401 (session ended)', new ApiError({ status: 401 }), 'Tu sesión terminó. Inicia sesión de nuevo.'],
    ['401 email not verified', new ApiError({ status: 401, code: 'EMAIL_NOT_VERIFIED' }), 'Verifica tu correo para continuar.'],
    ['network', new ApiError({ status: 0, isNetworkError: true }), 'No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.'],
    ['500', new ApiError({ status: 500 }), 'No pudimos guardar tu restaurante. Intenta de nuevo en un momento.'],
  ])('%s: error alert with the web text and the form stays', async (_case, error, text) => {
    register.mockRejectedValue(error)
    const { user } = renderOnboarding()
    await fillValidForm(user)
    await user.click(submitButton())

    expect(await screen.findByRole('alert')).toHaveTextContent(text)
    expect(screen.getByLabelText('Dirección')).toHaveValue('Calle 72 # 10-34, Bogotá')
    await waitFor(() => expect(submitButton()).toHaveTextContent('Guardar y continuar'))
    expect(screen.queryByText('Pantalla de mesas')).not.toBeInTheDocument()
  })

  it('the review alert only appears with more than two failing fields', async () => {
    const { user } = renderOnboarding()
    await user.type(screen.getByLabelText('Nombre'), 'Casa 72')
    await user.type(screen.getByLabelText('Dirección'), 'Calle 72')
    await user.click(submitButton())
    expect(screen.queryByText(/Revisa los/)).not.toBeInTheDocument()
    const hours = screen.getByRole('heading', { name: 'Horarios' }).closest('section') as HTMLElement
    expect(within(hours).getByText('Indica al menos un día en que abre tu restaurante.')).toBeInTheDocument()
  })
})
