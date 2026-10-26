import { UserRoundCheck, UserRoundPlus, type LucideIcon } from 'lucide-react'

export type AuthView = 'signin' | 'signup'

export const AUTH_VIEWS: { view: AuthView; label: string; icon: LucideIcon }[] = [
  { view: 'signin', label: 'Iniciar sesión', icon: UserRoundCheck },
  { view: 'signup', label: 'Crear cuenta', icon: UserRoundPlus },
]

export const authTabId = (view: AuthView) => `auth-tab-${view}`
export const authPanelId = (view: AuthView) => `auth-panel-${view}`

/*
 * The card carries `group` + `data-view`. Both panels share one grid cell, so the cell is as tall as the taller one:
 * sign in leaves upwards and sign up comes in from below, 300 ms (manual 13.2). With reduced motion they just swap.
 */
const SLIDE = 'col-start-1 row-start-1 transition duration-(--dur-slow) ease-dinno'
export const SLIDE_CLASSES: Record<AuthView, string> = {
  signin: `${SLIDE} group-data-[view=signup]:-translate-y-full group-data-[view=signup]:opacity-0`,
  signup: `${SLIDE} translate-y-full opacity-0 group-data-[view=signup]:translate-y-0 group-data-[view=signup]:opacity-100`,
}

export function validateEmail(value: string, action: string): string | undefined {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? undefined : `Escribe un correo válido para ${action}.`
}
