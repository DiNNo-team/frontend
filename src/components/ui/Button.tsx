import type { ComponentPropsWithRef, MouseEvent } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Icon } from '@/lib/icon'
import { Spinner } from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'md' | 'sm'

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: ButtonVariant
  /** `md` 48 (default) · `sm` 40, for tables and desktop toolbars. */
  size?: ButtonSize
  loading?: boolean
  /** Gerund with an ellipsis, shown while loading: "Guardando…". Defaults to the normal text. */
  loadingText?: string
  /** Lucide icon on the left, 20 px. */
  icon?: LucideIcon
  fullWidth?: boolean
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent enabled:hover:brightness-94 enabled:active:bg-accent-pressed enabled:active:brightness-100',
  // `inverse` is petrol + cream in light and cream + ink in dark (manual 6.1 mockup); `brand` would vanish on dark surfaces.
  secondary: 'bg-inverse text-on-inverse enabled:hover:brightness-94 enabled:active:brightness-88',
  outline: 'bg-surface border border-line-strong text-fg enabled:hover:brightness-94 enabled:active:brightness-88',
  ghost: 'text-accent-text underline-offset-4 enabled:hover:underline',
  danger: 'bg-surface border border-error text-error enabled:hover:brightness-94 enabled:active:brightness-88',
}

const SIZES: Record<ButtonSize, string> = {
  md: 'h-12',
  sm: 'h-10',
}

const LAYER = 'col-start-1 row-start-1 inline-flex items-center justify-center gap-2'

/**
 * The only button of the app. One `primary` per screen; text = verb + object ("Agregar mesa").
 * While `loading` it keeps its width, announces `aria-busy` and ignores clicks without losing focus.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  icon,
  fullWidth = false,
  type = 'button',
  className,
  children,
  onClick,
  ...props
}: ButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (loading) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }

  return (
    <button
      type={type}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={handleClick}
      className={cn(
        'inline-grid shrink-0 cursor-pointer select-none rounded-btn px-5 text-btn whitespace-nowrap',
        'transition duration-(--dur-fast) ease-dinno',
        'disabled:cursor-not-allowed disabled:opacity-45 aria-busy:cursor-progress',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      <span className={cn(LAYER, loading && 'invisible')} aria-hidden={loading || undefined}>
        {icon && <Icon icon={icon} size={20} />}
        {children}
      </span>
      <span className={cn(LAYER, !loading && 'invisible')} aria-hidden={!loading || undefined}>
        <Spinner size={16} />
        {loadingText ?? children}
      </span>
    </button>
  )
}
