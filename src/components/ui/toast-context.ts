import { createContext, useContext } from 'react'

export type ToastType = 'success' | 'info' | 'warning' | 'error'

export interface ToastOptions {
  type?: ToastType
  message: string
  /** Undo-style action ("Deshacer"). Raises the default duration to 6 s. */
  action?: { label: string; onClick: () => void }
  /** Milliseconds. Default 4000, or 6000 with an action. */
  duration?: number
}

export interface ToastApi {
  /** Shows a toast. Only one at a time: a new one replaces the current one. */
  show: (options: ToastOptions) => void
  dismiss: () => void
}

export const ToastContext = createContext<ToastApi | null>(null)

/** `const toast = useToast(); toast.show({ type: 'success', message: 'Mesa 04 agregada' })` */
export function useToast(): ToastApi {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context
}

/** Lets a FloatingBar tell the toasts to sit above it, so they never cover its controls. */
export const ToastLayoutContext = createContext<(barVisible: boolean) => void>(() => undefined)
