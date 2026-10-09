import { describe, expect, it } from 'vitest'
import type { DayHours, WeeklyHours } from '@/components/ui'
import {
  countRestaurantFormErrors,
  emptyRestaurantFormValues,
  SUGGESTED_HOURS,
  toRegisterRestaurantInput,
  validateAddress,
  validateCategory,
  validateDay,
  validateHours,
  validateName,
  validateRestaurantForm,
  type RestaurantFormValues,
} from './restaurant-form'

const openDay = (day: DayHours['day'], opensAt: string, closesAt: string): DayHours => ({
  day,
  isOpen: true,
  isOpen24h: false,
  opensAt,
  closesAt,
})

function withDays(...days: DayHours[]): WeeklyHours {
  return emptyRestaurantFormValues().hours.map((entry) => days.find((day) => day.day === entry.day) ?? entry)
}

const VALID: RestaurantFormValues = {
  name: '  Casa 72 ',
  category: 'colombian',
  address: ' Calle 72 # 10-34, Bogotá ',
  hours: withDays(openDay('mon', '12:00', '21:00'), { ...openDay('sat', '12:00', '21:00'), isOpen24h: true }, openDay('fri', '18:00', '02:00')),
}

describe('restaurant form: initial values', () => {
  it('starts with every day closed and the suggested 12:00 p. m. – 9:00 p. m. ready', () => {
    const { name, category, address, hours } = emptyRestaurantFormValues()
    expect({ name, category, address }).toEqual({ name: '', category: '', address: '' })
    expect(hours.map((entry) => entry.day)).toEqual(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])
    expect(hours.every((entry) => !entry.isOpen && !entry.isOpen24h)).toBe(true)
    expect(hours.every((entry) => entry.opensAt === '12:00' && entry.closesAt === '21:00')).toBe(true)
    expect(SUGGESTED_HOURS).toEqual({ opensAt: '12:00', closesAt: '21:00' })
  })
})

describe('restaurant form: fields (same rules and texts as RestaurantFieldsDto)', () => {
  it('requires the name, trimmed, with at most 120 characters', () => {
    expect(validateName('   ')).toBe('Escribe el nombre de tu restaurante.')
    expect(validateName('a'.repeat(121))).toBe('El nombre del restaurante es muy largo. Usa máximo 120 caracteres.')
    expect(validateName(` ${'a'.repeat(120)} `)).toBeUndefined()
  })

  it('accepts only a category of the closed list', () => {
    expect(validateCategory('')).toBe('Elige la categoría de tu restaurante de la lista.')
    expect(validateCategory('vegan')).toBe('Elige la categoría de tu restaurante de la lista.')
    expect(validateCategory('fast_food')).toBeUndefined()
  })

  it('requires the address, trimmed, with at most 255 characters', () => {
    expect(validateAddress('  ')).toBe('Escribe la dirección de tu restaurante.')
    expect(validateAddress('a'.repeat(256))).toBe('La dirección es muy larga. Usa máximo 255 caracteres.')
    expect(validateAddress('a'.repeat(255))).toBeUndefined()
  })
})

describe('restaurant form: hours (same rules as RegisterRestaurantDto and RestaurantScheduleDto)', () => {
  it('asks for at least one open day', () => {
    expect(validateHours(emptyRestaurantFormValues().hours)).toEqual({
      hours: 'Indica al menos un día en que abre tu restaurante.',
    })
  })

  it('rejects the same opening and closing hour, naming the day', () => {
    expect(validateDay(openDay('wed', '12:00', '12:00'))).toBe(
      'El miércoles: la hora de cierre debe ser distinta de la de apertura. Si abres todo el día, marca Abierto 24 horas.',
    )
  })

  it('accepts a closing hour earlier than the opening: it closes the next day', () => {
    expect(validateDay(openDay('fri', '18:00', '02:00'))).toBeUndefined()
  })

  it('asks to choose the missing or invalid hours', () => {
    expect(validateDay(openDay('mon', '', '21:00'))).toBe('El lunes: elige la hora de apertura.')
    expect(validateDay(openDay('sun', '12:00', '25:00'))).toBe('El domingo: elige la hora de cierre.')
  })

  it('does not check hours of closed days or of 24-hour days', () => {
    expect(validateDay({ ...openDay('tue', '12:00', '12:00'), isOpen: false })).toBeUndefined()
    expect(validateDay({ ...openDay('tue', '12:00', '12:00'), isOpen24h: true })).toBeUndefined()
  })

  it('gives one message per failing day', () => {
    const hours = withDays(openDay('mon', '09:00', '09:00'), openDay('tue', '09:00', '17:00'), openDay('sat', '10:00', '10:00'))
    expect(Object.keys(validateHours(hours).days ?? {})).toEqual(['mon', 'sat'])
  })
})

describe('restaurant form: whole form', () => {
  it('has no errors when everything is valid', () => {
    expect(validateRestaurantForm(VALID)).toEqual({})
  })

  it('collects every error and counts each day row as one field', () => {
    const errors = validateRestaurantForm({
      ...emptyRestaurantFormValues(),
      hours: withDays(openDay('mon', '12:00', '12:00'), openDay('tue', '12:00', '12:00')),
    })
    expect(errors.name).toBeDefined()
    expect(errors.category).toBeDefined()
    expect(errors.address).toBeDefined()
    expect(countRestaurantFormErrors(errors)).toBe(5)
  })
})

describe('restaurant form: body of POST /restaurants', () => {
  it('sends trimmed texts and one element per open day, without hours on a 24-hour day', () => {
    expect(toRegisterRestaurantInput({ ...VALID, category: 'colombian' })).toEqual({
      name: 'Casa 72',
      category: 'colombian',
      address: 'Calle 72 # 10-34, Bogotá',
      schedules: [
        { dayOfWeek: 1, isOpen24h: false, opensAt: '12:00', closesAt: '21:00' },
        { dayOfWeek: 5, isOpen24h: false, opensAt: '18:00', closesAt: '02:00' },
        { dayOfWeek: 6, isOpen24h: true },
      ],
    })
  })
})
