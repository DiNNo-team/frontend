import { useEffect, useState, type ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { IconButton, Skeleton } from '@/components/ui'
import { cn } from '@/lib/cn'

export interface TopbarProps {
  /** The restaurant's real name. `undefined` while it loads (a skeleton, never a placeholder word). */
  restaurantName?: string
  onOpenMenu: () => void
  /** Right side: restaurant open/closed switch (Sergio). */
  statusSlot?: ReactNode
}

/**
 * 64 px top bar (manual 12.2). Solid at the top of the page; once the content scrolls under it, it turns into the bar
 * glass (manual 7.1). The menu button only shows below 1024 px.
 */
export function Topbar({ restaurantName, onOpenMenu, statusSlot }: TopbarProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 0)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <header
      data-scrolled={scrolled}
      className={cn(
        'sticky top-0 z-(--z-sticky) flex h-16 shrink-0 items-center gap-3 border-b px-4 md:px-6 lg:px-8',
        'transition-colors duration-(--dur-fast) ease-dinno',
        scrolled ? 'glass-bar border-line' : 'border-transparent bg-bg',
      )}
    >
      <IconButton icon={Menu} label="Abrir menú" onClick={onOpenMenu} tooltipSide="bottom" className="-ml-2 text-fg lg:hidden" />
      {restaurantName === undefined ? (
        <Skeleton className="h-6 w-40" />
      ) : (
        <p className="min-w-0 truncate text-h3 text-fg">{restaurantName}</p>
      )}
      {statusSlot && <div className="ml-auto flex shrink-0 items-center">{statusSlot}</div>}
    </header>
  )
}
