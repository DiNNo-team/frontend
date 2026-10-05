import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Skeleton } from './Skeleton'

export interface DataTableColumn<Row> {
  key: string
  header: ReactNode
  cell: (row: Row) => ReactNode
  /** Label in the compact mobile list. Defaults to `header`. */
  mobileLabel?: ReactNode
  /** Extra classes for the cells of this column, e.g. `tabular-nums` for times. */
  className?: string
}

export interface DataTableProps<Row> {
  columns: DataTableColumn<Row>[]
  rows: Row[]
  getRowId: (row: Row) => string
  /** Shows skeleton rows. Combine with `useDelayedFlag` to skip loads under 300 ms. */
  loading?: boolean
  /** Rendered instead of the rows when there are none (an `EmptyState`). */
  emptyState?: ReactNode
  /** Accessible name of the table ("Bitácora de cambios de mesas"). */
  caption?: string
  className?: string
}

const SKELETON_ROWS = 5

/**
 * Data table (manual 9): label-style header, 52 px rows, horizontal dividers only, no zebra.
 * Below 768 px it turns into a list of compact rows (label + value).
 */
export function DataTable<Row>({ columns, rows, getRowId, loading, emptyState, caption, className }: DataTableProps<Row>) {
  const isEmpty = !loading && rows.length === 0

  return (
    <div className={cn('overflow-hidden rounded-card border border-line bg-surface', className)} aria-busy={loading || undefined}>
      {isEmpty && emptyState ? (
        <div className="px-4">{emptyState}</div>
      ) : (
        <>
          <table className="hidden w-full border-collapse md:table">
            {caption && <caption className="sr-only">{caption}</caption>}
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key} scope="col" className="h-11 px-4 text-left text-label text-fg-2 uppercase">
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
                    <tr key={index} className="h-13 border-t border-line">
                      {columns.map((column) => (
                        <td key={column.key} className="px-4">
                          <Skeleton className="h-4 w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                : rows.map((row) => (
                    <tr
                      key={getRowId(row)}
                      className="h-13 border-t border-line transition-colors duration-(--dur-fast) ease-dinno hover:bg-surface-2"
                    >
                      {columns.map((column) => (
                        <td key={column.key} className={cn('px-4 text-sec text-fg', column.className)}>
                          {column.cell(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>

          <ul className="divide-y divide-line md:hidden" aria-label={caption}>
            {loading
              ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
                  <li key={index} className="flex flex-col gap-2 p-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </li>
                ))
              : rows.map((row) => (
                  <li key={getRowId(row)} className="flex flex-col gap-2 p-4">
                    {columns.map((column) => (
                      <div key={column.key} className="flex items-center justify-between gap-4 text-sec">
                        <span className="text-fg-2">{column.mobileLabel ?? column.header}</span>
                        <span className={cn('text-right text-fg', column.className)}>{column.cell(row)}</span>
                      </div>
                    ))}
                  </li>
                ))}
          </ul>
        </>
      )}
    </div>
  )
}
