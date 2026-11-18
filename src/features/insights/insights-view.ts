import { ApiError, isAccessError } from '@/lib/api-client'
import { describeInsightsError, INSIGHTS_TEXT } from './messages'
import type { InsightsNarrative, NarrativeFallback, RestaurantInsights } from './types'

// Pure rules of «Informe de la semana». The screen state comes only from the fields of the response (§12.16:
// `dataSufficiency`, `narrative.source`, `narrative.fallback`, the counts), never from the text.

export type InsightsScreenState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  /** 401 or 403: the session or the account changed. No «Intentar de nuevo». */
  | { kind: 'access-error'; message: string }
  /** 429 on the first load. Not retried on its own. */
  | { kind: 'rate-limited'; message: string }
  /** No reservations created this week nor the one before. */
  | { kind: 'empty'; report: RestaurantInsights }
  /** Fewer than `minResolved` resolved reservations: counts only, no rates, level or recommendations. */
  | { kind: 'insufficient'; report: RestaurantInsights; missing: number }
  | { kind: 'ready-llm'; report: RestaurantInsights }
  /** Enough data, but the text came from templates (the model is off, failed or its text was rejected). */
  | { kind: 'ready-template'; report: RestaurantInsights; fallback: NarrativeFallback | null }

export function isRateLimited(error: unknown): boolean {
  return error instanceof ApiError && error.status === 429
}

/**
 * The state of the screen. A report already on screen wins over a later error (a failed «Actualizar» keeps it), so `error`
 * only decides when there is no report yet.
 */
export function insightsScreenState(report: RestaurantInsights | undefined, error: unknown): InsightsScreenState {
  if (report === undefined) {
    if (error === null || error === undefined) return { kind: 'loading' }
    const message = describeInsightsError(error)
    if (isAccessError(error)) return { kind: 'access-error', message }
    if (isRateLimited(error)) return { kind: 'rate-limited', message }
    return { kind: 'error', message }
  }
  if (report.metrics.reservationsCreated === 0 && report.previous.reservationsCreated === 0) return { kind: 'empty', report }
  if (report.dataSufficiency === 'insufficient') return { kind: 'insufficient', report, missing: missingResolved(report) }
  if (report.narrative.source === 'llm') return { kind: 'ready-llm', report }
  return { kind: 'ready-template', report, fallback: report.narrative.fallback }
}

/** «Te faltan N»: resolved reservations still needed for rates and the indicator. Never negative. */
export function missingResolved(report: Pick<RestaurantInsights, 'minResolved' | 'metrics'>): number {
  return Math.max(0, report.minResolved - report.metrics.resolved)
}

/** A rate (0–1, 4 decimals) as the whole percent the screen shows; `null` stays `null` (never «0 %»). */
export function toPercent(rate: number | null): number | null {
  return rate === null ? null : Math.round(rate * 100)
}

/**
 * Change of the check-in rate against the week before, in percentage points, computed from the percents the screen shows
 * (65 % and 58 % → 7), so the difference always matches what the person reads. `null` if either week has no rate.
 */
export function checkInDeltaPoints(report: Pick<RestaurantInsights, 'metrics' | 'previous'>): number | null {
  const current = toPercent(report.metrics.checkInRate)
  const previous = toPercent(report.previous.checkInRate)
  return current === null || previous === null ? null : current - previous
}

export function checkInDeltaText(points: number | null): string {
  if (points === null) return INSIGHTS_TEXT.deltaNone
  if (points === 0) return INSIGHTS_TEXT.deltaSame
  return points > 0 ? INSIGHTS_TEXT.deltaUp(points) : INSIGHTS_TEXT.deltaDown(points)
}

/** Whole minutes since `generatedAt`; `null` if the date is not valid. A clock a bit behind the server reads as 0. */
export function minutesSince(generatedAt: string, now: Date): number | null {
  const at = Date.parse(generatedAt)
  if (Number.isNaN(at)) return null
  return Math.max(0, Math.floor((now.getTime() - at) / 60_000))
}

/** «hace un momento», «hace 12 min», «hace 2 horas»; `null` if the date is not valid (the mark then shows no time). */
export function generatedAgoText(generatedAt: string, now: Date): string | null {
  const minutes = minutesSince(generatedAt, now)
  if (minutes === null) return null
  if (minutes < 1) return INSIGHTS_TEXT.generatedJustNow
  if (minutes < 60) return INSIGHTS_TEXT.generatedMinutesAgo(minutes)
  return INSIGHTS_TEXT.generatedHoursAgo(Math.floor(minutes / 60))
}

/** Who wrote the recommendations, for the mark next to them. */
export function authorMark(narrative: Pick<InsightsNarrative, 'source'>): string {
  return narrative.source === 'llm' ? INSIGHTS_TEXT.generatedWithAi : INSIGHTS_TEXT.generatedAutomatically
}

/** Why the text came from templates, for a report with enough data; `null` when there is nothing to explain. */
export function fallbackNotice(fallback: NarrativeFallback | null): string | null {
  if (fallback === null || fallback === 'insufficient_data') return null
  return INSIGHTS_TEXT.fallbackNotice[fallback]
}

export type RecommendationsView = { kind: 'list'; items: string[] } | { kind: 'paragraph'; text: string }

/**
 * The recommendations as the backend sent them: the list when `recommendations` comes with at least one item (pending in
 * the contract), and otherwise `text` exactly as it is. The web never splits the paragraph.
 */
export function recommendationsView(narrative: Pick<InsightsNarrative, 'text' | 'recommendations'>): RecommendationsView {
  const items = (narrative.recommendations ?? []).map((item) => item.trim()).filter((item) => item.length > 0)
  return items.length > 0 ? { kind: 'list', items } : { kind: 'paragraph', text: narrative.text }
}
