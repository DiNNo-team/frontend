import { useId } from 'react'
import { CircleAlert } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Icon } from '@/lib/icon'
import { Button } from './Button'
import {
  closesNextDay,
  copyMondayToAll,
  DAY_LABELS,
  OPEN_24H_LABEL,
  type DayHours,
  type DayOfWeek,
  type WeeklyHours,
} from './hours'
import { Switch } from './Switch'
import { TimeSelect } from './TimeSelect'

// Value of the "Abierto 24 horas" option inside the opening picker (never sent anywhere).
const OPEN_24H = 'open-24h'
const OPEN_24H_OPTION = [{ value: OPEN_24H, label: OPEN_24H_LABEL }]

export interface HoursEditorProps {
  /** Seven entries, Monday to Sunday. */
  value: WeeklyHours
  onChange: (value: WeeklyHours) => void
  /** One message per row, shown with the field error style. */
  errors?: Partial<Record<DayOfWeek, string>>
  disabled?: boolean
  className?: string
}

/**
 * Weekly opening hours (manual 13.1): one row per day with an Abierto/Cerrado switch and
 * opening – closing hours; a closed day is a single row (the switch already says "Cerrado").
 * The opening picker's first option is "Abierto 24 horas", which hides the closing hour.
 * "Copiar el lunes a todos" sits right under Monday, next to what it copies.
 */
export function HoursEditor({ value, onChange, errors, disabled, className }: HoursEditorProps) {
  const baseId = useId()

  function updateDay(day: DayOfWeek, patch: Partial<DayHours>) {
    onChange(value.map((entry) => (entry.day === day ? { ...entry, ...patch } : entry)))
  }

  return (
    // Container queries: the rows switch to one line by the editor's own width (forms are 560 max).
    <div role="group" aria-label="Horarios" className={cn('@container flex flex-col gap-3', className)}>
      <ul className="flex flex-col divide-y divide-line">
        {value.map((entry) => {
          const labels = DAY_LABELS[entry.day]
          const error = errors?.[entry.day]
          const errorId = `${baseId}-${entry.day}-error`
          return (
            <li key={entry.day} className="flex flex-col gap-2 py-3">
              <div className="flex flex-col gap-3 @2xl:flex-row @2xl:items-center @2xl:gap-6">
                <div className="flex items-center gap-4">
                  <span className="w-12 text-sec font-bold text-fg">{labels.short}</span>
                  <Switch
                    aria-label={labels.long}
                    checked={entry.isOpen}
                    onCheckedChange={(isOpen) => updateDay(entry.day, { isOpen })}
                    onLabel="Abierto"
                    offLabel="Cerrado"
                    disabled={disabled}
                  />
                </div>
                {entry.isOpen ? (
                  // Below @md (phones, about 390 px) two hour pickers do not fit side by side: opening and
                  // closing go one under the other, without the dash.
                  <div className="flex flex-col gap-2 @md:flex-row @md:items-center @md:gap-3">
                    <TimeSelect
                      label={`Apertura del ${labels.long.toLowerCase()}`}
                      hideLabel
                      leadingOptions={OPEN_24H_OPTION}
                      value={entry.isOpen24h ? OPEN_24H : entry.opensAt}
                      onValueChange={(value) =>
                        updateDay(
                          entry.day,
                          value === OPEN_24H ? { isOpen24h: true } : { isOpen24h: false, opensAt: value },
                        )
                      }
                      invalid={Boolean(error)}
                      aria-describedby={error ? errorId : undefined}
                      disabled={disabled}
                      className={cn('min-w-0 @md:flex-1 @2xl:flex-none', entry.isOpen24h ? '@2xl:w-60' : '@2xl:w-44')}
                    />
                    {!entry.isOpen24h && (
                      <>
                        <span className="hidden text-fg-2 @md:inline" aria-hidden="true">
                          –
                        </span>
                        <TimeSelect
                          label={`Cierre del ${labels.long.toLowerCase()}`}
                          hideLabel
                          value={entry.closesAt}
                          onValueChange={(closesAt) => updateDay(entry.day, { closesAt })}
                          invalid={Boolean(error)}
                          aria-describedby={error ? errorId : undefined}
                          disabled={disabled}
                          className="min-w-0 @md:flex-1 @2xl:w-44 @2xl:flex-none"
                        />
                      </>
                    )}
                    {closesNextDay(entry) && <span className="text-sec whitespace-nowrap text-fg-2">(día siguiente)</span>}
                  </div>
                ) : null}
              </div>
              {error && (
                <p id={errorId} className="flex items-start gap-2 text-sec text-error">
                  <Icon icon={CircleAlert} size={16} className="mt-0.5 shrink-0" />
                  {error}
                </p>
              )}
              {entry.day === 'mon' && (
                <div>
                  <Button variant="ghost" size="sm" className="px-0" disabled={disabled} onClick={() => onChange(copyMondayToAll(value))}>
                    Copiar el lunes a todos
                  </Button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
