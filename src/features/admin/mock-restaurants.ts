import type { RestaurantCategory } from '@/features/restaurant/types'

// The restaurants of the sample data, shared by the review mock and the billing/activity mock so that a restaurant opened
// from one list is the same in the other: [name, category, check-ins in a full month].
export const MOCK_PANEL_ROWS: readonly [string, RestaurantCategory, number][] = [
  ['Abasto Usaquén', 'colombian', 41],
  ['Casa 72', 'colombian', 36],
  ['Al Alma Parque 93', 'italian', 33],
  ['Sipote Burrito Andino', 'mexican', 29],
  ['Casa 45', 'grill', 27],
  ['Casa 16', 'colombian', 6],
  ['Trattoria del Parque', 'italian', 5],
  ['Mar de Chapinero', 'seafood', 4],
  ['Café Quinta', 'cafe', 4],
  ['Asados del Norte', 'grill', 3],
  ['Verde Vivo', 'healthy', 3],
  ['La Esquina Tapatía', 'mexican', 2],
  ['Sushi Candelaria', 'asian', 2],
  ['Pan y Brasa', 'fast_food', 2],
  ['Don Ramón', 'colombian', 1],
  ['Tranquilo', 'other', 3],
]

/** The restaurant that starts suspended. */
export const MOCK_SUSPENDED_INDEX = 15

export const mockRestaurantId = (index: number) => `mock-restaurant-${index + 1}`
