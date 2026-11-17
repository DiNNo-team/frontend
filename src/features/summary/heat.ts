// The weekday × hour grid of reservations: the same one draws the administrator's «Reservas por hora» and the restaurant's
// «Horas de mayor demanda». Pure functions over `byDayHour` (168 cells, index = (day - 1) × 24 + hour).

interface DayHourCell {
  dayOfWeek: number
  hour: number
  reservations: number
}

export const HEAT_HOURS = { from: 7, to: 22 } as const
export const HEAT_LEVELS = 5

/** The position of a weekday (1 = Monday) and hour in `byDayHour`. */
export function heatIndex(dayOfWeek: number, hour: number): number {
  return (dayOfWeek - 1) * 24 + hour
}

export interface HeatCell {
  dayOfWeek: number
  hour: number
  reservations: number
  /** 0 = none; 1 to 5 from the quietest to the busiest of the grid shown. */
  level: number
}

/** The grid: 7 days × the hours from 7 a. m. to 10 p. m., each with its tone (0 to 5). */
export function heatGrid(byDayHour: DayHourCell[]): HeatCell[][] {
  const hours = Array.from({ length: HEAT_HOURS.to - HEAT_HOURS.from + 1 }, (_, offset) => HEAT_HOURS.from + offset)
  const max = Math.max(0, ...hours.flatMap((hour) => Array.from({ length: 7 }, (_, day) => byDayHour[heatIndex(day + 1, hour)]?.reservations ?? 0)))
  return Array.from({ length: 7 }, (_, day) =>
    hours.map((hour) => {
      const reservations = byDayHour[heatIndex(day + 1, hour)]?.reservations ?? 0
      const level = reservations === 0 || max === 0 ? 0 : Math.max(1, Math.ceil((reservations / max) * HEAT_LEVELS))
      return { dayOfWeek: day + 1, hour, reservations, level }
    }),
  )
}

/** Six tones, from none to the busiest; the busiest are orange (the one accent of the chart). Also the tones of the calendar. */
export const HEAT_LEVEL_CLASS = ['bg-surface-2', 'bg-fg/15', 'bg-fg/35', 'bg-accent/45', 'bg-accent/75', 'bg-accent'] as const

/** The cell under the pointer or the keyboard: `[row, column]` of the grid, or none. */
export type HeatCursor = [number, number] | null
