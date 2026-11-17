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

/** Fresh Firebase token of the session (null without one). The socket asks for it on every (re)connection. */
export async function getAuthToken(): Promise<string | null> {
  return tokenProvider ? tokenProvider() : null
}

/** Fired on `window` when the backend answers 401, so the auth feature can send the user to /login. */
export const SESSION_EXPIRED_EVENT = 'dinno:session-expired'

/** `errorCode` of the 401 for a Firebase account whose email is not verified yet (agreed with Jacobo). */
export const EMAIL_NOT_VERIFIED_CODE = 'EMAIL_NOT_VERIFIED'

/** Fired on `window` on that 401 instead of SESSION_EXPIRED_EVENT: the session is fine, the email is not. */
export const EMAIL_NOT_VERIFIED_EVENT = 'dinno:email-not-verified'

/** `errorCode` values for restaurant routes used by accounts with the wrong role. */
export const ACCOUNT_NOT_ENABLED_CODE = 'ACCOUNT_NOT_ENABLED'
export const DINER_ACCOUNT_CODE = 'DINER_ACCOUNT'

/** Fired on `window` for a verified account without a restaurant profile. */
export const ACCOUNT_NOT_ENABLED_EVENT = 'dinno:account-not-enabled'

/** Fired on `window` when a diner account opens a restaurant route. */
export const DINER_ACCOUNT_EVENT = 'dinno:diner-account'

/** Sprint 4 (CLAUDE.md §10 and §12.12): restaurant under review or rejected, and the DiNNo administrator account. */
export const ACCOUNT_PENDING_APPROVAL_CODE = 'ACCOUNT_PENDING_APPROVAL'
export const ACCOUNT_REJECTED_CODE = 'ACCOUNT_REJECTED'
export const ADMIN_ACCOUNT_CODE = 'ADMIN_ACCOUNT'
/** §12.15: an approved restaurant the administrator suspended. */
export const RESTAURANT_SUSPENDED_CODE = 'RESTAURANT_SUSPENDED'
/** A 403 with any of those means the account's state changed: the session flow asks `/me` and the restaurant again. */
export const ACCESS_CHANGED_EVENT = 'dinno:access-changed'

/** Texts of the account codes of Sprint 4 (the contract's, section 10). The backend `message` is never shown. */
export const ACCOUNT_ERROR_TEXT = {
  pending: 'Tu solicitud está en revisión. Te avisaremos cuando tu cuenta esté aprobada.',
  rejected: 'Tu solicitud no fue aprobada. Revisa el motivo, corrige tus datos y vuelve a enviarla.',
  admin: 'Esta es una cuenta de administrador de DiNNo. Usa el panel de administración en la web.',
  suspended:
    'Tu restaurante está suspendido y no aparece para los comensales. Revisa el motivo en tu cuenta o escríbenos a dinnoteam2026@gmail.com para reactivarlo.',
} as const

function isAccessChangeCode(code: string | undefined): boolean {
  return (
    code === ACCOUNT_PENDING_APPROVAL_CODE ||
    code === ACCOUNT_REJECTED_CODE ||
    code === ADMIN_ACCOUNT_CODE ||
    code === RESTAURANT_SUSPENDED_CODE
  )
}

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

/** Tells the session flow (AuthProvider, AccessGuard) what the error says about the account. */
function announceAccountEvents(error: ApiError) {
  const fire = (name: string) => window.dispatchEvent(new CustomEvent(name))
  if (error.status === 401) fire(error.code === EMAIL_NOT_VERIFIED_CODE ? EMAIL_NOT_VERIFIED_EVENT : SESSION_EXPIRED_EVENT)
  if (error.code === RESTAURANT_REQUIRED_CODE) fire(RESTAURANT_REQUIRED_EVENT)
  if (error.status !== 403) return
  if (error.code === ACCOUNT_NOT_ENABLED_CODE) fire(ACCOUNT_NOT_ENABLED_EVENT)
  if (error.code === DINER_ACCOUNT_CODE) fire(DINER_ACCOUNT_EVENT)
  if (isAccessChangeCode(error.code)) fire(ACCESS_CHANGED_EVENT)
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
    announceAccountEvents(error)
    throw error
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/** Manual 14.2 texts for the generic cases; `fallback` for everything else. */
/** 429 of the rate limit (§12.14). Not retried: the person tries again after a moment. */
export const RATE_LIMITED_TEXT = 'Hiciste muchas solicitudes seguidas. Espera un momento e intenta de nuevo.'

const NETWORK_ERROR_TEXT = 'No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.'

/** The text of each account code and of each generic status (manual 14.2). The backend's `message` is never shown. */
const TEXT_BY_CODE: Record<string, string> = {
  [EMAIL_NOT_VERIFIED_CODE]: 'Verifica tu correo para continuar.',
  [ACCOUNT_NOT_ENABLED_CODE]: 'Esta cuenta no está habilitada como restaurante. Si eres comensal, encuentra mesa desde la app DiNNo.',
  [DINER_ACCOUNT_CODE]: 'Esta es una cuenta de comensal. Para buscar mesa, usa la app DiNNo.',
  [ACCOUNT_PENDING_APPROVAL_CODE]: ACCOUNT_ERROR_TEXT.pending,
  [ACCOUNT_REJECTED_CODE]: ACCOUNT_ERROR_TEXT.rejected,
  [ADMIN_ACCOUNT_CODE]: ACCOUNT_ERROR_TEXT.admin,
  [RESTAURANT_SUSPENDED_CODE]: ACCOUNT_ERROR_TEXT.suspended,
}
const TEXT_BY_STATUS: Record<number, string> = {
  401: 'Tu sesión terminó. Inicia sesión de nuevo.',
  403: 'No tienes acceso a esta sección.',
  429: RATE_LIMITED_TEXT,
}

export function getApiErrorMessage(error: unknown, fallback = NETWORK_ERROR_TEXT): string {
  if (!(error instanceof ApiError)) return fallback
  if (error.isNetworkError) return NETWORK_ERROR_TEXT
  return (error.code ? TEXT_BY_CODE[error.code] : undefined) ?? TEXT_BY_STATUS[error.status] ?? fallback
}

/** 401 (session ended, email not verified) or 403 (no access): show `getApiErrorMessage`, and retrying makes no sense. */
export function isAccessError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 403)
}

/** Query retry rule: an answer the server gave on purpose (4xx) will not change by asking again; network and server errors retry once. */
export function retryUnlessAnswered(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && !error.isNetworkError && error.status < 500) return false
  return failureCount < 1
}
