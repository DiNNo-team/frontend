import { useEffect, useRef, useState } from 'react'
import { authPanelId, authTabId, SLIDE_CLASSES, type AuthView } from './auth-view'
import { AccountRequestPanel } from './components/AccountRequestPanel'
import { AuthBackdrop } from './components/AuthBackdrop'
import { AuthHero } from './components/AuthHero'
import { AuthNav } from './components/AuthNav'
import { SignInForm } from './components/SignInForm'

/**
 * `/login`: glass card over two brand shapes, with "Iniciar sesión" and "Crear cuenta" tabs in the same card.
 * Restaurant access is invitation-only, so "Crear cuenta" explains how to get an account. Switching slides the
 * panels and the brand panel; the hidden panel is `inert`.
 */
export default function LoginPage() {
  const [view, setView] = useState<AuthView>('signin')
  const panels = useRef<Record<AuthView, HTMLDivElement | null>>({ signin: null, signup: null })
  const focusPending = useRef(false)

  useEffect(() => {
    if (!focusPending.current) return
    focusPending.current = false
    // The link that switched the view is now inside an inert panel: move focus into the new one.
    const panel = panels.current[view]
    const target = panel?.querySelector('input') ?? panel?.querySelector('h1')
    target?.focus({ preventScroll: true })
  }, [view])

  function switchFromPanel(next: AuthView) {
    focusPending.current = true
    setView(next)
  }

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-12">
      <AuthBackdrop />

      <div
        data-view={view}
        className="group glass-login relative flex w-full max-w-120 flex-col rounded-card shadow-lifted md:max-w-150 md:flex-row lg:min-h-140 lg:max-w-200"
      >
        <AuthNav view={view} onSelect={setView} />
        <AuthHero />

        <div className="grid min-w-0 flex-1 overflow-hidden">
          {(['signin', 'signup'] as const).map((panel) => (
            <div
              key={panel}
              ref={(element) => {
                panels.current[panel] = element
              }}
              role="tabpanel"
              id={authPanelId(panel)}
              aria-labelledby={authTabId(panel)}
              inert={view !== panel}
              className={`${SLIDE_CLASSES[panel]} flex flex-col justify-center px-6 pt-6 pb-8 sm:px-10 md:py-10`}
            >
              {panel === 'signin' ? (
                <SignInForm onSwitch={() => switchFromPanel('signup')} />
              ) : (
                <AccountRequestPanel onSwitch={() => switchFromPanel('signin')} />
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
