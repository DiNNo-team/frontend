import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import { NumberStepper } from './NumberStepper'

function Harness({ initial = 4 }: { initial?: number }) {
  const [value, setValue] = useState(initial)
  return (
    <NumberStepper
      label="Capacidad"
      value={value}
      onValueChange={setValue}
      decrementLabel="Quitar una persona"
      incrementLabel="Agregar una persona"
    />
  )
}

describe('NumberStepper', () => {
  it('exposes a labelled spinbutton with its range', () => {
    renderWithProviders(<Harness />)
    const input = screen.getByRole('spinbutton', { name: 'Capacidad' })
    expect(input).toHaveAttribute('aria-valuenow', '4')
    expect(input).toHaveAttribute('aria-valuemin', '1')
    expect(input).toHaveAttribute('aria-valuemax', '20')
  })

  it('changes with the − and + buttons', async () => {
    const { user } = renderWithProviders(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Agregar una persona' }))
    expect(screen.getByRole('spinbutton')).toHaveValue('5')
    await user.click(screen.getByRole('button', { name: 'Quitar una persona' }))
    await user.click(screen.getByRole('button', { name: 'Quitar una persona' }))
    expect(screen.getByRole('spinbutton')).toHaveValue('3')
  })

  it('disables − at the minimum and + at the maximum', () => {
    const { unmount } = renderWithProviders(<Harness initial={1} />)
    expect(screen.getByRole('button', { name: 'Quitar una persona' })).toBeDisabled()
    unmount()
    renderWithProviders(<Harness initial={20} />)
    expect(screen.getByRole('button', { name: 'Agregar una persona' })).toBeDisabled()
  })

  it('supports ↑ ↓ Inicio Fin', async () => {
    const { user } = renderWithProviders(<Harness />)
    const input = screen.getByRole('spinbutton')
    await user.click(input)
    await user.keyboard('{ArrowUp}')
    expect(input).toHaveValue('5')
    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(input).toHaveValue('3')
    await user.keyboard('{End}')
    expect(input).toHaveValue('20')
    await user.keyboard('{Home}')
    expect(input).toHaveValue('1')
  })

  it('validates a typed value on blur, clamping it to the range', async () => {
    const { user } = renderWithProviders(<Harness />)
    const input = screen.getByRole('spinbutton')
    await user.clear(input)
    await user.type(input, '35')
    expect(input).toHaveValue('35')
    await user.tab()
    expect(input).toHaveValue('20')
  })

  it('restores the previous value when the typed text is empty', async () => {
    const { user } = renderWithProviders(<Harness />)
    const input = screen.getByRole('spinbutton')
    await user.clear(input)
    await user.tab()
    expect(input).toHaveValue('4')
  })
})
