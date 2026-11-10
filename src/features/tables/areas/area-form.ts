import { ApiError, getApiErrorMessage } from '@/lib/api-client'
import { AREA_LIMITS, type TableArea } from '../types'

// Same rules and texts as the backend (table-areas/table-area-rules.ts).
export const AREA_MESSAGES = {
  nameRequired: 'Escribe el nombre de la zona.',
  nameTooLong: `Usa máximo ${AREA_LIMITS.nameMaxLength} caracteres en el nombre de la zona.`,
  nameTaken: (name: string) => `Ya tienes una zona llamada «${name.trim()}». Usa otro nombre.`,
  limit: `Puedes tener máximo ${AREA_LIMITS.maxAreas} zonas.`,
  saveFailed: 'No pudimos guardar la zona. Revisa tu conexión e intenta de nuevo.',
  deleteFailed: 'No pudimos eliminar la zona. Revisa tu conexión e intenta de nuevo.',
  notFound: 'Esta zona ya no existe. Actualiza la página.',
} as const

/** "Terraza", " terraza " and "TERRAZA" are the same zone. `ignoreId` skips the zone being renamed. */
export function validateAreaName(name: string, existing: TableArea[], ignoreId?: string): string | undefined {
  const trimmed = name.trim()
  if (!trimmed) return AREA_MESSAGES.nameRequired
  if ([...trimmed].length > AREA_LIMITS.nameMaxLength) return AREA_MESSAGES.nameTooLong
  const key = trimmed.toLowerCase()
  const taken = existing.some((area) => area.id !== ignoreId && area.name.trim().toLowerCase() === key)
  return taken ? AREA_MESSAGES.nameTaken(trimmed) : undefined
}

/** A backend error as a text for the zones dialog. Never the raw backend text, except the session/permission ones. */
export function describeAreaError(error: unknown, name: string, fallback: string = AREA_MESSAGES.saveFailed): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) return getApiErrorMessage(error)
    if (error.status === 404) return AREA_MESSAGES.notFound
    if (error.status === 409) return error.message.includes(String(AREA_LIMITS.maxAreas)) ? AREA_MESSAGES.limit : AREA_MESSAGES.nameTaken(name)
    if (error.status === 400) return validateAreaName(name, []) ?? AREA_MESSAGES.nameTooLong
  }
  return fallback
}
