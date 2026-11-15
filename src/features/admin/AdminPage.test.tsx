import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { renderWithProviders } from '@/test/render'
import AdminPage from './AdminPage'
import { mockAdminApi, mockAdminControl } from './api.mock'

// VITE_USE_MOCKS=true in tests: the sample requests answer (4 pending, 2 approved, 1 rejected). Controls by URL as in dev.

function setViewport(wide: boolean) {
  window.matchMedia = ((query: string) =>
    ({ matches: wide && query.includes('1024'), media: query, onchange: null, addEventListener: () => undefined, removeEventListener: () => undefined,
      addListener: () => undefined, removeListener: () => undefined, dispatchEvent: () => false }) as MediaQueryList)
}

function renderAdmin(path = '/admin', browserSearch = '') {
  window.history.replaceState({}, '', `/${browserSearch}`)
  const router = createMemoryRouter([{ path: '/admin', element: <AdminPage /> }], { initialEntries: [path] })
  return { router, ...renderWithProviders(<RouterProvider router={router} />) }
}

/** The table and the phone list both render in jsdom (no CSS): the first match is the table's. */
const openRequest = async (user: ReturnType<typeof renderAdmin>['user'], name: string) =>
  user.click((await screen.findAllByRole('button', { name: `Ver la solicitud de ${name}` }))[0])

const rowsOf = () => within(screen.getByRole('table', { name: 'Solicitudes de restaurantes' })).getAllByRole('row').slice(1)

beforeEach(() => {
  mockAdminControl.reset()
  setViewport(false)
})
afterEach(() => {
  window.history.replaceState({}, '', '/')
  vi.restoreAllMocks()
})

