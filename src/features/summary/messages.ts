import { ApiError, getApiErrorMessage, isAccessError } from '@/lib/api-client'
import { formatCop, formatDecimal } from './format'

// Texts of «Resumen» (CLAUDE.md §12.12 and docs/restaurant-summary-contract.md). Everything the screen says is here; backend
// `message`s are never shown. The restaurant PAYS DiNNo: nothing here says «cobrar» (the administrator's panel does).

const count = (value: number, one: string, many: string) => `${value} ${value === 1 ? one : many}`

export const SUMMARY_TEXT = {
  title: 'Resumen',
  description: 'Reservas, comensales y pago del periodo.',
  periodLabel: 'Periodo',
  presets: { month: 'Este mes', previous: 'Mes anterior', custom: 'Personalizado' },
  from: 'Desde',
  to: 'Hasta',
  apply: 'Ver periodo',
  updating: 'Actualizando…',
  loadError: 'No pudimos cargar el resumen. Revisa tu conexión e intenta de nuevo.',
  retry: 'Intentar de nuevo',
  noData: 'Sin datos',
  invalidPeriod: 'Revisa las fechas del periodo.',
  loading: 'Cargando el resumen',
  // Bloque 1: comensales y pago
  guestsKicker: 'Comensales con reserva DiNNo',
  guestsUnit: (guests: number) => (guests === 1 ? 'comensal' : 'comensales'),
  checkInsCount: (checkIns: number) => count(checkIns, 'check-in', 'check-ins'),
  ofReservations: (created: number) => `de ${count(created, 'reserva', 'reservas')}`,
  versus: (label: string) => `vs. ${label}`,
  changeUp: (percent: number) => `Subió ${percent} %`,
  changeDown: (percent: number) => `Bajó ${Math.abs(percent)} %`,
  changeSame: 'Sin cambio',
  reservationsCreated: 'reservas creadas',
  arrivalRate: 'tasa de llegada',
  partyPerReservation: 'personas por reserva',
  paymentKicker: 'Total a pagar a DiNNo',
  paymentFormula: (guests: number, fee: number) => `${count(guests, 'comensal', 'comensales')} × ${formatCop(fee)} por comensal`,
  paymentMixedFees: (checkIns: number) => `${count(checkIns, 'check-in', 'check-ins')}, cada uno con el monto de su momento`,
  feePerGuest: 'Tarifa por comensal',
  /** «2 personas × $1.500»: shown beside the amount of a check-in charged per guest. */
  feeFormula: (people: number, fee: number) => `${count(people, 'persona', 'personas')} × ${formatCop(fee)}`,
  paymentNone: 'Todavía no hay check-ins en este periodo',
  costPerGuest: 'Costo por comensal',
  periodClose: 'Cierre del periodo',
  previousMonthPayment: (month: string, amount: number) => `${month} · ${formatCop(amount)}`,
  previousMonthNone: (month: string) => `${month} · sin check-ins`,
  paymentNote: 'Pagas por cada comensal que llega: las personas de la reserva por la tarifa por comensal, al validar el check-in. Las reservas canceladas o vencidas no tienen costo.',
  // Bloque 2: calendario y detalle del día
  calendarHint: 'Selecciona un día para ver su detalle',
  calendarDayOf: (day: number, days: number) => `Día ${day} de ${days}`,
  calendarWeekdays: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  calendarWeekdayNames: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
  calendarPrevious: 'Mes anterior del calendario',
  calendarNext: 'Mes siguiente del calendario',
  calendarLegendReservations: 'Reservas:',
  calendarLegendLess: 'menos',
  calendarLegendMore: 'más',
  calendarLegendCheckIns: 'Check-ins',
  calendarDay: (label: string, reservations: number, checkIns: number) =>
    `${label}, ${count(reservations, 'reserva', 'reservas')}, ${count(checkIns, 'check-in', 'check-ins')}`,
  calendarDayFuture: (label: string) => `${label}, todavía no llega`,
  calendarDayOutside: (label: string) => `${label}, fuera del periodo`,
  calendarShortReservations: (reservations: number) => `${reservations} res.`,
  dayTitle: 'Detalle del día',
  dayReservations: 'reservas creadas',
  dayGuests: 'comensales',
  dayCheckIns: 'check-ins',
  dayCancelledOrExpired: 'canceladas o vencidas',
  dayCheckInsTitle: 'Check-ins del día',
  dayCheckInsEmpty: 'Sin check-ins este día.',
  dayCheckInLine: (time: string, table: string) => `${time} · ${table}`,
  dayValue: 'Valor del día',
  dayLoadError: 'No pudimos cargar los check-ins de este día. Revisa tu conexión e intenta de nuevo.',
  dayNone: 'Elige un día del calendario para ver su detalle.',
  // Bloque 3: comensales por mes y estado de las reservas
  monthsTitle: 'Comensales por mes',
  monthsDescription: 'Últimos 6 meses',
  monthsGroup: 'Comensales de los últimos 6 meses',
  monthsNote: (month: string) => `${month} en curso (rayado).`,
  monthsBar: (month: string, guests: number, inProgress: boolean) => `${month}: ${count(guests, 'comensal', 'comensales')}${inProgress ? ', en curso' : ''}`,
  statusTitle: 'Estado de las reservas',
  statusDescription: (created: number) => `${count(created, 'reserva creada', 'reservas creadas')} en el periodo`,
  statusEmpty: 'Aún no hay reservas en este periodo',
  statusEmptyDescription: 'Cuando un comensal reserve, aquí verás cómo terminan.',
  statusArrived: 'Llegaron',
  statusNotArrived: 'No llegaron',
  statusCancelled: 'Canceladas',
  statusActive: (active: number) => `${count(active, 'reserva sigue activa', 'reservas siguen activas')} y todavía no cuenta${active === 1 ? '' : 'n'} en la barra.`,
  statusBarLabel: (arrived: number, notArrived: number, cancelled: number) =>
    `${count(arrived, 'llegó', 'llegaron')}, ${count(notArrived, 'no llegó', 'no llegaron')} y ${count(cancelled, 'cancelada', 'canceladas')}`,
  statusShareArrived: 'llegaron',
  statusShareCancelled: 'canceladas',
  statusShareNotArrived: 'no llegaron',
  statusHelpLabel: 'Cómo se calculan',
  statusHelpTitle: 'Cómo se calculan estos porcentajes',
  statusHelp: [
    'Las reservas se cuentan por el día en que se crearon, con el estado que tienen hoy.',
    'Llegaron: reservas con check-in validado, de todas las reservas creadas.',
    'Canceladas: reservas que el comensal canceló, de todas las reservas creadas.',
    'No llegaron: reservas vencidas, de todas las reservas creadas. Las activas todavía no cuentan.',
  ],
  // Bloque 4: horas de mayor demanda
  demandTitle: 'Horas de mayor demanda',
  demandDescription: 'Reservas creadas por día de la semana y hora',
  demandEmpty: 'Aún no hay reservas en este periodo',
  demandEmptyDescription: 'Cuando un comensal reserve, verás aquí en qué horas se concentra.',
  demandHint: 'Reservas creadas por día de la semana y hora, de 7 a. m. a 10 p. m.',
  demandKeys: 'Usa las flechas para recorrer las horas.',
  demandCell: (day: string, hour: string, reservations: number) => `${day}, ${hour} · ${count(reservations, 'reserva', 'reservas')}`,
  demandLegendLess: 'Menos',
  demandLegendMore: 'Más',
  peakTitle: 'Horas pico',
  peakValue: (reservations: number) => count(reservations, 'reserva', 'reservas'),
  peakEmpty: 'Todavía no hay horas pico en este periodo.',
  weekdaysTitle: 'Por día de la semana',
  chartTableHeaders: { day: 'Día', count: 'Reservas', state: 'Estado' },
  // Bloque 5: detalle del pago
  detailTitle: 'Detalle del pago',
  detailDescription: 'Cada check-in del periodo · Hora de Bogotá',
  detailCaption: 'Check-ins del periodo',
  columnWhen: 'Fecha y hora',
  columnTable: 'Mesa',
  columnParty: 'Personas',
  columnFee: 'Monto',
  detailEmpty: 'No hay check-ins en este periodo',
  detailEmptyDescription: 'Cuando valides el código de un comensal, aparecerá aquí.',
  detailLoadError: 'No pudimos cargar el detalle del pago. Revisa tu conexión e intenta de nuevo.',
  detailTotal: (checkIns: number, amount: number) => `Total del periodo: ${count(checkIns, 'check-in', 'check-ins')} · ${formatCop(amount)}`,
  seeAll: (total: number) => `Ver los ${total} check-ins`,
  seeLess: 'Ver menos',
  itemsLabel: 'check-ins',
  feeHelpLabel: 'Cómo se calcula',
  feeHelp:
    'El monto de un check-in es el número de personas de la reserva por la tarifa por comensal que había cuando se hizo. Cada check-in guarda su monto, así que el total de un periodo no cambia si la tarifa cambia después; los check-ins anteriores a la tarifa por comensal conservan su monto de entonces. Solo pagas cuando un comensal llega y validas su código: las cancelaciones y los vencimientos no tienen costo.',
} as const

/** The text for a report that could not load, by access or network; `fallback` otherwise. */
export function describeReportError(error: unknown, fallback: string): string {
  if (error instanceof ApiError && (error.isNetworkError || isAccessError(error))) return getApiErrorMessage(error)
  return fallback
}

/** «+44 %» / «-20 %» text of a change, with its words; `null` when there is nothing to compare. */
export function changeText(percent: number | null): string | null {
  if (percent === null) return null
  if (percent === 0) return SUMMARY_TEXT.changeSame
  return percent > 0 ? SUMMARY_TEXT.changeUp(percent) : SUMMARY_TEXT.changeDown(percent)
}

export { formatDecimal }
