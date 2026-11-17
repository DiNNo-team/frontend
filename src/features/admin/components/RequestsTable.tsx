import { DataTable, EmptyState, Pagination, REVIEW_STATUS, StatusChip, type DataTableColumn } from '@/components/ui'
import { RESTAURANT_CATEGORY_LABELS } from '@/features/restaurant/types'
import { cn } from '@/lib/cn'
import { formatSince } from '../relative-time'
import { ADMIN_PAGE_SIZE, ADMIN_TEXT } from '../messages'
import type { AdminRestaurantItem, ReviewStatus } from '../types'

interface RequestsTableProps {
  status: ReviewStatus
  rows: AdminRestaurantItem[]
  total: number
  page: number
  loading: boolean
  selectedId: string | null
  onSelect: (id: string) => void
  onPageChange: (page: number) => void
}

const EMPTY_TITLE: Record<ReviewStatus, string> = {
  pending: ADMIN_TEXT.emptyPending,
  approved: ADMIN_TEXT.emptyApproved,
  rejected: ADMIN_TEXT.emptyRejected,
  suspended: ADMIN_TEXT.emptySuspended,
}

const EMPTY_DESCRIPTION: Partial<Record<ReviewStatus, string>> = {
  pending: ADMIN_TEXT.emptyPendingDescription,
  suspended: ADMIN_TEXT.emptySuspendedDescription,
}

/**
 * When it happened, in words: a pending request counts from when it arrived, the other views from the last review. A restaurant
 * that was never reviewed (the team approved it) has no review date: the date it was sent is not a substitute for it.
 */
function sinceText(item: AdminRestaurantItem, status: ReviewStatus): string {
  if (status === 'pending') return formatSince(item.submittedAt)
  return item.reviewedAt ? formatSince(item.reviewedAt) : ADMIN_TEXT.notReviewed
}

/**
 * The requests of one state (CLAUDE.md §12.12), in the order the backend gives. The restaurant's name opens its detail:
 * it is a real button, so the keyboard and screen readers reach it. On a phone each row has two lines.
 */
export function RequestsTable({ status, rows, total, page, loading, selectedId, onSelect, onPageChange }: RequestsTableProps) {
  const columns: DataTableColumn<AdminRestaurantItem>[] = [
    {
      key: 'restaurant',
      header: ADMIN_TEXT.columnRestaurant,
      mobileLine: 1,
      cell: (item) => (
        <button
          type="button"
          aria-label={ADMIN_TEXT.openRequest(item.name)}
          aria-current={item.id === selectedId ? 'true' : undefined}
          onClick={() => onSelect(item.id)}
          className={cn(
            'cursor-pointer rounded-tile text-left font-bold text-fg underline-offset-4 hover:underline',
            item.id === selectedId && 'text-accent-text underline',
          )}
        >
          {item.name}
        </button>
      ),
    },
    {
      key: 'category',
      header: ADMIN_TEXT.columnCategory,
      mobileLine: 2,
      cell: (item) => (item.category ? RESTAURANT_CATEGORY_LABELS[item.category] : 'Sin categoría'),
    },
    {
      key: 'contact',
      header: ADMIN_TEXT.columnContact,
      mobileLine: 2,
      className: 'break-all',
      cell: (item) => [item.contactPhone, item.ownerEmail].filter(Boolean).join(' · ') || 'Sin contacto',
    },
    {
      key: 'since',
      header: status === 'pending' ? ADMIN_TEXT.columnReceived : ADMIN_TEXT.columnReviewed,
      mobileLine: 2,
      className: 'whitespace-nowrap',
      cell: (item) => sinceText(item, status),
    },
    {
      key: 'status',
      header: ADMIN_TEXT.columnStatus,
      mobileLine: 1,
      cell: (item) => <StatusChip status={REVIEW_STATUS[item.approvalStatus]} />,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        caption={ADMIN_TEXT.tableCaption}
        columns={columns}
        rows={rows}
        getRowId={(item) => item.id}
        loading={loading}
        emptyState={
          <EmptyState
            title={EMPTY_TITLE[status]}
            description={EMPTY_DESCRIPTION[status]}
          />
        }
      />
      <Pagination page={page} pageSize={ADMIN_PAGE_SIZE} totalItems={total} onPageChange={onPageChange} itemsLabel={ADMIN_TEXT.itemsLabel} />
    </div>
  )
}
