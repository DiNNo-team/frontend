import { useId } from 'react'
import { CircleAlert } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Icon } from '@/lib/icon'
import { Button } from './Button'
import { closesNextDay, copyMondayToAll, DAY_LABELS, type DayHours, type DayOfWeek, type WeeklyHours } from './hours'
import { Switch } from './Switch'
import { TimeSelect } from './TimeSelect'

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
 * Weekly opening hours (manual 9): one row per day with an Abierto/Cerrado switch and
 * opening – closing hours. Below, "Copiar a todos los días" copies Monday to the rest.
 */
export function HoursEditor({ value, onChange, errors, disabled, className }: HoursEditorProps) {
  const baseId = useId()

  function updateDay(day: DayOfWeek, patch: Partial<DayHours>) {
    onChange(value.map((entry) => (entry.day === day ? { ...entry, ...patch } : entry)))
  }

  return (
    // Container queries: the rows switch to one line by the editor's own width (forms are 560 max).
    <div role="group" aria-label="Horarios" className={cn('@container flex flex-col gap-3', className)}>
      <ul className="flex flex-col divide-y divide-line border-b border-line">
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
                  <div className="flex items-center gap-3">
                    <TimeSelect
                      label={`Apertura del ${labels.long.toLowerCase()}`}
                      hideLabel
                      value={entry.opensAt}
                      onValueChange={(opensAt) => updateDay(entry.day, { opensAt })}
                      invalid={Boolean(error)}
                      aria-describedby={error ? errorId : undefined}
                      disabled={disabled}
                      className="min-w-0 flex-1 @2xl:w-44 @2xl:flex-none"
                    />
                    <span className="text-fg-2" aria-hidden="true">
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
                      className="min-w-0 flex-1 @2xl:w-44 @2xl:flex-none"
                    />
                    {closesNextDay(entry) && <span className="text-sec whitespace-nowrap text-fg-2">(día siguiente)</span>}
                  </div>
                ) : (
                  <span className="text-sec text-fg-2">Cerrado todo el día</span>
                )}
              </div>
              {error && (
                <p id={errorId} className="flex items-start gap-2 text-sec text-error">
                  <Icon icon={CircleAlert} size={16} className="mt-0.5 shrink-0" />
                  {error}
                </p>
              )}
            </li>
          )
        })}
      </ul>
      <div>
        <Button variant="ghost" className="px-0" disabled={disabled} onClick={() => onChange(copyMondayToAll(value))}>
          Copiar a todos los días
        </Button>
      </div>
    </div>
  )
}
