import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/cn'

/** Inline text action on the glass card, in orange and softened so it does not compete with the form. */
export function AuthLink({ className, type = 'button', ...props }: ComponentPropsWithRef<'button'>) {
  return (
    <button
      type={type}
      className={cn(
        'cursor-pointer font-bold text-accent-text opacity-70',
        'transition duration-(--dur-fast) ease-dinno enabled:hover:opacity-100',
        'disabled:cursor-not-allowed disabled:opacity-45',
        className,
      )}
      {...props}
    />
  )
}
