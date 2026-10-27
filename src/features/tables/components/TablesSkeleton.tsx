import { Skeleton } from '@/components/ui'

const CARD_PLACEHOLDERS = 8
const STAT_PLACEHOLDERS = 4

/**
 * Loading state with the real shapes and sizes (manual 13.6): the summary strip and table cards (title, capacity,
 * status line, same padding and gaps), so nothing jumps when the data lands.
 */
export function TablesSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-hidden="true">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-tile border border-line bg-line sm:grid-cols-4">
        {Array.from({ length: STAT_PLACEHOLDERS }, (_, index) => (
          <div key={index} className="flex flex-col gap-1 bg-surface p-4">
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
      <div className="grid grid-tables gap-3">
        {Array.from({ length: CARD_PLACEHOLDERS }, (_, index) => (
          <div key={index} className="flex flex-col justify-between gap-3 rounded-tile border border-line bg-surface p-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
