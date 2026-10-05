import { Skeleton } from '@/components/ui'

const CARD_PLACEHOLDERS = 8
const STAT_PLACEHOLDERS = 4

/** Loading state with the real shapes: 4 metrics + 8 table cards (manual 11.5). */
export function TablesSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-hidden="true">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: STAT_PLACEHOLDERS }, (_, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-tile border border-line bg-surface p-4 shadow-card">
            <Skeleton className="h-9 w-12" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      <div className="grid grid-tables gap-3">
        {Array.from({ length: CARD_PLACEHOLDERS }, (_, index) => (
          <div key={index} className="flex flex-col gap-3 rounded-tile border border-line bg-surface p-4 shadow-card">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-5 w-24" />
            <Skeleton radius="full" className="h-6 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
