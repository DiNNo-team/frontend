import { NavLink } from 'react-router'
import { Logo } from '@/components/ui'
import { cn } from '@/lib/cn'
import { Icon } from '@/lib/icon'
import { NAV_ITEMS } from './nav-items'
import { UserMenu, type UserMenuProps } from './UserMenu'

export interface SidebarProps extends UserMenuProps {
  /** Called after following a link (closes the drawer on small screens). */
  onNavigate?: () => void
  className?: string
}

/** Petrol navigation column (manual 12.1): logo, Mesas · Restaurante · Bitácora, user block. */
export function Sidebar({ onNavigate, className, ...userMenu }: SidebarProps) {
  return (
    <div className={cn('flex h-full w-62 flex-col border-r border-line bg-nav', className)}>
      <div className="p-6">
        <Logo variant="onDark" className="w-24" />
      </div>
      <nav aria-label="Principal" className="flex-1 px-3">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onNavigate}
                className={cn(
                  'relative flex h-11 items-center gap-3 rounded-input px-3 text-btn text-nav-fg-2',
                  'transition-colors duration-(--dur-fast) ease-dinno hover:bg-nav-active/50',
                  'aria-[current=page]:bg-nav-active aria-[current=page]:text-nav-fg',
                  'before:absolute before:inset-y-0 before:-left-3 before:hidden before:w-0.75 before:rounded-r-full before:bg-accent aria-[current=page]:before:block',
                )}
              >
                <Icon icon={item.icon} size={20} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-nav-active p-3">
        <UserMenu {...userMenu} />
      </div>
    </div>
  )
}
