import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LiveIndicator } from './LiveIndicator'

describe('LiveIndicator (manual 12.2)', () => {
  it('«En vivo» with the pulsing Active Dot', () => {
    const { container } = render(<LiveIndicator state="live" />)
    expect(screen.getByRole('status')).toHaveTextContent('En vivo')
    expect(container.querySelector('.animate-live-pulse')).not.toBeNull()
  })

  it('«Reconectando…» with the last update', () => {
    render(<LiveIndicator state="reconnecting" updatedAt={new Date(2026, 10, 8, 19, 42)} />)
    expect(screen.getByRole('status')).toHaveTextContent('Reconectando…· Actualizado 7:42 p. m.')
  })

  it('«Sin conexión» offers «Intentar de nuevo»', async () => {
    const onRetry = vi.fn()
    render(<LiveIndicator state="offline" onRetry={onRetry} />)
    expect(screen.getByRole('status')).toHaveTextContent('Sin conexión')
    await userEvent.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
