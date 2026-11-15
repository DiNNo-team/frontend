// Number texts of the summary. Colombian pesos have no cents and use the dot for thousands.

/** `24000` → «$24.000». */
export function formatCop(amount: number): string {
  const digits = String(Math.round(Math.abs(amount))).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${amount < 0 ? '-' : ''}$${digits}`
}

/** `3.2` → «3,2» (comma decimal, up to 2 decimals, no trailing zeros). */
export function formatDecimal(value: number): string {
  return String(Math.round(value * 100) / 100).replace('.', ',')
}

/** An hour 0–23 as in the dashboard: «1:00 a. m.», «7:00 p. m.». */
export function formatHour(hour: number): string {
  const suffix = hour < 12 ? 'a. m.' : 'p. m.'
  const twelve = hour % 12 === 0 ? 12 : hour % 12
  return `${twelve}:00 ${suffix}`
}
