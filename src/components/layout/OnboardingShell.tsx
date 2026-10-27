import type { ReactNode } from 'react'
import { Logo } from '@/components/ui'
import { AmbientGround } from './AmbientGround'

/**
 * Frame without navigation for the restaurant registration (manual v2.1, 12.4): the same room light as the dashboard,
 * the logo on a floating glass pill and the form on the glass sheet, centered.
 */
export function OnboardingShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate min-h-dvh p-3 text-fg md:p-4 lg:p-5">
      <AmbientGround />
      <header className="glass-pill mx-auto flex h-16 max-w-160 items-center rounded-full px-6">
        <Logo className="w-24" />
      </header>
      <main className="glass-sheet mx-auto mt-4 max-w-160 rounded-sheet p-4 md:p-8 lg:rounded-sheet-lg">
        <div className="mx-auto flex max-w-140 flex-col gap-8">{children}</div>
      </main>
    </div>
  )
}
