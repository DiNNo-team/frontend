import { useId, useRef, useState, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import { Alert, Button, Card, HoursEditor, Select, TextField, type WeeklyHours } from '@/components/ui'
import {
  countRestaurantFormErrors,
  describeRestaurantSaveError,
  isRestaurantCategory,
  RESTAURANT_FORM_MESSAGES,
  validateAddress,
  validateCategory,
  validateHours,
  validateName,
  validateRestaurantForm,
  type RestaurantFormErrors,
  type RestaurantFormValues,
  type ValidRestaurantFormValues,
} from '../restaurant-form'
import { RESTAURANT_CATEGORIES, RESTAURANT_CATEGORY_LABELS } from '../types'

const CATEGORY_OPTIONS = RESTAURANT_CATEGORIES.map((value) => ({ value, label: RESTAURANT_CATEGORY_LABELS[value] }))

export interface RestaurantFormProps {
  initialValues: RestaurantFormValues
  /** Primary button: "Guardar y continuar" (registration) or "Guardar cambios" (edition). */
  submitLabel: string
  saving: boolean
  /** Receives valid values. Throws on failure: the form shows the error and keeps what was typed. */
  onSubmit: (values: ValidRestaurantFormValues) => Promise<void>
  /** Shows "Cancelar" before the primary button. */
  onCancel?: () => void
}

/**
 * Restaurant form (manual 10 and 12.4): Tu restaurante (Nombre, Categoría), Ubicación (Dirección)
 * and Horarios (HoursEditor), one card per group. Validates on blur and on submit.
 */
export function RestaurantForm({ initialValues, submitLabel, saving, onSubmit, onCancel }: RestaurantFormProps) {
  const formId = useId()
  const nameId = `${formId}-name`
  const categoryId = `${formId}-category`
  const addressId = `${formId}-address`
  const hoursRef = useRef<HTMLDivElement>(null)
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<RestaurantFormErrors>({})
  const [formError, setFormError] = useState<string>()
  const errorCount = countRestaurantFormErrors(errors)

  /** Shows the errors right away (so the failing fields are marked) and focuses the first one (manual 10). */
  function showErrors(next: RestaurantFormErrors, nextFormError?: string) {
    flushSync(() => {
      setErrors(next)
      setFormError(nextFormError)
    })
    const fieldId = next.name ? nameId : next.category ? categoryId : next.address ? addressId : undefined
    if (fieldId) {
      document.getElementById(fieldId)?.focus()
      return
    }
    // HoursEditor has no ids: the first failing hour picker, or the first day switch when no day is open.
    const hours = hoursRef.current
    const target = hours?.querySelector<HTMLElement>('[aria-invalid="true"]') ?? hours?.querySelector<HTMLElement>('[role="switch"]')
    if (next.hours || next.days) target?.focus()
  }

  function handleHoursChange(hours: WeeklyHours) {
    setValues((current) => ({ ...current, hours }))
    // Once the hours show errors, they follow each change until fixed.
    if (errors.hours || errors.days) setErrors((current) => ({ ...current, hours: undefined, days: undefined, ...validateHours(hours) }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setFormError(undefined)

    const nextErrors = validateRestaurantForm(values)
    if (countRestaurantFormErrors(nextErrors) > 0 || !isRestaurantCategory(values.category)) {
      showErrors(nextErrors)
      return
    }
    setErrors({})

    try {
      await onSubmit({ ...values, category: values.category })
    } catch (error) {
      const failure = describeRestaurantSaveError(error, values)
      showErrors(failure.fieldErrors, failure.formError)
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
      {formError && <Alert type="error">{formError}</Alert>}
      {!formError && errorCount > 2 && <Alert type="error" title={RESTAURANT_FORM_MESSAGES.reviewFields(errorCount)} />}

      <Card as="section" title="Tu restaurante">
        <div className="flex flex-col gap-6">
          <TextField
            id={nameId}
            label="Nombre"
            placeholder="Ej.: Casa 72"
            autoComplete="organization"
            value={values.name}
            error={errors.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            onBlur={() => setErrors((current) => ({ ...current, name: validateName(values.name) }))}
          />
          {/* Validated on change, not on blur: opening the list already moves the focus out of the field. */}
          <Select
            id={categoryId}
            label="Categoría"
            placeholder="Elige una categoría"
            options={CATEGORY_OPTIONS}
            value={values.category}
            error={errors.category}
            onValueChange={(category) => {
              if (!isRestaurantCategory(category)) return
              setValues((current) => ({ ...current, category }))
              setErrors((current) => ({ ...current, category: validateCategory(category) }))
            }}
          />
        </div>
      </Card>

      <Card as="section" title="Ubicación">
        <TextField
          id={addressId}
          label="Dirección"
          placeholder="Ej.: Calle 72 # 10-34, Bogotá"
          autoComplete="street-address"
          value={values.address}
          error={errors.address}
          onChange={(event) => setValues((current) => ({ ...current, address: event.target.value }))}
          onBlur={() => setErrors((current) => ({ ...current, address: validateAddress(values.address) }))}
        />
      </Card>

      <Card as="section" title="Horarios">
        <div ref={hoursRef} className="flex flex-col gap-4">
          {errors.hours && <Alert type="error">{errors.hours}</Alert>}
          <HoursEditor value={values.hours} onChange={handleHoursChange} errors={errors.days} />
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-3 *:w-full sm:flex-row sm:justify-end sm:*:w-auto">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={saving} loadingText="Guardando…">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
