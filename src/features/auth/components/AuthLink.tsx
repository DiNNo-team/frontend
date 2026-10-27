import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/cn'

/** Inline text action on the glass card: deep orange at full strength (AA, manual 7.3); underlined on hover. */
export function AuthLink({ className, type = 'button', ...props }: ComponentPropsWithRef<'button'>) {
  return (
    <button
      type={type}
      className={cn(
        'cursor-pointer font-bold text-accent-text underline-offset-4',
        'transition duration-(--dur-fast) ease-dinno enabled:hover:underline',
        'disabled:cursor-not-allowed disabled:opacity-45',
        className,
      )}
      {...props}
    />
  )
}
