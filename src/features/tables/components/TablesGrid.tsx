import { StatusPicker, TableCard } from '@/components/ui'
import { formatTableName } from '@/lib/format'
import { RESERVATION_TEXT } from '@/features/reservations/messages'
import { tableMenuItems, type TableMenuActions } from '../table-menu'
import { getTableBoardStatus, TABLE_STATUS_OPTIONS } from '../table-status'
import type { Table, TableStatus } from '../types'

export interface TablesGridProps extends TableMenuActions {
  tables: Table[]
  /** Table whose status picker is open. */
  openId: string | null
  onToggle: (table: Table) => void
  onOpenChange: (table: Table, open: boolean) => void
  onChangeStatus: (table: Table, status: TableStatus) => void
  /** `id` of each card's button, so focus can return to it. */
  toggleIdFor: (tableId: string) => string
  /** `id` of each card's ⋯ button. */
  menuIdFor: (tableId: string) => string
  reactivatingId: string | null
  /** "Changed from another device" ring, by table id. */
  highlights?: Record<string, number>
  /** Tables held by a DiNNo reservation: «Reserva DiNNo», no status change, no Desactivar (CLAUDE.md §12.2). */
  dinnoTableIds?: ReadonlySet<string>
}

const NO_TABLES: ReadonlySet<string> = new Set()

/** Grid of table cards, min 168 px, gap 12, equal heights (manual 13.10); each card opens its status picker. */
export function TablesGrid({
  tables,
  openId,
  onToggle,
  onOpenChange,
  onChangeStatus,
  toggleIdFor,
  menuIdFor,
  reactivatingId,
  highlights,
  dinnoTableIds = NO_TABLES,
  ...actions
}: TablesGridProps) {
  return (
    <ul aria-label="Mesas" className="grid grid-tables gap-3">
      {tables.map((table) => {
        const name = formatTableName(table.identifier)
        const open = table.id === openId
        const status = getTableBoardStatus(table, dinnoTableIds)
        const locked = status === 'dinno'
        return (
          <li key={table.id} className="flex">
            <StatusPicker
              open={open}
              onOpenChange={(next) => onOpenChange(table, next)}
              title={`Estado de ${name}`}
              options={TABLE_STATUS_OPTIONS}
              value={table.status}
              onValueChange={(status) => onChangeStatus(table, status)}
              returnFocusId={toggleIdFor(table.id)}
              anchorClassName="flex min-w-0 flex-1"
              locked={locked ? { message: RESERVATION_TEXT.tableHasActiveReservation } : undefined}
              inactive={
                table.isActive
                  ? undefined
                  : {
                      message: `${name} está inactiva. No aparece para los comensales.`,
                      actionLabel: 'Reactivar mesa',
                      onAction: () => actions.onReactivate(table),
                      loading: reactivatingId === table.id,
                      loadingText: 'Reactivando…',
                    }
              }
            >
              <TableCard
                name={name}
                capacity={table.capacity}
                status={status}
                selected={open}
                onSelect={() => onToggle(table)}
                onShortcut={(next) => onChangeStatus(table, next)}
                lockedReason={locked ? RESERVATION_TEXT.lockedReason : undefined}
                toggleId={toggleIdFor(table.id)}
                menuItems={tableMenuItems(table, actions, { locked })}
                menuTriggerId={menuIdFor(table.id)}
                highlight={highlights?.[table.id]}
                headingAs="h2"
                className="flex-1"
              />
            </StatusPicker>
          </li>
        )
      })}
    </ul>
  )
}
