import { describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import { toRestaurantFormValues } from '../restaurant-form'
import type { RestaurantProfile } from '../types'
import { RestaurantForm, type RestaurantFormProps } from './RestaurantForm'

const PROFILE: RestaurantProfile = {
  id: 'restaurant-1',
  name: 'Casa 72',
  category: 'grill',
  address: 'Calle 72 # 10-34, Bogotá',
  schedules: [
    { dayOfWeek: 1, isOpen24h: false, opensAt: '09:00', closesAt: '17:00' },
    { dayOfWeek: 6, isOpen24h: true, opensAt: null, closesAt: null },
  ],
}

// The edition of /restaurante (Jacobo) as it would use the form.
function renderEdition(props: Partial<RestaurantFormProps> = {}) {
  const handlers = { onSubmit: vi.fn().mockResolvedValue(undefined), onCancel: vi.fn(), onDirtyChange: vi.fn() }
  const utils = renderWithProviders(
    <RestaurantForm initialValues={toRestaurantFormValues(PROFILE)} submitLabel="Guardar cambios" saving={false} {...handlers} {...props} />,
  )
  return { ...utils, ...handlers }
}

describe('RestaurantForm · reutilizado en la edición', () => {
  it('starts with the restaurant data and its hours', () => {
    renderEdition()
    expect(screen.getByLabelText('Nombre')).toHaveValue('Casa 72')
    expect(screen.getByRole('combobox', { name: 'Categoría' })).toHaveTextContent('Parrilla')
    expect(screen.getByLabelText('Dirección')).toHaveValue('Calle 72 # 10-34, Bogotá')
    expect(screen.getByRole('switch', { name: 'Lunes' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('combobox', { name: 'Apertura del lunes' })).toHaveTextContent('9:00 a. m.')
    expect(screen.getByRole('combobox', { name: 'Cierre del lunes' })).toHaveTextContent('5:00 p. m.')
    expect(screen.getByRole('combobox', { name: 'Apertura del sábado' })).toHaveTextContent('Abierto 24 horas')
    expect(screen.getByRole('switch', { name: 'Martes' })).toHaveAttribute('aria-checked', 'false')
  })

  it('"Cancelar" before "Guardar cambios"; cancel calls onCancel', async () => {
    const { user, onCancel } = renderEdition()
    const cancel = screen.getByRole('button', { name: 'Cancelar' })
    const save = screen.getByRole('button', { name: 'Guardar cambios' })
    expect(cancel.compareDocumentPosition(save) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('tells when there are unsaved changes, and when they are undone', async () => {
    const { user, onDirtyChange } = renderEdition()
    expect(onDirtyChange).toHaveBeenLastCalledWith(false)
    const name = screen.getByLabelText('Nombre')
    await user.type(name, ' Centro')
    expect(onDirtyChange).toHaveBeenLastCalledWith(true)
    await user.clear(name)
    await user.type(name, 'Casa 72')
    expect(onDirtyChange).toHaveBeenLastCalledWith(false)
  })

  it('submits the valid values with the same validations as the registration', async () => {
    const { user, onSubmit } = renderEdition()
    const address = screen.getByLabelText('Dirección')
    await user.clear(address)
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(address).toHaveAccessibleDescription('Escribe la dirección de tu restaurante.')
    expect(onSubmit).not.toHaveBeenCalled()

    await user.type(address, 'Carrera 7 # 45-10')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Casa 72', category: 'grill', address: 'Carrera 7 # 45-10' }))
  })

  it('while saving: "Guardando…" and "Cancelar" disabled', () => {
    renderEdition({ saving: true })
    expect(screen.getByRole('button', { name: 'Guardando…' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
  })

  it('if saving fails, shows the error and keeps what was typed', async () => {
    const { user } = renderEdition({ onSubmit: vi.fn().mockRejectedValue(new Error('boom')) })
    await user.type(screen.getByLabelText('Nombre'), ' Centro')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('No pudimos guardar tu restaurante. Intenta de nuevo en un momento.'))
    expect(screen.getByLabelText('Nombre')).toHaveValue('Casa 72 Centro')
  })
})
