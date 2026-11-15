// Contract: GET /v1/me (CLAUDE.md §10). Every role gets the same shape; a Firebase account without a profile gets
// 403 PROFILE_REQUIRED instead.

/** `restaurant_admin` and `platform_admin` use the web; `diner` is only for the app. */
export type UserRole = 'restaurant_admin' | 'diner' | 'platform_admin'

export interface Me {
  id: string
  email: string
  displayName: string | null
  role: UserRole
  restaurantId: string | null
}
