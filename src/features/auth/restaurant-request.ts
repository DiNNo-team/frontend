// Pending 2.2 of the Sprint 3 reparto, option A: restaurant accounts stay enabled by the team (no public sign-up), and
// the login offers a way to ask for one by email.

/** The team's mailbox. Public: it is the contact address of the product. */
export const TEAM_EMAIL = 'dinnoteam2026@gmail.com'

const SUBJECT = 'Quiero mi restaurante en DiNNo'
const BODY = 'Hola, equipo de DiNNo:\n\nNombre del restaurante:\nDirección:\nCorreo con el que voy a iniciar sesión:\n'

/** `mailto:` with the subject and the data the team needs to enable the account. */
export const RESTAURANT_REQUEST_MAILTO = `mailto:${TEAM_EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`

export const RESTAURANT_REQUEST_TEXT = {
  question: '¿Quieres tu restaurante en DiNNo?',
  action: 'Escríbenos',
} as const
