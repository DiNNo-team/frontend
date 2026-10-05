import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import { Button } from './Button'
import { ConfirmDialog } from './ConfirmDialog'

function Harness({ loading = false, error, onConfirm = vi.fn() }: { loading?: boolean; error?: string; onConfirm?: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Desactivar</Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="¿Desactivar Mesa 04?"
        description="No aparecerá para los comensales. Puedes reactivarla cuando quieras."
        confirmLabel="Desactivar mesa"
        loadingText="Desactivando…"
        loading={loading}
        error={error}
        onConfirm={onConfirm}
      />
    </>
  )
}

describe('Dialog / ConfirmDialog', () => {
  it('opens as a named modal with its consequence, and Cancelar closes it returning focus', async () => {
    const { user } = renderWithProviders(<Harness />)
    const opener = screen.getByRole('button', { name: 'Desactivar' })
    await user.click(opener)

    const dialog = screen.getByRole('dialog', { name: '¿Desactivar Mesa 04?' })
    expect(dialog).toHaveAccessibleDescription('No aparecerá para los comensales. Puedes reactivarla cuando quieras.')

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() => expect(opener).toHaveFocus())
  })

  it('Esc closes it', async () => {
    const { user } = renderWithProviders(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Desactivar' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onConfirm with the concrete action', async () => {
    const onConfirm = vi.fn()
    const { user } = renderWithProviders(<Harness onConfirm={onConfirm} />)
    await user.click(screen.getByRole('button', { name: 'Desactivar' }))
    await user.click(screen.getByRole('button', { name: 'Desactivar mesa' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('while loading, Esc does not close it and the button shows the gerund', async () => {
    const { user } = renderWithProviders(<Harness loading />)
    await user.click(screen.getByRole('button', { name: 'Desactivar' }))
    expect(screen.getByRole('button', { name: 'Desactivando…' })).toHaveAttribute('aria-busy', 'true')
    await user.keyboard('{Escape}')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('shows the error inside the dialog without closing it', async () => {
    const { user } = renderWithProviders(<Harness error="No pudimos desactivar la mesa. Revisa tu conexión e intenta de nuevo." />)
    await user.click(screen.getByRole('button', { name: 'Desactivar' }))
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos desactivar la mesa')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
