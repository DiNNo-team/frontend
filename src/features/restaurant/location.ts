// Restaurant location rules (Sprint 2 contract, CLAUDE.md section 10, "Reglas de los campos").
// Same values as BOGOTA_BOUNDS, isInsideBogota and roundCoordinate of the backend
// (restaurant-operations/shared/bogota-location.ts). A contract change touches this file.

export const BOGOTA_BOUNDS = {
  minLatitude: 4.45,
  maxLatitude: 4.85,
  minLongitude: -74.25,
  maxLongitude: -73.95,
} as const

/** Decimals the backend keeps (numeric(9,6)). */
export const COORDINATE_DECIMALS = 6

export interface Coordinates {
  latitude: number
  longitude: number
}

/** Bounds included: a point exactly on the edge is inside. */
export function isInsideBogota({ latitude, longitude }: Coordinates): boolean {
  return (
    latitude >= BOGOTA_BOUNDS.minLatitude &&
    latitude <= BOGOTA_BOUNDS.maxLatitude &&
    longitude >= BOGOTA_BOUNDS.minLongitude &&
    longitude <= BOGOTA_BOUNDS.maxLongitude
  )
}

/** Rounds like the backend does before saving, so the form sends what the database keeps. */
export function roundCoordinate(value: number): number {
  const factor = 10 ** COORDINATE_DECIMALS
  return Math.round(value * factor) / factor
}
