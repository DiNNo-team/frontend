import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { heatGrid } from '../data'
import { HourHeatmap } from './HourHeatmap'
import { MonthBars } from './MonthBars'

// The administrator's MonthBars and «Reservas por hora» are shared with the restaurant's summary (Comensales por mes, Horas de
// mayor demanda). These tests pin what the administrator sees: the same words, roles and behavior as before the sharing.

const BARS = [
  { month: '2026-09', value: 90_000 },
  { month: '2026-10', value: 374_000 },
  { month: '2026-11', value: 12_000 },
]

describe('MonthBars (administrator, as before)', () => {
  it('is a group of buttons, one per month, with the amount and «en curso» in its label and aria-pressed on the chosen one', () => {
    render(<MonthBars bars={BARS} selected="2026-10" current="2026-11" onSelect={() => {}} />)
    expect(screen.getByRole('group', { name: 'Meses' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'septiembre: $ 90.000' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'octubre: $ 374.000' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'noviembre: $ 12.000, en curso' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('draws the month in progress striped while it is not the chosen one, and says so beside its name', () => {
    const { container } = render(<MonthBars bars={BARS} selected="2026-10" current="2026-11" onSelect={() => {}} />)
    const bars = Array.from(container.querySelectorAll('button > span > span'))
    expect(bars.filter((bar) => bar.className.includes('hatch-busy'))).toHaveLength(1)
    expect(screen.getByText(/en curso/, { selector: 'span span' })).toBeInTheDocument()
    expect(container.querySelector('.bg-accent')).not.toBeNull()
  })

  it('selects the month that is pressed', async () => {
    const onSelect = vi.fn()
    render(<MonthBars bars={BARS} selected="2026-10" current="2026-11" onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button', { name: 'septiembre: $ 90.000' }))
    expect(onSelect).toHaveBeenCalledWith('2026-09')
  })

  it('without onSelect (the restaurant) it is a read-only list, with no buttons', () => {
    render(<MonthBars bars={BARS} current="2026-11" formatValue={String} describe={(month, value) => `${month}: ${value}`} groupLabel="Comensales" />)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(screen.getByRole('list', { name: 'Comensales' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })
})

describe('HourHeatmap (administrator, as before)', () => {
  const cells = Array.from({ length: 168 }, (_, index) => ({ dayOfWeek: Math.floor(index / 24) + 1, hour: index % 24, reservations: index === 4 * 24 + 13 ? 6 : 0 }))

  it('keeps its title, the map as one tab stop with the arrows hint, and the table behind it', () => {
    render(<HourHeatmap grid={heatGrid(cells)} summary="Almuerzo y cena, como se espera" />)
    expect(screen.getByRole('heading', { name: 'Reservas por hora' })).toBeInTheDocument()
    const map = screen.getByRole('img', { name: /Reservas creadas, por día de la semana y hora \(de 7 a\. m\. a 10 p\. m\.\)\. Usa las flechas para recorrer las horas\./ })
    expect(map).toHaveAttribute('tabindex', '0')
    expect(screen.getByText('Almuerzo y cena, como se espera')).toBeInTheDocument()
    expect(screen.getByRole('table', { name: /Reservas por hora/ })).toBeInTheDocument()
  })

  it('reads the cell under the keyboard in the line above, as before', async () => {
    render(<HourHeatmap grid={heatGrid(cells)} summary="Almuerzo y cena, como se espera" />)
    screen.getByRole('img').focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByText('Lunes, 8:00 a. m. · 0 reservas')).toBeInTheDocument()
  })

  it('says so when there are no reservations', () => {
    render(<HourHeatmap grid={heatGrid([])} summary={null} />)
    expect(screen.getByText('Aún no hay reservas este mes')).toBeInTheDocument()
  })
})
