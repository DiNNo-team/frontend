const INTERNAL_ORIGIN = 'https://dinno.internal'

export function getSafeReturnTo(state: unknown): string | undefined {
  if (typeof state !== 'object' || state === null || !('from' in state) || typeof state.from !== 'string') {
    return undefined
  }

  const path = state.from
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return undefined

  try {
    const url = new URL(path, INTERNAL_ORIGIN)
    if (url.origin !== INTERNAL_ORIGIN || url.pathname === '/login') return undefined
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return undefined
  }
}

export function getSafeCurrentPath(location: { pathname: string; search: string; hash: string }): string {
  return getSafeReturnTo({ from: `${location.pathname}${location.search}${location.hash}` }) ?? '/mesas'
}

export function requiresFreshSignIn(state: unknown): boolean {
  return typeof state === 'object' && state !== null && 'forceSignIn' in state && state.forceSignIn === true
}