describe('AdminPage · lista', () => {
  it('opens on the pending requests, the one that has waited longest first, with the count in its tab', async () => {
    renderAdmin()
    expect(screen.getByRole('heading', { level: 1, name: 'Solicitudes' })).toBeInTheDocument()
    await waitFor(() => expect(rowsOf()).toHaveLength(4))
    expect(within(rowsOf()[0]).getByText('Casa Tamarindo')).toBeInTheDocument()
    expect(within(rowsOf()[3]).getByText('Sushi Chapinero')).toBeInTheDocument()
    expect(within(rowsOf()[0]).getByText('hace 6 días')).toBeInTheDocument()
    expect(within(rowsOf()[0]).getByText('+573001234567 · tamarindo@correo.test')).toBeInTheDocument()
    expect(within(rowsOf()[0]).getByText('En revisión')).toBeInTheDocument()
    expect(await screen.findByRole('radio', { name: /Pendientes \(4\)/ })).toBeChecked()
  })

  it('shows the approved and the rejected ones in their own views, by last review', async () => {
    const { user, router } = renderAdmin()
    await waitFor(() => expect(rowsOf()).toHaveLength(4))
    await user.click(screen.getByRole('radio', { name: /Aprobadas/ }))
    await waitFor(() => expect(rowsOf()).toHaveLength(2))
    // Newest review first: Café Quinta (9 days ago) before Asados del Norte (12).
    expect(within(rowsOf()[0]).getByText('Café Quinta')).toBeInTheDocument()
    expect(within(rowsOf()[1]).getByText('Asados del Norte')).toBeInTheDocument()
    expect(within(rowsOf()[0]).getByText('Aprobado')).toBeInTheDocument()
    expect(router.state.location.search).toBe('?estado=aprobadas')

    await user.click(screen.getByRole('radio', { name: /Rechazadas/ }))
    await waitFor(() => expect(rowsOf()).toHaveLength(1))
    expect(within(rowsOf()[0]).getByText('Mar y Sol')).toBeInTheDocument()
    expect(within(rowsOf()[0]).getByText('No aprobada')).toBeInTheDocument()
  })

  it('keeps the view in the URL: a reload or a shared link opens the same tab', async () => {
    renderAdmin('/admin?estado=rechazadas')
    await waitFor(() => expect(rowsOf()).toHaveLength(1))
    expect(screen.getByRole('radio', { name: /Rechazadas/ })).toBeChecked()
  })

  it('says there is nothing pending, kindly, when there are no requests', async () => {
    renderAdmin('/admin', '?mockEmpty')
    expect(await screen.findByText('No hay solicitudes pendientes')).toBeInTheDocument()
    expect(screen.getByText('Cuando un restaurante pida entrar a DiNNo, aparecerá aquí.')).toBeInTheDocument()
  })

  it('shows a clear error with a retry when the list cannot load', async () => {
    const { user } = renderAdmin('/admin', '?mockError=admin-list')
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar las solicitudes. Revisa tu conexión e intenta de nuevo.')
    window.history.replaceState({}, '', '/')
    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
    await waitFor(() => expect(rowsOf()).toHaveLength(4))
  })

  it('pages the list by 20 and asks the backend for the next page', async () => {
    const item = (index: number) => ({ id: `r${index}`, name: `Restaurante ${index}`, category: null, address: null, contactPhone: null, approvalStatus: 'pending' as const,
      submittedAt: new Date().toISOString(), reviewedAt: null, ownerEmail: null })
    const list = vi.spyOn(mockAdminApi, 'list').mockImplementation(async ({ page, pageSize }) => ({
      items: Array.from({ length: pageSize }, (_, index) => item((page - 1) * pageSize + index + 1)), total: 45, page, pageSize,
    }))
    const { user, router } = renderAdmin()
    expect(await screen.findByText('1–20 de 45 solicitudes')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(await screen.findByText('21–40 de 45 solicitudes')).toBeInTheDocument()
    expect(list).toHaveBeenCalledWith({ status: 'pending', page: 2, pageSize: 20 })
    expect(router.state.location.search).toBe('?pagina=2')
  })
})

describe('AdminPage · detalle', () => {
  it('on a phone the detail takes the page and has a way back to the list', async () => {
    const { user, router } = renderAdmin()
    await openRequest(user, 'Casa Tamarindo')
    expect(await screen.findByRole('heading', { level: 2, name: 'Casa Tamarindo' })).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(router.state.location.search).toBe('?solicitud=mock-pending-1')

    await user.click(screen.getByRole('button', { name: 'Volver a solicitudes' }))
    await waitFor(() => expect(rowsOf()).toHaveLength(4))
  })

  it('on a desktop it opens beside the list, and the list stays', async () => {
    setViewport(true)
    const { user } = renderAdmin()
    await openRequest(user, 'Casa Tamarindo')
    expect(await screen.findByRole('heading', { level: 2, name: 'Casa Tamarindo' })).toBeInTheDocument()
    expect(screen.getByRole('table', { name: 'Solicitudes de restaurantes' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Ver la solicitud de Casa Tamarindo' })[0]).toHaveAttribute('aria-current', 'true')
    await user.click(screen.getByRole('button', { name: 'Cerrar detalle' }))
    await waitFor(() => expect(screen.queryByRole('heading', { level: 2, name: 'Casa Tamarindo' })).not.toBeInTheDocument())
  })

  it('shows the data, the location with its map link, the schedule and the review history', async () => {
    renderAdmin('/admin?solicitud=mock-reviewed-3&estado=rechazadas')
    expect(await screen.findByRole('heading', { level: 2, name: 'Mar y Sol' })).toBeInTheDocument()
    const section = (name: string) => within(screen.getByRole('heading', { level: 3, name }).closest('section') as HTMLElement)
    expect(section('Datos').getByText('Mariscos')).toBeInTheDocument()
    expect(section('Datos').getByText('mar@correo.test')).toBeInTheDocument()
    expect(section('Ubicación').getByText('4.653300, -74.083600')).toBeInTheDocument()
    const map = section('Ubicación').getByRole('link', { name: /Ver en Google Maps/ })
    expect(map).toHaveAttribute('href', 'https://www.google.com/maps/search/?api=1&query=4.6533,-74.0836')
    expect(map).toHaveAttribute('target', '_blank')
    expect(map).toHaveAttribute('rel', 'noopener noreferrer')
    expect(section('Horarios').getByText('Lunes')).toBeInTheDocument()
    expect(section('Horarios').getAllByText('12:00 p. m. – 9:00 p. m.')).toHaveLength(6)
    expect(section('Horarios').getByText('Domingo').nextSibling).toHaveTextContent('Cerrado')
    expect(section('Revisión').getByText('admin@dinno.test')).toBeInTheDocument()
    expect(section('Revisión').getByText('La dirección no coincide con la ubicación del mapa. Corrígela y vuelve a enviar la solicitud.')).toBeInTheDocument()
    // Already reviewed: no decisions.
    expect(screen.queryByRole('button', { name: 'Aprobar restaurante' })).not.toBeInTheDocument()
  })

  it('shows a loading state and then an error with a retry when the detail cannot load', async () => {
    const { user } = renderAdmin('/admin?solicitud=mock-pending-1', '?mockError=admin-detail')
    expect(await screen.findByText('No pudimos cargar esta solicitud. Revisa tu conexión e intenta de nuevo.')).toBeInTheDocument()
    window.history.replaceState({}, '', '/')
    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
    expect(await screen.findByRole('heading', { level: 2, name: 'Casa Tamarindo' })).toBeInTheDocument()
  })

  it('a request that does not exist says so and offers the way back', async () => {
    renderAdmin('/admin?solicitud=no-existe')
    expect(await screen.findByText('No encontramos esta solicitud. Es posible que ya no exista.')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Volver a solicitudes' }).length).toBeGreaterThan(0)
  })
})

describe('AdminPage · aprobar', () => {
  it('asks first, says what it means, approves, and shows it approved with no decisions left', async () => {
    const { user } = renderAdmin('/admin?solicitud=mock-pending-1')
    await user.click(await screen.findByRole('button', { name: 'Aprobar restaurante' }))
    const dialog = await screen.findByRole('dialog', { name: 'Aprobar restaurante: Casa Tamarindo' })
    expect(dialog).toHaveTextContent('Casa Tamarindo podrá operar y aparecer a los comensales en DiNNo. No podrás deshacerlo desde aquí; el restaurante ve la decisión la próxima vez que entre.')
    await user.click(within(dialog).getByRole('button', { name: 'Aprobar restaurante' }))

    expect(await screen.findByText('Restaurante aprobado')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'Aprobar restaurante' })).not.toBeInTheDocument()
    expect(within(screen.getByRole('heading', { level: 3, name: 'Revisión' }).closest('section') as HTMLElement).getByText('Aprobado')).toBeInTheDocument()
  })

  it('cancelling the confirmation approves nothing', async () => {
    const approve = vi.spyOn(mockAdminApi, 'approve')
    const { user } = renderAdmin('/admin?solicitud=mock-pending-1')
    await user.click(await screen.findByRole('button', { name: 'Aprobar restaurante' }))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancelar' }))
    expect(approve).not.toHaveBeenCalled()
  })

  it('somebody else reviewed it first (409): says so, closes the dialog and shows the request as it is now', async () => {
    const { user } = renderAdmin('/admin?solicitud=mock-pending-1', '?mockConflict')
    await user.click(await screen.findByRole('button', { name: 'Aprobar restaurante' }))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Aprobar restaurante' }))
    expect(await screen.findByText('Esta solicitud ya fue revisada.')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('a network failure keeps the dialog open with the reason in words', async () => {
    const { user } = renderAdmin('/admin?solicitud=mock-pending-1')
    await user.click(await screen.findByRole('button', { name: 'Aprobar restaurante' }))
    const dialog = await screen.findByRole('dialog')
    window.history.replaceState({}, '', '/?mockError=admin-review')
    await user.click(within(dialog).getByRole('button', { name: 'Aprobar restaurante' }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.')
  })
})

describe('AdminPage · rechazar', () => {
  async function openReject(user: ReturnType<typeof renderAdmin>['user']) {
    await user.click(await screen.findByRole('button', { name: 'Rechazar solicitud' }))
    return screen.findByRole('dialog', { name: /Rechazar solicitud: / })
  }

  it('asks for the reason, says it cannot be undone, and counts the characters', async () => {
    const { user } = renderAdmin('/admin?solicitud=mock-pending-2')
    const dialog = await openReject(user)
    expect(dialog).toHaveTextContent('No podrás deshacerlo desde aquí.')
    const reason = within(dialog).getByLabelText('Motivo del rechazo')
    expect(within(dialog).getByText('0 de 300 caracteres')).toBeInTheDocument()
    await user.type(reason, '  Corto ')
    expect(within(dialog).getByText('5 de 300 caracteres')).toBeInTheDocument()
  })

  it('does not reject with an empty, short or long reason: it says what to do', async () => {
    const reject = vi.spyOn(mockAdminApi, 'reject')
    const { user } = renderAdmin('/admin?solicitud=mock-pending-2')
    const dialog = await openReject(user)
    const submit = within(dialog).getByRole('button', { name: 'Rechazar solicitud' })

    await user.click(submit)
    expect(await within(dialog).findByText('Escribe el motivo del rechazo.')).toBeInTheDocument()
    await user.type(within(dialog).getByLabelText('Motivo del rechazo'), 'Corto')
    await user.click(submit)
    expect(await within(dialog).findByText('El motivo es muy corto. Usa al menos 10 caracteres.')).toBeInTheDocument()
    await user.clear(within(dialog).getByLabelText('Motivo del rechazo'))
    await user.click(within(dialog).getByRole('button', { name: 'Dirección incorrecta' }))
    await user.type(within(dialog).getByLabelText('Motivo del rechazo'), ' '.concat('x'.repeat(250)))
    await user.click(submit)
    expect(await within(dialog).findByText('El motivo es muy largo. Usa máximo 300 caracteres.')).toBeInTheDocument()
    expect(reject).not.toHaveBeenCalled()
  })

  it('inserts a draft that stays editable', async () => {
    const { user } = renderAdmin('/admin?solicitud=mock-pending-2')
    const dialog = await openReject(user)
    await user.click(within(dialog).getByRole('button', { name: 'Teléfono inválido' }))
    const reason = within(dialog).getByLabelText('Motivo del rechazo')
    expect(reason).toHaveValue('No pudimos comunicarnos con el teléfono de contacto. Revísalo y vuelve a enviar la solicitud.')
    await user.type(reason, ' Gracias.')
    expect(reason).toHaveValue('No pudimos comunicarnos con el teléfono de contacto. Revísalo y vuelve a enviar la solicitud. Gracias.')
  })

  it('rejects with the trimmed reason and shows it in the review history', async () => {
    const reject = vi.spyOn(mockAdminApi, 'reject')
    const { user } = renderAdmin('/admin?solicitud=mock-pending-2')
    const dialog = await openReject(user)
    await user.type(within(dialog).getByLabelText('Motivo del rechazo'), '  Teléfono sin respuesta, revísalo.  ')
    await user.click(within(dialog).getByRole('button', { name: 'Rechazar solicitud' }))

    expect(await screen.findByText('Solicitud rechazada')).toBeInTheDocument()
    expect(reject).toHaveBeenCalledWith('mock-pending-2', 'Teléfono sin respuesta, revísalo.')
    const review = within(await screen.findByRole('heading', { level: 3, name: 'Revisión' }).then((heading) => heading.closest('section') as HTMLElement))
    expect(review.getByText('Teléfono sin respuesta, revísalo.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Rechazar solicitud' })).not.toBeInTheDocument()
  })

  it('somebody else reviewed it first (409): says so and closes the dialog', async () => {
    const { user } = renderAdmin('/admin?solicitud=mock-pending-2', '?mockConflict')
    const dialog = await openReject(user)
    await user.type(within(dialog).getByLabelText('Motivo del rechazo'), 'Un motivo con suficiente longitud.')
    await user.click(within(dialog).getByRole('button', { name: 'Rechazar solicitud' }))
    expect(await screen.findByText('Esta solicitud ya fue revisada.')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
