import { useId, useState, type FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Alert, Button, Dialog, IconButton, TextField, useToast } from '@/components/ui'
import { AREA_LIMITS, type Table, type TableArea } from '../types'
import { AREA_MESSAGES, describeAreaError, validateAreaName } from './area-form'
import { useCreateTableArea, useDeleteTableArea, useRenameTableArea } from './hooks'

export interface AreasDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  areas: TableArea[]
  /** To say how many tables each zone has, and what happens to them when it is deleted. */
  tables: Table[]
}

function tablesWord(count: number): string {
  return count === 1 ? '1 mesa' : `${count} mesas`
}

/**
 * "Zonas": create, rename and delete the zones of the restaurant ("Piso 1", "Terraza", "Bar"). Deleting a zone never
 * deletes tables: they stay without zone and off the plan, and the dialog says so before confirming.
 */
export function AreasDialog({ open, onOpenChange, areas, tables }: AreasDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title="Zonas"
      description="Agrupa tus mesas por piso o área. Cada zona tiene su propio plano y puedes filtrar las mesas por zona."
      footer={
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cerrar
        </Button>
      }
    >
      {/* Remounts on every opening, so nothing half-typed survives. */}
      {open && <AreasManager areas={areas} tables={tables} />}
    </Dialog>
  )
}

function AreasManager({ areas, tables }: Pick<AreasDialogProps, 'areas' | 'tables'>) {
  const toast = useToast()
  const createArea = useCreateTableArea()
  const formId = useId()
  const [name, setName] = useState('')
  const [error, setError] = useState<string>()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const full = areas.length >= AREA_LIMITS.maxAreas

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (createArea.isPending) return
    const problem = validateAreaName(name, areas)
    setError(problem)
    if (problem) {
      document.getElementById(`${formId}-name`)?.focus()
      return
    }
    try {
      const created = await createArea.mutateAsync(name.trim())
      setName('')
      toast.show({ type: 'success', message: `Zona ${created.name} agregada` })
    } catch (caught) {
      setError(describeAreaError(caught, name))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {areas.length === 0 ? (
        <p className="text-sec text-fg">Aún no tienes zonas. Crea la primera, por ejemplo «Piso 1» o «Terraza».</p>
      ) : (
        <ul aria-label="Zonas del restaurante" className="flex flex-col divide-y divide-line rounded-tile border border-line">
          {areas.map((area) => {
            const count = tables.filter((table) => table.areaId === area.id).length
            return (
              <li key={area.id} className="p-3">
                {editingId === area.id ? (
                  <RenameRow area={area} areas={areas} onDone={() => setEditingId(null)} />
                ) : deletingId === area.id ? (
                  <DeleteRow area={area} count={count} onDone={() => setDeletingId(null)} />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-body text-fg">{area.name}</span>
                      <span className="text-sec text-fg-2">{tablesWord(count)}</span>
                    </div>
                    <IconButton icon={Pencil} size="sm" label={`Cambiar el nombre de ${area.name}`} onClick={() => setEditingId(area.id)} />
                    <IconButton icon={Trash2} size="sm" label={`Eliminar ${area.name}`} onClick={() => setDeletingId(area.id)} />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {full ? (
        <p className="text-sec text-fg">{AREA_MESSAGES.limit}</p>
      ) : (
        <form id={formId} noValidate onSubmit={add} className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <TextField
            id={`${formId}-name`}
            label="Nueva zona"
            placeholder="Ej.: Terraza, Piso 2"
            autoComplete="off"
            value={name}
            error={error}
            onChange={(event) => setName(event.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="outline" icon={Plus} loading={createArea.isPending} loadingText="Agregando…" className="sm:mt-6">
            Agregar zona
          </Button>
        </form>
      )}
    </div>
  )
}

function RenameRow({ area, areas, onDone }: { area: TableArea; areas: TableArea[]; onDone: () => void }) {
  const renameArea = useRenameTableArea()
  const fieldId = useId()
  const [name, setName] = useState(area.name)
  const [error, setError] = useState<string>()

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (renameArea.isPending) return
    if (name.trim() === area.name) {
      onDone()
      return
    }
    const problem = validateAreaName(name, areas, area.id)
    setError(problem)
    if (problem) return
    try {
      await renameArea.mutateAsync({ id: area.id, name: name.trim() })
      onDone()
    } catch (caught) {
      setError(describeAreaError(caught, name))
    }
  }

  return (
    <form noValidate onSubmit={save} className="flex flex-col gap-3">
      <TextField
        id={fieldId}
        label={`Nombre de ${area.name}`}
        autoFocus
        autoComplete="off"
        value={name}
        error={error}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            onDone()
          }
        }}
      />
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onDone} disabled={renameArea.isPending}>
          Cancelar
        </Button>
        <Button size="sm" type="submit" variant="outline" loading={renameArea.isPending} loadingText="Guardando…">
          Guardar nombre
        </Button>
      </div>
    </form>
  )
}

function DeleteRow({ area, count, onDone }: { area: TableArea; count: number; onDone: () => void }) {
  const toast = useToast()
  const deleteArea = useDeleteTableArea()
  const [error, setError] = useState<string>()

  async function confirm() {
    try {
      await deleteArea.mutateAsync(area.id)
      toast.show({ type: 'success', message: `Zona ${area.name} eliminada` })
      onDone()
    } catch (caught) {
      setError(describeAreaError(caught, area.name, AREA_MESSAGES.deleteFailed))
    }
  }

  return (
    <div className="flex flex-col gap-3" role="group" aria-label={`Eliminar ${area.name}`}>
      <p className="text-sec text-fg">
        <strong>¿Eliminar {area.name}?</strong>{' '}
        {count === 0
          ? 'No tiene mesas.'
          : `Sus ${tablesWord(count)} no se borran: quedan sin zona y salen del plano.`}
      </p>
      {error && <Alert type="error">{error}</Alert>}
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={onDone} disabled={deleteArea.isPending}>
          Cancelar
        </Button>
        <Button size="sm" variant="danger" onClick={() => void confirm()} loading={deleteArea.isPending} loadingText="Eliminando…">
          Eliminar zona
        </Button>
      </div>
    </div>
  )
}
