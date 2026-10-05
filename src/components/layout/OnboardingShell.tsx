import type { ReactNode } from 'react'
import { Logo } from '@/components/ui'

/** Frame without sidebar for the restaurant registration (manual 12.4): logo-only topbar, centered content. */
export function OnboardingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="flex h-16 items-center border-b border-line px-4 md:px-6 lg:px-8">
        <Logo className="w-24" />
      </header>
      <main className="p-4 md:p-6 lg:p-8">
        <div className="mx-auto flex max-w-140 flex-col gap-8">{children}</div>
      </main>
    </div>
  )
}
