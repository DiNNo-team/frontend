import { formatDayMonth, formatDecimal, formatHour } from '@/features/summary/format'
import { getApiErrorMessage } from '@/lib/api-client'
import type { ReliabilityLevel } from './types'

// Texts of «Informe de la semana» (CLAUDE.md §12.16 of the backend). Everything the screen says is here; backend `message`s
// are never shown. The rates are over RESOLVED reservations (completed + cancelled + expired), not over created ones like
// «Resumen», so every rate text says «de las resueltas»: otherwise the two screens would seem to contradict each other.

const count = (value: number, one: string, many: string) => `${value} ${value === 1 ? one : many}`

/** ISO day 1 = Monday … 7 = Sunday, in lower case for the middle of a sentence. */
const DAY_NAMES = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'] as const

export function dayName(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek - 1] ?? ''
}

export const INSIGHTS_TEXT = {
  title: 'Informe de la semana',
  description: 'Tus últimos 7 días con DiNNo, hoy incluido, y qué puedes mejorar.',
  refresh: 'Actualizar informe',
  refreshing: 'Generando…',
  retry: 'Intentar de nuevo',
  loading: 'Cargando tu informe',
  loadError: 'No pudimos cargar tu informe. Revisa tu conexión e intenta de nuevo.',
  refreshError: 'No pudimos actualizar tu informe. Sigues viendo el anterior.',

  // Who wrote it (always visible: the text is generated automatically, §12.16)
  generatedWithAi: 'Generado con IA',
  generatedAutomatically: 'Generado automáticamente',
  generatedJustNow: 'hace un momento',
  generatedMinutesAgo: (minutes: number) => `hace ${minutes} min`,
  generatedHoursAgo: (hours: number) => `hace ${count(hours, 'hora', 'horas')}`,

  // Empty: no reservations this week nor the one before
  emptyTitle: 'Aún no tienes reservas en los últimos 7 días',
  emptyDescription: 'Cuando los comensales reserven con DiNNo, aquí verás cómo te fue y qué puedes mejorar.',

  // Not enough data yet
  insufficientTitle: 'Aún no hay suficientes reservas para tu informe',
  insufficientMissing: (missing: number) =>
    `Te ${missing === 1 ? 'falta' : 'faltan'} ${count(missing, 'reserva resuelta', 'reservas resueltas')} para ver tus tasas, la confiabilidad y las recomendaciones.`,
  insufficientProgress: (resolved: number, minResolved: number) => `Llevas ${resolved} de ${minResolved} reservas resueltas`,
  resolvedHelp: 'Una reserva resuelta es la que terminó con check-in, se canceló o venció sin check-in.',

  // Headline: check-in rate
  checkInRateLabel: 'de las reservas resueltas terminó en check-in',
  noShowRateLabel: 'de las reservas resueltas venció sin check-in',
  cancellationRateLabel: 'de las reservas resueltas se canceló',
  completedOfResolved: (completed: number, resolved: number) => `${completed} de ${count(resolved, 'reserva resuelta', 'reservas resueltas')}`,
  deltaUp: (points: number) => `Subió ${count(points, 'punto', 'puntos')} frente a la semana anterior`,
  deltaDown: (points: number) => `Bajó ${count(Math.abs(points), 'punto', 'puntos')} frente a la semana anterior`,
  deltaSame: 'Igual que la semana anterior',
  deltaNone: 'La semana anterior no tuvo suficientes reservas para comparar',
  medianToCheckIn: (minutes: number) => `Los comensales llegan en ${formatDecimal(minutes)} min (mediana)`,
  averagePartySize: (people: number) => `${formatDecimal(people)} personas por reserva en promedio`,
  reservationsCreated: (created: number) => count(created, 'reserva creada', 'reservas creadas'),
  activeNow: (active: number) => `${count(active, 'reserva sigue activa', 'reservas siguen activas')} y aún no cuenta`,

  // Reliability
  reliabilityTitle: 'Confiabilidad de tu disponibilidad',
  reliabilityHelp:
    'Mide si los comensales pueden confiar en las mesas que muestras: sube cuando validas el código al recibir a cada comensal y cuando actualizas tus mesas a mano.',
  reliabilityLevel: { high: 'Alta', medium: 'Media', low: 'Baja' } satisfies Record<ReliabilityLevel, string>,

  // The week, day by day
  weekTitle: 'La semana día a día',
  today: 'Hoy',
  legendCompleted: 'Con check-in',
  legendCancelled: 'Canceladas',
  legendExpired: 'Vencieron sin check-in',
  legendManual: 'Actualizaste tus mesas a mano',
  legendNoManual: 'Sin cambios de mesas a mano',
  daysWithManualUpdates: (days: number, total: number) => `Actualizaste tus mesas a mano en ${days} de ${total} días`,
  topSlot: (dayOfWeek: number, hour: number, reservations: number) =>
    `Tu franja con más reservas: ${dayName(dayOfWeek)} a las ${formatHour(hour)} (${count(reservations, 'reserva', 'reservas')})`,
  noTopSlot: 'Aún no hay una franja con más reservas',
  dayDetail: (created: number, completed: number, cancelled: number, expired: number, manual: number) =>
    `${count(created, 'reserva', 'reservas')}: ${completed} con check-in, ${count(cancelled, 'cancelada', 'canceladas')}, ` +
    `${expired} ${expired === 1 ? 'venció' : 'vencieron'} sin check-in · ${count(manual, 'cambio', 'cambios')} de mesas a mano`,

  // Recommendations
  recommendationsTitle: 'Qué hacer esta semana',
  aiDisclaimer: 'Lo redactó la IA solo con tus números, sin datos de tus comensales. Revísalo antes de actuar.',
  /** The same words for every `llm_*` reason: the person does not need to know which one it was. */
  fallbackNotice: 'Recomendaciones básicas: el asistente de IA no estuvo disponible',
  updatedAgo: (ago: string) => `Actualizado ${ago}`,

  // Page
  periodRange: (from: string, to: string) => {
    const [fromDay, fromMonth] = [Number(from.slice(8)), from.slice(5, 7)]
    return fromMonth === to.slice(5, 7) ? `Del ${fromDay} al ${formatDayMonth(to)} · hoy incluido` : `Del ${formatDayMonth(from)} al ${formatDayMonth(to)} · hoy incluido`
  },
  errorTitle: 'No pudimos cargar tu informe',
  rateLimitedRefresh: 'Hiciste muchas solicitudes seguidas. Espera un momento y vuelve a actualizar. Sigues viendo el informe anterior.',

  // Headline
  checkInKicker: 'Check-in',
  tilesLabel: 'Más datos de la semana',
  reservationsCreatedLabel: 'reservas creadas',
  completedLabel: 'con check-in',
  cancelledLabel: 'canceladas',
  expiredLabel: 'vencieron sin check-in',
  averagePartySizeLabel: 'personas por reserva',
  noData: 'Sin datos',

  // Reliability
  reliabilityHelpLabel: 'Qué significa',
  reliabilityNow: (level: string) => `Confiabilidad: ${level}`,

  // Week chart
  legendActive: 'Siguen activas',
  columnReservations: 'Reservas creadas',
  columnManual: 'Mesas a mano',
  weekChartLabel: 'Reservas de cada día de la semana, por cómo terminaron',
  chartHeaders: ['Día', 'Reservas y cambios de mesas'] as [string, string],
  shortDay: (date: string, isToday: boolean) => {
    if (isToday) return 'Hoy'
    const [year, month, day] = date.split('-').map(Number)
    const weekday = SHORT_DAYS[(new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7]
    return `${weekday} ${day}`
  },
} as const

const SHORT_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const

/** The text of any error of the report: account texts for 401/403, the 429 of the kit, or the load error. */
export function describeInsightsError(error: unknown): string {
  return getApiErrorMessage(error, INSIGHTS_TEXT.loadError)
}
