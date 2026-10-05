import { apiUrl } from './api'

/** Normalized backend error. The UI never shows `message`: it maps `status` / `code` to manual texts. */
export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly fieldErrors?: Record<string, string>
  readonly isNetworkError: boolean

  constructor(init: { status: number; code?: string; fieldErrors?: Record<string, string>; isNetworkError?: boolean; message?: string }) {
    super(init.message ?? `API error ${init.status}${init.code ? ` (${init.code})` : ''}`)
    this.name = 'ApiError'
    this.status = init.status
    this.code = init.code
    this.fieldErrors = init.fieldErrors
    this.isNetworkError = init.isNetworkError ?? false
  }
}

type TokenProvider = () => string | null | Promise<string | null>

let tokenProvider: TokenProvider | null = null

/** Jacobo plugs the Firebase ID token here. Every request then carries `Authorization: Bearer <token>`. */
export function setAuthTokenProvider(provider: TokenProvider | null) {
  tokenProvider = provider
}

/** Fired on `window` when the backend answers 401, so the auth feature can send the user to /login. */
export const SESSION_EXPIRED_EVENT = 'dinno:session-expired'

interface ErrorBody {
  statusCode?: number
  code?: string
  error?: string
  message?: string | string[]
  fields?: Record<string, string>
}

async function toApiError(response: Response): Promise<ApiError> {
  let body: ErrorBody = {}
  try {
    body = (await response.json()) as ErrorBody
  } catch {
    // Non-JSON error page (proxy, HTML 502…): the status is enough.
  }
  const message = Array.isArray(body.message) ? body.message.join('; ') : body.message
  return new ApiError({ status: response.status, code: body.code, fieldErrors: body.fields, message })
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

/** JSON request to the backend (`/v1` is added by `apiUrl`). Throws `ApiError`. Never send `restaurantId`. */
export async function apiRequest<T>(path: string, { method = 'GET', body, signal }: ApiRequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = tokenProvider ? await tokenProvider() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(apiUrl(path), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (cause) {
    if (signal?.aborted) throw cause
    throw new ApiError({ status: 0, isNetworkError: true, message: 'Network error' })
  }

  if (response.status === 401) window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
  if (!response.ok) throw await toApiError(response)
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/** Manual 14.2 texts for the generic cases; `fallback` for everything else. */
export function getApiErrorMessage(error: unknown, fallback = 'No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.'): string {
  if (error instanceof ApiError) {
    if (error.isNetworkError) return 'No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.'
    if (error.status === 401) return 'Tu sesión terminó. Inicia sesión de nuevo.'
    if (error.status === 403) return 'No tienes acceso a esta sección.'
  }
  return fallback
}
