import { ACCOUNT_ERROR_TEXT } from '@/lib/api-client'
import type { AccessKind } from './access'

// Texts of the account screens (CLAUDE.md §10). Each one is the contract's text for that code, never the backend's.

export const ACCESS_SCREEN_TEXT: Record<'no-profile' | 'diner' | 'admin' | 'pending' | 'rejected', { title: string; description: string }> = {
  'no-profile': {
    title: 'Cierra sesión para continuar.',
    description: 'Esta cuenta no está habilitada como restaurante. Si eres comensal, encuentra mesa desde la app DiNNo.',
  },
  diner: {
    title: 'Cierra sesión para continuar.',
    description: 'Esta es una cuenta de comensal. Para buscar mesa, usa la app DiNNo.',
  },
  admin: { title: 'Cuenta de administrador', description: ACCOUNT_ERROR_TEXT.admin },
  pending: { title: 'Solicitud en revisión', description: ACCOUNT_ERROR_TEXT.pending },
  rejected: { title: 'Solicitud no aprobada', description: ACCOUNT_ERROR_TEXT.rejected },
}

export const ACCESS_LOAD_ERROR = 'No pudimos comprobar tu cuenta. Revisa tu conexión e intenta de nuevo.'
export const ACCESS_RETRY = 'Intentar de nuevo'

export function accessScreenKind(kind: AccessKind): keyof typeof ACCESS_SCREEN_TEXT | null {
  return kind in ACCESS_SCREEN_TEXT ? (kind as keyof typeof ACCESS_SCREEN_TEXT) : null
}
