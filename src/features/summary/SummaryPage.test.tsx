import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { renderWithProviders } from '@/test/render'
import { mockSummaryApi } from './api.mock'
import SummaryPage from './SummaryPage'
import type { RestaurantSummary } from './types'

// VITE_USE_MOCKS=true in tests: fixed reports (12 check-ins at $2.000, 30 reservations created). Controls by URL as in dev.

function renderSummary(path = '/resumen', browserSearch = '') {
  window.history.replaceState({}, '', `/${browserSearch}`)
  const router = createMemoryRouter([{ path: '/resumen', element: <SummaryPage /> }], { initialEntries: [path] })
  return { router, ...renderWithProviders(<RouterProvider router={router} />) }
}

/** The section with that heading, once the report has loaded. */
const section = async (title: string | RegExp) => within(((await screen.findByRole('heading', { name: title })).closest('section')) as HTMLElement)

const cellsOf = (row: HTMLElement) => Array.from(row.children).map((cell) => cell.textContent)

/** A summary of the sample with the given changes, for cases the fixed sample does not cover (null rates…). */
function withSummary(changes: Partial<RestaurantSummary>) {
  const original = mockSummaryApi.getSummary.bind(mockSummaryApi)
  return vi.spyOn(mockSummaryApi, 'getSummary').mockImplementation(async (range) => ({ ...(await original(range)), ...changes }))
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-11-15T17:00:00Z') })
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  window.history.replaceState({}, '', '/')
})

