import { afterEach, describe, expect, it } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import InsightsPage from './InsightsPage'

// VITE_USE_MOCKS=true in tests: the scenarios of api.mock.ts, chosen by URL as in dev. The page is mounted alone (the route
// and the dock come in phase 3).

function renderInsights(search = '') {
  window.history.replaceState({}, '', `/informe${search}`)
  return renderWithProviders(<InsightsPage />)
}

const section = async (title: string | RegExp) => within((await screen.findByRole('heading', { name: title })).closest('section') as HTMLElement)

afterEach(() => window.history.replaceState({}, '', '/'))

describe('InsightsPage · datos suficientes', () => {
  it('tells the week in order: check-in rate, reliability, day by day and what to do', async () => {
    renderInsights()
    expect(await screen.findByText('67 %')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Informe de la semana' })).toBeInTheDocument()
    expect(screen.getByText(/^Del \d+ al \d+ de \w+ · hoy incluido$/)).toBeInTheDocument()
    expect(screen.getByText('de las reservas resueltas terminó en check-in')).toBeInTheDocument()
    expect(screen.getByText('Subió 9 puntos frente a la semana anterior')).toBeInTheDocument()
    const headings = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)
    expect(headings).toEqual(['Confiabilidad de tu disponibilidad', 'La semana día a día', 'Qué hacer esta semana'])
  })

  it('shows the reliability level with color, shape and word, and its reasons', async () => {
    renderInsights()
    const reliability = await section('Confiabilidad de tu disponibilidad')
    expect(reliability.getAllByText('Media').length).toBeGreaterThan(0)
    expect(reliability.getByText('Tasa de check-in del 67 %')).toBeInTheDocument()
  })

  it('backs the weekly chart with a table for screen readers, one row per day', async () => {
    renderInsights()
    const week = await section('La semana día a día')
    const table = week.getByRole('table', { name: /Reservas de cada día/ })
    expect(within(table).getAllByRole('row')).toHaveLength(8)
    expect(within(table).getByText(/^Hoy, /)).toBeInTheDocument()
    expect(week.getByText(/Tu franja con más reservas: viernes a las 1:00 p\. m\./)).toBeInTheDocument()
  })

  it('marks the text written by the model as «Generado con IA · hace X min» and shows it as it came', async () => {
    renderInsights()
    const recommendations = await section('Qué hacer esta semana')
    expect(recommendations.getByText(/^Generado con IA · hace \d+ min$/)).toBeInTheDocument()
    expect(recommendations.getByText(/sigue validando el código apenas llega cada comensal/)).toBeInTheDocument()
    expect(recommendations.queryByRole('list')).not.toBeInTheDocument()
    expect(recommendations.getByText(/Lo redactó la IA solo con tus números/)).toBeInTheDocument()
  })

  it('lists the recommendations when the backend sends them separated', async () => {
    renderInsights('?mockInsights=withList')
    const recommendations = await section('Qué hacer esta semana')
    expect(recommendations.getAllByRole('listitem')).toHaveLength(3)
  })
})

describe('InsightsPage · respaldo y pocos datos', () => {
  it.each(['template', 'disabled'])('with templates (%s) says the recommendations are basic, without the IA mark', async (scenario) => {
    renderInsights(`?mockInsights=${scenario}`)
    const recommendations = await section('Qué hacer esta semana')
    expect(recommendations.getByText('Recomendaciones básicas: el asistente de IA no estuvo disponible')).toBeInTheDocument()
    expect(recommendations.getByText(/^Generado automáticamente · hace \d+ min$/)).toBeInTheDocument()
    expect(recommendations.queryByText(/Generado con IA/)).not.toBeInTheDocument()
  })

  it('with insufficient data shows what is missing, no rates, no level and no recommendations', async () => {
    renderInsights('?mockInsights=insufficient')
    expect(await screen.findByRole('heading', { name: 'Aún no hay suficientes reservas para tu informe' })).toBeInTheDocument()
    expect(screen.getByText(/Te faltan 4 reservas resueltas/)).toBeInTheDocument()
    expect(screen.getByText('Llevas 6 de 10 reservas resueltas')).toBeInTheDocument()
    expect(screen.queryByText(/ %$/)).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Confiabilidad de tu disponibilidad' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Qué hacer esta semana' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'La semana día a día' })).toBeInTheDocument()
  })

  it('without reservations in two weeks shows the empty state', async () => {
    renderInsights('?mockInsights=empty')
    expect(await screen.findByRole('heading', { name: 'Aún no tienes reservas en los últimos 7 días' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'La semana día a día' })).not.toBeInTheDocument()
  })
})

describe('InsightsPage · errores y actualizar', () => {
  it('a load error offers «Intentar de nuevo» and recovers', async () => {
    const { user } = renderInsights('?mockError=insights-load')
    expect(await screen.findByRole('heading', { name: 'No pudimos cargar tu informe' })).toBeInTheDocument()
    window.history.replaceState({}, '', '/informe')
    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
    expect(await screen.findByText('67 %')).toBeInTheDocument()
  })

  it('a 429 on the first load shows the text of the limit and does not retry on its own', async () => {
    renderInsights('?mockRateLimit=all')
    expect(await screen.findByText('Hiciste muchas solicitudes seguidas. Espera un momento e intenta de nuevo.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Actualizar informe' })).not.toBeInTheDocument()
  })

  it('«Actualizar informe» brings a new report («hace un momento»)', async () => {
    const { user } = renderInsights()
    await section('Qué hacer esta semana')
    await user.click(screen.getByRole('button', { name: 'Actualizar informe' }))
    expect(await screen.findByText('Generado con IA · hace un momento')).toBeInTheDocument()
  })

  it('a 429 on «Actualizar informe» keeps the report on screen and says why', async () => {
    const { user } = renderInsights('?mockRateLimit')
    await section('Qué hacer esta semana')
    await user.click(screen.getByRole('button', { name: 'Actualizar informe' }))
    expect(await screen.findByText(/Sigues viendo el informe anterior/)).toBeInTheDocument()
    expect(screen.getByText('67 %')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Actualizar informe' })).not.toHaveAttribute('aria-busy'))
  })
})
