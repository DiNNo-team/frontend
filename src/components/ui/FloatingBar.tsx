import { useContext, useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { ToastLayoutContext } from './toast-context'

export interface FloatingBarProps {
  /** Título 3 on the left: "Mesa 04". Also names the region for screen readers. */
  title: string
  /** Secondary line under the title: "2 personas". */
  description?: ReactNode
  /** Controls on the right (a SegmentedControl, a ⋯ menu). On mobile they drop below the title. */
  children: ReactNode
  className?: string
}

/**
 * Floating action bar pinned to the bottom of the content area (manual 12.2, level 3 glass: plan edition, bulk actions).
 * Place it as the last element of the page: it stays in view while scrolling, never covers the
 * sidebar, and takes its own space so it never hides the last row. Toasts move above it.
 */
export function FloatingBar({ title, description, children, className }: FloatingBarProps) {
  const setBarVisible = useContext(ToastLayoutContext)

  useEffect(() => {
    setBarVisible(true)
    return () => setBarVisible(false)
  }, [setBarVisible])

  return (
    <section
      aria-label={title}
      className={cn(
        'glass-panel sticky bottom-4 z-(--z-sticky) mt-auto flex animate-rise-in-fast flex-col gap-3 rounded-card p-4',
        'md:bottom-6 md:flex-row md:items-center md:justify-between md:gap-6',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col">
        <p className="truncate text-h3 text-fg">{title}</p>
        {/* Ink, not secondary text: on glass anything lighter fails AA with the worst background behind (manual 7.3). */}
        {description && <p className="text-sec text-fg">{description}</p>}
      </div>
      <div className="flex min-w-0 items-center gap-2">{children}</div>
    </section>
  )
}
