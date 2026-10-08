/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  /** "true" uses the in-memory tables mock (src/features/tables/api.mock.ts). */
  readonly VITE_USE_MOCKS?: string
  /** Public Firebase web configuration; these values are not secrets. */
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
