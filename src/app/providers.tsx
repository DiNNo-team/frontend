import type { ReactNode } from 'react'
import { Tooltip } from 'radix-ui'
import { ThemeProvider } from '@/lib/theme'

/** App-wide providers. The data (TanStack Query) and toast providers join in the next kit step. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <Tooltip.Provider delayDuration={400}>{children}</Tooltip.Provider>
    </ThemeProvider>
  )
}
