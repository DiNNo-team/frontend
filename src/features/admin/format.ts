// Number texts of the administrator's panel. Colombian pesos have no cents and use the dot for thousands, with a space
// after the sign in this panel («$ 374.000»; the restaurant's summary writes «$374.000»).

export function formatAdminCop(amount: number): string {
  const digits = String(Math.round(Math.abs(amount))).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${amount < 0 ? '-' : ''}$ ${digits}`
}

/** «+8 %» / «-12 %» against the previous month; `null` when there is nothing to compare with (the previous is 0). */
export function formatChange(current: number, previous: number): string | null {
  if (previous <= 0) return null
  const percent = Math.round(((current - previous) / previous) * 100)
  return `${percent > 0 ? '+' : ''}${percent} %`
}

/** `0.7114` → «71 %»; `null` → «Sin datos». */
export function formatRate(rate: number | null): string {
  return rate === null ? 'Sin datos' : `${Math.round(rate * 100)} %`
}

/** `15.4` → «15,4» (comma decimal, at most one decimal). */
export function formatAverage(value: number): string {
  return String(Math.round(value * 10) / 10).replace('.', ',')
}
