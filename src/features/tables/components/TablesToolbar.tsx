import { Layers, Plus, Search, Users } from 'lucide-react'
import { Button, SegmentedControl, Select, TextField } from '@/components/ui'
import { ALL_AREAS, NO_AREA, type AreaFilter, type TableFilters } from '../table-filters'
import type { TableArea } from '../types'

/** "Para cuántas personas": tables of at least this many. */
const CAPACITY_OPTIONS = [
  { value: 'any', label: 'Cualquiera' },
  ...[2, 4, 6, 8, 10].map((people) => ({ value: String(people), label: `${people} o más` })),
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
  /** Plano · Cuadrícula (manual 13.10). */
  onModeChange: (mode: 'grid' | 'plan') => void
  onAddTable: () => void
  /** While a zone's plan is being edited: the way out is "Guardar plano" or "Cancelar". */
  disabled?: boolean
}

/**
 * Organize a big restaurant: search by table, zone (floor or area) and capacity, then "Zonas", the Plano · Cuadrícula
 * switch and "Agregar mesa" (they moved here from the header, so the header keeps only "Validar código").
 */
export function TablesToolbar({
  areas,
  filters,
  onFiltersChange,
  mode,
  hasUnzoned,
  onManageAreas,
  onModeChange,
  onAddTable,
  disabled,
}: TablesToolbarProps) {
  const set = (patch: Partial<TableFilters>) => onFiltersChange({ ...filters, ...patch })
  const areaOptions = [
    ...(mode === 'grid' ? [{ value: ALL_AREAS, label: 'Todas las zonas' }] : []),
    ...areas.map((area) => ({ value: area.id, label: area.name })),
    ...(hasUnzoned ? [{ value: NO_AREA, label: 'Sin zona' }] : []),
  ]

  return (
    <div role="group" aria-label="Organizar mesas" className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
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
      <div className="flex flex-wrap items-center gap-3 md:self-end">
        <Button variant="outline" icon={Layers} onClick={onManageAreas} disabled={disabled}>
          {areas.length > 0 ? 'Zonas' : 'Crear zonas'}
        </Button>
        <SegmentedControl
          aria-label="Vista de mesas"
          value={mode}
          onValueChange={onModeChange}
          disabled={disabled}
          options={[
            { value: 'plan', label: 'Plano' },
            { value: 'grid', label: 'Cuadrícula' },
          ]}
        />
        <Button variant="outline" icon={Plus} onClick={onAddTable}>
          Agregar mesa
        </Button>
      </div>
    </div>
  )
}
