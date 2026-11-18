import { Sparkles } from 'lucide-react'
import { Icon } from '@/lib/icon'

export interface AiIconProps {
  /** 16 next to secondary text (default) · 20 next to a title. */
  size?: 16 | 20
  /** Color with a `text-*` class; it paints with `currentColor`. Never orange: it marks who wrote it, not an action. */
  className?: string
}

/**
 * The «Generado con IA» concept (Lucide `sparkles`; added for the smart report, Sprint 4). Decorative: it always goes
 * next to its words («Generado con IA · hace 12 min»), never alone.
 */
export function AiIcon({ size = 16, className }: AiIconProps) {
  return <Icon icon={Sparkles} size={size} className={className} />
}
