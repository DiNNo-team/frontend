import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api-client'
import { mockInsightsReport, type MockInsightsScenario } from './api.mock'
import {
  authorMark,
  checkInDeltaPoints,
  checkInDeltaText,
  fallbackNotice,
  generatedAgoText,
  insightsScreenState,
  minutesSince,
  missingResolved,
  recommendationsView,
  toPercent,
} from './insights-view'
import { INSIGHTS_TEXT } from './messages'
import type { RestaurantInsights } from './types'

const NOW = new Date('2026-11-18T15:00:00.000Z')
const report = (scenario: MockInsightsScenario = 'enough') => mockInsightsReport(scenario, NOW)

/** The same report with some fields changed (deep enough for metrics, previous and narrative). */
function withChanges(
  base: RestaurantInsights,
  changes: {
    metrics?: Partial<RestaurantInsights['metrics']>
    previous?: Partial<RestaurantInsights['previous']>
    narrative?: Partial<RestaurantInsights['narrative']>
  } & Partial<Pick<RestaurantInsights, 'dataSufficiency' | 'minResolved' | 'generatedAt'>>,
): RestaurantInsights {
  const { metrics, previous, narrative, ...rest } = changes
  return {
    ...base,
    ...rest,
    metrics: { ...base.metrics, ...metrics },
    previous: { ...base.previous, ...previous },
    narrative: { ...base.narrative, ...narrative },
  }
}

describe('insightsScreenState', () => {
  it('is loading while there is no report and no error', () => {
    expect(insightsScreenState(undefined, null)).toEqual({ kind: 'loading' })
    expect(insightsScreenState(undefined, undefined)).toEqual({ kind: 'loading' })
  })

  it('is an error with the load text for a server or network failure', () => {
    expect(insightsScreenState(undefined, new ApiError({ status: 500 }))).toEqual({ kind: 'error', message: INSIGHTS_TEXT.loadError })
    const network = insightsScreenState(undefined, new ApiError({ status: 0, isNetworkError: true }))
    expect(network.kind).toBe('error')
    expect(insightsScreenState(undefined, new Error('boom'))).toEqual({ kind: 'error', message: INSIGHTS_TEXT.loadError })
  })

  it('is an access error for 401 and 403, with the account text', () => {
    expect(insightsScreenState(undefined, new ApiError({ status: 401 }))).toMatchObject({ kind: 'access-error', message: 'Tu sesión terminó. Inicia sesión de nuevo.' })
    const suspended = insightsScreenState(undefined, new ApiError({ status: 403, code: 'RESTAURANT_SUSPENDED' }))
    expect(suspended.kind).toBe('access-error')
    expect(suspended).toMatchObject({ message: expect.stringMatching(/suspendido/) })
  })

  it('is rate-limited for a 429 on the first load', () => {
    expect(insightsScreenState(undefined, new ApiError({ status: 429 }))).toEqual({
      kind: 'rate-limited',
      message: 'Hiciste muchas solicitudes seguidas. Espera un momento e intenta de nuevo.',
    })
  })

  it('keeps the report on screen when a later request failed', () => {
    const current = report()
    expect(insightsScreenState(current, new ApiError({ status: 429 }))).toEqual({ kind: 'ready-llm', report: current })
  })

  it('is empty without reservations this week and the one before', () => {
    expect(insightsScreenState(report('empty'), null).kind).toBe('empty')
  })

  it('is insufficient, not empty, when only the previous week had reservations', () => {
    const onlyBefore = withChanges(report('empty'), { previous: { reservationsCreated: 4, resolved: 4 } })
    expect(insightsScreenState(onlyBefore, null)).toMatchObject({ kind: 'insufficient', missing: 10 })
  })

  it('is insufficient with fewer resolved than minResolved, and says how many are missing', () => {
    const state = insightsScreenState(report('insufficient'), null)
    expect(state).toMatchObject({ kind: 'insufficient', missing: 4 })
  })

  it('is ready-llm when the model wrote the text', () => {
    expect(insightsScreenState(report('enough'), null).kind).toBe('ready-llm')
    expect(insightsScreenState(report('withList'), null).kind).toBe('ready-llm')
  })

  it('is ready-template with its reason when the text came from templates', () => {
    expect(insightsScreenState(report('template'), null)).toMatchObject({ kind: 'ready-template', fallback: 'llm_unavailable' })
    expect(insightsScreenState(report('disabled'), null)).toMatchObject({ kind: 'ready-template', fallback: 'llm_disabled' })
    const invalid = withChanges(report(), { narrative: { source: 'template', fallback: 'llm_invalid' } })
    expect(insightsScreenState(invalid, null)).toMatchObject({ kind: 'ready-template', fallback: 'llm_invalid' })
  })

  it('decides by the fields, never by the text', () => {
    const misleading = withChanges(report('enough'), { narrative: { text: 'Aún no hay suficientes reservas para tu informe.' } })
    expect(insightsScreenState(misleading, null).kind).toBe('ready-llm')
    const emptyText = withChanges(report('insufficient'), { narrative: { text: '' } })
    expect(insightsScreenState(emptyText, null).kind).toBe('insufficient')
  })
})

