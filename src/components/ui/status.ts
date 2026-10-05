// Single source of status names, colors and shapes in the front (manual 3).
// SegmentedControl, TableCard and the activity log read from here; never redefine them in a feature.

export type Status = 'available' | 'reserved' | 'occupied' | 'inactive' | 'limited' | 'open' | 'closed' | 'error'

export type StatusTone = 'ok' | 'reserved' | 'busy' | 'inactive' | 'limited' | 'error'

/** `live-dot` is the dot with the pulsing Active Dot halo; `dot-alert` is the dot plus the alert icon. */
export type StatusShapeName = 'dot' | 'square' | 'striped-square' | 'diamond' | 'dash' | 'dot-alert' | 'live-dot'

export interface StatusMeta {
  tone: StatusTone
  shape: StatusShapeName
  label: string
}

export const STATUS_META: Record<Status, StatusMeta> = {
  available: { tone: 'ok', shape: 'dot', label: 'Disponible' },
  reserved: { tone: 'reserved', shape: 'square', label: 'Reservada' },
  occupied: { tone: 'busy', shape: 'striped-square', label: 'Ocupada' },
  inactive: { tone: 'inactive', shape: 'dash', label: 'Inactiva' },
  limited: { tone: 'limited', shape: 'diamond', label: 'Pocas mesas' },
  open: { tone: 'ok', shape: 'live-dot', label: 'Abierto' },
  closed: { tone: 'inactive', shape: 'dash', label: 'Cerrado' },
  error: { tone: 'error', shape: 'dot-alert', label: 'Error' },
}

/** Text color of each tone, for the shape (`currentColor`). Static strings so Tailwind generates them. */
export const TONE_TEXT: Record<StatusTone, string> = {
  ok: 'text-ok',
  reserved: 'text-reserved',
  busy: 'text-busy',
  inactive: 'text-inactive',
  limited: 'text-limited',
  error: 'text-error',
}

/** Chip background: the tone at 15 % (manual 3). */
export const TONE_CHIP_BG: Record<StatusTone, string> = {
  ok: 'bg-ok/15',
  reserved: 'bg-reserved/15',
  busy: 'bg-busy/15',
  inactive: 'bg-inactive/15',
  limited: 'bg-limited/15',
  error: 'bg-error/15',
}
