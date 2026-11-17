// Number texts of the summary. Colombian pesos have no cents and use the dot for thousands.

/** `24000` → «$24.000». */
export function formatCop(amount: number): string {
  const digits = String(Math.round(Math.abs(amount))).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${amount < 0 ? '-' : ''}$${digits}`
}

/** `3.2` → «3,2» (comma decimal, up to 2 decimals, no trailing zeros). */
export function formatDecimal(value: number): string {
  return String(Math.round(value * 100) / 100).replace('.', ',')
}

/** An hour 0–23 as in the dashboard: «1:00 a. m.», «7:00 p. m.». */
export function formatHour(hour: number): string {
  const suffix = hour < 12 ? 'a. m.' : 'p. m.'
  const twelve = hour % 12 === 0 ? 12 : hour % 12
  return `${twelve}:00 ${suffix}`
}

const SHORT_MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'] as const

/**
 * A moment (ISO 8601 UTC) as Bogotá shows it, whatever the device's time zone: «30 sept · 7:30 p. m.». The reports are
 * counted in Bogotá days, so the table of check-ins has to be read in that clock too.
 */
export function formatBogotaDateTime(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota',
    day: 'numeric',
    month: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso))
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value)
  const hour = get('hour')
  const suffix = hour < 12 ? 'a. m.' : 'p. m.'
  const twelve = hour % 12 === 0 ? 12 : hour % 12
  return `${get('day')} ${SHORT_MONTHS[get('month') - 1]} · ${twelve}:${String(get('minute')).padStart(2, '0')} ${suffix}`
}

/** Days of the week as the API numbers them: 1 = Monday … 7 = Sunday. */
export const WEEKDAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const

const LONG_MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'] as const

/** `'2026-11-08'` → «8 de noviembre». */
export function formatDayMonth(day: string): string {
  const [, month, date] = day.split('-').map(Number)
  return `${date} de ${LONG_MONTHS[month - 1]}`
}

/** `'2026-11-08'` → «Domingo 8 de noviembre» (the weekday of that Bogotá day, whatever the device's zone). */
export function formatLongDay(day: string): string {
  const [year, month, date] = day.split('-').map(Number)
  const weekday = WEEKDAY_NAMES[(new Date(Date.UTC(year, month - 1, date)).getUTCDay() + 6) % 7]
  return `${weekday} ${formatDayMonth(day)}`
}

/** A moment (ISO 8601 UTC) as Bogotá clock: «11:56 a. m.». */
export function formatBogotaTime(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Bogota', hour: 'numeric', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(iso))
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value)
  const hour = get('hour')
  return `${hour % 12 === 0 ? 12 : hour % 12}:${String(get('minute')).padStart(2, '0')} ${hour < 12 ? 'a. m.' : 'p. m.'}`
}
