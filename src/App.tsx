import { lazy, Suspense } from 'react'
import { Logo } from '@/components/ui'

// Dev-only kit reference at /kit. The router replaces this check in the next step.
const KitPage = import.meta.env.DEV ? lazy(() => import('@/dev/kit/KitPage')) : null

function App() {
  if (KitPage && window.location.pathname === '/kit') {
    return (
      <Suspense fallback={null}>
        <KitPage />
      </Suspense>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg">
      <Logo className="w-72" />
    </main>
  )
}

export default App
