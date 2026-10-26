import { AuthLink } from './AuthLink'

const STEPS = [
  'Escríbele al equipo de DiNNo con el nombre de tu restaurante y el correo con el que vas a entrar.',
  'Te avisamos cuando tu cuenta esté habilitada.',
  'Inicia sesión con ese correo o con Google y registra tu restaurante.',
]

/**
 * "Crear cuenta" tab. Restaurant accounts are enabled by the team (contract, section 10: no public sign-up),
 * so this panel explains how to get one instead of creating it.
 */
export function AccountRequestPanel({ onSwitch }: { onSwitch: () => void }) {
  return (
    <section aria-labelledby="signup-title" className="flex flex-col gap-5">
      <p className="order-last text-center text-sec text-fg/60 md:order-first">
        ¿Ya tienes cuenta? <AuthLink onClick={onSwitch}>Inicia sesión</AuthLink>
      </p>

      <header className="flex flex-col gap-2">
        {/* Focus target when switching from the inline link: this panel has no fields. */}
        <h1 id="signup-title" tabIndex={-1} className="text-h2">
          Pide tu cuenta de restaurante
        </h1>
        <p className="text-sec text-fg">
          En DiNNo, el equipo habilita cada cuenta de restaurante, así solo tú administras tus mesas.
        </p>
      </header>

      <ol className="flex list-decimal flex-col gap-3 pl-5 text-sec text-fg marker:font-bold marker:text-accent-text">
        {STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <p className="text-sec text-fg/60">¿Eres comensal? Encuentra mesa desde la app DiNNo.</p>
    </section>
  )
}
