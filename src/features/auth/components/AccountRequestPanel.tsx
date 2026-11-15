import { useNavigate } from 'react-router'
import { Button } from '@/components/ui'
import { AuthLink } from './AuthLink'

const STEPS = [
  'Crea tu cuenta con tu correo o con Google.',
  'Cuéntanos de tu restaurante: nombre, dirección, horarios y teléfono de contacto.',
  'Revisamos tu solicitud y, cuando la aprobemos, administras tus mesas.',
]

/**
 * "Crear cuenta" tab (CLAUDE.md §12.12): restaurants register themselves now, and the team reviews each request.
 * The tab explains the three steps and takes the person to the real registration (`/registro`).
 */
export function AccountRequestPanel({ onSwitch }: { onSwitch: () => void }) {
  const navigate = useNavigate()

  return (
    <section aria-labelledby="signup-title" className="flex flex-col gap-5">
      <p className="order-last text-center text-sec text-fg md:order-first">
        ¿Ya tienes cuenta? <AuthLink onClick={onSwitch}>Inicia sesión</AuthLink>
      </p>

      <header className="flex flex-col gap-2">
        {/* Focus target when switching from the inline link: this panel has no fields. */}
        <h1 id="signup-title" tabIndex={-1} className="text-h2">
          Registra tu restaurante
        </h1>
        <p className="text-sec text-fg">En DiNNo revisamos cada restaurante antes de mostrarlo a los comensales.</p>
      </header>

      <ol className="flex list-decimal flex-col gap-3 pl-5 text-sec text-fg marker:font-bold marker:text-accent-text">
        {STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <Button fullWidth onClick={() => navigate('/registro')}>
        Crear cuenta
      </Button>

      <p className="text-sec text-fg">¿Eres comensal? Encuentra mesa desde la app DiNNo.</p>
    </section>
  )
}
