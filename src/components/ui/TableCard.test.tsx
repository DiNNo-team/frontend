import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { Ban, Pencil } from 'lucide-react'
import { renderWithProviders } from '@/test/render'
import { TableCard } from './TableCard'

describe('TableCard', () => {
  it('is a toggle button named by the table, described by capacity and status', async () => {
    const onSelect = vi.fn()
    const { user } = renderWithProviders(<TableCard name="Mesa 04" capacity={2} status="occupied" onSelect={onSelect} />)
    const toggle = screen.getByRole('button', { name: 'Mesa 04' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    expect(toggle).toHaveAccessibleDescription('2 personas Ocupada')
    await user.click(toggle)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('selects with Enter and Space from the keyboard', async () => {
    const onSelect = vi.fn()
    const { user } = renderWithProviders(<TableCard name="Mesa 04" capacity={2} status="available" onSelect={onSelect} />)
    await user.tab()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')
    expect(onSelect).toHaveBeenCalledTimes(2)
  })

  it('reflects selection with aria-pressed', () => {
    renderWithProviders(<TableCard name="Mesa 04" capacity={2} status="available" selected onSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Mesa 04' })).toHaveAttribute('aria-pressed', 'true')
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

  it('inactive: cannot be selected, says "Inactiva" and offers "Reactivar"', async () => {
    const onSelect = vi.fn()
    const onReactivate = vi.fn()
    const { user } = renderWithProviders(
      <TableCard name="Mesa 06" capacity={4} status="inactive" onSelect={onSelect} onReactivate={onReactivate} />,
    )
    expect(screen.queryByRole('button', { name: 'Mesa 06' })).not.toBeInTheDocument()
    expect(screen.getByText('Inactiva')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reactivar' }))
    expect(onReactivate).toHaveBeenCalledTimes(1)
    expect(onSelect).not.toHaveBeenCalled()
  })
})
