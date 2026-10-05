import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Button, EmptyState, PageHeader } from '@/components/ui'
import { useDelayedFlag } from '@/lib/use-delayed-flag'
import { TablesGrid } from './components/TablesGrid'
import { TablesSkeleton } from './components/TablesSkeleton'
import { TablesStats } from './components/TablesStats'
import { useTablesQuery } from './hooks'
import { countTables, sortTables } from './table-status'

const TITLE = 'Mesas'
const DESCRIPTION = 'Actualiza el estado de cada mesa en tiempo real'

/** /mesas (manual 12.3 and 12.4): metrics + grid of tables, with loading, empty and error states. */
export default function TablesPage() {
  const tablesQuery = useTablesQuery()
  const showSkeleton = useDelayedFlag(tablesQuery.isPending)
  const tables = useMemo(() => sortTables(tablesQuery.data ?? []), [tablesQuery.data])
  const counts = useMemo(() => countTables(tables), [tables])

  // TODO(Sebastián): Fase 3 abre el diálogo "Agregar mesa".
  const addTableButton = <Button icon={Plus}>Agregar mesa</Button>

  if (tablesQuery.isPending) {
    return (
      <>
        <PageHeader title={TITLE} description={DESCRIPTION} />
        <div aria-busy="true">
          <p role="status" className="sr-only">
            Cargando mesas
          </p>
          {showSkeleton && <TablesSkeleton />}
        </div>
      </>
    )
  }

  if (tablesQuery.isError) {
    return (
      <>
        <PageHeader title={TITLE} description={DESCRIPTION} />
        <EmptyState
          variant="error"
          title="No pudimos cargar tus mesas"
          description="Revisa tu conexión e intenta de nuevo."
          action={
            <Button loading={tablesQuery.isFetching} onClick={() => tablesQuery.refetch()}>
              Intentar de nuevo
            </Button>
          }
        />
      </>
    )
  }

  if (tables.length === 0) {
    // Only one primary per screen: the empty state's button replaces the header one, and the metrics hide.
    return (
      <>
        <PageHeader title={TITLE} description={DESCRIPTION} />
        <EmptyState title="Aún no tienes mesas" description="Agrega tus mesas para empezar a recibir comensales." action={addTableButton} />
      </>
    )
  }

  return (
    <>
      <PageHeader title={TITLE} description={DESCRIPTION} actions={addTableButton} />
      <TablesStats counts={counts} />
      <TablesGrid tables={tables} />
    </>
  )
}
