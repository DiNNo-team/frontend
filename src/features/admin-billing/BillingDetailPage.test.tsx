import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { bogotaMonthOf, shiftMonth } from '../admin/month'
import { mockPanelControl } from '../admin/panel-api.mock'
import { renderWithProviders } from '@/test/render'
import BillingDetailPage from './BillingDetailPage'

const CLOSED = shiftMonth(bogotaMonthOf(), -1)

function renderDetail(month: string, browserSearch = '') {
  window.history.replaceState({}, '', `/${browserSearch}`)
  const router = createMemoryRouter(
    [
      { path: '/admin/cobros/:restaurantId', element: <BillingDetailPage /> },
      { path: '/admin/cobros', element: <p>Lista de cobros</p> },
    ],
    // Restaurant 6 («Casa 16») has pending charges last month in the sample data.
    { initialEntries: [`/admin/cobros/mock-restaurant-6?mes=${month}`] },
  )
  return renderWithProviders(<RouterProvider router={router} />)
}

beforeEach(() => mockPanelControl.reset())
afterEach(() => window.history.replaceState({}, '', '/'))

describe('BillingDetailPage', () => {
  it('shows the amount, how it adds up and why it is charged, with no data of the diner', async () => {
    renderDetail(CLOSED)
    expect(await screen.findByRole('heading', { level: 1, name: 'Casa 16' })).toBeInTheDocument()
    expect(screen.getByText(/check-ins × \$ 2\.000/)).toBeInTheDocument()
    expect(screen.getByText(/Las reservas canceladas o vencidas no se cobran/)).toBeInTheDocument()
    expect(screen.queryByText(/@/)).not.toBeInTheDocument()
  })

  it('marks the month as paid after the confirmation, says so, and then offers to undo it', async () => {
    const { user } = renderDetail(CLOSED)
    await user.click(await screen.findByRole('button', { name: 'Marcar como cobrado' }))
    const dialog = await screen.findByRole('dialog', { name: /como cobrado por \$ 12\.000/ })
    await user.click(dialog.querySelector('button:last-of-type') as HTMLElement)
    expect(await screen.findByText(/de Casa 16 marcado como cobrado/)).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Deshacer cobro' })).toBeInTheDocument()
    expect(screen.getByText(/Cobrado el/)).toBeInTheDocument()
  })

  it('offers no button while the month is still running, and says when it can be marked', async () => {
    renderDetail(bogotaMonthOf())
    expect(await screen.findByText('Podrás marcarlo desde el día 1 del mes siguiente')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Marcar como cobrado' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Deshacer cobro' })).not.toBeInTheDocument()
  })

  it('shows the contract text of a 409 and loads the detail again', async () => {
    const { user } = renderDetail(CLOSED, '?mockConflict')
    await user.click(await screen.findByRole('button', { name: 'Marcar como cobrado' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(dialog.querySelector('button:last-of-type') as HTMLElement)
    expect(await screen.findByText('Este mes ya estaba marcado como cobrado.')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('warns when the saved amount does not match the current one', async () => {
    // Restaurant 2 («Casa 72») has a paid month two months ago whose saved amount differs.
    window.history.replaceState({}, '', '/')
    const router = createMemoryRouter([{ path: '/admin/cobros/:restaurantId', element: <BillingDetailPage /> }], {
      initialEntries: [`/admin/cobros/mock-restaurant-2?mes=${shiftMonth(bogotaMonthOf(), -2)}`],
    })
    renderWithProviders(<RouterProvider router={router} />)
    expect(await screen.findByText(/no coincide con el cobrado/)).toBeInTheDocument()
  })
})
