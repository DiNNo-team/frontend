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

/** `errorCode` of the 401 for a Firebase account whose email is not verified yet (agreed with Jacobo). */
export const EMAIL_NOT_VERIFIED_CODE = 'EMAIL_NOT_VERIFIED'

/** Fired on `window` on that 401 instead of SESSION_EXPIRED_EVENT: the session is fine, the email is not. */
export const EMAIL_NOT_VERIFIED_EVENT = 'dinno:email-not-verified'

/** `errorCode` of the 403 for a session user without a restaurant yet. */
export const RESTAURANT_REQUIRED_CODE = 'RESTAURANT_REQUIRED'

/** Fired on `window` on that 403, so the auth feature can send the user to /onboarding. */
export const RESTAURANT_REQUIRED_EVENT = 'dinno:restaurant-required'

interface ErrorBody {
  statusCode?: number
  /** The backend's reason, only when one status has several causes (e.g. RESTAURANT_REQUIRED). */
  errorCode?: string
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
  return new ApiError({ status: response.status, code: body.errorCode ?? body.code, fieldErrors: body.fields, message })
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

  if (!response.ok) {
    const error = await toApiError(response)
    if (error.status === 401) {
      const event = error.code === EMAIL_NOT_VERIFIED_CODE ? EMAIL_NOT_VERIFIED_EVENT : SESSION_EXPIRED_EVENT
      window.dispatchEvent(new CustomEvent(event))
    }
    if (error.code === RESTAURANT_REQUIRED_CODE) window.dispatchEvent(new CustomEvent(RESTAURANT_REQUIRED_EVENT))
    throw error
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/** Manual 14.2 texts for the generic cases; `fallback` for everything else. */
export function getApiErrorMessage(error: unknown, fallback = 'No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.'): string {
  if (error instanceof ApiError) {
    if (error.isNetworkError) return 'No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.'
    if (error.code === EMAIL_NOT_VERIFIED_CODE) return 'Verifica tu correo para continuar.'
    if (error.status === 401) return 'Tu sesión terminó. Inicia sesión de nuevo.'
    if (error.status === 403) return 'No tienes acceso a esta sección.'
  }
  return fallback
}

/** 401 (session ended, email not verified) or 403 (no access): show `getApiErrorMessage`, and retrying makes no sense. */
export function isAccessError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 403)
}
