import { ChevronDown, LogOut, Moon, Sun } from 'lucide-react'
import { DropdownMenu } from '@/components/ui'
import { Icon } from '@/lib/icon'
import { useTheme } from '@/lib/theme-context'

export interface UserMenuProps {
  restaurantName: string
  userEmail: string
  onSignOut: () => void
}

/** User block at the bottom of the sidebar: theme switch and "Cerrar sesión". */
export function UserMenu({ restaurantName, userEmail, onSignOut }: UserMenuProps) {
  const { theme, toggleTheme } = useTheme()
  const initial = restaurantName.trim().charAt(0).toUpperCase()

  return (
    <DropdownMenu
      side="top"
      align="start"
      items={[
        theme === 'dark'
          ? { label: 'Tema claro', icon: Sun, onSelect: toggleTheme }
          : { label: 'Tema oscuro', icon: Moon, onSelect: toggleTheme },
        { label: 'Cerrar sesión', icon: LogOut, onSelect: onSignOut },
      ]}
      trigger={
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-3 rounded-input p-2 text-left transition-colors duration-(--dur-fast) ease-dinno hover:bg-nav-active/50"
        >
          <span
            aria-hidden="true"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-nav-active text-sec font-bold text-nav-fg"
          >
            {initial}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sec font-bold text-nav-fg">{restaurantName}</span>
            <span className="truncate text-sec text-nav-fg-2">{userEmail}</span>
          </span>
          <Icon icon={ChevronDown} size={16} className="shrink-0 text-nav-fg-2" />
        </button>
      }
    />
  )
}
