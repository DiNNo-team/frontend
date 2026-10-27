import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { Ban, Pencil } from 'lucide-react'
import { renderWithProviders } from '@/test/render'
import { TableCard } from './TableCard'

describe('TableCard', () => {
  it('is a button named by the table that opens its picker, described by capacity and status', async () => {
    const onSelect = vi.fn()
    const { user } = renderWithProviders(<TableCard name="Mesa 04" capacity={2} status="occupied" onSelect={onSelect} />)
    const toggle = screen.getByRole('button', { name: 'Mesa 04' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-haspopup', 'dialog')
    expect(toggle).toHaveAccessibleDescription('2 personas Ocupada')
    await user.click(toggle)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('opens with Enter and Space from the keyboard', async () => {
    const onSelect = vi.fn()
    const { user } = renderWithProviders(<TableCard name="Mesa 04" capacity={2} status="available" onSelect={onSelect} />)
    await user.tab()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')
    expect(onSelect).toHaveBeenCalledTimes(2)
  })

  it('D, R and O change the status of the focused card without opening anything', async () => {
    const onShortcut = vi.fn()
    const onSelect = vi.fn()
    const { user } = renderWithProviders(<TableCard name="Mesa 04" capacity={2} status="available" onSelect={onSelect} onShortcut={onShortcut} />)
    await user.tab()
    await user.keyboard('o')
    await user.keyboard('R')
    await user.keyboard('d')
    expect(onShortcut.mock.calls.map(([status]) => status)).toEqual(['occupied', 'reserved', 'available'])
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('reflects its open picker with aria-expanded', () => {
    renderWithProviders(<TableCard name="Mesa 04" capacity={2} status="available" selected onSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Mesa 04' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('has a separate ⋯ menu button (no nested buttons) that opens the actions', async () => {
    const onEdit = vi.fn()
    const { user, container } = renderWithProviders(
      <TableCard
        name="Mesa 04"
        capacity={2}
        status="available"
        onSelect={vi.fn()}
        menuItems={[
          { label: 'Editar', icon: Pencil, onSelect: onEdit },
          { label: 'Desactivar', icon: Ban, onSelect: vi.fn(), destructive: true },
        ]}
      />,
    )
    expect(container.querySelector('button button')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Más acciones de Mesa 04' }))
    expect(screen.getByRole('menuitem', { name: 'Desactivar' })).toBeInTheDocument()
    expect(screen.getByRole('separator')).toBeInTheDocument()
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }))
    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('inactive: says "Inactiva", still opens (to offer "Reactivar mesa") and ignores shortcuts', async () => {
    const onSelect = vi.fn()
    const onShortcut = vi.fn()
    const { user } = renderWithProviders(<TableCard name="Mesa 06" capacity={4} status="inactive" onSelect={onSelect} onShortcut={onShortcut} />)
    expect(screen.getByText('Inactiva')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mesa 06' })).toHaveAccessibleDescription('4 personas Inactiva')
    await user.tab()
    await user.keyboard('o')
    expect(onShortcut).not.toHaveBeenCalled()
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledTimes(1)
  })
})
