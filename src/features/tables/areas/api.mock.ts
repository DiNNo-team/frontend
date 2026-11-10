import { ApiError } from '@/lib/api-client'
import { mockTablesControl } from '../api.mock'
import { AREA_LIMITS, type TableArea } from '../types'
import type { TableAreasApi } from './api'

// In-memory stand-in for /v1/table-areas: same contract, same rules and texts as the backend.
// Start with zones: /mesas?mockAreas (Salón: 01–04, Terraza: 05–07; Mesa 08 without zone). Without it, no zones.
// Force errors: ?mockError=areas-list or areas-save. Latency follows ?mockLatency.

export const MOCK_AREAS: TableArea[] = [
  { id: 'area-salon', name: 'Salón' },
  { id: 'area-terraza', name: 'Terraza' },
]

function urlParams(): URLSearchParams {
  return typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search)
}

let areas: TableArea[] = urlParams().has('mockAreas') ? MOCK_AREAS.map((area) => ({ ...area })) : []
let nextId = 1
let latencyMs = Number(urlParams().get('mockLatency') ?? 300)

export const mockAreasControl = {
  reset(next: TableArea[] = []) {
    areas = next.map((area) => ({ ...area }))
    nextId = 1
  },
  setLatency(ms: number) {
    latencyMs = ms
  },
  snapshot(): TableArea[] {
    return areas.map((area) => ({ ...area }))
  },
}

/** For the tables mock: a table can only go to a zone that exists. */
export function mockAreaExists(id: string): boolean {
  return areas.some((area) => area.id === id)
}

async function simulate(operation: 'areas-list' | 'areas-save') {
  if (latencyMs > 0) await new Promise((resolve) => setTimeout(resolve, latencyMs))
  if (urlParams().get('mockError')?.split(',').includes(operation)) {
    throw new ApiError({ status: 0, isNetworkError: true, message: `Mock network error on ${operation}` })
  }
}

function fail(status: number, message: string): never {
  throw new ApiError({ status, message })
}

function validName(name: string, ignoreId?: string): string {
  const trimmed = name.trim()
  if (!trimmed) fail(400, 'Escribe el nombre de la zona.')
  if ([...trimmed].length > AREA_LIMITS.nameMaxLength) fail(400, `Usa máximo ${AREA_LIMITS.nameMaxLength} caracteres en el nombre de la zona.`)
  if (areas.some((area) => area.id !== ignoreId && area.name.trim().toLowerCase() === trimmed.toLowerCase())) {
    fail(409, `Ya tienes una zona llamada «${trimmed}». Usa otro nombre.`)
  }
  return trimmed
}

function findArea(id: string): TableArea {
  return areas.find((area) => area.id === id) ?? fail(404, 'No encontramos esta zona. Actualiza la página e intenta de nuevo.')
}

export const mockTableAreasApi: TableAreasApi = {
  async list() {
    await simulate('areas-list')
    return areas.map((area) => ({ ...area }))
  },
  async create(name) {
    await simulate('areas-save')
    if (areas.length >= AREA_LIMITS.maxAreas) fail(409, `Puedes tener máximo ${AREA_LIMITS.maxAreas} zonas.`)
    const area = { id: `area-${nextId++}`, name: validName(name) }
    areas.push(area)
    return { ...area }
  },
  async rename(id, name) {
    await simulate('areas-save')
    const area = findArea(id)
    area.name = validName(name, id)
    return { ...area }
  },
  async remove(id) {
    await simulate('areas-save')
    findArea(id)
    areas = areas.filter((area) => area.id !== id)
    mockTablesControl.leaveArea(id)
  },
}
