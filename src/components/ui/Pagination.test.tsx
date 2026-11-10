import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('says which rows are shown and moves between pages', async () => {
    const onPageChange = vi.fn()
    const { user } = renderWithProviders(<Pagination page={2} pageSize={15} totalItems={40} onPageChange={onPageChange} itemsLabel="cambios" />)

    expect(screen.getByText('16–30 de 40 cambios')).toBeInTheDocument()
    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Siguiente' }))
    await user.click(screen.getByRole('button', { name: 'Anterior' }))
    expect(onPageChange.mock.calls).toEqual([[3], [1]])
  })

  it('disables the way out at each end and hides itself with a single page', () => {
    const { rerender } = renderWithProviders(<Pagination page={1} pageSize={15} totalItems={20} onPageChange={vi.fn()} itemsLabel="cambios" />)
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    expect(screen.getByText('1–15 de 20 cambios')).toBeInTheDocument()

    rerender(<Pagination page={1} pageSize={15} totalItems={15} onPageChange={vi.fn()} itemsLabel="cambios" />)
    expect(screen.queryByRole('navigation', { name: 'Paginación' })).not.toBeInTheDocument()
  })
})
