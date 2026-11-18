import { bogotaToday } from '@/features/summary/period'
import { ApiError } from '@/lib/api-client'
import { mockFailIfAsked, mockParams, mockWait } from '@/lib/mock-env'
import type { InsightsApi } from './api'
import type { InsightsDaily, InsightsPeriod, RestaurantInsights } from './types'

// Stand-in for GET /v1/restaurants/me/insights with VITE_USE_MOCKS=true, with the exact shape of the contract (§12.16).
// The 7 days always end today (Bogotá). Controls by URL:
//   ?mockInsights=enough (default) | insufficient | empty | template | disabled | long600 | withList
//   ?mockError=insights-load or insights-refresh (network error) · ?mockLatency=20000 (a slow model; shared)
//   ?mockRateLimit        «Actualizar» answers 429 · ?mockRateLimit=all   the first load answers 429 too
//   ?mockForbidden=RESTAURANT_SUSPENDED (or another account errorCode)   every call answers 403 with that code

export const MOCK_INSIGHTS_SCENARIOS = ['enough', 'insufficient', 'empty', 'template', 'disabled', 'long600', 'withList'] as const
export type MockInsightsScenario = (typeof MOCK_INSIGHTS_SCENARIOS)[number]

const DAY_MS = 86_400_000
/** How old the report on the first load looks (it «comes from the cache»). */
const CACHED_AGE_MS = 12 * 60_000

const LLM_TEXT =
  'El {porcentaje} de tus reservas resueltas terminó en check-in, más que la semana anterior: sigue validando el código ' +
  'apenas llega cada comensal. Tus viernes a la 1:00 p. m. concentran más reservas que cualquier otra franja; procura tener ' +
  'mesas Disponibles a esa hora. El domingo no actualizaste tus mesas a mano: márcalas como Ocupada o Disponible cuando ' +
  'cambien, para que los comensales vean tu disponibilidad real.'

const LIST = [
  'El 67 % de tus reservas resueltas terminó en check-in, más que la semana anterior: sigue validando el código apenas llega cada comensal.',
  'Tus viernes a la 1:00 p. m. concentran más reservas que cualquier otra franja; procura tener mesas Disponibles a esa hora.',
  'El domingo no actualizaste tus mesas a mano: márcalas como Ocupada o Disponible cuando cambien.',
]

const TEMPLATE_TEXT =
  'No actualizaste tus mesas a mano en 1 de 7 días. Márcalas como Ocupada o Disponible cuando cambien, para que los ' +
  'comensales vean tu disponibilidad real. Tu franja con más reservas es el viernes a las 13:00 (8 reservas). Procura ' +
  'tener mesas Disponibles a esa hora.'

/** [created, completed, cancelled, expired, manualUpdates]; created − the other three = still active. Today is the last. */
type DayRow = [number, number, number, number, number]
const ENOUGH_DAYS: DayRow[] = [
  [6, 4, 1, 1, 3],
  [7, 5, 0, 2, 4],
  [3, 1, 1, 1, 0],
  [5, 4, 0, 1, 2],
  [9, 6, 1, 1, 5],
  [8, 5, 1, 2, 6],
  [4, 1, 0, 1, 4],
]
const INSUFFICIENT_DAYS: DayRow[] = [
  [1, 1, 0, 0, 2],
  [0, 0, 0, 0, 0],
  [2, 1, 1, 0, 1],
  [1, 0, 0, 1, 0],
  [0, 0, 0, 0, 3],
  [2, 1, 0, 0, 1],
  [2, 1, 0, 0, 0],
]
const EMPTY_DAYS: DayRow[] = Array.from({ length: 7 }, () => [0, 0, 0, 0, 0])

function shiftDay(day: string, days: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10)
}

function period(from: string, to: string): InsightsPeriod {
  return { from, to, timezone: 'America/Bogota' }
}

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)
const rate = (part: number, whole: number) => Math.round((part / whole) * 10_000) / 10_000

function textOf(scenario: MockInsightsScenario, checkInPercent: number): string {
  if (scenario === 'long600') return LLM_TEXT.replace('{porcentaje}', `${checkInPercent} %`).padEnd(600, ' Revisa tu bitácora cada noche.').slice(0, 600)
  if (scenario === 'withList') return LIST.join(' ')
  return LLM_TEXT.replace('{porcentaje}', `${checkInPercent} %`)
}

