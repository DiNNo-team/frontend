import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import { SegmentedControl } from './SegmentedControl'

type Value = 'available' | 'reserved' | 'occupied'
const OPTIONS = [
  { value: 'available' as const, label: 'Disponible', status: 'available' as const },
  { value: 'reserved' as const, label: 'Reservada', status: 'reserved' as const },
  { value: 'occupied' as const, label: 'Ocupada', status: 'occupied' as const },
]

function Harness({ onChange }: { onChange: (value: Value) => void }) {
  const [value, setValue] = useState<Value>('available')
  return (
    <SegmentedControl
      aria-label="Estado de Mesa 04"
      options={OPTIONS}
      value={value}
      onValueChange={(next) => {
        setValue(next)
        onChange(next)
      }}
    />
  )
}

describe('SegmentedControl', () => {
  it('is a named radio group with the current value checked', () => {
    renderWithProviders(<Harness onChange={vi.fn()} />)
    expect(screen.getByRole('radiogroup', { name: 'Estado de Mesa 04' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Disponible' })).toHaveAttribute('aria-checked', 'true')
  })

  it('arrows move focus without changing the value; Enter applies', async () => {
    const onChange = vi.fn()
    const { user } = renderWithProviders(<Harness onChange={onChange} />)
    await user.tab()
    expect(screen.getByRole('radio', { name: 'Disponible' })).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'Reservada' })).toHaveFocus()
    expect(onChange).not.toHaveBeenCalled()

    await user.keyboard('{ArrowRight}{Enter}')
    expect(onChange).toHaveBeenCalledWith('occupied')
    expect(screen.getByRole('radio', { name: 'Ocupada' })).toHaveAttribute('aria-checked', 'true')
  })

  it('Space applies too, and pressing the active segment keeps it selected', async () => {
    const onChange = vi.fn()
    const { user } = renderWithProviders(<Harness onChange={onChange} />)
    await user.tab()
    await user.keyboard(' ')
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('radio', { name: 'Disponible' })).toHaveAttribute('aria-checked', 'true')

    await user.keyboard('{ArrowLeft} ')
    expect(onChange).toHaveBeenCalledWith('occupied')
  })
})