describe('SummaryPage · A cobrar', () => {
  it('puts the total owed first, as one big figure, with the sum behind it in a phrase', async () => {
    renderSummary()
    expect(await screen.findByText('$24.000')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Resumen' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'A cobrar' })).toBeInTheDocument()
    expect(screen.getByText('12 check-ins × tarifa de $2.000')).toBeInTheDocument()
  })

  it('explains, in a help, that each check-in keeps its own fee and that cancellations and expirations are not charged', async () => {
    const { user } = renderSummary()
    await screen.findByText('$24.000')
    const toggle = screen.getByRole('button', { name: 'Cómo se cobra' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Cada check-in guarda la tarifa que había cuando se hizo. Por eso el total de un periodo no cambia si la tarifa cambia después.')
    expect(screen.getByRole('status')).toHaveTextContent('las cancelaciones y los vencimientos no se cobran')
  })

  it('does not claim «N × tarifa» when the fees of the period were not all the same', async () => {
    withSummary({ billing: { checkIns: 10, amountCop: 18_000, currentFeeCop: 2000 } })
    renderSummary()
    expect(await screen.findByText('$18.000')).toBeInTheDocument()
    expect(screen.getByText('10 check-ins, cada uno con la tarifa de su momento')).toBeInTheDocument()
    expect(screen.queryByText(/× tarifa/)).not.toBeInTheDocument()
  })

  it('with no check-ins it shows $0 and says kindly when DiNNo charges', async () => {
    renderSummary('/resumen', '?mockEmpty')
    expect(await screen.findByText('$0')).toBeInTheDocument()
    expect(screen.getByText('Todavía no hay cobros en este periodo')).toBeInTheDocument()
    expect(screen.getByText('Se cobra solo cuando un comensal llega y validas su código. Las cancelaciones y los vencimientos no se cobran.')).toBeInTheDocument()
  })
})

describe('SummaryPage · así van tus reservas', () => {
  it('splits the reservations created in one bar, with its legend and the table that backs it', async () => {
    renderSummary()
    await screen.findByText('$24.000')
    const story = await section('Así van tus reservas')
    expect(story.getByText('30 reservas creadas en el periodo')).toBeInTheDocument()
    const table = story.getByRole('table', { name: 'Reservas del periodo por estado' })
    const rows = within(table).getAllByRole('row').slice(1).map((row) => cellsOf(row))
    expect(rows).toEqual([['Llegaron', '12'], ['Canceladas', '8'], ['Vencidas', '6'], ['Activas', '4']])
    // The drawing itself is decorative: it is hidden from screen readers.
    expect(story.getAllByText('Llegaron').length).toBeGreaterThan(0)
    expect(document.querySelectorAll('svg[aria-hidden="true"]').length).toBeGreaterThan(0)
  })

  it('says each rate in its own sentence, with its own denominator, never mixed', async () => {
    renderSummary()
    await screen.findByText('$24.000')
    const story = await section('Así van tus reservas')
    expect(story.getByText('De cada 10 reservas, 4 llegaron.')).toBeInTheDocument()
    expect(story.getByText('12 de 30 reservas')).toBeInTheDocument()
    expect(story.getByText('De cada 10 reservas, 3 se cancelaron.')).toBeInTheDocument()
    expect(story.getByText('8 de 30 reservas')).toBeInTheDocument()
    expect(story.getByText('De las 18 reservas que llegaron o vencieron, 3 de cada 10 no llegaron.')).toBeInTheDocument()
    expect(story.getByText('6 vencidas de 18 que llegaron o vencieron')).toBeInTheDocument()
    for (const sentence of story.getAllByText(/^De /)) {
      expect(sentence.textContent).not.toMatch(/De cada 10 reservas.*llegaron o vencieron|llegaron o vencieron.*De cada 10 reservas/)
    }
    expect(story.getByText('Cada reserva fue en promedio de 3,2 personas.')).toBeInTheDocument()
  })

  it('defines every rate in a contextual help', async () => {
    const { user } = renderSummary()
    await screen.findByText('$24.000')
    await user.click(screen.getByRole('button', { name: 'Cómo se calculan' }))
    const help = screen.getByText('Cómo se calculan estos porcentajes').closest('[role="status"]') as HTMLElement
    expect(help).toHaveTextContent('Las reservas se cuentan por el día en que se crearon, con el estado que tienen hoy.')
    expect(help).toHaveTextContent('No llegaron: reservas vencidas, de las que ya se resolvieron por llegada o por vencimiento.')
  })

  it('shows «Sin datos» with a dash for a rate whose denominator is 0, never 0 or NaN', async () => {
    withSummary({
      reservations: { created: 5, completed: 0, cancelled: 2, expired: 0, active: 3 },
      rates: { conversion: 0, noShow: null, cancellation: 0.4 },
      averagePartySize: null,
    })
    renderSummary()
    await screen.findByText('5 reservas creadas en el periodo')
    const story = await section('Así van tus reservas')
    expect(story.getAllByText('Sin datos', { exact: false })).toHaveLength(2)
    expect(story.getByText('No llegaron')).toBeInTheDocument()
    expect(story.getByText('Personas por reserva')).toBeInTheDocument()
    expect(story.getByText('De cada 10 reservas, 0 llegaron.')).toBeInTheDocument()
    expect(story.queryByText(/NaN/)).not.toBeInTheDocument()
  })

  it('says there are no reservations when the period has none', async () => {
    renderSummary('/resumen', '?mockEmpty')
    expect(await screen.findByText('No hay reservas creadas en este periodo.')).toBeInTheDocument()
  })
})

describe('SummaryPage · tu ritmo', () => {
  it('lists the three peak hours, highest first, and nothing else (no 24-hour map)', async () => {
    renderSummary()
    await screen.findByText('$24.000')
    const peak = await section('Tus horas pico')
    const items = peak.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('1. 7:00 p. m.9 reservas')
    expect(items[1]).toHaveTextContent('2. 8:00 p. m.7 reservas')
    expect(items[2]).toHaveTextContent('3. 1:00 p. m.5 reservas')
  })

  it('shows the seven days Monday to Sunday and marks the busiest in words, in a table for screen readers', async () => {
    renderSummary()
    await screen.findByText('$24.000')
    const days = await section('Días de más movimiento')
    const table = days.getByRole('table', { name: 'Reservas creadas por día de la semana' })
    const rows = within(table).getAllByRole('row').slice(1).map((row) => cellsOf(row))
    expect(rows).toEqual([
      ['Lunes', '4'], ['Martes', '5'], ['Miércoles', '7'], ['Jueves', '6'], ['Viernes', '13 (Día con más movimiento)'], ['Sábado', '9'], ['Domingo', '3'],
    ])
    expect(days.getByText('Viernes', { selector: 'p' })).toBeInTheDocument()
  })

  it('says so when there is no rhythm yet', async () => {
    renderSummary('/resumen', '?mockEmpty')
    expect(await screen.findByText('Todavía no hay horas pico en este periodo.')).toBeInTheDocument()
    expect(screen.getByText('Todavía no hay reservas en este periodo.')).toBeInTheDocument()
  })
})

describe('SummaryPage · detalle de cobro', () => {
  it('lists the check-ins in Bogotá time, with table, people and fee, and the same total as the figure', async () => {
    renderSummary()
    await screen.findByText('$24.000')
    const detail = await section('Detalle de cobro')
    const table = await detail.findByRole('table', { name: 'Check-ins del periodo' })
    const rows = within(table).getAllByRole('row').slice(1)
    expect(rows).toHaveLength(12)
    expect(within(rows[0]).getByText('15 nov · 11:30 p. m.')).toBeInTheDocument()
    expect(within(rows[0]).getByText('Mesa 01')).toBeInTheDocument()
    expect(within(rows[0]).getByText('2 personas')).toBeInTheDocument()
    expect(within(rows[0]).getByText('$2.000')).toBeInTheDocument()
    expect(detail.getByText('Total del periodo: 12 check-ins · $24.000')).toBeInTheDocument()
    expect(detail.queryByText(/comensal/i)).not.toBeInTheDocument()
  })

  it('with no check-ins it says when they will show up', async () => {
    renderSummary('/resumen', '?mockEmpty')
    expect(await screen.findByText('No hay check-ins en este periodo')).toBeInTheDocument()
    expect(screen.getByText('Cuando valides el código de un comensal, aparecerá aquí.')).toBeInTheDocument()
  })

  it('a failure of the detail does not take the rest down: it says so, with a retry', async () => {
    renderSummary('/resumen', '?mockError=billing-load')
    expect(await screen.findByText('$24.000')).toBeInTheDocument()
    expect(await screen.findByText('No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Intentar de nuevo' })).toBeInTheDocument()
  })
})

describe('SummaryPage · periodo', () => {
  it('opens on this month, written in words, and asks the backend for exactly that range', async () => {
    const getSummary = vi.spyOn(mockSummaryApi, 'getSummary')
    renderSummary()
    expect(await screen.findByText('Del 1 al 15 de noviembre de 2026')).toBeInTheDocument()
    await screen.findByText('$24.000')
    expect(getSummary).toHaveBeenCalledWith({ from: '2026-11-01', to: '2026-11-15' })
  })

  it('«Mes anterior» asks for the whole previous month', async () => {
    const getSummary = vi.spyOn(mockSummaryApi, 'getSummary')
    const { user, router } = renderSummary()
    await screen.findByText('$24.000')
    await user.click(screen.getByRole('radio', { name: 'Mes anterior' }))
    expect(await screen.findByText('Del 1 al 31 de octubre de 2026')).toBeInTheDocument()
    await waitFor(() => expect(getSummary).toHaveBeenCalledWith({ from: '2026-10-01', to: '2026-10-31' }))
    expect(router.state.location.search).toBe('?periodo=anterior')
  })

  it('«Personalizado» shows two dates and asks the period they say', async () => {
    const getSummary = vi.spyOn(mockSummaryApi, 'getSummary')
    const { user } = renderSummary()
    await screen.findByText('$24.000')
    await user.click(screen.getByRole('radio', { name: 'Personalizado' }))
    const from = screen.getByLabelText('Desde')
    const to = screen.getByLabelText('Hasta')
    expect(from).toHaveValue('2026-11-01')
    expect(to).toHaveValue('2026-11-15')
    expect(to).toHaveAttribute('max', '2026-11-15')
    await user.clear(from)
    await user.type(from, '2026-10-20')
    await user.click(screen.getByRole('button', { name: 'Ver periodo' }))
    await waitFor(() => expect(getSummary).toHaveBeenCalledWith({ from: '2026-10-20', to: '2026-11-15' }))
    expect(await screen.findByText('Del 20 de octubre al 15 de noviembre de 2026')).toBeInTheDocument()
  })

  it.each([
    ['2026-11-10', '2026-11-09', 'La fecha final no puede ser anterior a la de inicio.'],
    ['2026-11-01', '2026-11-16', 'La fecha final no puede ser futura. Elige hoy o un día anterior.'],
    ['2025-11-14', '2026-11-15', 'El periodo puede durar máximo 366 días. Acórtalo e intenta de nuevo.'],
  ])('rejects %s to %s without asking the backend: «%s»', async (start, end, message) => {
    const getSummary = vi.spyOn(mockSummaryApi, 'getSummary')
    const { user } = renderSummary()
    await screen.findByText('$24.000')
    await user.click(screen.getByRole('radio', { name: 'Personalizado' }))
    const calls = getSummary.mock.calls.length
    const from = screen.getByLabelText('Desde')
    const to = screen.getByLabelText('Hasta')
    await user.clear(from)
    await user.type(from, start)
    await user.clear(to)
    await user.type(to, end)
    await user.click(screen.getByRole('button', { name: 'Ver periodo' }))
    expect(await screen.findByText(message)).toBeInTheDocument()
    expect(getSummary.mock.calls.length).toBe(calls)
  })

  it('a link with an invalid period says what is wrong instead of asking', async () => {
    const getSummary = vi.spyOn(mockSummaryApi, 'getSummary')
    renderSummary('/resumen?periodo=personalizado&desde=2026-11-10&hasta=2026-11-30')
    expect(await screen.findByText('Revisa las fechas del periodo.')).toBeInTheDocument()
    expect(screen.getByText('La fecha final no puede ser futura. Elige hoy o un día anterior.')).toBeInTheDocument()
    expect(getSummary).not.toHaveBeenCalled()
  })
})

describe('SummaryPage · carga y error', () => {
  it('shows a polite loading state while the first summary arrives', async () => {
    renderSummary('/resumen', '?mockLatency=600')
    expect(await screen.findByText('Cargando el resumen')).toBeInTheDocument()
  })

  it('shows a clear error with a retry when the summary cannot load', async () => {
    const { user } = renderSummary('/resumen', '?mockError=summary-load')
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.')
    window.history.replaceState({}, '', '/')
    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
    expect(await screen.findByText('$24.000')).toBeInTheDocument()
  })
})
