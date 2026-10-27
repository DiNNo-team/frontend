import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Skeleton } from './Skeleton'

export interface DataTableColumn<Row> {
  key: string
  header: ReactNode
  cell: (row: Row) => ReactNode
  /** Label in the compact mobile list. Defaults to `header`. Unused when the table sets lines (`mobileLine`). */
  mobileLabel?: ReactNode
  /**
   * Line of the two-line mobile row (manual 13.4): 1 = identity and key fact, 2 = the rest in secondary text,
   * joined with " · ". When no column sets it, the mobile list keeps one label + value pair per column.
   */
  mobileLine?: 1 | 2
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
 * Data table (manual 12.2): sentence-case label header, 52 px rows, horizontal dividers only, no zebra.
 * Below 768 px it turns into a list: two lines per row when the columns set `mobileLine`, otherwise label + value pairs.
 */
export function DataTable<Row>({ columns, rows, getRowId, loading, emptyState, caption, className }: DataTableProps<Row>) {
  const isEmpty = !loading && rows.length === 0
  const twoLines = columns.some((column) => column.mobileLine)
  const lineOf = (line: 1 | 2) => columns.filter((column) => (column.mobileLine ?? 2) === line)

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
                  <th key={column.key} scope="col" className="h-11 px-4 text-left text-label text-fg-2">
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
              : rows.map((row) =>
                  twoLines ? (
                    <li key={getRowId(row)} className="flex flex-col gap-1 px-4 py-3">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sec text-fg">
                        {lineOf(1).map((column) => (
                          <span key={column.key} className={cn('inline-flex items-center', column.className)}>
                            {column.cell(row)}
                          </span>
                        ))}
                      </div>
                      <p className="text-sec text-fg-2">
                        {lineOf(2).map((column, index) => (
                          <span key={column.key} className={column.className}>
                            {index > 0 && ' · '}
                            {column.cell(row)}
                          </span>
                        ))}
                      </p>
                    </li>
                  ) : (
                    <li key={getRowId(row)} className="flex flex-col gap-2 p-4">
                      {columns.map((column) => (
                        <div key={column.key} className="flex items-center justify-between gap-4 text-sec">
                          <span className="text-fg-2">{column.mobileLabel ?? column.header}</span>
                          <span className={cn('text-right text-fg', column.className)}>{column.cell(row)}</span>
                        </div>
                      ))}
                    </li>
                  ),
                )}
          </ul>
        </>
      )}
    </div>
  )
}
