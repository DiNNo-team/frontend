import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import { SuspendDialog } from './SuspendDialog'

const props = { open: true, onOpenChange: () => undefined, restaurantName: 'Casa 16', saving: false }

describe('SuspendDialog', () => {
  it('asks the question and says what happens', () => {
    renderWithProviders(<SuspendDialog {...props} onSuspend={() => undefined} />)
    expect(screen.getByRole('dialog', { name: '¿Suspender Casa 16?' })).toBeInTheDocument()
    expect(screen.getByText(/Las reservas en curso se respetan/)).toBeInTheDocument()
  })

  it('does not send a reason shorter than 10 characters, and says so with the contract text', async () => {
    const onSuspend = vi.fn()
    const { user } = renderWithProviders(<SuspendDialog {...props} onSuspend={onSuspend} />)
    await user.type(screen.getByLabelText(/Motivo \(lo verá el restaurante\)/), 'corto')
    await user.click(screen.getByRole('button', { name: 'Suspender restaurante' }))
    expect(await screen.findByText('Escribe el motivo de la suspensión, de 10 a 300 caracteres, para que el restaurante sepa por qué.')).toBeInTheDocument()
    expect(onSuspend).not.toHaveBeenCalled()
  })

  it('sends the trimmed reason when it is valid', async () => {
    const onSuspend = vi.fn()
    const { user } = renderWithProviders(<SuspendDialog {...props} onSuspend={onSuspend} />)
    await user.type(screen.getByLabelText(/Motivo \(lo verá el restaurante\)/), '  Prueba interna del panel  ')
    await user.click(screen.getByRole('button', { name: 'Suspender restaurante' }))
    expect(onSuspend).toHaveBeenCalledWith('Prueba interna del panel')
  })
})
