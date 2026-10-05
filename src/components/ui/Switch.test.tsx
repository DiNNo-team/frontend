import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import { Switch } from './Switch'

describe('Switch', () => {
  it('reads the label and the state word, and toggles', async () => {
    const onChange = vi.fn()
    const { user } = renderWithProviders(
      <Switch label="Estado del restaurante" defaultChecked onCheckedChange={onChange} onLabel="Abierto" offLabel="Cerrado" />,
    )
    const control = screen.getByRole('switch', { name: 'Estado del restaurante Abierto' })
    expect(control).toHaveAttribute('aria-checked', 'true')
    await user.click(control)
    expect(onChange).toHaveBeenCalledWith(false)
    expect(screen.getByRole('switch', { name: 'Estado del restaurante Cerrado' })).toHaveAttribute('aria-checked', 'false')
  })

  it('clicking the visible label toggles it too', async () => {
    const { user } = renderWithProviders(<Switch label="Estado del restaurante" onLabel="Abierto" offLabel="Cerrado" />)
    await user.click(screen.getByText('Estado del restaurante'))
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })
})
