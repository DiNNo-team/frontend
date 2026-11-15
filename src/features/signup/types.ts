import type { RegisterRestaurantInput } from '@/features/restaurant/types'

// Contract: POST /v1/restaurants/signup (CLAUDE.md §12.12). A Firebase account with a verified email and no profile
// creates its restaurant user and the restaurant in review in one call.

/** The fields of POST /restaurants plus the contact phone, which the registration requires. */
export interface SignupRestaurantInput extends RegisterRestaurantInput {
  /** 7 to 15 digits; spaces, dashes, dots, parentheses and a leading + are accepted and the backend normalizes them. */
  contactPhone: string
}
