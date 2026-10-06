import { Clock } from 'lucide-react'
import { formatTime12h } from '@/lib/format'
import { Select, type SelectOption, type SelectProps } from './Select'

/** 00:00 … 23:30 every 30 minutes, shown as "7:30 p. m.". */
const TIME_OPTIONS: SelectOption[] = Array.from({ length: 48 }, (_, index) => {
  const hours = String(Math.floor(index / 2)).padStart(2, '0')
  const value = `${hours}:${index % 2 === 0 ? '00' : '30'}`
  return { value, label: formatTime12h(value) }
})

export interface TimeSelectProps extends Omit<SelectProps, 'options' | 'icon'> {
  /** Extra choices listed before the hours (HoursEditor uses it for "Abierto 24 horas"). */
  leadingOptions?: SelectOption[]
}

/** Hour picker in 30 min steps (manual 9). Value is `"HH:mm"` in 24 h; the label is 12 h. */
export function TimeSelect({ leadingOptions = [], ...props }: TimeSelectProps) {
  const options = leadingOptions.length > 0 ? [...leadingOptions, ...TIME_OPTIONS] : TIME_OPTIONS
  return <Select {...props} options={options} icon={Clock} />
}
