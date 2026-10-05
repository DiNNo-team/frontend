import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface CardProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  /** Título 3 at the top of the card. */
  title?: ReactNode
  /** Heading level for `title`; the look is always Título 3. Default `h2` (pages own the `h1`). */
  titleAs?: 'h2' | 'h3'
  as?: 'div' | 'section' | 'article' | 'aside'
}

/** Content card (manual 6 and 9). Never put another Card inside a Card. */
export function Card({ title, titleAs: Heading = 'h2', as: Element = 'div', className, children, ...props }: CardProps) {
  return (
    <Element className={cn('rounded-card border border-line bg-surface p-4 shadow-card md:p-6', className)} {...props}>
      {title && <Heading className="mb-4 text-h3 text-fg">{title}</Heading>}
      {children}
    </Element>
  )
}
