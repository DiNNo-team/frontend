import { afterEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import { UserMenu } from './UserMenu'

afterEach(() => {
  delete document.documentElement.dataset.theme
})

// Under sm the dock has no theme switch (approved by Sebastián, 18 nov 2026): the user menu is the way to change it there.
describe('UserMenu', () => {
  it('switches the theme to dark and back from the menu', async () => {
    const { user } = renderWithProviders(<UserMenu restaurantName="Casa 72" userEmail="casa72@example.com" onSignOut={() => undefined} />)

    await user.click(screen.getByRole('button', { name: /Casa 72/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'Tema oscuro' }))
    expect(document.documentElement.dataset.theme).toBe('dark')

    await user.click(screen.getByRole('button', { name: /Casa 72/ }))
    await user.click(await screen.findByRole('menuitem', { name: 'Tema claro' }))
    expect(document.documentElement.dataset.theme).toBeUndefined()
  })
})
