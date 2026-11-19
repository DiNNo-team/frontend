import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { renderWithProviders } from '@/test/render'
import { mockSummaryApi } from './api.mock'
import SummaryPage from './SummaryPage'
import type { RestaurantSummary } from './types'

// VITE_USE_MOCKS=true in tests: the sample of the design (docs/design/restaurant-summary), «today» is 15 Nov 2026. In «Este mes»
// (1–15 Nov) the sample has 5 check-ins (8 Nov ×2, 10 Nov ×2, 11 Nov ×1) at $1.500 per guest. Controls by URL as in dev.

function renderSummary(path = '/resumen', browserSearch = '') {
  window.history.replaceState({}, '', `/${browserSearch}`)
  const router = createMemoryRouter([{ path: '/resumen', element: <SummaryPage /> }], { initialEntries: [path] })
  return { router, ...renderWithProviders(<RouterProvider router={router} />) }
}

const section = async (title: string | RegExp) => within(((await screen.findByRole('heading', { name: title })).closest('section')) as HTMLElement)

/** A summary of the sample with the given changes, for cases the sample does not cover. */
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

describe('SummaryPage · comensales y pago', () => {
  it('puts the guests first, the big figure, and what is paid beside them', async () => {
    renderSummary()
    const hero = await section('Comensales con reserva DiNNo')
    expect(screen.getByRole('heading', { level: 1, name: 'Resumen' })).toBeInTheDocument()
    expect(screen.getByText('Reservas, comensales y pago del periodo.')).toBeInTheDocument()
    expect(hero.getByText('Total a pagar a DiNNo')).toBeInTheDocument()
    expect(hero.getByText('$15.000')).toBeInTheDocument()
    expect(hero.getByText('10 comensales × $1.500 por comensal')).toBeInTheDocument()
    expect(hero.getByText('Tarifa por comensal')).toBeInTheDocument()
    expect(hero.getByText('Costo por comensal')).toBeInTheDocument()
    expect(hero.getByText('Cierre del periodo')).toBeInTheDocument()
    expect(hero.getByText('Solo pagas los check-ins. Las reservas canceladas o vencidas no tienen costo.')).toBeInTheDocument()
  })

  it('does not claim a per-guest formula when the period has older check-ins with a flat amount', async () => {
    withSummary({ billing: { checkIns: 5, amountCop: 11000, currentFeePerGuestCop: 1500, guests: 10 } })
    renderSummary()
    const hero = await section('Comensales con reserva DiNNo')
    expect(await hero.findByText('$11.000')).toBeInTheDocument()
    expect(hero.getByText('5 check-ins, cada uno con el monto de su momento')).toBeInTheDocument()
    expect(hero.queryByText(/× \$1\.500 por comensal/)).not.toBeInTheDocument()
  })

  it('never says «A cobrar», «cobro» or «Cobrado» anywhere on the screen', async () => {
    renderSummary()
    await screen.findByText('Comensales con reserva DiNNo')
    await screen.findByText('Detalle del pago')
    expect(document.body.textContent).not.toMatch(/cobr/i)
  })

  it('the cost per guest is the amount over the guests, and is not shown with 0 guests', async () => {
    renderSummary()
    const hero = await section('Comensales con reserva DiNNo')
    // 5 check-ins: 2 + 2 + 2 + 3 (8 Nov ×2 mesa 04, 10 Nov ×2, 11 Nov ×1 mesa 04) → guests of the sample, $15.000 over them.
    expect(hero.getByText('Costo por comensal').closest('div')).toHaveTextContent(/\$[\d.]+/)
    renderSummary('/resumen', '?mockEmpty')
    expect(await screen.findAllByText('Todavía no hay check-ins en este periodo')).not.toHaveLength(0)
  })

  it('compares with the same stretch of the month before, and says which', async () => {
    renderSummary()
    const hero = await section('Comensales con reserva DiNNo')
    expect(await hero.findByText('vs. octubre (mismo tramo)')).toBeInTheDocument()
  })

  it('shows no percentage when the stretch before had nothing', async () => {
    renderSummary('/resumen', '?mockPrevious=zero')
    const hero = await section('Comensales con reserva DiNNo')
    await screen.findByText('Total a pagar a DiNNo')
    expect(hero.queryByText(/vs\./)).not.toBeInTheDocument()
  })

  it('says «Sin datos» for a rate whose denominator is 0, never 0 or NaN', async () => {
    renderSummary('/resumen', '?mockEmpty')
    const hero = await section('Comensales con reserva DiNNo')
    expect(hero.getAllByText('Sin datos').length).toBeGreaterThan(0)
    expect(document.body.textContent).not.toMatch(/NaN/)
  })

  it('the month before shows its state with color, shape and word: Pagado, Pendiente', async () => {
    renderSummary()
    const hero = await section('Comensales con reserva DiNNo')
    expect(await hero.findByText('Pagado')).toBeInTheDocument()
    expect(hero.getByText('Octubre · $12.000')).toBeInTheDocument()
    expect(hero.getByText('En curso')).toBeInTheDocument()
  })

  it('a pending previous month reads «Pendiente»', async () => {
    renderSummary('/resumen', '?mockPayment=pending')
    const hero = await section('Comensales con reserva DiNNo')
    expect(await hero.findByText('Pendiente')).toBeInTheDocument()
  })

  it('a custom period over several months has no state for the period, only for the month before', async () => {
    renderSummary('/resumen?periodo=personalizado&desde=2026-09-15&hasta=2026-11-10')
    const hero = await section('Comensales con reserva DiNNo')
    await hero.findByText('Total a pagar a DiNNo')
    expect(hero.queryByText('Cierre del periodo')).not.toBeInTheDocument()
    expect(hero.getByText('Octubre · $12.000')).toBeInTheDocument()
  })
})

