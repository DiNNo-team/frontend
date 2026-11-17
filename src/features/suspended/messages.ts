// Texts of the suspended restaurant's screen (backend contract docs/admin-panel-contract.md, section 6).

export const SUSPENDED_TEXT = {
  title: 'Tu restaurante está suspendido',
  description: 'No apareces para los comensales mientras dure la suspensión. Las reservas que ya estaban en curso se respetan: puedes hacer su check-in.',
  reasonTitle: 'Motivo de la suspensión',
  contactQuestion: 'Si crees que es un error, escríbenos a',
  checkIn: 'Validar código',
  summaryTitle: 'Resumen y cobro',
  summaryDescription: 'Mira cuántos check-ins tuviste y cuánto se te cobra. Es solo de lectura.',
  summaryLink: 'Ver resumen',
  loadError: 'No pudimos cargar tu cuenta. Revisa tu conexión e intenta de nuevo.',
  retry: 'Intentar de nuevo',
} as const
