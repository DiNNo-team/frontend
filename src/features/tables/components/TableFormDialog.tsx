import { useId, useState, type FormEvent } from 'react'
import { Alert, Button, Dialog, DialogFooter, NumberStepper, TextField } from '@/components/ui'
import { formatTableName } from '@/lib/format'
import { describeTableSaveError, validateCapacity, validateIdentifier, validateTableForm, type TableFormErrors, type TableFormValues } from '../table-form'
import { TABLE_LIMITS, type Table } from '../types'

export interface TableFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Loaded tables, to catch repeated identifiers before calling the backend. */
  existingTables: Table[]
  /** The table being edited. Without it the dialog creates a new one. */
  table?: Table
  saving: boolean
  onSubmit: (values: TableFormValues) => Promise<Table>
  onSaved: (table: Table) => void
}

const DEFAULT_CAPACITY = 4

/** Create (and later edit) a table: identifier + capacity in a short dialog (manual 10 and 11.1). */
export function TableFormDialog({ open, onOpenChange, table, saving, ...formProps }: TableFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={table ? `Editar ${formatTableName(table.identifier)}` : 'Agregar mesa'} preventClose={saving}>
      {/* Remounts on every opening, so the form always starts clean. */}
      <TableForm table={table} saving={saving} onCancel={() => onOpenChange(false)} onDone={() => onOpenChange(false)} {...formProps} />
    </Dialog>
  )
}

interface TableFormProps extends Pick<TableFormDialogProps, 'existingTables' | 'table' | 'saving' | 'onSubmit' | 'onSaved'> {
  onCancel: () => void
  onDone: () => void
}

function TableForm({ existingTables, table, saving, onSubmit, onSaved, onCancel, onDone }: TableFormProps) {
  const formId = useId()
  const identifierId = `${formId}-identifier`
  const capacityId = `${formId}-capacity`
  const [values, setValues] = useState<TableFormValues>({
    identifier: table?.identifier ?? '',
    capacity: table?.capacity ?? DEFAULT_CAPACITY,
  })
  const [errors, setErrors] = useState<TableFormErrors>({})
  const [formError, setFormError] = useState<string>()

  const preview = values.identifier.trim() ? `Así la verás: ${formatTableName(values.identifier)}` : undefined

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setFormError(undefined)

    const nextErrors = validateTableForm(values, existingTables, table?.id)
    setErrors(nextErrors)
    if (nextErrors.identifier || nextErrors.capacity) {
      document.getElementById(nextErrors.identifier ? identifierId : capacityId)?.focus()
      return
    }

    try {
      const saved = await onSubmit({ identifier: values.identifier.trim(), capacity: values.capacity })
      onSaved(saved)
      onDone()
    } catch (error) {
      const failure = describeTableSaveError(error, values)
      setErrors(failure.fieldErrors)
      setFormError(failure.formError)
      if (failure.fieldErrors.identifier) document.getElementById(identifierId)?.focus()
    }
  }

  return (
    <form id={formId} noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
      {formError && <Alert type="error">{formError}</Alert>}
      <TextField
        id={identifierId}
        label="Identificador"
        placeholder="Ej.: 04"
        autoComplete="off"
        value={values.identifier}
        helperText={preview}
        error={errors.identifier}
        onChange={(event) => setValues((current) => ({ ...current, identifier: event.target.value }))}
        onBlur={() => setErrors((current) => ({ ...current, identifier: validateIdentifier(values.identifier, existingTables, table?.id) }))}
      />
      <NumberStepper
        id={capacityId}
        label="Capacidad"
        value={values.capacity}
        min={TABLE_LIMITS.minCapacity}
        max={TABLE_LIMITS.maxCapacity}
        decrementLabel="Quitar una persona"
        incrementLabel="Agregar una persona"
        error={errors.capacity}
        onValueChange={(capacity) => setValues((current) => ({ ...current, capacity }))}
        onBlur={() => setErrors((current) => ({ ...current, capacity: validateCapacity(values.capacity) }))}
      />
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving} loadingText={table ? 'Guardando…' : 'Agregando…'}>
          {table ? 'Guardar cambios' : 'Agregar mesa'}
        </Button>
      </DialogFooter>
    </form>
  )
}
