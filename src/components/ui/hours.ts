// Weekly hours value shared by HoursEditor and the restaurant form (onboarding and edit).
// Proposed format: to be confirmed by Santiago, owner of the restaurant model.

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

/** Times are `"HH:mm"` in 24 h. A closing time earlier than the opening means the next day. */
export interface DayHours {
  day: DayOfWeek
  isOpen: boolean
  opensAt: string
  closesAt: string
}

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
export function closesNextDay({ isOpen, opensAt, closesAt }: DayHours): boolean {
  return isOpen && closesAt < opensAt
}

/** Copies Monday (open flag and times) to every other day. */
export function copyMondayToAll(hours: WeeklyHours): WeeklyHours {
  const monday = hours.find((entry) => entry.day === 'mon')
  if (!monday) return hours
  return hours.map((entry) => ({ ...monday, day: entry.day }))
}
