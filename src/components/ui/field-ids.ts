import { useId } from 'react'

export interface FieldIds {
  id: string
  helperId: string
  errorId: string
}

/** Stable ids for a field and its helper/error texts. Pass the caller's `id` to keep it. */
export function useFieldIds(id?: string): FieldIds {
  const generated = useId()
  const fieldId = id ?? generated
  return { id: fieldId, helperId: `${fieldId}-helper`, errorId: `${fieldId}-error` }
}

/** Value for `aria-describedby`: the error replaces the helper text, and the caller's own ids are kept. */
export function describedBy(ids: FieldIds, hasHelper: boolean, hasError: boolean, own?: string): string | undefined {
  const parts = [own, hasError ? ids.errorId : hasHelper ? ids.helperId : undefined].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : undefined
}
