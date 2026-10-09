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

  describe('status variant (onStatus / offStatus)', () => {
    const renderStatusSwitch = (props: { defaultChecked?: boolean; disabled?: boolean } = {}) =>
      renderWithProviders(
        <Switch label="Estado del restaurante" onLabel="Abierto" offLabel="Cerrado" onStatus="open" offStatus="closed" {...props} />,
      )
    // The shape is aria-hidden and sits inside the switch, right before the word.
    const shapeOf = (control: HTMLElement) => control.querySelector('[aria-hidden="true"]')

    it('without onStatus / offStatus draws no shape (HoursEditor and the plain switch stay the same)', () => {
      renderWithProviders(<Switch aria-label="Lunes" defaultChecked onLabel="Abierto" offLabel="Cerrado" />)
      expect(shapeOf(screen.getByRole('switch'))).toBeNull()
    })

    it('on: pulsing dot in the ok tone before "Abierto"', () => {
      renderStatusSwitch({ defaultChecked: true })
      const shape = shapeOf(screen.getByRole('switch'))
      expect(shape).toHaveClass('text-ok')
      expect(shape?.querySelector('.animate-live-pulse')).not.toBeNull()
      expect(shape?.nextElementSibling).toHaveTextContent('Abierto')
    })

    it('off: dash in the inactive tone before "Cerrado", without pulse', () => {
      renderStatusSwitch()
      const shape = shapeOf(screen.getByRole('switch'))
      expect(shape).toHaveClass('text-inactive')
      expect(shape?.querySelector('.animate-live-pulse')).toBeNull()
      expect(shape?.nextElementSibling).toHaveTextContent('Cerrado')
    })

    it('the pulse stops with reduced motion', () => {
      renderStatusSwitch({ defaultChecked: true })
      // jsdom has no CSS: check the class that stops it (verified in the browser with prefers-reduced-motion).
      expect(screen.getByRole('switch').querySelector('.animate-live-pulse')).toHaveClass('motion-reduce:animate-none')
    })

    it('the shape does not change the accessible name and follows the state when toggled', async () => {
      const { user } = renderStatusSwitch({ defaultChecked: true })
      const control = screen.getByRole('switch', { name: 'Estado del restaurante Abierto' })
      await user.click(control)
      expect(screen.getByRole('switch', { name: 'Estado del restaurante Cerrado' })).toHaveAttribute('aria-checked', 'false')
      expect(shapeOf(control)).toHaveClass('text-inactive')
    })

    it('disabled: the shape is dimmed with the rest of the switch', () => {
      renderStatusSwitch({ defaultChecked: true, disabled: true })
      const control = screen.getByRole('switch')
      expect(control).toBeDisabled()
      // The 45 % opacity is on the switch button, so it covers track, shape and word.
      expect(control).toHaveClass('disabled:opacity-45')
      expect(control).toContainElement(shapeOf(control) as HTMLElement)
    })
  })
})
