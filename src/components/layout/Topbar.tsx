import type { ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { IconButton } from '@/components/ui'

export interface TopbarProps {
  restaurantName: string
  onOpenMenu: () => void
  /** Right side: restaurant open/closed switch (Sergio). */
  statusSlot?: ReactNode
}

/** 64 px top bar (manual 12.1). The menu button only shows below 1024 px. */
export function Topbar({ restaurantName, onOpenMenu, statusSlot }: TopbarProps) {
  return (
    <header className="sticky top-0 z-(--z-sticky) flex h-16 shrink-0 items-center gap-3 border-b border-line bg-bg px-4 md:px-6 lg:px-8">
      <IconButton icon={Menu} label="Abrir menú" onClick={onOpenMenu} tooltipSide="bottom" className="-ml-2 text-fg lg:hidden" />
      <p className="min-w-0 truncate text-h3 text-fg">{restaurantName}</p>
      {statusSlot && <div className="ml-auto flex shrink-0 items-center">{statusSlot}</div>}
    </header>
  )
}
