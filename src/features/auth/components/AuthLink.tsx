import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/cn'

/**
 * Inline text action on the glass card. Text stays in `text-fg` (manual 7: text on glass is ink or cream, AA);
 * the orange underline marks it as an action.
 */
export function AuthLink({ className, type = 'button', ...props }: ComponentPropsWithRef<'button'>) {
  return (
    <button
      type={type}
      className={cn(
        'cursor-pointer font-bold text-fg underline decoration-accent decoration-2 underline-offset-4',
        'transition duration-(--dur-fast) ease-dinno enabled:hover:decoration-accent-pressed',
        'disabled:cursor-not-allowed disabled:opacity-45',
        className,
      )}
      {...props}
    />
  )
}
