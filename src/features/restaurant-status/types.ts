// Contract with the backend (Sergio, PBI 8): GET /restaurants/me/status → { isOpen } and
// PATCH /restaurants/me/status with { isOpen } → { isOpen }. A contract change touches only this file and api.ts.
// Errors: 401 without session, 403 RESTAURANT_REQUIRED without restaurant, 400 invalid body.
// `message` is never shown: the UI uses the manual's texts.

export interface RestaurantStatus {
  isOpen: boolean
}
