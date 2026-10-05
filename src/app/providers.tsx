import { useState, type ReactNode } from 'react'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { Tooltip } from 'radix-ui'
import { ToastProvider } from '@/components/ui'
import { ThemeProvider } from '@/lib/theme'
import { createQueryClient } from './query-client'

interface ProvidersProps {
  children: ReactNode
  /** Tests pass their own client (no retries). */
  queryClient?: QueryClient
}

/** App-wide providers: theme, server data (TanStack Query), tooltips and toasts. */
export function Providers({ children, queryClient }: ProvidersProps) {
  const [client] = useState(() => queryClient ?? createQueryClient())
  return (
    <ThemeProvider>
      <QueryClientProvider client={client}>
        <Tooltip.Provider delayDuration={400}>
          <ToastProvider>{children}</ToastProvider>
        </Tooltip.Provider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
