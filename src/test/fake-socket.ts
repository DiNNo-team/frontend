// In-memory stand-in for socket.io-client in every test (mocked in setup.ts): no test opens a real connection.
// `lastSocket()` gives the socket the code under test created; `serverEmit` plays an event from the server.

type Handler = (...args: unknown[]) => void

export class FakeSocket {
  connected = false
  active = false
  readonly url: string
  readonly options: Record<string, unknown>
  private handlers = new Map<string, Set<Handler>>()
  connectCalls = 0

  constructor(url: string, options: Record<string, unknown> = {}) {
    this.url = url
    this.options = options
  }

  on(event: string, handler: Handler) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set())
    this.handlers.get(event)?.add(handler)
    return this
  }

  removeAllListeners() {
    this.handlers.clear()
    return this
  }

  connect() {
    this.connectCalls += 1
    this.active = true
    return this
  }

  disconnect() {
    this.active = false
    this.connected = false
    this.serverEmit('disconnect', 'io client disconnect')
    return this
  }

  /** The server accepted the handshake. */
  acceptConnection() {
    this.connected = true
    this.serverEmit('connect')
  }

  /** The connection dropped (network): Socket.IO keeps trying (`active`). */
  dropConnection() {
    this.connected = false
    this.serverEmit('disconnect', 'transport close')
  }

  /** The server rejected the handshake with a code (`connect_error.message`). */
  rejectConnection(code: string) {
    this.active = false
    this.serverEmit('connect_error', new Error(code))
  }

  serverEmit(event: string, ...args: unknown[]) {
    for (const handler of this.handlers.get(event) ?? []) handler(...args)
  }
}

const created: FakeSocket[] = []

export function fakeIo(url: string, options?: Record<string, unknown>): FakeSocket {
  const socket = new FakeSocket(url, options)
  created.push(socket)
  return socket
}

export function lastSocket(): FakeSocket | undefined {
  return created.at(-1)
}

export function createdSockets(): number {
  return created.length
}

export function resetFakeSockets() {
  created.length = 0
}
