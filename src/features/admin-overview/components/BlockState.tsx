import type { ReactNode } from 'react'
import { Alert, Button, Skeleton } from '@/components/ui'
import { useDelayedFlag } from '@/lib/use-delayed-flag'
import { canRetry, describeBlockError, OVERVIEW_TEXT } from '../messages'

interface QueryLike {
  isPending: boolean
  isError: boolean
  error: unknown
  refetch: () => unknown
}

interface BlockStateProps {
  query: QueryLike
  /** Skeleton classes for what is loading, with the shape of the real block. */
  skeleton: string
  /** What the block says to read it while it loads (screen readers). */
  loadingLabel: string
  children: ReactNode
}

/**
 * One block's three states, so a failing block never takes the others with it: the skeleton (only if the wait passes
 * 300 ms, `useDelayedFlag`), the error with «Intentar de nuevo» (never for a 401 or 403), or the content. A 429 is shown, not retried.
 */
export function BlockState({ query, skeleton, loadingLabel, children }: BlockStateProps) {
  const showSkeleton = useDelayedFlag(query.isPending)
  if (query.isError) {
    return (
      <Alert
        type="error"
        action={
          canRetry(query.error) ? (
            <Button size="sm" variant="outline" onClick={() => void query.refetch()}>
              {OVERVIEW_TEXT.retry}
            </Button>
          ) : undefined
        }
      >
        {describeBlockError(query.error)}
      </Alert>
    )
  }
  if (query.isPending) {
    return (
      <div aria-busy="true" aria-label={loadingLabel} role="status">
        <span className="sr-only">{loadingLabel}</span>
        {showSkeleton && <Skeleton radius="card" className={skeleton} />}
      </div>
    )
  }
  return <>{children}</>
}
