const API_VERSION_PREFIX = '/v1'

const API_ORIGIN = import.meta.env.VITE_API_URL.replace(/\/+$/, '')

/** Builds a backend URL: `apiUrl('/health')` -> `${VITE_API_URL}/v1/health`. */
export function apiUrl(path: string): string {
  return `${API_ORIGIN}${API_VERSION_PREFIX}${path.startsWith('/') ? path : `/${path}`}`
}

/** `fetch` against the backend; the `/v1` prefix is added by `apiUrl`. */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), init)
}
