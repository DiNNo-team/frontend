// Single source of status names, colors and shapes in the front (manual 3).
// SegmentedControl, TableCard and the activity log read from here; never redefine them in a feature.

export type Status =
  | 'available'
  | 'reserved'
  | 'occupied'
  | 'inactive'
  | 'limited'
  | 'open'
  | 'closed'
  | 'error'
  // Sprint 3: a table held by a DiNNo reservation (CLAUDE.md §12.2) and the four reservation states (§12.1).
  | 'dinno'
  | 'reservation-active'
  | 'reservation-completed'
  | 'reservation-expired'
  | 'reservation-cancelled'
  // Sprint 4: review of a restaurant by the DiNNo administrator (CLAUDE.md §12.12).
  | 'review-pending'
  | 'review-approved'
  | 'review-rejected'
  | 'review-suspended'
  // Sprint 4 (admin panel): a restaurant that is part of DiNNo, and the monthly billing state (docs/admin-panel-contract.md §3).
  | 'restaurant-active'
  | 'billing-in-progress'
  | 'billing-pending'
  | 'billing-paid'
  // Sprint 4 (restaurant summary): the same billing states seen by whoever pays: «Pagado», not «Cobrado».
  | 'payment-in-progress'
  | 'payment-pending'
  | 'payment-paid'
  // Sprint 4 (smart report): reliability of the restaurant's availability (backend CLAUDE.md §12.16).
  | 'reliability-high'
  | 'reliability-medium'
  | 'reliability-low'

export type StatusTone = 'ok' | 'reserved' | 'busy' | 'inactive' | 'limited' | 'error'

/**
 * `live-dot` is the dot with the pulsing Active Dot halo; `dot-alert` is the dot plus the alert icon; `square-lock` is the
 * Reservada square plus a lock: a table reserved through DiNNo, which the restaurant cannot change by hand (§12.2).
 */
export type StatusShapeName = 'dot' | 'square' | 'striped-square' | 'diamond' | 'dash' | 'dot-alert' | 'live-dot' | 'square-lock'

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
  // Same family as Reservada (it is reserved), told apart by the lock and the word. Never orange (manual 3).
  dinno: { tone: 'reserved', shape: 'square-lock', label: 'Reserva DiNNo' },
  // Reservation states: the same words and shapes in the diner app (manual 12.1).
  'reservation-active': { tone: 'ok', shape: 'live-dot', label: 'Activa' },
  // The table ends up Ocupada: same tone and shape.
  'reservation-completed': { tone: 'busy', shape: 'striped-square', label: 'Cumplida' },
  'reservation-expired': { tone: 'inactive', shape: 'dash', label: 'Vencida' },
  'reservation-cancelled': { tone: 'inactive', shape: 'dash', label: 'Cancelada' },
  // Review states of a restaurant (Sprint 4). Never orange; "No aprobada" uses the error tone, not a table state.
  'review-pending': { tone: 'limited', shape: 'diamond', label: 'En revisión' },
  'review-approved': { tone: 'ok', shape: 'dot', label: 'Aprobado' },
  'review-rejected': { tone: 'error', shape: 'dot-alert', label: 'No aprobada' },
  // Suspended: the same dash as Cerrado/Inactiva (paused, not an alarm), told apart by the word.
  'review-suspended': { tone: 'inactive', shape: 'dash', label: 'Suspendido' },
  'restaurant-active': { tone: 'ok', shape: 'dot', label: 'Activo' },
  // Billing of a month: in progress (square, like Reservada: still moving), pending (diamond, like Pocas mesas) and paid (dot).
  'billing-in-progress': { tone: 'reserved', shape: 'square', label: 'En curso' },
  'billing-pending': { tone: 'limited', shape: 'diamond', label: 'Pendiente' },
  'billing-paid': { tone: 'ok', shape: 'dot', label: 'Cobrado' },
  // Same tone and shape as the billing ones (one state, two points of view); only the word changes.
  'payment-in-progress': { tone: 'reserved', shape: 'square', label: 'En curso' },
  'payment-pending': { tone: 'limited', shape: 'diamond', label: 'Pendiente' },
  'payment-paid': { tone: 'ok', shape: 'dot', label: 'Pagado' },
  // Reliability of the availability: high is fine (dot), medium asks for attention (diamond, like a warning, manual 3.5) and
  // low is a problem to fix (dot + alert). Never orange.
  'reliability-high': { tone: 'ok', shape: 'dot', label: 'Alta' },
  'reliability-medium': { tone: 'limited', shape: 'diamond', label: 'Media' },
  'reliability-low': { tone: 'error', shape: 'dot-alert', label: 'Baja' },
}

/** Kit status of each reliability level of the smart report (`high` · `medium` · `low`). */
export const RELIABILITY_STATUS: Record<'high' | 'medium' | 'low', Status> = {
  high: 'reliability-high',
  medium: 'reliability-medium',
  low: 'reliability-low',
}

/** Kit status of each approval state of a restaurant (`pending` · `approved` · `rejected`). */
export const REVIEW_STATUS: Record<'pending' | 'approved' | 'rejected' | 'suspended', Status> = {
  pending: 'review-pending',
  approved: 'review-approved',
  rejected: 'review-rejected',
  suspended: 'review-suspended',
}

/** Billing state of a month by the API's  (docs/admin-panel-contract.md §3). */
export const BILLING_STATUS: Record<'in_progress' | 'pending' | 'paid', Status> = {
  in_progress: 'billing-in-progress',
  pending: 'billing-pending',
  paid: 'billing-paid',
}

/** The restaurant's view of the billing state of a month (restaurant summary): the same API values, «Pagado» instead of «Cobrado». */
export const PAYMENT_STATUS: Record<'in_progress' | 'pending' | 'paid', Status> = {
  in_progress: 'payment-in-progress',
  pending: 'payment-pending',
  paid: 'payment-paid',
}

/** Kit status of each reservation status of the API (`active` · `completed` · `expired` · `cancelled`). */
export const RESERVATION_STATUS: Record<'active' | 'completed' | 'expired' | 'cancelled', Status> = {
  active: 'reservation-active',
  completed: 'reservation-completed',
  expired: 'reservation-expired',
  cancelled: 'reservation-cancelled',
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

/**
 * Status surface of a table card or plan node (manual 3.6): the tone's tint and edge; Ocupada adds the hatch
 * (its "cuadrado rayado" shape). Inactive tables have no surface: dashed border instead. Static strings for Tailwind.
 */
export const TONE_SURFACE: Record<'ok' | 'reserved' | 'busy' | 'limited', string> = {
  ok: 'bg-tint-ok border-edge-ok',
  reserved: 'bg-tint-reserved border-edge-reserved',
  busy: 'bg-tint-busy border-edge-busy hatch-busy',
  limited: 'bg-tint-limited border-edge-limited',
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
