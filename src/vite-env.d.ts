/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  /** "true" uses the in-memory mocks of tables, restaurant status and activity log (each feature's api.mock.ts). Sign-in still uses Firebase. */
  readonly VITE_USE_MOCKS?: string
  /** Google Maps JavaScript API key for the restaurant location map; restricted by domain in Google Cloud. Optional: without it there is no map. */
  readonly VITE_GOOGLE_MAPS_API_KEY?: string
  /** Google Maps Map ID (not a secret), required by the draggable pin and the dark map. Optional: without it there is no map. */
  readonly VITE_GOOGLE_MAPS_MAP_ID?: string
  /** Public Firebase web configuration; these values are not secrets. */
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
