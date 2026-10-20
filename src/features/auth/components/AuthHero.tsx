import { Download } from 'lucide-react'
import { Icon } from '@/lib/icon'

/**
 * Brand panel of the login (manual 5 and 12.4), only from 1024 px. Decorative: the form carries its own heading.
 */
export function AuthHero() {
  return (
    <div aria-hidden="true" className="relative -my-7.5 hidden w-75 shrink-0 overflow-hidden rounded-card shadow-lifted lg:block">
      {/* TODO(Sebastián): reemplazar el gradiente por la imagen del panel cuando esté definida. */}
      <div className="absolute inset-0 bg-(image:--grad-petrol)" />

      <div className="relative flex h-full flex-col items-center justify-center gap-2 px-8 text-center text-on-brand">
        <p className="text-h1">Hola de nuevo</p>
        <p className="text-sec">Ingresa tus datos para continuar</p>
        <p className="mt-4 inline-flex items-center gap-1.5 text-sec">
          Términos y condiciones
          <Icon icon={Download} size={16} />
        </p>
      </div>
    </div>
  )
}
