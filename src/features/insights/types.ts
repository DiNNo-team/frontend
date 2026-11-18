// Contract: GET /v1/restaurants/me/insights?refresh=true|false (CLAUDE.md §12.16 of the backend, Swagger tag `insights`),
// only for an approved restaurant. Same shape as `RestaurantInsightsResponseDto`. Days are Bogotá days (`YYYY-MM-DD`,
// inclusive). It never carries diner data. The screen decides by `dataSufficiency`, `reliability.level`, `narrative.source`
// and `narrative.fallback`, never by the text.

export interface InsightsPeriod {
  from: string
  to: string
  timezone: 'America/Bogota'
}

export interface InsightsTopSlot {
  /** ISO day: 1 = Monday … 7 = Sunday (Bogotá). */
  dayOfWeek: number
  /** 0 to 23, Bogotá. */
  hour: number
  reservations: number
}

export interface InsightsDaily {
  date: string
  /** Reservations created that day (by their current state in the next three fields). */
  created: number
  completed: number
  cancelled: number
  expired: number
  /** Table state changes made by hand that day (activity log, `source = manual`). */
  manualUpdates: number
}

export interface InsightsMetrics {
  /** Created in the period, by their current state. */
  reservationsCreated: number
  active: number
  /** Of the created ones, those already finished: completed + cancelled + expired. */
  resolved: number
  /** With check-in. */
  completed: number
  cancelled: number
  /** Expired without check-in. */
  expired: number
  /** Check-ins made in the period (the same as the billing statement). */
  checkIns: number
  /** completed / resolved, 4 decimals. `null` with insufficient data. */
  checkInRate: number | null
  /** expired / resolved, 4 decimals. `null` with insufficient data. */
  noShowRate: number | null
  /** cancelled / resolved, 4 decimals. `null` with insufficient data. */
  cancellationRate: number | null
  /** Median minutes from creating the reservation to the check-in, 1 decimal. `null` without check-ins. */
  medianMinutesToCheckIn: number | null
  /** Average party size of the created ones, 2 decimals. `null` without reservations. */
  averagePartySize: number | null
  /** Up to 3, most reservations first. */
  topSlots: InsightsTopSlot[]
  /** Always one per day of the period, oldest first, today last. */
  daily: InsightsDaily[]
  manualUpdates: number
  manualUpdatesPerDay: number
  daysWithManualUpdates: number
  daysWithoutManualUpdates: number
}

export interface InsightsPrevious {
  reservationsCreated: number
  resolved: number
  /** `null` if the previous week had fewer than `minResolved` resolved reservations. */
  checkInRate: number | null
}

export type ReliabilityLevel = 'high' | 'medium' | 'low'

export interface InsightsReliability {
  /** `null` with insufficient data. */
  level: ReliabilityLevel | null
  /** Reasons of the level, in Spanish. Empty with insufficient data. */
  reasons: string[]
}

export type NarrativeSource = 'llm' | 'template'

/**
 * Why the text came from templates; `null` if the model wrote it. insufficient_data: few resolved reservations ·
 * llm_disabled: no model key · llm_unavailable: the model failed, took too long or refused · llm_invalid: its text failed
 * the validation.
 */
export type NarrativeFallback = 'insufficient_data' | 'llm_disabled' | 'llm_unavailable' | 'llm_invalid'

export interface InsightsNarrative {
  /** 2 or 3 recommendations in Spanish, one paragraph, at most 600 characters. Generated automatically. */
  text: string
  source: NarrativeSource
  fallback: NarrativeFallback | null
  /**
   * NOT in the contract yet (asked to Santiago, 18 nov 2026): the same recommendations, one per item. When it comes, the
   * screen lists them; when not, it shows `text` as it is. The text is never split by the web.
   */
  recommendations?: string[]
}

export interface RestaurantInsights {
  /** The last 7 Bogotá days, today included. */
  period: InsightsPeriod
  /** The 7 days before. */
  previousPeriod: InsightsPeriod
  /** When the report was generated (ISO 8601 UTC). It may come from the cache. */
  generatedAt: string
  dataSufficiency: 'enough' | 'insufficient'
  /** Resolved reservations needed for rates and the indicator (10). */
  minResolved: number
  metrics: InsightsMetrics
  previous: InsightsPrevious
  reliability: InsightsReliability
  narrative: InsightsNarrative
}
