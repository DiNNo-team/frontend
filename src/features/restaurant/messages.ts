// Texts of the restaurant registration (/onboarding). The form texts and its errors live in restaurant-form.ts.

export const ONBOARDING_TEXT = {
  // Manual 12.4; the secondary line comes from the onboarding mockup (manual 10).
  title: 'Configura tu restaurante',
  description: 'Esta información la verán los comensales en DiNNo.',
  submit: 'Guardar y continuar',
  // Manual 14.2: "Toast al guardar".
  savedToast: 'Cambios guardados',
  // 409: the user already has a restaurant. Same text as the backend, owned by the web.
  alreadyRegisteredToast: 'Ya registraste tu restaurante. Para cambiar sus datos, entra a Restaurante.',
} as const

// Dashboard notice while the restaurant has no coordinates (Sprint 2 plan, section 9; final period added
// like the closed notice, decision of Santiago, 2026-10-22).
export const LOCATION_BANNER_TEXT = {
  text: 'Completa la ubicación de tu restaurante para que los comensales te encuentren en DiNNo.',
  action: 'Completar ubicación',
} as const

// Texts of the location picker (registration and edition). Its validation errors live in restaurant-form.ts.
export const LOCATION_TEXT = {
  locate: 'Ubicar en el mapa',
  locating: 'Ubicando…',
  help: 'Arrastra el pin hasta la entrada de tu restaurante o toca el mapa para moverlo.',
  // GET /geocode answers with neutral messages (CLAUDE.md §10): the web picks its own text by errorCode.
  // With the map, the person moves the pin by hand (Sprint 2 closing notes, Elizabeth, 2026-10-26).
  addressNotFound: 'No encontramos esa dirección en Bogotá. Mueve el pin al lugar correcto.',
  geocodingUnavailable: 'No pudimos ubicar la dirección en este momento. Mueve el pin al lugar correcto.',
  locateFailed: 'No pudimos ubicar la dirección. Intenta de nuevo en un momento.',
  // Without the map (no key or Map ID in this build): informative, not an error.
  mapUnavailable: 'Con «Ubicar en el mapa» guardamos la ubicación de tu dirección.',
  locatedWithoutMap: (address: string) => `Ubicamos tu dirección: ${address}.`,
  addressNotFoundWithoutMap:
    'No encontramos esa dirección en Bogotá. Revísala o guarda y completa la ubicación después en Restaurante.',
  geocodingUnavailableWithoutMap:
    'No pudimos ubicar la dirección en este momento. Intenta de nuevo o guarda y completa la ubicación después en Restaurante.',
} as const
