import { NavLink } from 'react-router'
import { Moon, Sun } from 'lucide-react'
import { Logo } from '@/components/ui'
import { cn } from '@/lib/cn'
import { Icon } from '@/lib/icon'
import { useTheme } from '@/lib/theme-context'
import { NAV_ITEMS_RESTAURANT, type NavItem } from './nav-items'

const separator = <span aria-hidden="true" className="mx-1 h-10 w-px shrink-0 self-center bg-line" />

export interface NavDockProps {
  /** The sections to show; the restaurant's by default. */
  items?: NavItem[]
  /** A count over an item's icon, by its route (the pending requests of the administrator). 0 shows nothing. */
  badges?: Record<string, number>
}

/**
 * Navigation dock (manual v2.1, 12.2 `AppShell`), like the macOS dock: a glass capsule centered at the bottom of the
 * screen on every size. The DiNNo symbol, then each section as an icon with its word underneath (never an icon
 * alone; the current one as a pill), then the theme switch, split by thin separators. The icon peeks up on hover. The
 * glass follows the theme: light in light, petrol in dark.
 */
export function NavDock({ items = NAV_ITEMS_RESTAURANT, badges = {} }: NavDockProps) {
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'

  return (
    <div className="glass-dock dock-position flex items-center gap-1.5 rounded-sheet px-2 py-1.5 text-(--dock-fg)">
      {/* The pin fills only the middle of its square file. The file is drawn at 60 px, centered in a 44 px box that crops
          its empty edges: the visible pin is about 36 px tall and the dock does not grow. Never resize one axis alone. */}
      <span className="hidden size-11 shrink-0 items-center justify-center overflow-hidden sm:flex">
        <Logo symbolOnly className="size-15 max-w-none shrink-0" />
      </span>
      <span className="hidden sm:contents">{separator}</span>
      <nav aria-label="Principal">
        <ul className="flex items-center gap-1">
          {items.map((item) => {
            const badge = badges[item.to] ?? 0
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={cn(
                    'press flex w-20 flex-col items-center gap-0.5 rounded-tile py-1.5 text-label sm:w-24',
                    'hover:bg-(--dock-hover)',
                    'aria-[current=page]:bg-(--dock-active-bg) aria-[current=page]:text-(--dock-active-fg) aria-[current=page]:shadow-card',
                  )}
                >
                  <span className="dock-magnify relative inline-flex">
                    <Icon icon={item.icon} size={20} />
                    {badge > 0 && (
                      // The count is a fact, not an alert: the accent is the "now" color; dark text on it (manual 3).
                      <span
                        aria-hidden="true"
                        className="absolute -top-1.5 -right-3 min-w-4 rounded-full bg-accent px-1 text-center text-label text-on-accent tabular-nums"
                      >
                        {badge}
                      </span>
                    )}
                  </span>
                  {item.label}
                  {badge > 0 && item.badgeLabel && <span className="sr-only">, {item.badgeLabel(badge)}</span>}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
      {separator}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        className="press flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-tile hover:bg-(--dock-hover)"
      >
        <span className="dock-magnify inline-flex">
          <Icon icon={dark ? Sun : Moon} size={20} />
        </span>
      </button>
    </div>
  )
}
