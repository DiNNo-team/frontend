import type { ReactNode } from 'react'
import { Skeleton } from '@/components/ui'
import { UserMenu, type UserMenuProps } from './UserMenu'

export interface TopbarProps extends Omit<UserMenuProps, 'restaurantName'> {
  /** The restaurant's real name. `undefined` while it loads (a skeleton, never a placeholder word). */
  restaurantName?: string
  /** Right side: restaurant open/closed switch (Sergio). */
  statusSlot?: ReactNode
}

/**
 * Floating top bar (manual v2.1, 12.2): a glass pill that stays at the top while the page scrolls under it. The
 * restaurant's name on the left, on every screen size; the open/closed switch and the account on the right.
 * Navigation lives in the dock.
 */
export function Topbar({ restaurantName, statusSlot, userEmail, onSignOut }: TopbarProps) {
  return (
    <header className="glass-pill sticky top-4 z-(--z-sticky) flex h-16 shrink-0 items-center gap-3 rounded-full pr-2 pl-5">
      {restaurantName === undefined ? (
        <Skeleton className="h-6 w-32 md:w-40" />
      ) : (
        <p className="min-w-0 truncate text-h3 text-fg">{restaurantName}</p>
      )}
      <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-4">
        {statusSlot}
        <UserMenu restaurantName={restaurantName ?? ''} userEmail={userEmail} onSignOut={onSignOut} />
      </div>
    </header>
  )
}
