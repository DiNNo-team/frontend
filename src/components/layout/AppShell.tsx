import type { ReactNode } from 'react'
import { AmbientGround } from './AmbientGround'
import { NavDock } from './NavDock'
import { Topbar } from './Topbar'

export interface AppShellProps {
  /** The restaurant's real name; `undefined` while it loads. */
  restaurantName?: string
  userEmail: string
  onSignOut: () => void
  /** Top bar right side: "Estado del restaurante" + Switch (Sergio). */
  statusSlot?: ReactNode
  /** Above the content: the "restaurant closed" Alert (Sergio). */
  banner?: ReactNode
  /** The restaurant is open: the room's light is warm; closed, it goes out (manual v2.1). */
  lit?: boolean
  children: ReactNode
}

/**
 * Dashboard frame (manual v2.1, 12.2): the room's light behind everything; the top bar and the page on one glass sheet,
 * centered; and the navigation dock floating at the bottom on every screen size. The page keeps room at the bottom so
 * the dock never covers its last row. Toasts arrive at the top, under the bar.
 */
export function AppShell({ restaurantName, userEmail, onSignOut, statusSlot, banner, lit = true, children }: AppShellProps) {
  return (
    <div className="relative isolate min-h-dvh text-fg">
      <AmbientGround lit={lit} />
      <NavDock />
      <div className="mx-auto flex min-h-dvh max-w-320 flex-col gap-4 p-3 pb-(--dock-clearance) md:p-4 md:pb-(--dock-clearance) lg:p-5 lg:pb-(--dock-clearance)">
        <Topbar restaurantName={restaurantName} userEmail={userEmail} onSignOut={onSignOut} statusSlot={statusSlot} />
        <main className="glass-sheet flex flex-1 flex-col gap-8 rounded-sheet p-4 md:p-6 lg:rounded-sheet-lg lg:p-8">
          {banner}
          {children}
        </main>
      </div>
    </div>
  )
}
