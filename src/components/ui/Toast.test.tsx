import { describe, expect, it, vi } from 'vitest'
import { act, screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/render'
import { useToast, type ToastOptions } from './toast-context'

function Trigger({ options }: { options: ToastOptions[] }) {
  const toast = useToast()
  return (
    <>
      {options.map((option) => (
        <button key={option.message} type="button" onClick={() => toast.show(option)}>
          {option.message}-trigger
        </button>
      ))}
    </>
  )
}

describe('Toast', () => {
  it('shows one toast at a time: a new one replaces the current one', async () => {
    const { user } = renderWithProviders(<Trigger options={[{ message: 'Mesa 04 agregada' }, { message: 'Cambios guardados' }]} />)
    await user.click(screen.getByText('Mesa 04 agregada-trigger'))
    expect(screen.getAllByText('Mesa 04 agregada').length).toBeGreaterThan(0)

    await user.click(screen.getByText('Cambios guardados-trigger'))
    expect(screen.queryByText('Mesa 04 agregada', { selector: 'li *' })).not.toBeInTheDocument()
    expect(screen.getAllByText('Cambios guardados').length).toBeGreaterThan(0)
  })

  it('runs the action ("Deshacer") and can be closed', async () => {
    const onUndo = vi.fn()
    const { user } = renderWithProviders(
      <Trigger options={[{ message: 'Mesa 04 ahora está Ocupada', action: { label: 'Deshacer', onClick: onUndo } }]} />,
    )
    await user.click(screen.getByText('Mesa 04 ahora está Ocupada-trigger'))
    await user.click(screen.getByRole('button', { name: 'Deshacer' }))
    expect(onUndo).toHaveBeenCalledTimes(1)
  })

  it('closes itself after 4 s, or 6 s when it has an action', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { user } = renderWithProviders(
      <Trigger options={[{ message: 'Cambios guardados' }, { message: 'Con acción', action: { label: 'Deshacer', onClick: vi.fn() } }]} />,
    )
    await user.click(screen.getByText('Cambios guardados-trigger'))
    await act(() => vi.advanceTimersByTimeAsync(4100))
    expect(screen.queryByText('Cambios guardados', { selector: 'li *' })).not.toBeInTheDocument()

    await user.click(screen.getByText('Con acción-trigger'))
    await act(() => vi.advanceTimersByTimeAsync(4100))
    expect(screen.getByRole('button', { name: 'Deshacer' })).toBeInTheDocument()
    await act(() => vi.advanceTimersByTimeAsync(2000))
    expect(screen.queryByRole('button', { name: 'Deshacer' })).not.toBeInTheDocument()
  })
})
