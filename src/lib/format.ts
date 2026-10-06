// Hand-written on purpose: `Intl` output differs between browsers
// (odd spaces in "p. m.", "sept." with a dot), and the manual fixes one exact format.

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'] as const

function formatClock(hours24: number, minutes: number): string {
  const suffix = hours24 < 12 ? 'a. m.' : 'p. m.'
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
  return `${hours12}:${String(minutes).padStart(2, '0')} ${suffix}`
}

/** `'19:30'` → `'7:30 p. m.'` · `'00:00'` → `'12:00 a. m.'` · `'12:00'` → `'12:00 p. m.'` */
export function formatTime12h(time: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time)
  if (!match) throw new Error(`Invalid time "${time}", expected HH:mm`)
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) throw new Error(`Invalid time "${time}", expected HH:mm`)
  return formatClock(hours, minutes)
}

function toDate(value: Date | string): Date {
  return typeof value === 'string' ? new Date(value) : value
}

/** `'30 sept 2026'` (browser local time). */
export function formatDate(value: Date | string): string {
  const date = toDate(value)
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

/** `'30 sept · 7:30 p. m.'` (browser local time). Used in tables such as the activity log. */
export function formatDateTime(value: Date | string): string {
  const date = toDate(value)
  return `${date.getDate()} ${MONTHS[date.getMonth()]} · ${formatClock(date.getHours(), date.getMinutes())}`
}

/** `1` → `'1 persona'` · `4` → `'4 personas'` */
export function formatCapacity(people: number): string {
  return `${people} ${people === 1 ? 'persona' : 'personas'}`
}

const NUMERIC = /^\d+$/
const TABLE_WORD = /^mesa\s+/i

/**
 * The identifier without a leading "Mesa": the backend may store the full name ("Mesa 4")
 * while the form sends the short one ("04"); both mean the same table.
 */
export function tableIdentifierCore(identifier: string): string {
  const trimmed = identifier.trim()
  return trimmed.replace(TABLE_WORD, '').trim() || trimmed
}

/**
 * `'4'`, `'04'`, `'Mesa 4'` → `'Mesa 04'` · `'123'` → `'Mesa 123'` · `'T1'` → `'Mesa T1'` · `'Mesa'` → `'Mesa'`.
 * Same rule as the backend (`tables/table-identifier.ts`).
 */
export function formatTableName(identifier: string): string {
  const core = tableIdentifierCore(identifier)
  if (core.toLowerCase() === 'mesa') return 'Mesa'
  if (NUMERIC.test(core)) return `Mesa ${String(Number(core)).padStart(2, '0')}`
  return `Mesa ${core}`
}

/** Key to detect repeated identifiers: `'04'`, `'4'` and `'Mesa 4'` collide; `' T1 '` and `'t1'` collide. */
export function normalizeTableIdentifier(identifier: string): string {
  const core = tableIdentifierCore(identifier)
  if (NUMERIC.test(core)) return String(Number(core))
  return core.toLowerCase()
}
