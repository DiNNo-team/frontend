import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { renderWithProviders } from '@/test/render'
import { NavDock } from './NavDock'
import { NAV_ITEMS_ADMIN, NAV_ITEMS_RESTAURANT } from './nav-items'

function renderDock(props: Parameters<typeof NavDock>[0] = {}, path = '/') {
  return renderWithProviders(
    <MemoryRouter initialEntries={[path]}>
      <NavDock {...props} />
    </MemoryRouter>,
  )
}

describe('NavDock', () => {
  it('shows the restaurant sections by default, each with its word', () => {
    renderDock()
    expect(NAV_ITEMS_RESTAURANT.map((item) => item.label)).toEqual(['Mesas', 'Resumen', 'Informe', 'Restaurante', 'Bitácora'])
    for (const link of screen.getAllByRole('link')) expect(link).toHaveTextContent(/\S/)
    expect(screen.queryByRole('link', { name: /Solicitudes/ })).not.toBeInTheDocument()
  })

  it("shows only the administrator's section, and none of the restaurant's", () => {
    renderDock({ items: NAV_ITEMS_ADMIN }, '/admin/solicitudes')
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual(['Resumen', 'Solicitudes', 'Restaurantes', 'Cobros'])
    expect(screen.getByRole('link', { name: 'Solicitudes' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Resumen' })).not.toHaveAttribute('aria-current')
    expect(screen.queryByRole('link', { name: 'Mesas' })).not.toBeInTheDocument()
  })

  it('shows the pending count over the icon and says it in words to a screen reader', () => {
    renderDock({ items: NAV_ITEMS_ADMIN, badges: { '/admin/solicitudes': 4 } }, '/admin/solicitudes')
    const link = screen.getByRole('link', { name: /Solicitudes/ })
    expect(link).toHaveAccessibleName('Solicitudes, 4 solicitudes pendientes')
    expect(within(link).getByText('4')).toHaveAttribute('aria-hidden', 'true')
  })

  it('says «1 solicitud pendiente» in the singular and shows no count at zero', () => {
    const { unmount } = renderDock({ items: NAV_ITEMS_ADMIN, badges: { '/admin/solicitudes': 1 } }, '/admin')
    expect(screen.getByRole('link', { name: /1 solicitud pendiente$/ })).toBeInTheDocument()
    unmount()
    renderDock({ items: NAV_ITEMS_ADMIN, badges: { '/admin/solicitudes': 0 } }, '/admin')
    expect(screen.getByRole('link', { name: 'Solicitudes' })).toBeInTheDocument()
  })
})