describe('missingResolved', () => {
  it('is minResolved − resolved', () => {
    expect(missingResolved(report('insufficient'))).toBe(4)
    expect(missingResolved(report('empty'))).toBe(10)
  })

  it('is never negative', () => {
    expect(missingResolved(withChanges(report(), { minResolved: 10, metrics: { resolved: 39 } }))).toBe(0)
  })
})

describe('rates and the delta against the week before', () => {
  it('turns a rate into the whole percent and keeps null as null', () => {
    expect(toPercent(0.6667)).toBe(67)
    expect(toPercent(0)).toBe(0)
    expect(toPercent(null)).toBeNull()
  })

  it('is the difference of the percents the screen shows, in points', () => {
    expect(checkInDeltaPoints(report())).toBe(9) // 67 % against 58 %
    const down = withChanges(report(), { metrics: { checkInRate: 0.5 }, previous: { checkInRate: 0.6249 } })
    expect(checkInDeltaPoints(down)).toBe(-12)
  })

  it('is null when either week has no rate', () => {
    expect(checkInDeltaPoints(withChanges(report(), { previous: { checkInRate: null } }))).toBeNull()
    expect(checkInDeltaPoints(report('insufficient'))).toBeNull()
  })

  it('says up, down, the same or that there is nothing to compare', () => {
    expect(checkInDeltaText(9)).toBe('Subió 9 puntos frente a la semana anterior')
    expect(checkInDeltaText(1)).toBe('Subió 1 punto frente a la semana anterior')
    expect(checkInDeltaText(-12)).toBe('Bajó 12 puntos frente a la semana anterior')
    expect(checkInDeltaText(0)).toBe(INSIGHTS_TEXT.deltaSame)
    expect(checkInDeltaText(null)).toBe(INSIGHTS_TEXT.deltaNone)
  })

  it('every rate text says «de las resueltas»', () => {
    for (const label of [INSIGHTS_TEXT.checkInRateLabel, INSIGHTS_TEXT.noShowRateLabel, INSIGHTS_TEXT.cancellationRateLabel]) {
      expect(label).toMatch(/de las reservas resueltas/)
    }
  })
})

