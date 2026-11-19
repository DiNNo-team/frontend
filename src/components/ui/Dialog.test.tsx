import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import { Button } from './Button'
import { Dialog, type DialogProps } from './Dialog'

function Harness(props: Partial<DialogProps>) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir</Button>
      <Dialog open={open} onOpenChange={setOpen} title="Informe de la semana" {...props}>
        <p>Contenido</p>
      </Dialog>
    </>
  )
}

async function openWith(props: Partial<DialogProps>) {
  const view = renderWithProviders(<Harness {...props} />)
  const opener = screen.getByRole('button', { name: 'Abrir' })
  await view.user.click(opener)
  return { ...view, opener, dialog: screen.getByRole('dialog', { name: 'Informe de la semana' }) }
}

describe('Dialog · sizes and veil', () => {
  it('keeps sm and md as they were: solid veil, no close button in a header', async () => {
    const { dialog } = await openWith({ size: 'md' })
    expect(dialog).toHaveClass('max-w-140', 'p-6', 'bg-surface')
    expect(dialog.parentElement).not.toHaveClass('veil-blur')
    expect(screen.queryByRole('button', { name: 'Cerrar' })).not.toBeInTheDocument()
  })

  it('lg: wide solid panel, the period as its description, header actions and one close button that returns focus', async () => {
    const { dialog, opener, user } = await openWith({
      size: 'lg',
      description: 'Del 12 al 18 de noviembre · hoy incluido',
      headerActions: <Button variant="outline">Actualizar informe</Button>,
    })
    expect(dialog).toHaveClass('max-w-240', 'bg-surface')
    // Focus starts on the panel, so the close button's tooltip does not pop up and the first Esc closes the dialog.
    await waitFor(() => expect(dialog).toHaveFocus())
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    expect(dialog).toHaveAccessibleDescription('Del 12 al 18 de noviembre · hoy incluido')
    expect(screen.getByRole('button', { name: 'Actualizar informe' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Cerrar' })).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() => expect(opener).toHaveFocus())
  })

  it('lg: the body scrolls inside the panel and the header does not', async () => {
    await openWith({ size: 'lg' })
    const body = screen.getByText('Contenido').parentElement as HTMLElement
    expect(body).toHaveClass('overflow-y-auto', 'min-h-0')
  })

  it('blur veil: the overlay gets veil-blur (the panel stays solid)', async () => {
    const { dialog } = await openWith({ size: 'lg', veil: 'blur' })
    expect(dialog.parentElement).toHaveClass('veil-blur', 'bg-(--overlay)')
    expect(dialog).toHaveClass('bg-surface')
  })

  it('Esc and a click outside close it', async () => {
    const { user } = await openWith({ size: 'lg', veil: 'blur' })
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    const overlay = screen.getByRole('dialog').parentElement as HTMLElement
    // Radix starts listening for outside clicks a tick after opening.
    await new Promise((resolve) => setTimeout(resolve, 0))
    await user.click(overlay)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
