import { ApiError, getApiErrorMessage, isAccessError } from '@/lib/api-client'

// Texts of the public registration and of the request screen (CLAUDE.md §12.12). Backend `message`s are never shown.

export const SIGNUP_TEXT = {
  progressLabel: 'Progreso del registro',
  steps: ['Crea tu cuenta', 'Datos de tu restaurante'],
  step: (number: number) => `Paso ${number} de 2`,
  // Step 1
  accountTitle: 'Crea tu cuenta de restaurante',
  accountDescription: 'Con tu cuenta administras tus mesas en DiNNo. Después te pedimos los datos de tu restaurante.',
  createAccount: 'Crear cuenta',
  creatingAccount: 'Creando cuenta…',
  continueWithGoogle: 'Continuar con Google',
  connectingGoogle: 'Conectando con Google…',
  orWith: 'O crea tu cuenta con',
  alreadyHaveAccount: '¿Ya tienes cuenta?',
  signIn: 'Inicia sesión',
  emailLabel: 'Correo',
  passwordLabel: 'Contraseña',
  passwordHelp: 'Usa al menos 6 caracteres.',
  passwordRequired: 'Escribe una contraseña para crear tu cuenta.',
  passwordTooShort: 'La contraseña es muy corta. Usa al menos 6 caracteres.',
  diner: '¿Eres comensal? Encuentra mesa desde la app DiNNo.',
  accountCreatedToast: 'Cuenta creada. Te enviamos un correo para verificarla.',
  // Step 2
  detailsTitle: 'Cuéntanos de tu restaurante',
  detailsDescription: 'Revisamos cada restaurante antes de mostrarlo a los comensales en DiNNo.',
  submit: 'Enviar solicitud',
  confirmTitle: '¿Enviar tu solicitud?',
  confirmBody: 'Revisaremos los datos de tu restaurante. Mientras tanto puedes editarlos, y esta pantalla te avisa cuando tu cuenta esté aprobada.',
  confirmSend: 'Enviar solicitud',
  sending: 'Enviando…',
  sentToast: 'Solicitud enviada',
  alreadyRegistered: 'Ya registraste tu restaurante. Te llevamos al estado de tu solicitud.',
  invalidData: 'Revisa los datos de tu restaurante e intenta de nuevo.',
  sendFailed: 'No pudimos enviar tu solicitud. Intenta de nuevo en un momento.',
} as const

export const REQUEST_TEXT = {
  loadError: 'No pudimos cargar tu solicitud. Revisa tu conexión e intenta de nuevo.',
  retry: 'Intentar de nuevo',
  signOut: 'Cerrar sesión',
  signOutFailed: 'No pudimos cerrar sesión. Intenta de nuevo.',
  // En revisión
  pendingTitle: 'Tu solicitud está en revisión',
  pendingDescription: 'Revisamos cada restaurante antes de mostrarlo a los comensales. Todavía no necesitas hacer nada.',
  pendingAlertTitle: 'En revisión',
  pendingAlert: 'Cuando tu cuenta esté aprobada, esta pantalla te lleva a tus mesas. Se actualiza sola cada 30 segundos.',
  nextTitle: 'Qué sigue',
  nextSteps: [
    'El equipo de DiNNo revisa los datos que enviaste.',
    'Si todo está bien, aprobamos tu restaurante y podrás administrar tus mesas.',
    'Si hay algo por corregir, aquí verás el motivo para que lo cambies y vuelvas a enviar.',
  ],
  contactQuestion: '¿Tienes dudas? Escríbenos a',
  sentTitle: 'Datos que enviaste',
  edit: 'Editar mis datos',
  editSave: 'Guardar cambios',
  editCancel: 'Cancelar',
  editSavedToast: 'Cambios guardados',
  // No aprobada
  rejectedTitle: 'Tu solicitud no fue aprobada',
  rejectedDescription: 'Corrige tus datos y vuelve a enviar la solicitud. La revisaremos de nuevo.',
  rejectedReasonTitle: 'Qué debes corregir',
  resend: 'Reenviar solicitud',
  resendConfirmTitle: '¿Reenviar tu solicitud?',
  resendConfirmBody: 'Guardamos tus cambios y volvemos a revisar tu restaurante. Mientras tanto, esta pantalla te muestra el estado.',
  resendConfirm: 'Reenviar solicitud',
  resending: 'Reenviando…',
  resentToast: 'Solicitud reenviada',
  notRejected: 'Tu solicitud ya no está rechazada. Te mostramos su estado actual.',
  resendFailed: 'No pudimos reenviar tu solicitud. Intenta de nuevo en un momento.',
  welcomeToast: 'Tu restaurante fue aprobado. Bienvenido a DiNNo.',
} as const

export const SIGNUP_ERROR_CODES = { notRejected: 'RESTAURANT_NOT_REJECTED' } as const

function isConflict(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409
}

/** The text for a failed registration, by status and `errorCode`; the backend `message` is never shown. */
export function describeSignupError(error: unknown): string {
  if (isConflict(error)) return SIGNUP_TEXT.alreadyRegistered
  if (error instanceof ApiError) {
    if (error.isNetworkError || isAccessError(error)) return getApiErrorMessage(error)
    if (error.status === 400) return SIGNUP_TEXT.invalidData
  }
  return SIGNUP_TEXT.sendFailed
}

/** `true` for 409 RESTAURANT_NOT_REJECTED: the request is not rejected any more, so the screen asks its state again. */
export function isNotRejectedError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409 && error.code === SIGNUP_ERROR_CODES.notRejected
}

/** The text for a failed resend (saving the changes or sending it again). */
export function describeResendError(error: unknown): string {
  if (isNotRejectedError(error)) return REQUEST_TEXT.notRejected
  if (error instanceof ApiError) {
    if (error.isNetworkError || isAccessError(error)) return getApiErrorMessage(error)
    if (error.status === 400) return SIGNUP_TEXT.invalidData
  }
  return REQUEST_TEXT.resendFailed
}
