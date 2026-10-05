import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { Plus } from 'lucide-react'
import { renderWithProviders } from '@/test/render'
import { Button } from './Button'

describe('Button', () => {
  it('is type="button" by default and calls onClick', async () => {
    const onClick = vi.fn()
    const { user } = renderWithProviders(<Button onClick={onClick}>Guardar cambios</Button>)
    const button = screen.getByRole('button', { name: 'Guardar cambios' })
    expect(button).toHaveAttribute('type', 'button')
    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('while loading announces the gerund, sets aria-busy and ignores clicks without losing focus', async () => {
    const onClick = vi.fn()
    const { user } = renderWithProviders(
      <Button loading loadingText="Guardando…" icon={Plus} onClick={onClick}>
        Guardar cambios
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Guardando…' })
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).not.toBeDisabled()
    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
    expect(button).toHaveFocus()
  })

  it('keeps both contents in the same grid cell so the width does not change', () => {
    renderWithProviders(
      <Button loading loadingText="Guardando…">
        Guardar cambios
      </Button>,
    )
    const button = screen.getByRole('button')
    const layers = Array.from(button.children)
    expect(layers).toHaveLength(2)
    for (const layer of layers) expect(layer).toHaveClass('col-start-1', 'row-start-1')
  })

  it('does not submit a form while loading', async () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault())
    const { user } = renderWithProviders(
      <form onSubmit={(event) => onSubmit(event.nativeEvent as SubmitEvent)}>
        <Button type="submit" loading loadingText="Guardando…">
          Guardar cambios
        </Button>
      </form>,
    )
    await user.click(screen.getByRole('button'))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('when disabled it cannot be pressed', async () => {
    const onClick = vi.fn()
    const { user } = renderWithProviders(
      <Button disabled onClick={onClick}>
        Guardar cambios
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Guardar cambios' })
    expect(button).toBeDisabled()
    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
})
