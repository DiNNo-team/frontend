// Contract with the backend (Santiago, PBI 3): POST /restaurants and GET /restaurants/me (Swagger, tag `restaurants`).
// Same rules as RestaurantFieldsDto, RegisterRestaurantDto and RestaurantScheduleDto. A contract change touches this file.

/** `RESTAURANT_CATEGORIES` of the backend, in the same order. */
export const RESTAURANT_CATEGORIES = [
  'colombian',
  'italian',
  'mexican',
  'asian',
  'grill',
  'fast_food',
  'healthy',
  'seafood',
  'cafe',
  'other',
] as const

export type RestaurantCategory = (typeof RESTAURANT_CATEGORIES)[number]

/** Interface texts of each category (Swagger description of `category`). */
export const RESTAURANT_CATEGORY_LABELS: Record<RestaurantCategory, string> = {
  colombian: 'Colombiana',
  italian: 'Italiana',
  mexican: 'Mexicana',
  asian: 'Asiática',
  grill: 'Parrilla',
  fast_food: 'Comida rápida',
  healthy: 'Saludable',
  seafood: 'Mariscos',
  cafe: 'Cafetería',
  other: 'Otra',
}

export const RESTAURANT_LIMITS = {
  nameMaxLength: 120,
  addressMaxLength: 255,
} as const

/** One open day as the API returns it. 1 = Monday … 7 = Sunday; hours are `"HH:MM"`, `null` when open 24 hours. */
export interface RestaurantSchedule {
  dayOfWeek: number
  isOpen24h: boolean
  opensAt: string | null
  closesAt: string | null
}

/** GET /restaurants/me and the 201 of POST /restaurants. `category` and `address` are `null` in restaurants created before PBI 3. */
export interface RestaurantProfile {
  id: string
  name: string
  category: RestaurantCategory | null
  address: string | null
  /** Only the days it opens, Monday to Sunday. */
  schedules: RestaurantSchedule[]
}

/** One open day in POST /restaurants. With `isOpen24h: true` no hours are sent. */
export type RegisterScheduleInput =
  | { dayOfWeek: number; isOpen24h: true }
  | { dayOfWeek: number; isOpen24h: false; opensAt: string; closesAt: string }

/** Body of POST /restaurants: exactly these fields (any other one is rejected with 400). */
export interface RegisterRestaurantInput {
  name: string
  category: RestaurantCategory
  address: string
  schedules: RegisterScheduleInput[]
}
