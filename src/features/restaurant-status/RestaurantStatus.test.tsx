import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { mockTablesApi, mockTablesControl } from '@/features/tables/api.mock'
import { renderWithProviders } from '@/test/render'
import { mockRestaurantStatusApi, mockRestaurantStatusControl } from './api.mock'
import { RestaurantStatusBanner } from './components/RestaurantStatusBanner'
import { RestaurantStatusControl } from './components/RestaurantStatusControl'

vi.mock('./api', () => ({ restaurantStatusApi: mockRestaurantStatusApi }))
vi.mock('@/features/tables/api', () => ({ tablesApi: mockTablesApi }))

const CLOSED_BANNER = 'Tu restaurante está cerrado. Los comensales no lo ven en DiNNo.'
const CLOSED_TOAST = 'Restaurante cerrado. Los comensales ya no lo ven'
const OPENED_TOAST = 'Restaurante abierto. Los comensales ya lo ven'

beforeEach(() => {
  mockRestaurantStatusControl.reset()
  mockRestaurantStatusControl.setLatency(0)
  // Seed: Mesa 03 and Mesa 08 are reserved.
  mockTablesControl.reset()
  mockTablesControl.setLatency(0)
})

/** Keeps only the reserved tables listed (the others become available). */
function keepReserved(...identifiers: string[]) {
  mockTablesControl.reset(
    mockTablesControl
      .snapshot()
      .map((table) => (table.status === 'reserved' && !identifiers.includes(table.identifier) ? { ...table, status: 'available' } : table)),
  )
}

// The topbar slot and the banner, as the DashboardLayout mounts them.
function renderStatus() {
  return renderWithProviders(
    <>
      <RestaurantStatusControl />
      <RestaurantStatusBanner />
    </>,
  )
}

const findSwitch = () => screen.findByRole('switch', { name: /Estado del restaurante/ })
const toastShown = async (text: string) => expect((await screen.findAllByText(text)).length).toBeGreaterThan(0)

