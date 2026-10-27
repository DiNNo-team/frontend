import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { CircleAlert, CircleCheck, Info, TriangleAlert, X, type LucideIcon } from 'lucide-react'
import { Toast as RadixToast } from 'radix-ui'
import { cn } from '@/lib/cn'
import { Icon } from '@/lib/icon'
import { useTheme } from '@/lib/theme-context'
import { IconButton } from './IconButton'
import { ToastContext, type ToastOptions, type ToastType } from './toast-context'

const ICONS: Record<ToastType, { icon: LucideIcon; color: string }> = {
  success: { icon: CircleCheck, color: 'text-ok' },
  info: { icon: Info, color: 'text-info' },
  warning: { icon: TriangleAlert, color: 'text-limited' },
  error: { icon: CircleAlert, color: 'text-error' },
}

interface ActiveToast extends ToastOptions {
  id: number
}

/**
 * Temporary notice (manual 12.2, v2.1): centered at the top, under the bar, like the phone's banners; the bottom
 * belongs to the navigation dock. One at a time, pauses on hover or focus, comes in and leaves
 * through the top. Announced politely; errors assertively.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<ActiveToast | null>(null)
  const { theme } = useTheme()
  // The toast sits on the inverse surface, so its icon and close button read the opposite theme's tokens.
  const inverseScope = theme === 'dark' ? 't-light' : 't-dark'

  const show = useCallback((options: ToastOptions) => {
    setCurrent((previous) => ({ ...options, id: (previous?.id ?? 0) + 1 }))
  }, [])
  const dismiss = useCallback(() => setCurrent(null), [])
  const api = useMemo(() => ({ show, dismiss }), [show, dismiss])

  const type = current?.type ?? 'success'
  const icon = ICONS[type]

  return (
    <ToastContext.Provider value={api}>
      <RadixToast.Provider swipeDirection="up" label="Avisos">
          {children}
          {current && (
            <RadixToast.Root
              key={current.id}
              type={type === 'error' ? 'foreground' : 'background'}
              duration={current.duration ?? (current.action ? 6000 : 4000)}
              onOpenChange={(open) => {
                if (!open) setCurrent(null)
              }}
              className="flex w-full max-w-100 items-center gap-3 rounded-btn bg-inverse px-4 py-3 text-sec text-on-inverse shadow-lifted data-[state=closed]:animate-lift-out data-[state=open]:animate-drop-in"
            >
              <span className={cn('inline-flex shrink-0', inverseScope)}>
                <Icon icon={icon.icon} size={20} className={icon.color} />
              </span>
              <RadixToast.Description className="min-w-0 flex-1">{current.message}</RadixToast.Description>
              {current.action && (
                <RadixToast.Action asChild altText={current.action.label}>
                  <button
                    type="button"
                    onClick={current.action.onClick}
                    className="min-h-11 shrink-0 cursor-pointer rounded-input px-2 font-bold text-inverse-accent hover:underline"
                  >
                    {current.action.label}
                  </button>
                </RadixToast.Action>
              )}
              <RadixToast.Close asChild>
                <IconButton icon={X} label="Cerrar aviso" size="sm" className={cn('-my-1 -mr-2', inverseScope)} />
              </RadixToast.Close>
            </RadixToast.Root>
          )}
          <RadixToast.Viewport
            label="Avisos ({hotkey})"
            className={cn(
              // Centered under the top bar (16 + 64 + 12): on desktop it lands between the greeting and the page's actions,
              // so it never covers the primary button; the dock owns the bottom of the screen.
              'fixed inset-x-4 top-23 z-(--z-toast) flex flex-col items-center outline-none',
            )}
          />
        </RadixToast.Provider>
    </ToastContext.Provider>
  )
}