describe('when it was generated', () => {
  it('counts whole minutes since generatedAt', () => {
    expect(minutesSince('2026-11-18T14:48:00.000Z', NOW)).toBe(12)
    expect(minutesSince('2026-11-18T14:59:30.000Z', NOW)).toBe(0)
  })

  it('reads a server clock ahead of the device as 0, and an invalid date as null', () => {
    expect(minutesSince('2026-11-18T15:02:00.000Z', NOW)).toBe(0)
    expect(minutesSince('no es una fecha', NOW)).toBeNull()
  })

  it('says «hace un momento», minutes or hours', () => {
    expect(generatedAgoText('2026-11-18T14:59:30.000Z', NOW)).toBe('hace un momento')
    expect(generatedAgoText('2026-11-18T14:48:00.000Z', NOW)).toBe('hace 12 min')
    expect(generatedAgoText('2026-11-18T14:00:00.000Z', NOW)).toBe('hace 1 hora')
    expect(generatedAgoText('2026-11-18T12:10:00.000Z', NOW)).toBe('hace 2 horas')
    expect(generatedAgoText('', NOW)).toBeNull()
  })
})

describe('who wrote it and why', () => {
  it('marks the model as IA and the templates as automatic', () => {
    expect(authorMark({ source: 'llm' })).toBe('Generado con IA')
    expect(authorMark({ source: 'template' })).toBe('Generado automáticamente')
  })

  it('says the same for every llm_* reason, and nothing with few data or the model', () => {
    for (const fallback of ['llm_disabled', 'llm_unavailable', 'llm_invalid'] as const) {
      expect(fallbackNotice(fallback)).toBe('Recomendaciones básicas: el asistente de IA no estuvo disponible')
    }
    expect(fallbackNotice('insufficient_data')).toBeNull()
    expect(fallbackNotice(null)).toBeNull()
  })
})

describe('recommendationsView', () => {
  it('uses the list when it comes', () => {
    const view = recommendationsView(report('withList').narrative)
    expect(view.kind).toBe('list')
    expect(view).toMatchObject({ items: expect.arrayContaining([expect.stringMatching(/check-in/)]) })
    if (view.kind === 'list') expect(view.items).toHaveLength(3)
  })

  it('shows the paragraph exactly as it is without the list, never split', () => {
    const text = 'Primera idea. Segunda idea: con 2,5 personas. Tercera idea.'
    expect(recommendationsView({ text })).toEqual({ kind: 'paragraph', text })
  })

  it('falls back to the paragraph when the list is empty or blank', () => {
    expect(recommendationsView({ text: 'Texto.', recommendations: [] })).toEqual({ kind: 'paragraph', text: 'Texto.' })
    expect(recommendationsView({ text: 'Texto.', recommendations: ['  ', ''] })).toEqual({ kind: 'paragraph', text: 'Texto.' })
  })

  it('drops blank items and trims the rest', () => {
    expect(recommendationsView({ text: 'x', recommendations: [' Una. ', '', 'Dos.'] })).toEqual({ kind: 'list', items: ['Una.', 'Dos.'] })
  })
})

describe('the mock respects the contract', () => {
  it('always brings 7 days ending today and counts that add up', () => {
    for (const scenario of ['enough', 'insufficient', 'empty'] as const) {
      const { metrics, period } = report(scenario)
      expect(metrics.daily).toHaveLength(7)
      expect(metrics.daily[6].date).toBe(period.to)
      expect(metrics.resolved).toBe(metrics.completed + metrics.cancelled + metrics.expired)
      expect(metrics.reservationsCreated).toBe(metrics.resolved + metrics.active)
    }
  })

  it('brings null rates and level with insufficient data', () => {
    const { metrics, reliability, narrative } = report('insufficient')
    expect([metrics.checkInRate, metrics.noShowRate, metrics.cancellationRate, reliability.level]).toEqual([null, null, null, null])
    expect(reliability.reasons).toEqual([])
    expect(narrative).toMatchObject({ source: 'template', fallback: 'insufficient_data' })
  })

  it('brings null median and average without reservations', () => {
    const { metrics } = report('empty')
    expect(metrics.medianMinutesToCheckIn).toBeNull()
    expect(metrics.averagePartySize).toBeNull()
    expect(metrics.topSlots).toEqual([])
  })

  it('long600 has exactly 600 characters', () => {
    expect(report('long600').narrative.text).toHaveLength(600)
  })
})
