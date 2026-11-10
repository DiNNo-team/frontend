import { Layers, Search, Users } from 'lucide-react'
import { Button, Select, TextField } from '@/components/ui'
import { ALL_AREAS, NO_AREA, type AreaFilter, type TableFilters } from '../table-filters'
import type { TableArea } from '../types'

/** "Para cuántas personas": tables of at least this many. */
const CAPACITY_OPTIONS = [
  { value: 'any', label: 'Cualquier capacidad' },
  ...[2, 4, 6, 8, 10].map((people) => ({ value: String(people), label: `${people} personas o más` })),
]

export interface TablesToolbarProps {
  areas: TableArea[]
  filters: TableFilters
  onFiltersChange: (filters: TableFilters) => void
  /** The plan shows one zone at a time: no "Todas las zonas", and no search or capacity (they are for the grid). */
  mode: 'grid' | 'plan'
  /** Some table has no zone: "Sin zona" becomes a choice. */
  hasUnzoned: boolean
  onManageAreas: () => void
  disabled?: boolean
}

/** Organize a big restaurant: search by table, zone (floor or area) and capacity, plus the "Zonas" manager. */
export function TablesToolbar({ areas, filters, onFiltersChange, mode, hasUnzoned, onManageAreas, disabled }: TablesToolbarProps) {
  const set = (patch: Partial<TableFilters>) => onFiltersChange({ ...filters, ...patch })
  const areaOptions = [
    ...(mode === 'grid' ? [{ value: ALL_AREAS, label: 'Todas las zonas' }] : []),
    ...areas.map((area) => ({ value: area.id, label: area.name })),
    ...(hasUnzoned ? [{ value: NO_AREA, label: 'Sin zona' }] : []),
  ]

  return (
    <div role="search" aria-label="Organizar mesas" className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
      {mode === 'grid' && (
        <TextField
          label="Buscar mesa"
          type="search"
          icon={Search}
          placeholder="Ej.: 04, T1"
          autoComplete="off"
          value={filters.query}
          onChange={(event) => set({ query: event.target.value })}
          className="md:min-w-48 md:flex-1"
        />
      )}
      {areas.length > 0 && (
        <Select
          label="Zona"
          icon={Layers}
          options={areaOptions}
          value={filters.area}
          onValueChange={(area: AreaFilter) => set({ area })}
          disabled={disabled}
          className="md:min-w-48 md:flex-1"
        />
      )}
      {mode === 'grid' && (
        <Select
          label="Personas"
          icon={Users}
          options={CAPACITY_OPTIONS}
          value={filters.minCapacity === null ? 'any' : String(filters.minCapacity)}
          onValueChange={(value) => set({ minCapacity: value === 'any' ? null : Number(value) })}
          className="md:min-w-48 md:flex-1"
        />
      )}
      <Button variant="outline" icon={Layers} onClick={onManageAreas} disabled={disabled} className="md:self-end">
        {areas.length > 0 ? 'Zonas' : 'Crear zonas'}
      </Button>
    </div>
  )
}
