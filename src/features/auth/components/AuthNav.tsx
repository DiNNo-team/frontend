import type { KeyboardEvent } from 'react'
import { Logo } from '@/components/ui'
import { cn } from '@/lib/cn'
import { Icon } from '@/lib/icon'
import { AUTH_VIEWS, authPanelId, authTabId, type AuthView } from '../auth-view'

interface AuthNavProps {
  view: AuthView
  onSelect: (view: AuthView) => void
}

const NEXT_KEYS = ['ArrowDown', 'ArrowRight']
const PREVIOUS_KEYS = ['ArrowUp', 'ArrowLeft']

/**
 * Logo + "Iniciar sesión" / "Crear cuenta" tabs. Column on the left from 768 px, row on top below it.
 * The orange bar slides to the active tab.
 */
export function AuthNav({ view, onSelect }: AuthNavProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = NEXT_KEYS.includes(event.key) ? 1 : PREVIOUS_KEYS.includes(event.key) ? -1 : 0
    if (!step) return
    event.preventDefault()
    const index = AUTH_VIEWS.findIndex((item) => item.view === view)
    const next = AUTH_VIEWS[(index + step + AUTH_VIEWS.length) % AUTH_VIEWS.length].view
    onSelect(next)
    document.getElementById(authTabId(next))?.focus()
  }

  return (
    <nav aria-label="Acceso" className="flex shrink-0 flex-col md:w-25">
      <div className="flex justify-center pt-8 pb-4 md:flex-1 md:items-center md:p-0">
        <Logo symbolOnly className="hidden h-11 w-auto md:block" />
        <Logo className="w-24 md:hidden" />
      </div>

      <div role="tablist" aria-label="Acceso a DiNNo" className="relative flex md:flex-2 md:flex-col" onKeyDown={handleKeyDown}>
        {AUTH_VIEWS.map((item) => {
          const active = item.view === view
          return (
            <button
              key={item.view}
              type="button"
              role="tab"
              id={authTabId(item.view)}
              aria-selected={active}
              aria-controls={authPanelId(item.view)}
              tabIndex={active ? 0 : -1}
              onClick={() => onSelect(item.view)}
              className={cn(
                'flex min-h-14 flex-1 cursor-pointer items-center justify-center gap-2 px-2 text-sec text-fg',
                'transition duration-(--dur-fast) ease-dinno md:flex-col md:gap-1.5',
                active ? 'font-bold' : 'font-medium hover:bg-fg/5',
              )}
            >
              <Icon icon={item.icon} size={20} className={cn('transition duration-(--dur-fast) ease-dinno', active && 'text-accent-text')} />
              {item.label}
            </button>
          )
        })}

        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute bottom-0 left-0 flex h-full w-1/2 items-end justify-center',
            'md:top-0 md:bottom-auto md:h-1/2 md:w-full md:items-center md:justify-start',
            'transition duration-(--dur-slow) ease-dinno',
            'group-data-[view=signup]:translate-x-full md:group-data-[view=signup]:translate-x-0 md:group-data-[view=signup]:translate-y-full',
          )}
        >
          <span className="h-1 w-15 rounded-t-full bg-accent md:h-15 md:w-1.5 md:rounded-tl-none md:rounded-tr-full md:rounded-br-full" />
        </span>
      </div>
    </nav>
  )
}
