import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import { TextField } from './TextField'

describe('TextField', () => {
  it('links the label and the helper text', () => {
    renderWithProviders(<TextField label="Identificador" helperText="Así la verás: Mesa 04" />)
    const input = screen.getByLabelText('Identificador')
    const helper = screen.getByText('Así la verás: Mesa 04')
    expect(input).toHaveAttribute('aria-describedby', helper.id)
    expect(input).not.toHaveAttribute('aria-invalid')
  })

  it('marks "(opcional)" in the label and never uses asterisks', () => {
    renderWithProviders(<TextField label="Teléfono" optional />)
    expect(screen.getByLabelText('Teléfono (opcional)')).toBeInTheDocument()
    expect(screen.queryByText(/\*/)).not.toBeInTheDocument()
  })

  it('links the error with aria-describedby and aria-invalid, replacing the helper', () => {
    renderWithProviders(
      <TextField label="Identificador" helperText="Así la verás: Mesa 04" error="Escribe el identificador de la mesa" />,
    )
    const input = screen.getByLabelText('Identificador')
    const error = screen.getByText('Escribe el identificador de la mesa')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', error.id)
    expect(input).toHaveAccessibleDescription('Escribe el identificador de la mesa')
    expect(screen.queryByText('Así la verás: Mesa 04')).not.toBeInTheDocument()
  })

  it('keeps aria-describedby ids passed by the caller', () => {
    renderWithProviders(<TextField label="Identificador" aria-describedby="extra" error="Usa máximo 10 caracteres" />)
    const describedBy = screen.getByLabelText('Identificador').getAttribute('aria-describedby')
    expect(describedBy?.split(' ')).toContain('extra')
    expect(describedBy?.split(' ')).toHaveLength(2)
  })

  it('toggles password visibility with an accessible button', async () => {
    const { user } = renderWithProviders(<TextField label="Contraseña" type="password" defaultValue="secreta" />)
    const input = screen.getByLabelText('Contraseña')
    expect(input).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(input).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: 'Ocultar contraseña' }))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('forwards ref and native props to the input', () => {
    let node: HTMLInputElement | null = null
    renderWithProviders(
      <TextField
        label="Nombre"
        name="name"
        maxLength={10}
        ref={(element) => {
          node = element
        }}
      />,
    )
    expect(node).toBe(screen.getByLabelText('Nombre'))
    expect(node).toHaveAttribute('name', 'name')
    expect(node).toHaveAttribute('maxlength', '10')
  })
})
