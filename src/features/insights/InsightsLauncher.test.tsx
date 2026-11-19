import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { restaurantApi } from '@/features/restaurant/api'
import { mockRestaurantApi } from '@/features/restaurant/api.mock'
import { renderWithProviders } from '@/test/render'
import { mockInsightsApi } from './api.mock'
import { InsightsLauncher } from './InsightsLauncher'

// VITE_USE_MOCKS=true in tests. The mock scenario is read from the browser URL (?mockInsights=…), as in dev; the open state
// (?informe=1) from the router's URL. The launcher lives in the header of Resumen.

function renderLauncher({ path = '/resumen?periodo=anterior', mock = '' } = {}) {
  window.history.replaceState({}, '', `/resumen${mock}`)
  const router = createMemoryRouter([{ path: '/resumen', element: <InsightsLauncher /> }], { initialEntries: [path] })
  return { router, ...renderWithProviders(<RouterProvider router={router} />) }
}

const openButton = () => screen.findByRole('button', { name: 'Ver informe de la semana' })
const dialog = () => screen.findByRole('dialog', { name: 'Informe de la semana' })
const section = async (title: string | RegExp) => within((await screen.findByRole('heading', { name: title })).closest('section') as HTMLElement)

afterEach(() => {
  vi.restoreAllMocks()
  window.history.replaceState({}, '', '/')
})

