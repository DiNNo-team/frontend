import logoDark from '@/assets/brand/logo-dark.svg'
import logoLight from '@/assets/brand/logo-light.svg'
import symbolDark from '@/assets/brand/symbol-dark.svg'
import symbolLight from '@/assets/brand/symbol.svg'
import { cn } from '@/lib/cn'
import { useTheme } from '@/lib/theme-context'

export type LogoVariant = 'onLight' | 'onDark' | 'auto'

export interface LogoProps {
  /** Background the logo sits on. `auto` follows the current theme. */
  variant?: LogoVariant
  /** Only the pin with the Active Dot (manual 1). */
  symbolOnly?: boolean
  className?: string
}

const SOURCES = {
  onLight: { logo: logoLight, symbol: symbolLight },
  onDark: { logo: logoDark, symbol: symbolDark },
} as const

/** Brand files from `assets/brand/`. Never rebuild the logo with text or icons. */
export function Logo({ variant = 'auto', symbolOnly = false, className }: LogoProps) {
  const { theme } = useTheme()
  const background = variant === 'auto' ? (theme === 'dark' ? 'onDark' : 'onLight') : variant
  const source = SOURCES[background][symbolOnly ? 'symbol' : 'logo']

  return <img src={source} alt="DiNNo" className={cn('block h-auto', className)} draggable={false} />
}
