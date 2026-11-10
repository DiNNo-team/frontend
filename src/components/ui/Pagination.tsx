import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './Button'

export interface PaginationProps {
  /** 1-based. */
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  /** What is being counted, in plural: "cambios" → "16–30 de 74 cambios". */
  itemsLabel: string
  className?: string
}

/** Pages of a long list (manual 12.4): "16–30 de 74 cambios", "Anterior", "Página 2 de 5", "Siguiente". */
export function Pagination({ page, pageSize, totalItems, onPageChange, itemsLabel, className }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize))
  if (pageCount <= 1) return null
  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, totalItems)

  return (
    <nav aria-label="Paginación" className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
      <p className="text-sec text-fg tabular-nums">
        {first}–{last} de {totalItems} {itemsLabel}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" icon={ChevronLeft} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Anterior
        </Button>
        <p aria-live="polite" className="text-sec text-fg tabular-nums">
          Página {page} de {pageCount}
        </p>
        <Button variant="outline" size="sm" icon={ChevronRight} iconPosition="end" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
          Siguiente
        </Button>
      </div>
    </nav>
  )
}
