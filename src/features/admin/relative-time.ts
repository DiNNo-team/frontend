// «hace 2 días»: how long ago a request arrived, in words. Hand-written like `@/lib/format`: Intl output differs by browser.

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const MONTH = 30 * DAY

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`
}

/** `formatSince('2026-11-13T…', now)` → «hace 2 días». Under a minute: «hace un momento». A future date counts as now. */
export function formatSince(value: string | Date, now: Date = new Date()): string {
  const elapsed = Math.max(0, now.getTime() - new Date(value).getTime())
  if (elapsed < MINUTE) return 'hace un momento'
  if (elapsed < HOUR) return `hace ${plural(Math.floor(elapsed / MINUTE), 'minuto', 'minutos')}`
  if (elapsed < DAY) return `hace ${plural(Math.floor(elapsed / HOUR), 'hora', 'horas')}`
  if (elapsed < MONTH) return `hace ${plural(Math.floor(elapsed / DAY), 'día', 'días')}`
  return `hace ${plural(Math.floor(elapsed / MONTH), 'mes', 'meses')}`
}
