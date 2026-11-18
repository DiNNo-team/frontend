import { bogotaToday } from '@/features/summary/period'

// Months of the administrator's panel (docs/admin-panel-contract.md §0): `AAAA-MM` in Bogotá time, from 2026-01 to the current one.

export const FIRST_MONTH = '2026-01'

const MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/
const NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

/** The month a moment belongs to in Bogotá (UTC-5, no daylight saving), whatever the device's time zone. */
export function bogotaMonthOf(moment: string | Date = new Date()): string {
  return bogotaToday(typeof moment === 'string' ? new Date(moment) : moment).slice(0, 7)
}

/** The day of the month (1–31) of a moment in Bogotá. */
export function bogotaDayOfMonth(moment: string | Date): number {
  return Number(bogotaToday(typeof moment === 'string' ? new Date(moment) : moment).slice(8, 10))
}

function parts(month: string): { year: number; index: number } {
  const match = MONTH.exec(month)
  return { year: Number(match?.[1]), index: Number(match?.[2]) - 1 }
}

/** `month` if it is a valid month between the first one and `current`; `fallback` otherwise (a wrong link never breaks the screen). */
export function parseMonth(value: string | null, current: string, fallback: string = current): string {
  return value !== null && MONTH.test(value) && value >= FIRST_MONTH && value <= current ? value : fallback
}

export function shiftMonth(month: string, delta: number): string {
  const { year, index } = parts(month)
  const total = year * 12 + index + delta
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`
}

/** The `count` months that end at `month`, oldest first. */
export function lastMonths(month: string, count: number): string[] {
  return Array.from({ length: count }, (_, position) => shiftMonth(month, position - count + 1))
}

export function daysInMonth(month: string): number {
  const { year, index } = parts(month)
  return new Date(Date.UTC(year, index + 1, 0)).getUTCDate()
}

/** «noviembre» */
export function monthName(month: string): string {
  return NAMES[parts(month).index]
}

/** «noviembre de 2026» */
export function monthTitle(month: string): string {
  return `${monthName(month)} de ${parts(month).year}`
}

/** «Nov» */
export function monthShort(month: string): string {
  return SHORT[parts(month).index]
}

/** «Noviembre de Casa 72» for the toasts: the month and the restaurant, capitalised like a sentence. */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** The days the metrics ask for: the whole month, or up to today while it is still running. */
export function monthPeriod(month: string, today: string = bogotaToday()): { from: string; to: string } {
  const last = `${month}-${String(daysInMonth(month)).padStart(2, '0')}`
  return { from: `${month}-01`, to: today.slice(0, 7) === month && today < last ? today : last }
}

/** Day of the week of a `AAAA-MM-DD` day, 1 = Monday … 7 = Sunday (the API's numbering). */
export function weekdayOf(day: string): number {
  const date = new Date(`${day}T00:00:00Z`)
  return ((date.getUTCDay() + 6) % 7) + 1
}
