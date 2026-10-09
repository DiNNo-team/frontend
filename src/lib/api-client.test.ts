import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  apiRequest,
  EMAIL_NOT_VERIFIED_EVENT,
  getApiErrorMessage,
  isAccessError,
  RESTAURANT_REQUIRED_EVENT,
  SESSION_EXPIRED_EVENT,
  setAuthTokenProvider,
} from './api-client'

function mockFetch(response: Partial<Response> & { jsonBody?: unknown }) {
  const fn = vi.fn().mockResolvedValue({
    ok: response.ok ?? true,
    status: response.status ?? 200,
    json: () => Promise.resolve(response.jsonBody),
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

afterEach(() => {
  vi.unstubAllGlobals()
  setAuthTokenProvider(null)
})

describe('apiRequest', () => {
  it('calls VITE_API_URL + /v1 with JSON and the auth token', async () => {
    const fetchMock = mockFetch({ jsonBody: [{ id: '1' }] })
    setAuthTokenProvider(() => 'token-123')
    await expect(apiRequest('/tables', { method: 'POST', body: { identifier: '04' } })).resolves.toEqual([{ id: '1' }])
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('http://localhost:3000/v1/tables')
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json', Authorization: 'Bearer token-123' })
    expect(init.body).toBe('{"identifier":"04"}')
  })

  it('normalizes the proposed error format', async () => {
    mockFetch({ ok: false, status: 409, jsonBody: { statusCode: 409, code: 'TABLE_IDENTIFIER_TAKEN', message: 'taken' } })
    await expect(apiRequest('/tables')).rejects.toMatchObject({ status: 409, code: 'TABLE_IDENTIFIER_TAKEN', isNetworkError: false })
  })

  it('accepts the NestJS default format (message as an array)', async () => {
    mockFetch({ ok: false, status: 400, jsonBody: { statusCode: 400, message: ['capacity must be ≤ 20'], error: 'Bad Request' } })
    const error = await apiRequest('/tables').catch((caught: unknown) => caught)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(400)
  })

  it('reads the backend errorCode and announces RESTAURANT_REQUIRED for the auth feature', async () => {
    mockFetch({
      ok: false,
      status: 403,
      jsonBody: { statusCode: 403, message: 'Primero registra tu restaurante.', error: 'Forbidden', errorCode: 'RESTAURANT_REQUIRED' },
    })
    const listener = vi.fn()
    window.addEventListener(RESTAURANT_REQUIRED_EVENT, listener)
    await expect(apiRequest('/tables')).rejects.toMatchObject({ status: 403, code: 'RESTAURANT_REQUIRED' })
    window.removeEventListener(RESTAURANT_REQUIRED_EVENT, listener)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('a 401 for an unverified email announces EMAIL_NOT_VERIFIED, not an expired session', async () => {
    mockFetch({
      ok: false,
      status: 401,
      jsonBody: { statusCode: 401, message: 'Verifica tu correo.', error: 'Unauthorized', errorCode: 'EMAIL_NOT_VERIFIED' },
    })
    const expired = vi.fn()
    const unverified = vi.fn()
    window.addEventListener(SESSION_EXPIRED_EVENT, expired)
    window.addEventListener(EMAIL_NOT_VERIFIED_EVENT, unverified)
    const error = await apiRequest('/tables').catch((caught: unknown) => caught)
    window.removeEventListener(SESSION_EXPIRED_EVENT, expired)
    window.removeEventListener(EMAIL_NOT_VERIFIED_EVENT, unverified)
    expect(unverified).toHaveBeenCalledTimes(1)
    expect(expired).not.toHaveBeenCalled()
    expect(getApiErrorMessage(error)).toBe('Verifica tu correo para continuar.')
  })

  it('turns fetch failures into network errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(apiRequest('/tables')).rejects.toMatchObject({ isNetworkError: true, status: 0 })
  })

  it('emits session-expired on 401', async () => {
    mockFetch({ ok: false, status: 401, jsonBody: {} })
    const listener = vi.fn()
    window.addEventListener(SESSION_EXPIRED_EVENT, listener)
    await apiRequest('/tables').catch(() => undefined)
    window.removeEventListener(SESSION_EXPIRED_EVENT, listener)
    expect(listener).toHaveBeenCalledTimes(1)
  })
})

describe('getApiErrorMessage', () => {
  it('uses the manual texts, never the raw backend message', () => {
    expect(getApiErrorMessage(new ApiError({ status: 0, isNetworkError: true }))).toBe(
      'No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.',
    )
    expect(getApiErrorMessage(new ApiError({ status: 401 }))).toBe('Tu sesión terminó. Inicia sesión de nuevo.')
    expect(getApiErrorMessage(new ApiError({ status: 403 }))).toBe('No tienes acceso a esta sección.')
    expect(getApiErrorMessage(new ApiError({ status: 500, message: 'stack trace' }), 'Texto propio')).toBe('Texto propio')
  })
})

describe('isAccessError', () => {
  it('is true for 401 (session, unverified email) and 403 (no access, no restaurant)', () => {
    expect(isAccessError(new ApiError({ status: 401 }))).toBe(true)
    expect(isAccessError(new ApiError({ status: 401, code: 'EMAIL_NOT_VERIFIED' }))).toBe(true)
    expect(isAccessError(new ApiError({ status: 403 }))).toBe(true)
    expect(isAccessError(new ApiError({ status: 403, code: 'RESTAURANT_REQUIRED' }))).toBe(true)
  })

  it('is false for network, validation, conflict and server errors, and for anything that is not an ApiError', () => {
    expect(isAccessError(new ApiError({ status: 0, isNetworkError: true }))).toBe(false)
    expect(isAccessError(new ApiError({ status: 400 }))).toBe(false)
    expect(isAccessError(new ApiError({ status: 409 }))).toBe(false)
    expect(isAccessError(new ApiError({ status: 500 }))).toBe(false)
    expect(isAccessError(new Error('403'))).toBe(false)
    expect(isAccessError(undefined)).toBe(false)
  })
})
