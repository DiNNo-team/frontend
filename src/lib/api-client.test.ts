import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiRequest, getApiErrorMessage, SESSION_EXPIRED_EVENT, setAuthTokenProvider } from './api-client'

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
