import { ChevronDown, LogOut, Moon, Sun } from 'lucide-react'
import { DropdownMenu } from '@/components/ui'
import { Icon } from '@/lib/icon'
import { useTheme } from '@/lib/theme-context'

export interface UserMenuProps {
  restaurantName: string
  userEmail: string
  onSignOut: () => void
}

/**
 * Account menu at the right of the top bar (manual v2.1): the restaurant's initial on the brand gradient; the menu
 * shows who is signed in, the theme switch and "Cerrar sesión".
 */
export function UserMenu({ restaurantName, userEmail, onSignOut }: UserMenuProps) {
  const { theme, toggleTheme } = useTheme()
  const initial = restaurantName.trim().charAt(0).toUpperCase() || userEmail.charAt(0).toUpperCase()
  const name = restaurantName.trim()

  return (
    <DropdownMenu
      align="end"
      header={
        <div className="flex min-w-0 flex-col">
          {name && <span className="truncate text-sec font-bold text-fg">{name}</span>}
          <span className="truncate text-sec text-fg-2">{userEmail}</span>
        </div>
      }
      items={[
        theme === 'dark'
          ? { label: 'Tema claro', icon: Sun, onSelect: toggleTheme }
          : { label: 'Tema oscuro', icon: Moon, onSelect: toggleTheme },
        { label: 'Cerrar sesión', icon: LogOut, onSelect: onSignOut },
      ]}
      trigger={
        <button
          type="button"
          aria-label={`Cuenta de ${name || userEmail}`}
          className="press flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full p-1 pr-2 text-fg hover:bg-(--glass-card-bg)"
        >
          <span
            aria-hidden="true"
            className="bg-highlight inline-flex size-9 items-center justify-center rounded-full text-sec font-bold text-(--cream)"
          >
            {initial}
          </span>
          <Icon icon={ChevronDown} size={16} />
        </button>
      }
    />
  )
}
