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

// Texts of the location picker (registration and edition). Its validation errors live in restaurant-form.ts.
export const LOCATION_TEXT = {
  locate: 'Ubicar en el mapa',
  locating: 'Ubicando…',
  help: 'Arrastra el pin hasta la entrada de tu restaurante o toca el mapa para moverlo.',
  // Sprint 2 plan, section 9: 404 ADDRESS_NOT_FOUND.
  addressNotFound: 'No encontramos esa dirección. Mueve el pin al lugar correcto.',
  // Backend AVISOS.md (Santiago): 503 GEOCODING_UNAVAILABLE.
  geocodingUnavailable: 'No pudimos ubicar la dirección en este momento. Mueve el pin al lugar correcto.',
  locateFailed: 'No pudimos ubicar la dirección. Intenta de nuevo en un momento.',
  mapUnavailable: 'No pudimos cargar el mapa. Con «Ubicar en el mapa» guardamos la ubicación de tu dirección.',
  locatedWithoutMap: (address: string) => `Ubicamos tu dirección: ${address}.`,
  notLocatedWithoutMap: 'No pudimos ubicar tu dirección. Puedes guardar y completar la ubicación después en Restaurante.',
} as const
