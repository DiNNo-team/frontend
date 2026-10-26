import { Logo } from '@/components/ui'
import { AuthBackdrop } from './components/AuthBackdrop'
import { AuthHero } from './components/AuthHero'
import { SignInForm } from './components/SignInForm'

/** `/login`: restaurant access is invitation-only, so this page only offers sign-in. */
export default function LoginPage() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-12">
      <AuthBackdrop />

      <div className="glass-login relative flex w-full max-w-120 flex-col rounded-card shadow-lifted md:max-w-150 md:flex-row lg:min-h-140 lg:max-w-200">
        <AuthHero />

        <div className="flex min-w-0 flex-1 flex-col justify-center px-6 pt-8 pb-8 sm:px-10 md:py-10">
          <div className="mb-6 flex justify-center lg:hidden">
            <Logo className="w-24" />
          </div>
          <SignInForm />
        </div>
      </div>
    </main>
  )
}
