import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Providers } from '@/app/providers'

/** Renders inside the app providers and returns a ready `user` for interactions. */
export function renderWithProviders(ui: ReactElement) {
  return { user: userEvent.setup(), ...render(ui, { wrapper: Providers }) }
}