/** The report of a scenario, as the backend would answer at `now`. Exported for the tests. */
export function mockInsightsReport(scenario: MockInsightsScenario, now: Date, generatedAt: Date = now): RestaurantInsights {
  const today = bogotaToday(now)
  const from = shiftDay(today, -6)
  const rows = scenario === 'empty' ? EMPTY_DAYS : scenario === 'insufficient' ? INSUFFICIENT_DAYS : ENOUGH_DAYS
  const daily: InsightsDaily[] = rows.map(([created, completed, cancelled, expired, manualUpdates], index) => ({
    date: shiftDay(from, index),
    created,
    completed,
    cancelled,
    expired,
    manualUpdates,
  }))
  const created = sum(daily.map((day) => day.created))
  const completed = sum(daily.map((day) => day.completed))
  const cancelled = sum(daily.map((day) => day.cancelled))
  const expired = sum(daily.map((day) => day.expired))
  const resolved = completed + cancelled + expired
  const manualUpdates = sum(daily.map((day) => day.manualUpdates))
  const daysWithManualUpdates = daily.filter((day) => day.manualUpdates > 0).length
  const enough = scenario !== 'insufficient' && scenario !== 'empty'
  const checkInRate = enough ? rate(completed, resolved) : null
  const checkInPercent = checkInRate === null ? 0 : Math.round(checkInRate * 100)
  const fromTemplates = !enough || scenario === 'template' || scenario === 'disabled'

  return {
    period: period(from, today),
    previousPeriod: period(shiftDay(from, -7), shiftDay(from, -1)),
    generatedAt: generatedAt.toISOString(),
    dataSufficiency: enough ? 'enough' : 'insufficient',
    minResolved: 10,
    metrics: {
      reservationsCreated: created,
      active: created - resolved,
      resolved,
      completed,
      cancelled,
      expired,
      checkIns: completed,
      checkInRate,
      noShowRate: enough ? rate(expired, resolved) : null,
      cancellationRate: enough ? rate(cancelled, resolved) : null,
      medianMinutesToCheckIn: completed > 0 ? (enough ? 9.5 : 11.5) : null,
      averagePartySize: created > 0 ? (enough ? 2.83 : 2.5) : null,
      topSlots: enough
        ? [
            { dayOfWeek: 5, hour: 13, reservations: 8 },
            { dayOfWeek: 6, hour: 20, reservations: 6 },
            { dayOfWeek: 4, hour: 19, reservations: 5 },
          ]
        : created > 0
          ? [{ dayOfWeek: 3, hour: 20, reservations: 2 }]
          : [],
      daily,
      manualUpdates,
      manualUpdatesPerDay: Math.round((manualUpdates / 7) * 100) / 100,
      daysWithManualUpdates,
      daysWithoutManualUpdates: 7 - daysWithManualUpdates,
    },
    previous:
      scenario === 'empty'
        ? { reservationsCreated: 0, resolved: 0, checkInRate: null }
        : enough
          ? { reservationsCreated: 35, resolved: 33, checkInRate: 0.5758 }
          : { reservationsCreated: 3, resolved: 3, checkInRate: null },
    reliability: enough
      ? { level: 'medium', reasons: [`Tasa de check-in del ${checkInPercent} %`, `Actualizaste tus mesas a mano en ${daysWithManualUpdates} de 7 días`] }
      : { level: null, reasons: [] },
    narrative: fromTemplates
      ? {
          text: enough
            ? TEMPLATE_TEXT
            : `Aún no hay suficientes reservas para tu informe. Vuelve cuando tengas al menos 10 reservas resueltas (con check-in, canceladas o vencidas); en los últimos 7 días llevas ${resolved}.`,
          source: 'template',
          fallback: !enough ? 'insufficient_data' : scenario === 'disabled' ? 'llm_disabled' : 'llm_unavailable',
        }
      : {
          text: textOf(scenario, checkInPercent),
          source: 'llm',
          fallback: null,
          ...(scenario === 'withList' ? { recommendations: LIST } : {}),
        },
  }
}

function scenarioFromUrl(): MockInsightsScenario {
  const asked = mockParams().get('mockInsights')
  return MOCK_INSIGHTS_SCENARIOS.find((scenario) => scenario === asked) ?? 'enough'
}

function failIfForbidden(): void {
  const code = mockParams().get('mockForbidden')
  if (code !== null) throw new ApiError({ status: 403, code: code || undefined })
}

function failIfRateLimited(refresh: boolean): void {
  const limit = mockParams().get('mockRateLimit')
  if (limit === null) return
  if (refresh || limit === 'all') {
    throw new ApiError({ status: 429, message: 'Hiciste muchas solicitudes seguidas. Espera un momento e intenta de nuevo.' })
  }
}

export const mockInsightsApi: InsightsApi = {
  async getInsights({ refresh }) {
    // A new report takes a while (the model); the cached one answers fast.
    await mockWait(refresh ? 1500 : 500)
    mockFailIfAsked(refresh ? 'insights-refresh' : 'insights-load')
    failIfForbidden()
    failIfRateLimited(refresh)
    const now = new Date()
    return mockInsightsReport(scenarioFromUrl(), now, refresh ? now : new Date(now.getTime() - CACHED_AGE_MS))
  },
}
