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
