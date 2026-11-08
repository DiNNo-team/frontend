import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusChip } from './StatusChip'
import { STATUS_META, type Status } from './status'

const EXPECTED: Record<Status, string> = {
  available: 'Disponible',
  reserved: 'Reservada',
  occupied: 'Ocupada',
  inactive: 'Inactiva',
  limited: 'Pocas mesas',
  open: 'Abierto',
  closed: 'Cerrado',
  error: 'Error',
  dinno: 'Reserva DiNNo',
  'reservation-active': 'Activa',
  'reservation-completed': 'Cumplida',
  'reservation-expired': 'Vencida',
  'reservation-cancelled': 'Cancelada',
}

describe('StatusChip', () => {
  it.each(Object.entries(EXPECTED) as [Status, string][])('%s shows the word "%s" as real text', (status, word) => {
    const { container } = render(<StatusChip status={status} />)
    expect(screen.getByText(word)).toBeInTheDocument()
    expect(container).toHaveTextContent(word)
    expect(STATUS_META[status].label).toBe(word)
  })

  it('hides the shape from screen readers', () => {
    const { container } = render(<StatusChip status="occupied" />)
    expect(container.querySelector('svg')?.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('accepts a custom label', () => {
    render(<StatusChip status="error" label="Error · intenta de nuevo" />)
    expect(screen.getByText('Error · intenta de nuevo')).toBeInTheDocument()
  })

  it('gives every status a distinct shape within its group', () => {
    const tableShapes = (['available', 'reserved', 'occupied', 'inactive', 'dinno'] as const).map((s) => STATUS_META[s].shape)
    expect(new Set(tableShapes).size).toBe(5)
  })

  it('Reserva DiNNo is never orange and reads apart from Reservada without color (the lock)', () => {
    expect(STATUS_META.dinno.tone).toBe('reserved')
    const { container } = render(<StatusChip status="dinno" />)
    expect(container.querySelectorAll('svg')).toHaveLength(2)
  })

  it('the four reservation states keep the words shared with the diner app', () => {
    const words = (['reservation-active', 'reservation-completed', 'reservation-expired', 'reservation-cancelled'] as const).map(
      (s) => STATUS_META[s].label,
    )
    expect(words).toEqual(['Activa', 'Cumplida', 'Vencida', 'Cancelada'])
  })
})
