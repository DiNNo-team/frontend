import type { PeriodRange } from './types'

// Periods of the reports. Days are Bogotá days (`YYYY-MM-DD`), range inclusive, at most 366 days, never in the future.

export const MAX_PERIOD_DAYS = 366

export const PERIOD_MESSAGES = {
  fromRequired: 'Elige la fecha de inicio.',
  toRequired: 'Elige la fecha final.',
  toBeforeFrom: 'La fecha final no puede ser anterior a la de inicio.',
  toInFuture: 'La fecha final no puede ser futura. Elige hoy o un día anterior.',
  tooLong: `El periodo puede durar máximo ${MAX_PERIOD_DAYS} días. Acórtalo e intenta de nuevo.`,
} as const

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const MS_PER_DAY = 86_400_000

function toUtc(day: string): Date | null {
  const match = DAY.exec(day)
  if (!match) return null
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== day ? null : date
}

function toDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Today in Bogotá (UTC-5, no daylight saving), as `YYYY-MM-DD`, whatever the device's time zone. */
export function bogotaToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

export function thisMonth(today: string): PeriodRange {
  return { from: `${today.slice(0, 8)}01`, to: today }
}

export function previousMonth(today: string): PeriodRange {
  const first = toUtc(`${today.slice(0, 8)}01`) as Date
  const lastOfPrevious = toDay(new Date(first.getTime() - MS_PER_DAY))
  return { from: `${lastOfPrevious.slice(0, 8)}01`, to: lastOfPrevious }
}

/** Days in the range, both ends included (0 if a date is not valid). */
export function countDays({ from, to }: PeriodRange): number {
  const start = toUtc(from)
  const end = toUtc(to)
  return start && end ? Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1 : 0
}

/** The text of the first rule the range breaks, or `undefined` when the backend will accept it. */
export function validatePeriod({ from, to }: PeriodRange, today: string): string | undefined {
  if (!toUtc(from)) return PERIOD_MESSAGES.fromRequired
  if (!toUtc(to)) return PERIOD_MESSAGES.toRequired
  if (to < from) return PERIOD_MESSAGES.toBeforeFrom
  if (to > today) return PERIOD_MESSAGES.toInFuture
  if (countDays({ from, to }) > MAX_PERIOD_DAYS) return PERIOD_MESSAGES.tooLong
  return undefined
}

function dayText(day: string, { month, year }: { month: boolean; year: boolean }): string {
  const date = toUtc(day) as Date
  const parts = [String(date.getUTCDate())]
  if (month) parts.push(`de ${MONTHS[date.getUTCMonth()]}`)
  if (year) parts.push(`de ${date.getUTCFullYear()}`)
  return parts.join(' ')
}

/** The period in words: «15 de noviembre de 2026», «Del 1 al 15 de noviembre de 2026», «Del 28 de octubre al 5 de noviembre de 2026». */
export function describePeriod({ from, to }: PeriodRange): string {
  if (from === to) return dayText(from, { month: true, year: true })
  const sameMonth = from.slice(0, 7) === to.slice(0, 7)
  const sameYear = from.slice(0, 4) === to.slice(0, 4)
  const start = dayText(from, { month: !sameMonth, year: !sameYear })
  return `Del ${start} al ${dayText(to, { month: true, year: true })}`
}