describe('InsightsLauncher · abrir y cerrar', () => {
  it('asks for the report only when the dialog opens, not for entering Resumen', async () => {
    const getInsights = vi.spyOn(mockInsightsApi, 'getInsights')
    const { user } = renderLauncher()
    await user.click(await openButton())
    expect(await screen.findByText('67 %')).toBeInTheDocument()
    expect(getInsights).toHaveBeenCalledTimes(1)
    expect(getInsights).toHaveBeenCalledWith({ refresh: false })
  })

  it('does not call the API while the dialog is closed', async () => {
    const getInsights = vi.spyOn(mockInsightsApi, 'getInsights')
    renderLauncher()
    await openButton()
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(getInsights).not.toHaveBeenCalled()
  })

  it('keeps the open state in the URL, with the other params of Resumen, and closes with «Cerrar informe»', async () => {
    const { router, user } = renderLauncher()
    const button = await openButton()
    await user.click(button)
    await dialog()
    expect(new URLSearchParams(router.state.location.search).get('informe')).toBe('1')
    expect(new URLSearchParams(router.state.location.search).get('periodo')).toBe('anterior')

    await user.click(screen.getByRole('button', { name: 'Cerrar informe' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(router.state.location.search).toBe('?periodo=anterior')
    await waitFor(() => expect(button).toHaveFocus())
  })

  it('closes with Esc and returns the focus to the button', async () => {
    const { user } = renderLauncher()
    const button = await openButton()
    await user.click(button)
    await dialog()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(button).toHaveFocus())
  })

  it('closes with a click outside the panel', async () => {
    const { user } = renderLauncher()
    await user.click(await openButton())
    const panel = await dialog()
    await new Promise((resolve) => setTimeout(resolve, 0))
    await user.click(panel.parentElement as HTMLElement)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('opens from the URL (/resumen?informe=1)', async () => {
    renderLauncher({ path: '/resumen?informe=1' })
    const panel = await dialog()
    // Until the report arrives the line under the title is the general one; then it is the period.
    await waitFor(() => expect(panel).toHaveAccessibleDescription(/^Del \d+ al \d+ de \w+ · hoy incluido$/))
  })

  it('a suspended restaurant sees neither the button nor the dialog, even with ?informe=1', async () => {
    const restaurant = await mockRestaurantApi.get()
    const get = vi.spyOn(restaurantApi, 'get').mockResolvedValue({ ...restaurant, approvalStatus: 'suspended' })
    const getInsights = vi.spyOn(mockInsightsApi, 'getInsights')
    renderLauncher({ path: '/resumen?informe=1' })
    await waitFor(() => expect(get).toHaveBeenCalled())
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(screen.queryByRole('button', { name: 'Ver informe de la semana' })).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(getInsights).not.toHaveBeenCalled()
  })
})

describe('InsightsLauncher · contenido del informe', () => {
  it('shows only the headline with its figures, the reliability and the recommendations (no day-by-day chart)', async () => {
    renderLauncher({ path: '/resumen?informe=1' })
    const panel = within(await dialog())
    expect(await panel.findByText('67 %')).toBeInTheDocument()
    expect(panel.getByText('de las reservas resueltas terminó en check-in')).toBeInTheDocument()
    expect(panel.getByText('Subió 9 puntos frente a la semana anterior')).toBeInTheDocument()
    for (const figure of ['23 %', '10 %', '42', '2,83']) expect(panel.getByText(figure)).toBeInTheDocument()
    const headings = panel.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)
    expect(headings).toEqual(['Confiabilidad de tu disponibilidad', 'Qué hacer esta semana'])
    expect(panel.queryByText('La semana día a día')).not.toBeInTheDocument()
  })

  it('marks the text of the model as «Generado con IA · hace X min»', async () => {
    renderLauncher({ path: '/resumen?informe=1' })
    const recommendations = await section('Qué hacer esta semana')
    expect(recommendations.getByText(/^Generado con IA · hace \d+ min$/)).toBeInTheDocument()
    expect(recommendations.getByText(/Lo redactó la IA solo con tus números/)).toBeInTheDocument()
  })

  it.each(['template', 'disabled'])('with templates (%s) says the recommendations are basic, without the IA mark', async (scenario) => {
    renderLauncher({ path: '/resumen?informe=1', mock: `?mockInsights=${scenario}` })
    const recommendations = await section('Qué hacer esta semana')
    expect(recommendations.getByText('Recomendaciones básicas: el asistente de IA no estuvo disponible')).toBeInTheDocument()
    expect(recommendations.getByText(/^Generado automáticamente · hace \d+ min$/)).toBeInTheDocument()
    expect(recommendations.queryByText(/Generado con IA/)).not.toBeInTheDocument()
  })

  it('lists the recommendations when they come separated, and shows a 600-character text whole', async () => {
    renderLauncher({ path: '/resumen?informe=1', mock: '?mockInsights=withList' })
    expect((await section('Qué hacer esta semana')).getAllByRole('listitem')).toHaveLength(3)
  })

  it('shows a text of 600 characters whole, in one paragraph that wraps', async () => {
    renderLauncher({ path: '/resumen?informe=1', mock: '?mockInsights=long600' })
    const paragraph = (await section('Qué hacer esta semana')).getByText(/^El 67 % de tus reservas resueltas/)
    expect(paragraph.textContent).toHaveLength(600)
    expect(paragraph).toHaveClass('break-words')
  })

  it('with insufficient data shows what is missing, without rates, level or recommendations', async () => {
    renderLauncher({ path: '/resumen?informe=1', mock: '?mockInsights=insufficient' })
    const panel = within(await dialog())
    expect(await panel.findByRole('heading', { name: 'Aún no hay suficientes reservas para tu informe' })).toBeInTheDocument()
    expect(panel.getByText(/Te faltan 4 reservas resueltas/)).toBeInTheDocument()
    expect(panel.queryByText(/ %$/)).not.toBeInTheDocument()
    expect(panel.queryByRole('heading', { name: 'Confiabilidad de tu disponibilidad' })).not.toBeInTheDocument()
    expect(panel.queryByRole('heading', { name: 'Qué hacer esta semana' })).not.toBeInTheDocument()
  })

  it('without reservations in two weeks shows the empty state', async () => {
    renderLauncher({ path: '/resumen?informe=1', mock: '?mockInsights=empty' })
    expect(await screen.findByRole('heading', { name: 'Aún no tienes reservas en los últimos 7 días' })).toBeInTheDocument()
  })
})

describe('InsightsLauncher · errores y actualizar', () => {
  it('a load error offers «Intentar de nuevo» and recovers', async () => {
    const { user } = renderLauncher({ path: '/resumen?informe=1', mock: '?mockError=insights-load' })
    expect(await screen.findByRole('heading', { name: 'No pudimos cargar tu informe' })).toBeInTheDocument()
    window.history.replaceState({}, '', '/resumen')
    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
    expect(await screen.findByText('67 %')).toBeInTheDocument()
  })

  it('a 403 shows the account text and offers no retry', async () => {
    renderLauncher({ path: '/resumen?informe=1', mock: '?mockForbidden=RESTAURANT_SUSPENDED' })
    expect(await screen.findByRole('heading', { name: /Tu restaurante está suspendido/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Intentar de nuevo' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Actualizar informe' })).not.toBeInTheDocument()
  })

  it('a 429 on the first load shows the text of the limit and does not retry on its own', async () => {
    renderLauncher({ path: '/resumen?informe=1', mock: '?mockRateLimit=all' })
    expect(await screen.findByText('Hiciste muchas solicitudes seguidas. Espera un momento e intenta de nuevo.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Actualizar informe' })).not.toBeInTheDocument()
  })

  it('«Actualizar informe» brings a new report («hace un momento»)', async () => {
    const { user } = renderLauncher({ path: '/resumen?informe=1' })
    await section('Qué hacer esta semana')
    await user.click(screen.getByRole('button', { name: 'Actualizar informe' }))
    expect(await screen.findByText('Generado con IA · hace un momento')).toBeInTheDocument()
  })

  it('a 429 on «Actualizar informe» keeps the report on screen and says why', async () => {
    const { user } = renderLauncher({ path: '/resumen?informe=1', mock: '?mockRateLimit' })
    await section('Qué hacer esta semana')
    await user.click(screen.getByRole('button', { name: 'Actualizar informe' }))
    expect(await screen.findByText(/Sigues viendo el informe anterior/)).toBeInTheDocument()
    expect(screen.getByText('67 %')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Actualizar informe' })).not.toHaveAttribute('aria-busy'))
  })
})
