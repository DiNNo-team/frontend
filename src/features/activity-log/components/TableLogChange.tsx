import { ArrowRight } from 'lucide-react'
import { StatusChip } from '@/components/ui'
import { toTableDisplayStatus } from '@/features/tables/table-status'
import { Icon } from '@/lib/icon'

function StatusWord({ code }: { code: string }) {
  const status = toTableDisplayStatus(code)
  // The backend only stores the four table log statuses; an unknown code is shown as it comes.
  return status ? <StatusChip status={status} /> : <span>{code}</span>
}

/** "Disponible → Ocupada" with the same chips as /mesas. Screen readers hear "Disponible a Ocupada". */
export function TableLogChange({ previousStatus, newStatus }: { previousStatus: string; newStatus: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <StatusWord code={previousStatus} />
      <Icon icon={ArrowRight} size={16} className="shrink-0 text-fg-2" />
      {/* Spaces included: the chips are inline, so screen readers would otherwise run the words together. */}
      <span className="sr-only">{' a '}</span>
      <StatusWord code={newStatus} />
    </span>
  )
}
