import { DAY_LABELS, DAYS_OF_WEEK, type DayHours, type DayOfWeek, type WeeklyHours } from '@/components/ui'
import { ApiError, getApiErrorMessage, isAccessError } from '@/lib/api-client'
import { RESTAURANT_CATEGORIES, RESTAURANT_LIMITS, type RegisterRestaurantInput, type RestaurantCategory } from './types'

// Single source of the restaurant form rules and texts, shared by the registration (Santiago, /onboarding)
// and the edition (Jacobo, /restaurante). Same rules and texts as the backend DTOs.

export interface RestaurantFormValues {
  name: string
  /** `''` while nothing is chosen. */
  category: RestaurantCategory | ''
  address: string
  /** Seven entries, Monday to Sunday (HoursEditor value). */
  hours: WeeklyHours
}

/** What the form hands over once it is valid: trimmed texts and a chosen category. */
export interface ValidRestaurantFormValues extends Omit<RestaurantFormValues, 'category'> {
  category: RestaurantCategory
}

export interface RestaurantFormErrors {
  name?: string
  category?: string
  address?: string
  /** Error of the whole schedule (no open day). */
  hours?: string
  /** One message per day row. */
  days?: Partial<Record<DayOfWeek, string>>
}

/** "El lunes", "El miércoles"… like the backend messages. */
function dayLabel(day: DayOfWeek): string {
  return `El ${DAY_LABELS[day].long.toLowerCase()}`
}

export const RESTAURANT_FORM_MESSAGES = {
  nameRequired: 'Escribe el nombre de tu restaurante.',
  nameTooLong: `El nombre del restaurante es muy largo. Usa máximo ${RESTAURANT_LIMITS.nameMaxLength} caracteres.`,
  categoryRequired: 'Elige la categoría de tu restaurante de la lista.',
  addressRequired: 'Escribe la dirección de tu restaurante.',
  addressTooLong: `La dirección es muy larga. Usa máximo ${RESTAURANT_LIMITS.addressMaxLength} caracteres.`,
  noOpenDay: 'Indica al menos un día en que abre tu restaurante.',
  // Backend: "escribe la hora … en formato HH:MM". Here the hours come from a list, so the text says to choose one.
  openingRequired: (day: DayOfWeek) => `${dayLabel(day)}: elige la hora de apertura.`,
  closingRequired: (day: DayOfWeek) => `${dayLabel(day)}: elige la hora de cierre.`,
  sameHours: (day: DayOfWeek) =>
    `${dayLabel(day)}: la hora de cierre debe ser distinta de la de apertura. Si abres todo el día, marca Abierto 24 horas.`,
  /** Alert above the form when more than two fields fail (manual 10). */
  reviewFields: (count: number) => `Revisa los ${count} campos marcados.`,
  /** 400 the web rules did not catch (they drifted from the backend's). */
  invalidData: 'No pudimos guardar tu restaurante. Revisa el nombre, la categoría, la dirección y los horarios e intenta de nuevo.',
  /** 500 or any other failure. */
  saveFailed: 'No pudimos guardar tu restaurante. Intenta de nuevo en un momento.',
} as const

// HH:MM in 24 h, the same pattern as the backend.
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

export function isRestaurantCategory(value: string): value is RestaurantCategory {
  return (RESTAURANT_CATEGORIES as readonly string[]).includes(value)
}

/**
 * Hours a day gets when it is switched to Abierto (decision of Santiago, 2026-10-09): a suggestion
 * the person changes. Every day starts closed, so nothing is saved until someone opens a day.
 */
export const SUGGESTED_HOURS = { opensAt: '12:00', closesAt: '21:00' } as const

/** Every day closed, with the suggested hours ready for when it is opened. */
export function emptyRestaurantFormValues(): RestaurantFormValues {
  return {
    name: '',
    category: '',
    address: '',
    hours: DAYS_OF_WEEK.map((day) => ({ day, isOpen: false, isOpen24h: false, ...SUGGESTED_HOURS })),
  }
}

export function validateName(name: string): string | undefined {
  const trimmed = name.trim()
  if (!trimmed) return RESTAURANT_FORM_MESSAGES.nameRequired
  if (trimmed.length > RESTAURANT_LIMITS.nameMaxLength) return RESTAURANT_FORM_MESSAGES.nameTooLong
  return undefined
}

