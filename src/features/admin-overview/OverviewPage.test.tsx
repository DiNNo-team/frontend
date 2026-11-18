import { afterEach, describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { bogotaMonthOf, monthName, shiftMonth } from '../admin/month'
import { renderWithProviders } from '@/test/render'
import OverviewPage from './OverviewPage'

// VITE_USE_MOCKS=true in tests: the sample numbers answer (16 restaurants, six months). Controls by URL as in dev.

function renderOverview(path = '/admin', browserSearch = '') {
  window.history.replaceState({}, '', `/${browserSearch}`)
  const router = createMemoryRouter(
    [
      { path: '/admin', element: <OverviewPage /> },
      { path: '/admin/solicitudes', element: <p>Pantalla de solicitudes</p> },
    ],
    { initialEntries: [path] },
  )
  return { router, ...renderWithProviders(<RouterProvider router={router} />) }
}

afterEach(() => window.history.replaceState({}, '', '/'))

describe('OverviewPage', () => {
  it('shows the income of the current month, the six months, and the note of what the dates mean', async () => {
    renderOverview()
    const current = bogotaMonthOf()
    expect(await screen.findByRole('heading', { name: `Ingresos de ${monthName(current)}` })).toBeInTheDocument()
    const group = await screen.findByRole('group', { name: 'Meses' })
    const buttons = await waitFor(() => {
      const found = group.querySelectorAll('button')
      expect(found).toHaveLength(6)
      return found
    })
    expect(buttons[5]).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Según la fecha en que se hizo la reserva')).toBeInTheDocument()
  })

  it('changes the whole page when a month is picked, and keeps it in the URL', async () => {
    const { router, user } = renderOverview()
    const group = await screen.findByRole('group', { name: 'Meses' })
    const previous = shiftMonth(bogotaMonthOf(), -1)
    await user.click(await screen.findByRole('button', { name: new RegExp(`^${monthName(previous)}:`) }))
    expect(router.state.location.search).toBe(`?mes=${previous}`)
    expect(await screen.findByRole('heading', { name: `Ingresos de ${monthName(previous)}` })).toBeInTheDocument()
    expect(group.querySelector('[aria-pressed="true"]')).toHaveAccessibleName(new RegExp(`^${monthName(previous)}:`))
  })

  it('gives each chart its text for a screen reader, and reads «Sin datos» for a missing rate', async () => {
    renderOverview()
    expect(await screen.findByRole('table', { name: 'Resultado de las reservas' })).toBeInTheDocument()
    expect(await screen.findByRole('table', { name: 'Días de la semana' })).toBeInTheDocument()
  })

  it('shows an empty state in each block when there is nothing yet, and never an error', async () => {
    renderOverview('/admin', '?mockEmpty')
    expect(await screen.findAllByText('Aún no hay reservas este mes')).not.toHaveLength(0)
    expect(await screen.findByText('Aún no hay check-ins este mes')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('lets the other blocks work when one fails, and offers «Intentar de nuevo» on the one that failed', async () => {
    renderOverview('/admin', '?mockError=admin-metrics')
    expect((await screen.findAllByRole('button', { name: 'Intentar de nuevo' })).length).toBeGreaterThan(0)
    expect(await screen.findByRole('heading', { name: /^Ingresos de/ })).toBeInTheDocument()
  })

  it('sends the old address of the requests (/admin?estado=…) to its new place', async () => {
    const { router } = renderOverview('/admin?estado=aprobadas&solicitud=abc')
    await waitFor(() => expect(router.state.location.pathname).toBe('/admin/solicitudes'))
    expect(router.state.location.search).toBe('?estado=aprobadas&solicitud=abc')
  })
})
