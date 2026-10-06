// Weekly hours value shared by HoursEditor and the restaurant form (onboarding and edit).
// Proposed format: to be confirmed by Santiago, owner of the restaurant model.

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

/**
 * Times are `"HH:mm"` in 24 h. A closing time earlier than the opening means the next day.
 * `isOpen24h` (backend `restaurant_schedules.is_open_24h`): open all day; `opensAt`/`closesAt`
 * are kept only so switching back restores the previous hours.
 */
export interface DayHours {
  day: DayOfWeek
  isOpen: boolean
  isOpen24h: boolean
  opensAt: string
  closesAt: string
}

/** Text of the "open all day" choice, first option of the opening hour picker. */
export const OPEN_24H_LABEL = 'Abierto 24 horas'

export type WeeklyHours = DayHours[]

export const DAYS_OF_WEEK: readonly DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export const DAY_LABELS: Record<DayOfWeek, { short: string; long: string }> = {
  mon: { short: 'Lun', long: 'Lunes' },
  tue: { short: 'Mar', long: 'Martes' },
  wed: { short: 'Mié', long: 'Miércoles' },
  thu: { short: 'Jue', long: 'Jueves' },
  fri: { short: 'Vie', long: 'Viernes' },
  sat: { short: 'Sáb', long: 'Sábado' },
  sun: { short: 'Dom', long: 'Domingo' },
}

/** `true` when the day closes after midnight ("(día siguiente)"). */
export function closesNextDay({ isOpen, isOpen24h, opensAt, closesAt }: DayHours): boolean {
  return isOpen && !isOpen24h && closesAt < opensAt
}

/** Copies Monday (open flags and times) to every other day. */
export function copyMondayToAll(hours: WeeklyHours): WeeklyHours {
  const monday = hours.find((entry) => entry.day === 'mon')
  if (!monday) return hours
  return hours.map((entry) => ({ ...monday, day: entry.day }))
}
