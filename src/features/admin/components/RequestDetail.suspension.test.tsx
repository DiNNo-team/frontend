import { beforeEach, describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import { mockAdminControl } from '../api.mock'
import { RequestDetail } from './RequestDetail'

// Restaurant 1 («Abasto Usaquén») starts approved and restaurant 16 («Tranquilo») starts suspended in the sample data.

beforeEach(() => mockAdminControl.reset())

describe('RequestDetail · suspension', () => {
  it('suspends an approved restaurant with a reason, and then offers to reactivate it and remembers the reason', async () => {
    const { user } = renderWithProviders(<RequestDetail id="mock-restaurant-1" variant="page" onClose={() => undefined} />)
    await user.click(await screen.findByRole('button', { name: 'Suspender restaurante' }))
    const dialog = await screen.findByRole('dialog', { name: '¿Suspender Abasto Usaquén?' })
    await user.type(within(dialog).getByLabelText(/Motivo \(lo verá el restaurante\)/), 'Prueba interna del panel de administración')
    await user.click(within(dialog).getByRole('button', { name: 'Suspender restaurante' }))
    expect(await screen.findByText('Abasto Usaquén quedó suspendido')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Reactivar restaurante' })).toBeInTheDocument()
    expect(screen.getByText('Prueba interna del panel de administración')).toBeInTheDocument()
  })

  it('reactivates a suspended one with a confirmation and keeps «Suspendido antes» with the reason', async () => {
    const { user } = renderWithProviders(<RequestDetail id="mock-restaurant-16" variant="page" onClose={() => undefined} />)
    await user.click(await screen.findByRole('button', { name: 'Reactivar restaurante' }))
    const dialog = await screen.findByRole('dialog', { name: '¿Reactivar Tranquilo?' })
    await user.click(within(dialog).getByRole('button', { name: 'Reactivar restaurante' }))
    expect(await screen.findByText('Tranquilo quedó activo otra vez')).toBeInTheDocument()
    expect(await screen.findByText(/^Suspendido antes: .* · Varios comensales reportaron/)).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Suspender restaurante' })).toBeInTheDocument()
  })
})
