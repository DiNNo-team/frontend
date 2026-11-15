import { ApiError, getApiErrorMessage, isAccessError } from '@/lib/api-client'
import { formatCop, formatDecimal } from './format'

// Texts of «Resumen» (CLAUDE.md §12.12). Everything the screen says is here; backend `message`s are never shown.

export const SUMMARY_TEXT = {
  title: 'Resumen',
  description: 'Lo que DiNNo te trae y lo que se cobra, por periodo.',
  periodLabel: 'Periodo',
  presets: { month: 'Este mes', previous: 'Mes anterior', custom: 'Personalizado' },
  from: 'Desde',
  to: 'Hasta',
  apply: 'Ver periodo',
  updating: 'Actualizando…',
  loadError: 'No pudimos cargar el resumen. Revisa tu conexión e intenta de nuevo.',
  retry: 'Intentar de nuevo',
  // A cobrar
  billingKicker: 'A cobrar',
  checkIns: (count: number) => `${count} ${count === 1 ? 'check-in' : 'check-ins'}`,
  billingFormula: (count: number, fee: number) => `${count} ${count === 1 ? 'check-in' : 'check-ins'} × tarifa de ${formatCop(fee)}`,
  billingMixedFees: (count: number) => `${count} ${count === 1 ? 'check-in' : 'check-ins'}, cada uno con la tarifa de su momento`,
  feeHelpLabel: 'Cómo se cobra',
  feeHelp:
    'Cada check-in guarda la tarifa que había cuando se hizo. Por eso el total de un periodo no cambia si la tarifa cambia después. Solo se cobra cuando un comensal llega y validas su código: las cancelaciones y los vencimientos no se cobran.',
  billingEmptyTitle: 'Todavía no hay cobros en este periodo',
  billingEmpty:
    'Se cobra solo cuando un comensal llega y validas su código. Las cancelaciones y los vencimientos no se cobran.',
  // Historia
  storyTitle: 'Así van tus reservas',
  storyCreated: (count: number) => `${count} ${count === 1 ? 'reserva creada' : 'reservas creadas'} en el periodo`,
  storyEmpty: 'No hay reservas creadas en este periodo.',
  storyLabel: (arrived: number, cancelled: number, expired: number, active: number) =>
    `Reservas del periodo: ${arrived} llegaron, ${cancelled} canceladas, ${expired} vencidas y ${active} activas`,
  legend: { arrived: 'Llegaron', cancelled: 'Canceladas', expired: 'Vencidas', active: 'Activas' },
  noData: 'Sin datos',
  noShowLabel: 'No llegaron',
  averageParty: (value: number) => `Cada reserva fue en promedio de ${formatDecimal(value)} personas.`,
  averagePartyLabel: 'Personas por reserva',
  ratesHelpLabel: 'Cómo se calculan',
  ratesHelpTitle: 'Cómo se calculan estos porcentajes',
  ratesHelp: [
    'Las reservas se cuentan por el día en que se crearon, con el estado que tienen hoy.',
    'Llegaron: reservas con check-in validado, de todas las reservas creadas.',
    'Se cancelaron: reservas que el comensal canceló, de todas las reservas creadas.',
    'No llegaron: reservas vencidas, de las que ya se resolvieron por llegada o por vencimiento. Las activas todavía no cuentan.',
  ],
  // Ritmo
  rhythmTitle: 'Tu ritmo',
  peakTitle: 'Tus horas pico',
  peakDescription: 'Las tres horas en que más reservas se crean.',
  peakEmpty: 'Todavía no hay horas pico en este periodo.',
  peakValue: (count: number) => `${count} ${count === 1 ? 'reserva' : 'reservas'}`,
  daysTitle: 'Días de más movimiento',
  daysDescription: 'Reservas creadas en cada día de la semana.',
  daysEmpty: 'Todavía no hay reservas en este periodo.',
  daysTop: 'Día con más movimiento',
  chartTableCaption: {
    story: 'Reservas del periodo por estado',
    days: 'Reservas creadas por día de la semana',
  },
  chartTableHeaders: { state: 'Estado', day: 'Día', count: 'Reservas' },
  // Detalle de cobro
  detailTitle: 'Detalle de cobro',
  detailDescription: 'Cada check-in del periodo. Horas de Bogotá.',
  detailCaption: 'Check-ins del periodo',
  columnWhen: 'Fecha y hora',
  columnTable: 'Mesa',
  columnParty: 'Personas',
  columnFee: 'Tarifa',
  detailEmpty: 'No hay check-ins en este periodo',
  detailEmptyDescription: 'Cuando valides el código de un comensal, aparecerá aquí.',
  detailLoadError: 'No pudimos cargar el detalle de cobro. Revisa tu conexión e intenta de nuevo.',
  detailTotal: (count: number, amount: number) => `Total del periodo: ${count} ${count === 1 ? 'check-in' : 'check-ins'} · ${formatCop(amount)}`,
  itemsLabel: 'check-ins',
  invalidPeriod: 'Revisa las fechas del periodo.',
} as const

/** The «de cada 10» of a rate, said honestly at the edges: a rate that rounds to 0 or 10 but is not 0 or 1. */
export function perTen(rate: number): string {
  const tenths = Math.round(rate * 10)
  if (rate > 0 && tenths === 0) return 'menos de 1'
  if (rate < 1 && tenths === 10) return 'más de 9'
  return String(tenths)
}

/** Lead phrase of each rate, with its own denominator: they are not mixed in one sentence. `null` rates are «Sin datos». */
export function conversionSentence(rate: number): string {
  return `De cada 10 reservas, ${perTen(rate)} llegaron.`
}

export function cancellationSentence(rate: number): string {
  return `De cada 10 reservas, ${perTen(rate)} se cancelaron.`
}

export function noShowSentence(rate: number, resolved: number): string {
  return `De las ${resolved} reservas que llegaron o vencieron, ${perTen(rate)} de cada 10 no llegaron.`
}

/** The text for a report that could not load, by access or network; `fallback` otherwise. */
export function describeReportError(error: unknown, fallback: string): string {
  if (error instanceof ApiError && (error.isNetworkError || isAccessError(error))) return getApiErrorMessage(error)
  return fallback
}
