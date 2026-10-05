import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import { HoursEditor } from './HoursEditor'
import { closesNextDay, copyMondayToAll, type WeeklyHours } from './hours'

const HOURS: WeeklyHours = [
  { day: 'mon', isOpen: true, opensAt: '12:00', closesAt: '22:00' },
  { day: 'tue', isOpen: true, opensAt: '09:00', closesAt: '17:00' },
  { day: 'wed', isOpen: true, opensAt: '09:00', closesAt: '17:00' },
  { day: 'thu', isOpen: true, opensAt: '09:00', closesAt: '17:00' },
  { day: 'fri', isOpen: true, opensAt: '12:00', closesAt: '01:00' },
  { day: 'sat', isOpen: true, opensAt: '09:00', closesAt: '17:00' },
  { day: 'sun', isOpen: false, opensAt: '12:00', closesAt: '22:00' },
]

function Harness({ errors }: { errors?: Partial<Record<'mon' | 'sat', string>> }) {
  const [value, setValue] = useState(HOURS)
  return <HoursEditor value={value} onChange={setValue} errors={errors} />
}

describe('HoursEditor', () => {
  it('renders seven rows with the 12 h times and "(día siguiente)" when closing after midnight', () => {
    renderWithProviders(<Harness />)
    expect(screen.getAllByRole('listitem')).toHaveLength(7)
    const friday = screen.getAllByRole('listitem')[4]
    expect(within(friday).getByText('12:00 p. m.')).toBeInTheDocument()
    expect(within(friday).getByText('1:00 a. m.')).toBeInTheDocument()
    expect(within(friday).getByText('(día siguiente)')).toBeInTheDocument()
    expect(within(screen.getAllByRole('listitem')[0]).queryByText('(día siguiente)')).not.toBeInTheDocument()
  })

  it('shows "Cerrado todo el día" for closed days and toggles with the switch', async () => {
    const { user } = renderWithProviders(<Harness />)
    expect(screen.getByText('Cerrado todo el día')).toBeInTheDocument()
    const sunday = screen.getByRole('switch', { name: 'Domingo' })
    expect(sunday).toHaveAccessibleDescription('Cerrado')
    await user.click(sunday)
    expect(sunday).toHaveAttribute('aria-checked', 'true')
    expect(sunday).toHaveAccessibleDescription('Abierto')
    expect(screen.queryByText('Cerrado todo el día')).not.toBeInTheDocument()
  })

  it('"Copiar a todos los días" copies Monday to every day', async () => {
    const { user } = renderWithProviders(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Copiar a todos los días' }))
    expect(screen.getAllByText('12:00 p. m.')).toHaveLength(7)
    expect(screen.getAllByText('10:00 p. m.')).toHaveLength(7)
    expect(screen.queryByText('Cerrado todo el día')).not.toBeInTheDocument()
  })

  it('links a row error to its hour pickers', () => {
    renderWithProviders(<Harness errors={{ sat: 'Revisa el horario del sábado' }} />)
    const opening = screen.getByRole('combobox', { name: 'Apertura del sábado' })
    expect(opening).toHaveAttribute('aria-invalid', 'true')
    expect(opening).toHaveAccessibleDescription('Revisa el horario del sábado')
  })

  it('helpers', () => {
    expect(closesNextDay({ day: 'fri', isOpen: true, opensAt: '12:00', closesAt: '01:00' })).toBe(true)
    expect(closesNextDay({ day: 'fri', isOpen: false, opensAt: '12:00', closesAt: '01:00' })).toBe(false)
    expect(copyMondayToAll(HOURS).every((d) => d.opensAt === '12:00' && d.isOpen)).toBe(true)
    expect(copyMondayToAll(HOURS).map((d) => d.day)).toEqual(HOURS.map((d) => d.day))
  })
})
