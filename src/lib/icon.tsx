import type { LucideIcon, LucideProps } from 'lucide-react'

// Lucide's `Map` shadows the global JS `Map`: always import it renamed as `MapIcon`.

export type IconSize = 16 | 20 | 24

export interface IconProps extends Omit<LucideProps, 'size' | 'strokeWidth' | 'ref'> {
  icon: LucideIcon
  /** 16 inside chips and secondary text · 20 buttons, fields, sidebar · 24 standalone actions. */
  size?: IconSize
  /** Accessible name. Without it the icon is decorative and hidden from screen readers. */
  label?: string
}

/** The only way to render a Lucide icon in the app (manual, section 8). */
export function Icon({ icon: LucideComponent, size = 20, label, ...props }: IconProps) {
  return (
    <LucideComponent
      size={size}
      strokeWidth={1.75}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      focusable="false"
      {...props}
    />
  )
}
