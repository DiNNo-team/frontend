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
 * Floating action bar pinned to the bottom of the content area (manual 12.4, table status bar).
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
        'sticky bottom-4 z-(--z-sticky) mt-auto flex animate-rise-in-fast flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-lifted',
        'md:bottom-6 md:flex-row md:items-center md:justify-between md:gap-6',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col">
        <p className="truncate text-h3 text-fg">{title}</p>
        {description && <p className="text-sec text-fg-2">{description}</p>}
      </div>
      <div className="flex min-w-0 items-center gap-2">{children}</div>
    </section>
  )
}
