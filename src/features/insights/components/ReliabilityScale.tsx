import { RELIABILITY_STATUS, STATUS_META, StatusChip, StatusShape, TONE_TEXT } from '@/components/ui'
import { HelpToggle } from '@/features/summary/components/HelpToggle'
import { cn } from '@/lib/cn'
import { INSIGHTS_TEXT } from '../messages'
import type { InsightsReliability, ReliabilityLevel } from '../types'

const LEVELS: ReliabilityLevel[] = ['low', 'medium', 'high']

/**
 * Reliability of the availability (§12.16): the level as a status chip (color + shape + word) and on a three-step scale
 * Baja · Media · Alta, with its reasons as the backend wrote them. Nothing with `level: null` (insufficient data).
 */
export function ReliabilityScale({ reliability }: { reliability: InsightsReliability }) {
  const { level, reasons } = reliability
  if (level === null) return null
  return (
    <section aria-labelledby="reliability-title" className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="reliability-title" className="text-h3 text-fg">
          {INSIGHTS_TEXT.reliabilityTitle}
        </h2>
        <StatusChip status={RELIABILITY_STATUS[level]} />
      </div>
      <div aria-hidden="true" className="grid grid-cols-3 gap-1">
        {LEVELS.map((step) => {
          const meta = STATUS_META[RELIABILITY_STATUS[step]]
          const current = step === level
          return (
            <div key={step} className="flex flex-col gap-2">
              <span className={cn('h-2 rounded-full', current ? cn(TONE_TEXT[meta.tone], 'bg-current') : 'bg-line')} />
              <span className={cn('inline-flex items-center gap-1.5 text-label', current ? 'font-bold text-fg' : 'text-fg-2')}>
                {current && <StatusShape shape={meta.shape} className={TONE_TEXT[meta.tone]} />}
                {meta.label}
              </span>
            </div>
          )
        })}
      </div>
      {reasons.length > 0 && (
        <ul className="flex list-disc flex-col gap-1 pl-5 text-sec text-fg">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      )}
      <HelpToggle label={INSIGHTS_TEXT.reliabilityHelpLabel} title={INSIGHTS_TEXT.reliabilityTitle}>
        {INSIGHTS_TEXT.reliabilityHelp}
      </HelpToggle>
    </section>
  )
}