describe('RestaurantStatus', () => {
  it('shows "Abierto" when open and "Cerrado" plus the banner when closed', async () => {
    const { unmount } = renderStatus()
    const control = await findSwitch()
    expect(control).toBeChecked()
    expect(control).toHaveAccessibleName('Estado del restaurante Abierto')
    expect(screen.queryByText(CLOSED_BANNER)).not.toBeInTheDocument()
    unmount()

    mockRestaurantStatusControl.reset(false)
    renderStatus()
    expect(await findSwitch()).not.toBeChecked()
    expect(await findSwitch()).toHaveAccessibleName('Estado del restaurante Cerrado')
    expect(screen.getByText(CLOSED_BANNER)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir ahora' })).toBeInTheDocument()
  })

  it('shows the status shape next to the word: pulsing dot when open, dash when closed', async () => {
    const shapeOf = (control: HTMLElement) => control.querySelector('[aria-hidden="true"]')
    const { unmount } = renderStatus()
    const open = await findSwitch()
    expect(shapeOf(open)).toHaveClass('text-ok')
    expect(open.querySelector('.animate-live-pulse')).not.toBeNull()
    unmount()

    mockRestaurantStatusControl.reset(false)
    renderStatus()
    const closed = await findSwitch()
    expect(shapeOf(closed)).toHaveClass('text-inactive')
    expect(closed.querySelector('.animate-live-pulse')).toBeNull()
  })

  it('keeps "Estado del restaurante" for screen readers when it is visually hidden on small screens', async () => {
    renderStatus()
    const control = await findSwitch()
    expect(control).toHaveAccessibleName('Estado del restaurante Abierto')
    expect(screen.getByText('Estado del restaurante')).toHaveClass('sr-only', 'sm:not-sr-only')
  })

  it('closes at once without reserved tables, toasts with "Deshacer", and "Deshacer" opens again', async () => {
    keepReserved()
    const { user } = renderStatus()
    await user.click(await findSwitch())

    await toastShown(CLOSED_TOAST)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await findSwitch()).not.toBeChecked()
    expect(screen.getByText(CLOSED_BANNER)).toBeInTheDocument()
    expect(mockRestaurantStatusControl.isOpen()).toBe(false)

    await user.click(screen.getByRole('button', { name: 'Deshacer' }))
    await waitFor(() => expect(mockRestaurantStatusControl.isOpen()).toBe(true))
    await toastShown(OPENED_TOAST)
    expect(await findSwitch()).toBeChecked()
    expect(screen.queryByText(CLOSED_BANNER)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Deshacer' })).not.toBeInTheDocument()
  })

  it('with reserved tables asks first (plural) and "Cancelar" changes nothing', async () => {
    const { user } = renderStatus()
    await user.click(await findSwitch())

    const dialog = await screen.findByRole('dialog', { name: '¿Cerrar el restaurante?' })
    expect(dialog).toHaveTextContent(
      'Tienes 2 mesas reservadas. Mientras esté cerrado, los comensales no verán tu restaurante en DiNNo.',
    )
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(await findSwitch()).toBeChecked()
    expect(mockRestaurantStatusControl.isOpen()).toBe(true)
    expect(screen.queryByText(CLOSED_BANNER)).not.toBeInTheDocument()
  })

  it('uses the singular with one reserved table and closes after "Cerrar restaurante"', async () => {
    keepReserved('08')
    const { user } = renderStatus()
    await user.click(await findSwitch())

    const dialog = await screen.findByRole('dialog', { name: '¿Cerrar el restaurante?' })
    expect(dialog).toHaveTextContent('Tienes 1 mesa reservada. Mientras esté cerrado, los comensales no verán tu restaurante en DiNNo.')
    await user.click(within(dialog).getByRole('button', { name: 'Cerrar restaurante' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await toastShown(CLOSED_TOAST)
    expect(screen.getByRole('button', { name: 'Deshacer' })).toBeInTheDocument()
    expect(mockRestaurantStatusControl.isOpen()).toBe(false)
  })

  it('a failed close from the dialog keeps it open with the error inside, not in the banner', async () => {
    mockRestaurantStatusControl.failOn('restaurant-status-save')
    const { user } = renderStatus()
    await user.click(await findSwitch())
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Cerrar restaurante' }))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.')
    expect(mockRestaurantStatusControl.isOpen()).toBe(true)
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(await findSwitch()).toBeChecked()
  })

  it('asks with the safe text when the tables cannot be loaded', async () => {
    mockTablesControl.failOn('list')
    const { user } = renderStatus()
    await user.click(await findSwitch())

    const dialog = await screen.findByRole('dialog', { name: '¿Cerrar el restaurante?' })
    expect(dialog).toHaveTextContent('Los comensales no verán tu restaurante en DiNNo mientras esté cerrado.')
    expect(dialog).not.toHaveTextContent('Tienes')
  })

  it('"Abrir ahora" opens and shows its toast', async () => {
    mockRestaurantStatusControl.reset(false)
    const { user } = renderStatus()
    await user.click(await screen.findByRole('button', { name: 'Abrir ahora' }))

    await toastShown(OPENED_TOAST)
    expect(mockRestaurantStatusControl.isOpen()).toBe(true)
    expect(await findSwitch()).toBeChecked()
    expect(screen.queryByText(CLOSED_BANNER)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Deshacer' })).not.toBeInTheDocument()
  })

  it('if saving fails the status goes back and the banner shows the error with "Intentar de nuevo"', async () => {
    keepReserved()
    mockRestaurantStatusControl.failOn('restaurant-status-save')
    const { user } = renderStatus()
    await user.click(await findSwitch())

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.')
    expect(await findSwitch()).toBeChecked()
    expect(screen.queryByText(CLOSED_BANNER)).not.toBeInTheDocument()
    expect(screen.queryByText(CLOSED_TOAST)).not.toBeInTheDocument()

    mockRestaurantStatusControl.clearFailures()
    await user.click(within(alert).getByRole('button', { name: 'Intentar de nuevo' }))
    await waitFor(() => expect(mockRestaurantStatusControl.isOpen()).toBe(false))
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    await toastShown(CLOSED_TOAST)
  })

  it('cannot be pressed again while saving', async () => {
    keepReserved()
    const { user } = renderStatus()
    const control = await findSwitch()
    mockRestaurantStatusControl.setLatency(50)
    await user.click(control)

    // Optimistic: already "Cerrado", but locked until the backend answers.
    expect(control).not.toBeChecked()
    expect(control).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Abrir ahora' })).toHaveAttribute('aria-busy', 'true')
    await user.click(control)
    await user.click(screen.getByRole('button', { name: 'Abrir ahora' }))

    await waitFor(() => expect(control).toBeEnabled())
    expect(control).not.toBeChecked()
    expect(mockRestaurantStatusControl.isOpen()).toBe(false)
  })

  it('keyboard: Space toggles and the focus comes back to the switch after saving', async () => {
    keepReserved()
    const { user } = renderStatus()
    const control = await findSwitch()
    control.focus()
    await user.keyboard(' ')

    await waitFor(() => expect(mockRestaurantStatusControl.isOpen()).toBe(false))
    await waitFor(() => expect(control).toHaveFocus())
    expect(control).not.toBeChecked()
  })

  it('a failed load shows the error with "Intentar de nuevo" and no switch', async () => {
    mockRestaurantStatusControl.failOn('restaurant-status-load')
    const { user } = renderStatus()

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('No pudimos cargar el estado del restaurante. Revisa tu conexión e intenta de nuevo.')
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()

    mockRestaurantStatusControl.clearFailures()
    await user.click(within(alert).getByRole('button', { name: 'Intentar de nuevo' }))
    expect(await findSwitch()).toBeChecked()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
