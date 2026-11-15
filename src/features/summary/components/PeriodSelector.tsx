import { useState } from 'react'
import { Button, SegmentedControl, Spinner, TextField } from '@/components/ui'
import { SUMMARY_TEXT } from '../messages'
import { describePeriod, validatePeriod } from '../period'
import type { PeriodRange } from '../types'

export type PeriodPreset = 'month' | 'previous' | 'custom'

interface PeriodSelectorProps {
  preset: PeriodPreset
  /** The period shown, already resolved (this month, the previous one, or the custom range). */
  range: PeriodRange
  today: string
  /** Something is being asked again behind the numbers on screen. */
  updating: boolean
  onPresetChange: (preset: PeriodPreset) => void
  onApplyCustom: (range: PeriodRange) => void
}

/**
 * «Este mes», «Mes anterior» or «Personalizado», and the period in words under them. A custom period has two dates and is
 * checked with the backend's rules (not in the future, 366 days at most) before it is asked; the message says what to fix.
 */
export function PeriodSelector({ preset, range, today, updating, onPresetChange, onApplyCustom }: PeriodSelectorProps) {
  const [draft, setDraft] = useState<PeriodRange>(range)
  const [error, setError] = useState<string>()
  const valid = !validatePeriod(range, today)

  function apply() {
    const problem = validatePeriod(draft, today)
    setError(problem)
    if (!problem) onApplyCustom(draft)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <SegmentedControl
          aria-label={SUMMARY_TEXT.periodLabel}
          value={preset}
          onValueChange={(next) => {
            setError(undefined)
            setDraft(range)
            onPresetChange(next)
          }}
          options={[
            { value: 'month', label: SUMMARY_TEXT.presets.month },
            { value: 'previous', label: SUMMARY_TEXT.presets.previous },
            { value: 'custom', label: SUMMARY_TEXT.presets.custom },
          ]}
        />
        <p className="flex min-h-6 items-center gap-2 text-sec text-fg" aria-live="polite">
          {valid ? describePeriod(range) : null}
          {updating && (
            <span className="inline-flex items-center gap-1.5 text-fg-2">
              <Spinner />
              {SUMMARY_TEXT.updating}
            </span>
          )}
        </p>
      </div>

      {preset === 'custom' && (
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            apply()
          }}
          className="flex flex-col gap-4 sm:flex-row sm:items-start"
        >
          <TextField
            type="date"
            label={SUMMARY_TEXT.from}
            value={draft.from}
            max={today}
            error={error && !draft.from ? error : undefined}
            onChange={(event) => setDraft((current) => ({ ...current, from: event.target.value }))}
          />
          <TextField
            type="date"
            label={SUMMARY_TEXT.to}
            value={draft.to}
            max={today}
            error={error && draft.from ? error : undefined}
            onChange={(event) => setDraft((current) => ({ ...current, to: event.target.value }))}
          />
          <Button type="submit" variant="secondary" className="sm:mt-7">
            {SUMMARY_TEXT.apply}
          </Button>
        </form>
      )}
    </div>
  )
}
