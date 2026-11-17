import { ApiError, getApiErrorMessage } from '@/lib/api-client'

// Texts of the administrator's summary. Every error is shown with the manual's words, never the backend's.

export const OVERVIEW_TEXT = {
  title: 'Resumen',
  description: 'Lo que DiNNo ha cobrado, cómo se mueven las reservas y qué restaurantes aportan más.',
  retry: 'Intentar de nuevo',
  loadError: 'No pudimos cargar esta información. Revisa tu conexión e intenta de nuevo.',
  loadingFirst: 'Cargando el resumen. La primera vez puede tardar un poco.',
  basis: 'Según la fecha en que se hizo la reserva',
  // Hero
  heroKicker: (month: string) => `Ingresos de ${month}`,
  inProgress: 'En curso',
  monthClosed: 'Mes cerrado',
  checkIns: (count: number) => `${count} ${count === 1 ? 'check-in' : 'check-ins'}`,
  dayOf: (day: number, days: number) => `día ${day} de ${days}`,
  previousClosed: (month: string, amount: string) => `${month} cerró en ${amount}`,
  versus: (change: string, month: string) => `${change} frente a ${month}`,
  collectedLabel: 'Cobrado',
  pendingLabel: 'Pendiente',
  inProgressLabel: 'En curso',
  inProgressNote: 'se cobra al cerrar el mes',
  pendingClosedLabel: 'Pendiente de meses cerrados',
  restaurantsCount: (count: number) => `${count} ${count === 1 ? 'restaurante' : 'restaurantes'}`,
  allPaid: 'Todo al día',
  nothingToBill: 'Sin check-ins este mes',
  billingBarLabel: (paid: string, pending: string) => `Cobrado ${paid}, pendiente ${pending}`,
  // Monthly bars
  monthsTitle: 'Ingresos por mes',
  monthsHint: 'Toca un mes para ver su detalle',
  monthButton: (month: string, amount: string, inProgress: boolean) => `${month}: ${amount}${inProgress ? ', en curso' : ''}`,
  monthsGroup: 'Meses',
  emptyMonths: 'Aún no hay check-ins en estos meses',
  // Daily
  dailyTitle: (month: string) => `Reservas por día · ${month}`,
  dailyBest: (label: string, count: number) => `${label} · ${count} ${count === 1 ? 'reserva' : 'reservas'} · mejor día`,
  dailyOne: (label: string, count: number) => `${label} · ${count} ${count === 1 ? 'reserva' : 'reservas'}`,
  dailyFuture: (label: string) => `${label} · todavía no llega`,
  dailyKeys: 'Usa las flechas para recorrer los días.',
  legendBest: 'Mejor día',
  legendAbove: (average: string) => `Sobre el promedio (${average} por día)`,
  legendBelow: 'Bajo el promedio',
  legendFuture: 'Días que faltan',
  dailyEmpty: 'Aún no hay reservas este mes',
  dailyEmptyDescription: 'Cuando un comensal reserve, el día aparecerá aquí.',
  // Weekdays
  weekdaysTitle: 'Días de la semana',
  weekdaysDescription: (month: string) => `Reservas de ${month}, de más a menos`,
  average: (value: string) => `prom. ${value}`,
  // Flow
  flowTitle: 'De la reserva a la mesa',
  conversion: 'Conversión',
  created: (count: number) => `${count} ${count === 1 ? 'reserva creada' : 'reservas creadas'}`,
  arrived: (count: number) => `${count} ${count === 1 ? 'llegó' : 'llegaron'}`,
  legendArrived: 'Llegaron (se cobra)',
  legendExpired: 'Se vencieron',
  legendCancelled: 'Se cancelaron',
  flowNoData: 'Sin datos',
  flowEmpty: 'Aún no hay reservas este mes',
  // Pulse
  pulseTitle: 'Pulso por hora',
  pulseHint: 'Reservas creadas, por día de la semana y hora (de 7 a. m. a 10 p. m.)',
  pulseKeys: 'Usa las flechas para recorrer las horas.',
  pulseCell: (day: string, hour: string, count: number) => `${day}, ${hour} · ${count} ${count === 1 ? 'reserva' : 'reservas'}`,
  pulseEmpty: 'Aún no hay reservas este mes',
  // Restaurants
  restaurantsTitle: (month: string) => `Restaurantes en ${month}`,
  restaurantsHint: 'Línea: check-ins de los últimos 6 meses · el punto es el mes elegido',
  seeDetail: 'Ver detalle',
  seeDetailOf: (name: string) => `Ver el cobro de ${name}`,
  others: (count: number) => `Otros ${count} ${count === 1 ? 'restaurante' : 'restaurantes'}`,
  restaurantsEmpty: 'Aún no hay check-ins este mes',
  restaurantsEmptyDescription: 'Cuando un restaurante reciba comensales, aparecerá aquí con su cobro.',
  suspended: 'Suspendido',
} as const

/** The text of a block that failed: the manual's words for access, network and limit errors, the generic one otherwise. */
export function describeBlockError(error: unknown): string {
  if (error instanceof ApiError && (error.isNetworkError || error.status === 401 || error.status === 403 || error.status === 429)) {
    return getApiErrorMessage(error)
  }
  return OVERVIEW_TEXT.loadError
}

/** A 401, a 403 or a 429 will not change by asking again right away: no «Intentar de nuevo» is offered for the first two. */
export function canRetry(error: unknown): boolean {
  return !(error instanceof ApiError && (error.status === 401 || error.status === 403))
}
