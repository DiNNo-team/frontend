import { Download } from 'lucide-react'
import { Icon } from '@/lib/icon'
import { SLIDE_CLASSES, type AuthView } from '../auth-view'

const HERO_TEXT: Record<AuthView, { title: string; subtitle: string }> = {
  signin: { title: 'Hola de nuevo', subtitle: 'Ingresa tus datos para continuar' },
  signup: { title: 'Únete a DiNNo', subtitle: 'Crear tu cuenta toma un minuto' },
}

/**
 * Brand panel of the login (manual 5 and 12.4), only from 1024 px. It sticks out of the card and its background
 * drifts a little when the view changes. Decorative: the forms carry their own headings for screen readers.
 */
export function AuthHero() {
  return (
    <div aria-hidden="true" className="relative -my-7.5 hidden w-75 shrink-0 overflow-hidden rounded-card shadow-lifted lg:block">
      {/* TODO(Sebastián): reemplazar el gradiente por la imagen del panel cuando esté definida. */}
      <div className="absolute inset-x-0 -inset-y-6 bg-(image:--grad-petrol) transition duration-(--dur-slow) ease-dinno group-data-[view=signup]:-translate-y-6" />

      <div className="relative grid h-full overflow-hidden">
        {(['signin', 'signup'] as const).map((view) => (
          <div key={view} className={`${SLIDE_CLASSES[view]} flex flex-col items-center justify-center gap-2 px-8 text-center text-on-brand`}>
            <p className="text-h1">{HERO_TEXT[view].title}</p>
            <p className="text-sec">{HERO_TEXT[view].subtitle}</p>
            {/* TODO(Sebastián): enlazar el documento cuando exista; por ahora es solo texto. */}
            <p className="mt-4 inline-flex items-center gap-1.5 text-sec">
              Términos y condiciones
              <Icon icon={Download} size={16} />
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