export function validateCategory(category: string): string | undefined {
  return isRestaurantCategory(category) ? undefined : RESTAURANT_FORM_MESSAGES.categoryRequired
}

export function validateAddress(address: string): string | undefined {
  const trimmed = address.trim()
  if (!trimmed) return RESTAURANT_FORM_MESSAGES.addressRequired
  if (trimmed.length > RESTAURANT_LIMITS.addressMaxLength) return RESTAURANT_FORM_MESSAGES.addressTooLong
  return undefined
}

/** One message per day: a closed day or a 24-hour day has no hours to check. */
export function validateDay({ day, isOpen, isOpen24h, opensAt, closesAt }: DayHours): string | undefined {
  if (!isOpen || isOpen24h) return undefined
  if (!TIME_PATTERN.test(opensAt)) return RESTAURANT_FORM_MESSAGES.openingRequired(day)
  if (!TIME_PATTERN.test(closesAt)) return RESTAURANT_FORM_MESSAGES.closingRequired(day)
  // A closing time earlier than the opening is valid: it closes the next day.
  if (closesAt === opensAt) return RESTAURANT_FORM_MESSAGES.sameHours(day)
  return undefined
}

export function validateHours(hours: WeeklyHours): Pick<RestaurantFormErrors, 'hours' | 'days'> {
  if (!hours.some((entry) => entry.isOpen)) return { hours: RESTAURANT_FORM_MESSAGES.noOpenDay }
  const days: Partial<Record<DayOfWeek, string>> = {}
  for (const entry of hours) {
    const error = validateDay(entry)
    if (error) days[entry.day] = error
  }
  return Object.keys(days).length > 0 ? { days } : {}
}

export function validateRestaurantForm(values: RestaurantFormValues): RestaurantFormErrors {
  const errors: RestaurantFormErrors = validateHours(values.hours)
  const name = validateName(values.name)
  const category = validateCategory(values.category)
  const address = validateAddress(values.address)
  if (name) errors.name = name
  if (category) errors.category = category
  if (address) errors.address = address
  return errors
}

/** Fields with an error: each day row counts as one field. */
export function countRestaurantFormErrors(errors: RestaurantFormErrors): number {
  const fields = [errors.name, errors.category, errors.address, errors.hours].filter(Boolean).length
  return fields + Object.keys(errors.days ?? {}).length
}

export interface RestaurantSaveFailure {
  fieldErrors: RestaurantFormErrors
  /** Shown as an error Alert above the form, keeping what was typed. */
  formError?: string
}

/**
 * Translates a backend error into the form's own texts: the backend message is never shown.
 * A 400 is checked again with the web rules (the same as the backend's) to mark the failing fields.
 */
export function describeRestaurantSaveError(error: unknown, values: RestaurantFormValues): RestaurantSaveFailure {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      const fieldErrors = validateRestaurantForm(values)
      if (countRestaurantFormErrors(fieldErrors) > 0) return { fieldErrors }
      return { fieldErrors: {}, formError: RESTAURANT_FORM_MESSAGES.invalidData }
    }
    // Network, session ended, email not verified or no access: manual 14.2 texts.
    if (error.isNetworkError || isAccessError(error)) return { fieldErrors: {}, formError: getApiErrorMessage(error) }
  }
  return { fieldErrors: {}, formError: RESTAURANT_FORM_MESSAGES.saveFailed }
}

/** Body of POST /restaurants: one element per open day; a 24-hour day goes without hours. */
export function toRegisterRestaurantInput(values: ValidRestaurantFormValues): RegisterRestaurantInput {
  return {
    name: values.name.trim(),
    category: values.category,
    address: values.address.trim(),
    schedules: values.hours
      .filter((entry) => entry.isOpen)
      .map((entry) => {
        const dayOfWeek = DAYS_OF_WEEK.indexOf(entry.day) + 1
        return entry.isOpen24h
          ? { dayOfWeek, isOpen24h: true }
          : { dayOfWeek, isOpen24h: false, opensAt: entry.opensAt, closesAt: entry.closesAt }
      }),
  }
}
