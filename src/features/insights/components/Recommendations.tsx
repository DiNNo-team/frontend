import { AiIcon, Alert, Card } from '@/components/ui'
import { authorMark, fallbackNotice, generatedAgoText, recommendationsView } from '../insights-view'
import { INSIGHTS_TEXT } from '../messages'
import type { InsightsNarrative } from '../types'

interface RecommendationsProps {
  narrative: InsightsNarrative
  generatedAt: string
  now: Date
}

/**
 * «Qué hacer esta semana»: the recommendations as the backend sent them (the list if it comes, otherwise the paragraph as
 * it is, never split), always marked as generated automatically: «Generado con IA · hace 12 min» when the model wrote them;
 * «Generado automáticamente» plus the notice of basic recommendations when they came from templates because of the model.
 * Only for a report with enough data.
 */
export function Recommendations({ narrative, generatedAt, now }: RecommendationsProps) {
  const view = recommendationsView(narrative)
  const fromModel = narrative.source === 'llm'
  const mark = [authorMark(narrative), generatedAgoText(generatedAt, now)].filter(Boolean).join(' · ')
  const notice = fromModel ? null : fallbackNotice(narrative.fallback)

  return (
    <Card as="section" aria-labelledby="recommendations-title" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h3 id="recommendations-title" className="text-h3 text-fg">
          {INSIGHTS_TEXT.recommendationsTitle}
        </h3>
        <p className="inline-flex items-center gap-1.5 text-sec font-bold text-fg">
          {fromModel && <AiIcon />}
          {mark}
        </p>
      </div>
      {notice && <Alert type="info">{notice}</Alert>}
      {view.kind === 'list' ? (
        <ol className="flex max-w-3xl flex-col gap-4">
          {view.items.map((item, index) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden="true" className="w-6 shrink-0 text-h3 text-fg-2 tabular-nums">
                {index + 1}
              </span>
              <p className="min-w-0 text-body break-words text-fg">{item}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="max-w-3xl text-body break-words text-fg">{view.text}</p>
      )}
      {fromModel && <p className="text-label text-fg-2">{INSIGHTS_TEXT.aiDisclaimer}</p>}
    </Card>
  )
}