describe('SummaryPage · calendario y detalle del día', () => {
  it('opens on today, with its detail, and day buttons that say reservations and check-ins', async () => {
    renderSummary()
    const calendar = await section('Noviembre')
    expect(calendar.getByRole('button', { name: '8 de noviembre, 4 reservas, 2 check-ins' })).toHaveAttribute('aria-pressed', 'false')
    expect(calendar.getByRole('button', { name: '15 de noviembre, 1 reserva, 0 check-ins' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('heading', { name: 'Detalle del día' })).toBeInTheDocument()
    expect(screen.getByText('Domingo 15 de noviembre')).toBeInTheDocument()
  })

  it('November 2026 starts on a Sunday: Monday first, six blanks before the 1st', async () => {
    renderSummary()
    const calendar = await section('Noviembre')
    const group = calendar.getByRole('group')
    // 7 weekday letters + 6 blanks, and then day 1.
    const children = Array.from(group.children)
    expect(children.slice(0, 7).map((child) => child.textContent)).toEqual(['L', 'M', 'X', 'J', 'V', 'S', 'D'])
    expect(children[13].getAttribute('data-date')).toBe('2026-11-01')
  })

  it('days that have not come are disabled and cannot be chosen', async () => {
    const { user } = renderSummary()
    const calendar = await section('Noviembre')
    const future = calendar.getByRole('button', { name: '20 de noviembre, todavía no llega' })
    expect(future).toBeDisabled()
    await user.click(future)
    expect(screen.getByText('Domingo 15 de noviembre')).toBeInTheDocument()
  })

  it('choosing a day with the mouse shows its figures, its check-ins and the value of the day', async () => {
    const { user } = renderSummary()
    const calendar = await section('Noviembre')
    await user.click(calendar.getByRole('button', { name: '8 de noviembre, 4 reservas, 2 check-ins' }))
    expect(screen.getByText('Domingo 8 de noviembre')).toBeInTheDocument()
    const detail = await section('Detalle del día')
    expect(await detail.findByText('11:56 a. m. · Mesa 04')).toBeInTheDocument()
    expect(detail.getByText('3:47 p. m. · Mesa 04')).toBeInTheDocument()
    expect(detail.getByText('Valor del día').closest('p')).toHaveTextContent('$6.000')
    expect(detail.getByText('canceladas o vencidas')).toBeInTheDocument()
  })

  it('the keyboard moves between days with the arrows and chooses with Enter; the detail is announced politely', async () => {
    const { user } = renderSummary()
    const calendar = await section('Noviembre')
    const day15 = calendar.getByRole('button', { name: '15 de noviembre, 1 reserva, 0 check-ins' })
    day15.focus()
    // One week back: the 8th.
    await user.keyboard('{ArrowUp}')
    expect(calendar.getByRole('button', { name: '8 de noviembre, 4 reservas, 2 check-ins' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(calendar.getByRole('button', { name: '8 de noviembre, 4 reservas, 2 check-ins' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Domingo 8 de noviembre').closest('[aria-live]')).toHaveAttribute('aria-live', 'polite')
    await user.keyboard('{ArrowLeft}')
    expect(calendar.getByRole('button', { name: '7 de noviembre, 3 reservas, 0 check-ins' })).toHaveFocus()
    await user.keyboard('{Home}')
    expect(calendar.getByRole('button', { name: '1 de noviembre, 0 reservas, 0 check-ins' })).toHaveFocus()
  })

  it('the grid is one tab stop: only the chosen day is tabbable', async () => {
    renderSummary()
    const calendar = await section('Noviembre')
    const tabbable = calendar.getAllByRole('button').filter((button) => button.getAttribute('tabindex') === '0')
    expect(tabbable).toHaveLength(1)
    expect(tabbable[0]).toHaveAttribute('aria-pressed', 'true')
  })

  it('a period of several months has one calendar per month with arrows between them', async () => {
    const { user } = renderSummary('/resumen?periodo=personalizado&desde=2026-10-20&hasta=2026-11-10')
    const calendar = await section('Noviembre')
    await user.click(calendar.getByRole('button', { name: 'Mes anterior del calendario' }))
    expect(await screen.findByRole('heading', { name: 'Octubre' })).toBeInTheDocument()
    const october = await section('Octubre')
    // Days before the period are not selectable.
    expect(october.getByRole('button', { name: '10 de octubre, fuera del periodo' })).toBeDisabled()
    expect(october.getByRole('button', { name: 'Mes anterior del calendario' })).toBeDisabled()
  })

  it('opens on the last day with data when today is not in the period', async () => {
    renderSummary('/resumen?periodo=anterior')
    const calendar = await section('Octubre')
    expect(await calendar.findByRole('button', { pressed: true })).toHaveAccessibleName(/^28 de octubre/)
  })

  it('a failure of the check-ins of a day says so, with a retry, and does not take the calendar down', async () => {
    renderSummary('/resumen', '?mockError=billing-load')
    const detail = await section('Detalle del día')
    expect(await detail.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Noviembre' })).toBeInTheDocument()
  })
})

describe('SummaryPage · comensales por mes y estado de las reservas', () => {
  it('shows the guests of the last six months and says which one is in progress', async () => {
    renderSummary()
    const months = await section('Comensales por mes')
    expect(months.getByText('Últimos 6 meses')).toBeInTheDocument()
    expect(months.getAllByRole('listitem').filter((item) => item.getAttribute('aria-label'))).toHaveLength(6)
    expect(months.getByText('Noviembre en curso (rayado).')).toBeInTheDocument()
  })

  it('splits the reservations in arrived, did not arrive and cancelled, with percents over the created ones', async () => {
    renderSummary()
    const status = await section('Estado de las reservas')
    expect(status.getAllByText('Llegaron').length).toBeGreaterThan(0)
    expect(status.getAllByText('No llegaron').length).toBeGreaterThan(0)
    expect(status.getAllByText('Canceladas').length).toBeGreaterThan(0)
    expect(status.getByRole('img')).toHaveAccessibleName(/llegaron/)
    expect(status.getByText('llegaron', { selector: 'dt' })).toBeInTheDocument()
  })

  it('defines every percentage in a contextual help', async () => {
    const { user } = renderSummary()
    const status = await section('Estado de las reservas')
    const toggle = status.getByRole('button', { name: 'Cómo se calculan' })
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(status.getAllByText(/de todas las reservas creadas/).length).toBeGreaterThan(0)
  })

  it('says there are no reservations when the period has none', async () => {
    renderSummary('/resumen', '?mockEmpty')
    const status = await section('Estado de las reservas')
    expect(status.getByText('Aún no hay reservas en este periodo')).toBeInTheDocument()
  })
})

describe('SummaryPage · horas de mayor demanda', () => {
  it('shows the map, the three peak hours and the reservations of each weekday in one block', async () => {
    renderSummary()
    const demand = await section('Horas de mayor demanda')
    expect(demand.getByRole('img', { name: /Reservas creadas por día de la semana y hora/ })).toBeInTheDocument()
    const peaks = within(demand.getByRole('heading', { name: 'Horas pico' }).closest('section') as HTMLElement)
    expect(peaks.getAllByRole('listitem')).toHaveLength(3)
    expect(peaks.getByText('7:00 p. m.')).toBeInTheDocument()
    expect(demand.getByRole('heading', { name: 'Por día de la semana' })).toBeInTheDocument()
  })

  it('reads the cell under the keyboard in words', async () => {
    const { user } = renderSummary()
    const demand = await section('Horas de mayor demanda')
    await user.tab()
    demand.getByRole('img', { name: /Reservas creadas por día de la semana y hora/ }).focus()
    await user.keyboard('{ArrowRight}')
    expect(demand.getByText(/Lunes, 8:00 a\. m\. · 0 reservas/)).toBeInTheDocument()
  })

  it('says so when nothing has been reserved yet', async () => {
    renderSummary('/resumen', '?mockEmpty')
    const demand = await section('Horas de mayor demanda')
    expect(demand.getByText('Aún no hay reservas en este periodo')).toBeInTheDocument()
  })
})

describe('SummaryPage · detalle del pago', () => {
  it('shows each amount with «personas × tarifa» beside it when it was charged per guest', async () => {
    renderSummary()
    const detail = await section('Detalle del pago')
    expect((await detail.findAllByText('$3.000')).length).toBeGreaterThan(0)
    expect(detail.getAllByText('2 personas × $1.500').length).toBeGreaterThan(0)
  })

  it('shows an older check-in with its stored amount alone, never as people × fee', async () => {
    const original = mockSummaryApi.getBilling.bind(mockSummaryApi)
    vi.spyOn(mockSummaryApi, 'getBilling').mockImplementation(async (...args) => {
      const statement = await original(...args)
      const [first, ...rest] = statement.items
      return first ? { ...statement, items: [{ ...first, partySize: 4, feeCop: 2000 }, ...rest] } : statement
    })
    renderSummary()
    const detail = await section('Detalle del pago')
    expect((await detail.findAllByText('$2.000')).length).toBeGreaterThan(0)
    expect(detail.queryByText('4 personas × $1.500')).not.toBeInTheDocument()
  })

  it('shows three rows, the total of the period and «Ver los N check-ins»', async () => {
    renderSummary()
    const detail = await section('Detalle del pago')
    expect(await detail.findByText('Total del periodo: 5 check-ins · $15.000')).toBeInTheDocument()
    expect(detail.getAllByRole('row')).toHaveLength(4)
    expect(detail.getByRole('button', { name: 'Ver los 5 check-ins' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens the whole list and closes it again', async () => {
    const { user } = renderSummary()
    const detail = await section('Detalle del pago')
    await user.click(await detail.findByRole('button', { name: 'Ver los 5 check-ins' }))
    expect(detail.getAllByRole('row')).toHaveLength(6)
    await user.click(detail.getByRole('button', { name: 'Ver menos' }))
    expect(detail.getAllByRole('row')).toHaveLength(4)
  })

  it('explains how it is calculated, in a help', async () => {
    const { user } = renderSummary()
    const detail = await section('Detalle del pago')
    const toggle = detail.getByRole('button', { name: 'Cómo se calcula' })
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(detail.getByText(/El monto de un check-in es el número de personas de la reserva por la tarifa por comensal/)).toBeInTheDocument()
  })

  it('with no check-ins it says when they will show up', async () => {
    renderSummary('/resumen', '?mockEmpty')
    const detail = await section('Detalle del pago')
    expect(await detail.findByText('No hay check-ins en este periodo')).toBeInTheDocument()
  })

  it('a failure of the detail does not take the rest down: it says so, with a retry', async () => {
    renderSummary('/resumen', '?mockError=billing-load')
    const detail = await section('Detalle del pago')
    expect(await detail.findByText('No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.')).toBeInTheDocument()
    expect(detail.getByRole('button', { name: 'Intentar de nuevo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Comensales con reserva DiNNo' })).toBeInTheDocument()
  })
})

describe('SummaryPage · periodo', () => {
  it('opens on this month, written in words, and asks the backend for exactly that range', async () => {
    const getSummary = vi.spyOn(mockSummaryApi, 'getSummary')
    renderSummary()
    expect(await screen.findByText('Del 1 al 15 de noviembre de 2026')).toBeInTheDocument()
    await screen.findByText('Total a pagar a DiNNo')
    expect(getSummary).toHaveBeenCalledWith({ from: '2026-11-01', to: '2026-11-15' })
  })

  it('«Mes anterior» asks for the whole previous month', async () => {
    const getSummary = vi.spyOn(mockSummaryApi, 'getSummary')
    const { user, router } = renderSummary()
    await screen.findByText('Total a pagar a DiNNo')
    await user.click(screen.getByRole('radio', { name: 'Mes anterior' }))
    expect(await screen.findByText('Del 1 al 31 de octubre de 2026')).toBeInTheDocument()
    await waitFor(() => expect(getSummary).toHaveBeenCalledWith({ from: '2026-10-01', to: '2026-10-31' }))
    expect(router.state.location.search).toBe('?periodo=anterior')
  })

  it('«Personalizado» shows two dates and asks the period they say', async () => {
    const getSummary = vi.spyOn(mockSummaryApi, 'getSummary')
    const { user } = renderSummary()
    await screen.findByText('Total a pagar a DiNNo')
    await user.click(screen.getByRole('radio', { name: 'Personalizado' }))
    const from = screen.getByLabelText('Desde')
    const to = screen.getByLabelText('Hasta')
    expect(from).toHaveValue('2026-11-01')
    expect(to).toHaveValue('2026-11-15')
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
    await screen.findByText('Total a pagar a DiNNo')
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
    expect(getSummary).not.toHaveBeenCalled()
  })

  it('changing the period starts the calendar over on that period\'s default day', async () => {
    const { user } = renderSummary()
    const calendar = await section('Noviembre')
    await user.click(calendar.getByRole('button', { name: '8 de noviembre, 4 reservas, 2 check-ins' }))
    await user.click(screen.getByRole('radio', { name: 'Mes anterior' }))
    const october = await section('Octubre')
    expect(await october.findByRole('button', { pressed: true })).toHaveAccessibleName(/^28 de octubre/)
  })
})

describe('SummaryPage · carga y error', () => {
  it('shows a polite loading state while the first summary arrives', async () => {
    renderSummary('/resumen', '?mockLatency=600')
    expect(await screen.findAllByText('Cargando el resumen')).not.toHaveLength(0)
  })

  it('shows a clear error with a retry when the summary cannot load, and the detail of the payment still asks on its own', async () => {
    const { user } = renderSummary('/resumen', '?mockError=summary-load')
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.')
    expect(await screen.findByText('Detalle del pago')).toBeInTheDocument()
    window.history.replaceState({}, '', '/')
    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
    expect(await screen.findByText('Total a pagar a DiNNo')).toBeInTheDocument()
  })

  it('a summary with other numbers is drawn from the answer, not from fixed values', async () => {
    withSummary({ averagePartySize: null, rates: { conversion: null, noShow: null, cancellation: null } })
    renderSummary()
    const hero = await section('Comensales con reserva DiNNo')
    expect(hero.getAllByText('Sin datos')).toHaveLength(2)
  })
})
