import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/cn'

const LINK_CLASSES = 'cursor-pointer font-bold text-accent-text underline-offset-4 transition duration-(--dur-fast) ease-dinno'

/** Inline text action on the glass card: deep orange at full strength (AA, manual 7.3); underlined on hover. */
export function AuthLink({ className, type = 'button', ...props }: ComponentPropsWithRef<'button'>) {
  return (
    <button
      type={type}
      className={cn(LINK_CLASSES, 'enabled:hover:underline disabled:cursor-not-allowed disabled:opacity-45', className)}
      {...props}
    />
  )
}

/** The same inline link when it goes somewhere (an email, an external page): a real `<a>`. */
export function AuthAnchor({ className, ...props }: ComponentPropsWithRef<'a'>) {
  return <a className={cn(LINK_CLASSES, 'hover:underline focus-visible:underline', className)} {...props} />
}
