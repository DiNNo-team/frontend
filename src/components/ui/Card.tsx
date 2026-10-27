import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface CardProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  /** Título 3 at the top of the card. */
  title?: ReactNode
  /** Heading level for `title`; the look is always Título 3. Default `h2` (pages own the `h1`). */
  titleAs?: 'h2' | 'h3'
  as?: 'div' | 'section' | 'article' | 'aside'
}

/** Content card (manual v2.1, 6.3): glass over the sheet, flat while resting. Never put another Card inside a Card. */
export function Card({ title, titleAs: Heading = 'h2', as: Element = 'div', className, children, ...props }: CardProps) {
  return (
    <Element className={cn('glass-card rounded-card p-4 md:p-6', className)} {...props}>
      {title && <Heading className="mb-4 text-h3 text-fg">{title}</Heading>}
      {children}
    </Element>
  )
}
