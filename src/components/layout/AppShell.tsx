import { useEffect, useState, type ReactNode } from 'react'
import { Dialog as RadixDialog } from 'radix-ui'
import { useReturnFocus } from '@/components/ui/use-return-focus'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export interface AppShellProps {
  restaurantName: string
  userEmail: string
  onSignOut: () => void
  /** Topbar right side: "Estado del restaurante" + Switch (Sergio). */
  statusSlot?: ReactNode
  /** Above the content: the "restaurant closed" Alert (Sergio). */
  banner?: ReactNode
  children: ReactNode
}

const DESKTOP_QUERY = '(min-width: 1024px)'

/**
 * Dashboard frame (manual 12.1): fixed sidebar from 1024 px, drawer below; sticky topbar;
 * content up to 1200 px with 32 / 24 / 16 padding.
 */
export function AppShell({ restaurantName, userEmail, onSignOut, statusSlot, banner, children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const userMenu = { restaurantName, userEmail, onSignOut }
  const returnFocus = useReturnFocus()

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY)
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setDrawerOpen(false)
    }
    media.addEventListener('change', closeOnDesktop)
    return () => media.removeEventListener('change', closeOnDesktop)
  }, [])

  return (
    <div className="min-h-screen bg-bg text-fg">
      <aside className="fixed inset-y-0 left-0 hidden lg:block">
        <Sidebar {...userMenu} />
      </aside>

      <RadixDialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <RadixDialog.Portal>
          <RadixDialog.Overlay className="fixed inset-0 z-(--z-drawer) animate-fade-in bg-(--overlay) lg:hidden" />
          <RadixDialog.Content
            aria-describedby={undefined}
            onOpenAutoFocus={returnFocus.onOpenAutoFocus}
            onCloseAutoFocus={returnFocus.onCloseAutoFocus}
            className="fixed inset-y-0 left-0 z-(--z-drawer) animate-drawer-in lg:hidden"
          >
            <RadixDialog.Title className="sr-only">Menú</RadixDialog.Title>
            <Sidebar {...userMenu} onNavigate={() => setDrawerOpen(false)} />
          </RadixDialog.Content>
        </RadixDialog.Portal>
      </RadixDialog.Root>

      <div className="flex min-h-screen flex-col lg:pl-62">
        <Topbar restaurantName={restaurantName} onOpenMenu={() => setDrawerOpen(true)} statusSlot={statusSlot} />
        <main className="mx-auto flex w-full max-w-300 flex-1 flex-col gap-8 p-4 md:p-6 lg:p-8">
          {banner}
          {children}
        </main>
      </div>
    </div>
  )
}
