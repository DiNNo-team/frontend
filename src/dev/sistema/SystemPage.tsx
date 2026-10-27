import { useEffect, useState, type ReactNode } from 'react'
import { CircleAlert, Moon, Plus, Sun, WifiOff } from 'lucide-react'
import { Button, Logo, STATUS_META, StatusShape } from '@/components/ui'
import { TONE_TEXT } from '@/components/ui/status'
import { cn } from '@/lib/cn'
import { Icon } from '@/lib/icon'
import { useTheme } from '@/lib/theme-context'
import { TablesDemo } from './TablesDemo'
import './system-v2.css'

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="sv2-h2">{title}</h2>
        {description && <p className="max-w-160 text-sec text-fg-2">{description}</p>}
      </div>
      {children}
    </section>
  )
}

const TYPE_SCALE = [
  { className: 'text-display', role: 'Display 48/52 · solo momentos de marca', sample: 'Dile no a la espera.' },
  { className: 'sv2-h1', role: 'Título 1 28/32 · página', sample: 'Mesas' },
  { className: 'sv2-h2', role: 'Título 2 22/28 · sección', sample: 'Horarios' },
  { className: 'text-h3', role: 'Título 3 18/24 · tarjeta, mesa', sample: 'Mesa 04' },
  { className: 'text-body', role: 'Cuerpo 16/24', sample: 'Ubica tus mesas como están en el salón.' },
  { className: 'text-sec', role: 'Secundario 14/20', sample: '30 sept · 7:30 p. m.' },
  { className: 'sv2-label', role: 'Etiqueta 12/16 700 · mayúscula inicial', sample: 'Fecha y hora' },
  { className: 'sv2-kicker', role: 'Kicker 11/14 · una por pantalla', sample: 'En vivo' },
  { className: 'sv2-metric', role: 'Cifra de métrica 28/32 tabular', sample: '12' },
]

const LEVELS = [
  { name: '0 · Suelo', detail: 'bg crema', className: 'bg-bg border border-dashed border-line-strong' },
  { name: '1 · Superficie', detail: 'surface + borde, sin sombra', className: 'bg-surface border border-line' },
  { name: '2 · Levantado', detail: 'nivel 1 + sombra soft', className: 'bg-surface border border-line shadow-card' },
  { name: '3 · Flotante', detail: 'vidrio de panel + sombra flotante', className: 'sv2-glass-panel' },
]

function GlassStage({ alpha, onAlpha, solid, onSolid }: { alpha: number; onAlpha: (value: number) => void; solid: boolean; onSolid: (value: boolean) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <label className="flex flex-1 flex-col gap-2 text-sec font-bold text-fg">
          Opacidad del vidrio de panel: {alpha}%
          <input type="range" min={30} max={95} step={1} value={alpha} onChange={(event) => onAlpha(Number(event.target.value))} className="sv2-range" />
        </label>
        <label className="flex items-center gap-2 text-sec text-fg md:max-w-80">
          <input type="checkbox" checked={solid} onChange={(event) => onSolid(event.target.checked)} className="sv2-check" />
          Ver el respaldo sólido (sin backdrop-filter o con reducir transparencia)
        </label>
      </div>
      <div className="relative overflow-hidden rounded-card border border-line bg-surface-2 p-4">
        <ul aria-hidden="true" className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {(['available', 'occupied', 'reserved', 'available', 'occupied', 'reserved', 'available', 'available', 'occupied', 'reserved'] as const).map(
            (status, index) => (
              <li key={index} data-status={status} className="sv2-table flex h-24 flex-col justify-between rounded-tile p-3">
                <span className="text-h3">Mesa {String(index + 1).padStart(2, '0')}</span>
                <span className="flex items-center gap-1.5 text-sec font-bold">
                  <StatusShape shape={STATUS_META[status].shape} className={TONE_TEXT[STATUS_META[status].tone]} />
                  {STATUS_META[status].label}
                </span>
              </li>
            ),
          )}
        </ul>
        <div className="sv2-glass-panel absolute top-10 left-1/2 flex w-72 -translate-x-1/2 flex-col gap-2 rounded-tile p-4 text-fg">
          <p className="text-h3">Mesa 04 · 2 personas</p>
          <p className="text-sec">Sobre vidrio todo el texto va en tinta. Lo secundario se distingue por tamaño, no por color.</p>
          <Button size="sm" variant="outline" className="sv2-press self-start">
            Editar mesa
          </Button>
        </div>
      </div>
    </div>
  )
}

function CurvesDemo() {
  const [moved, setMoved] = useState(false)
  const curves = [
    { curve: 'v1', name: '--ease (v1.1): hover, color, estado' },
    { curve: 'enter', name: '--ease-enter: entradas y toques' },
    { curve: 'move', name: '--ease-move: algo que se mueve' },
    { curve: 'sheet', name: '--ease-sheet: hojas y paneles' },
  ]
  return (
    <div className="flex flex-col gap-4">
      <Button variant="outline" size="sm" onClick={() => setMoved((value) => !value)} className="sv2-press self-start">
        Reproducir las curvas (300 ms)
      </Button>
      {curves.map(({ curve, name }) => (
        <div key={curve} className="flex flex-col gap-1">
          <span className="text-sec text-fg-2">{name}</span>
          <div className="sv2-track">
            <span data-curve={curve} className="sv2-puck" style={{ transform: moved ? 'translateX(calc(min(560px, 70vw) - 12px))' : 'none' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function LiveIndicators() {
  return (
    <div className="flex flex-col gap-3">
      <div className="sv2-glass-bar flex h-16 items-center justify-between gap-3 rounded-card border border-line px-6">
        <p className="text-h3 text-fg">Casa 72</p>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 text-sec font-bold text-fg">
            <span className="sv2-live-dot text-ok" aria-hidden="true" />
            En vivo
          </span>
          <span className="flex items-center gap-1.5 text-sec font-bold text-fg">
            <StatusShape shape={STATUS_META.open.shape} className={TONE_TEXT.ok} />
            Abierto
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-6 text-sec">
        <span className="flex items-center gap-2 font-bold text-fg">
          <StatusShape shape={STATUS_META.inactive.shape} className={TONE_TEXT.inactive} />
          Reconectando… <span className="font-medium text-fg-2">Actualizado 7:42 p. m.</span>
        </span>
        <span className="flex items-center gap-2 font-bold text-fg">
          <Icon icon={WifiOff} size={16} className="text-error" />
          Sin conexión
          <Button variant="ghost" size="sm" className="px-0">
            Intentar de nuevo
          </Button>
        </span>
      </div>
    </div>
  )
}

/** /sistema: living preview of the identity manual v2.0. Development only, outside the navigation. */
export default function SystemPage() {
  const { theme, toggleTheme } = useTheme()
  const [alphaByTheme, setAlphaByTheme] = useState({ light: 50, dark: 50 })
  const [solid, setSolid] = useState(false)
  const alpha = alphaByTheme[theme]

  // On <html> so the popovers, which render in a portal, read the same values.
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--sv2-alpha', `${alpha}%`)
    if (solid) root.dataset.sv2Solid = ''
    else delete root.dataset.sv2Solid
    return () => {
      root.style.removeProperty('--sv2-alpha')
      delete root.dataset.sv2Solid
    }
  }, [alpha, solid])

  return (
    <main className="sv2 min-h-screen bg-bg text-fg">
      <div className="mx-auto flex max-w-300 flex-col gap-12 p-4 md:p-6 lg:p-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Logo className="w-24" />
            <div className="flex flex-col">
              <h1 className="sv2-h1">Sistema v2.0</h1>
              <p className="text-sec text-fg-2">Muestra del manual de identidad v2.0. Solo en desarrollo; las pantallas reales siguen en v1.1.</p>
            </div>
          </div>
          <Button variant="outline" icon={theme === 'dark' ? Sun : Moon} onClick={toggleTheme} className="sv2-press">
            {theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
          </Button>
        </header>

        <Section
          title="Vista de mesas"
          description="Superficie de estado (tinte + forma + palabra), selector junto a la mesa, franja de métricas, Plano · Cuadrícula con transición y edición del plano con arrastre o teclado."
        >
          <TablesDemo />
        </Section>

        <Section
          title="Vidrio de panel"
          description="Revisión de Sebastián: 50% en claro y oscuro (el mínimo que cumple AA en claro), desenfoque de 20 px. Mueve el control para comparar; el valor queda por tema."
        >
          <GlassStage
            alpha={alpha}
            onAlpha={(value) => setAlphaByTheme((current) => ({ ...current, [theme]: value }))}
            solid={solid}
            onSolid={setSolid}
          />
        </Section>

        <Section title="Elevación" description="Tres niveles más el suelo. En reposo, borde o sombra, nunca los dos.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LEVELS.map((level) => (
              <div key={level.name} className={cn('flex h-28 flex-col justify-end rounded-tile p-4 text-fg', level.className)}>
                <span className="text-h3">{level.name}</span>
                <span className="text-sec">{level.detail}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Tipografía" description="Plus Jakarta Sans. Escala de producto: títulos más contenidos y nada por debajo de 12 px.">
          <dl className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface">
            {TYPE_SCALE.map((item) => (
              <div key={item.role} className="flex flex-col gap-1 px-4 py-3 md:flex-row md:items-baseline md:gap-6">
                <dt className="text-sec text-fg-2 md:w-72 md:shrink-0">{item.role}</dt>
                <dd className={cn(item.className, 'min-w-0 truncate text-fg')}>{item.sample}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Motion" description="Presionar (escala 0,97 en 120 ms) y las cuatro curvas. Con reducir movimiento no hay escala ni desplazamiento.">
          <div className="flex flex-wrap items-center gap-3">
            <Button icon={Plus} className="sv2-press">
              Guardar plano
            </Button>
            <Button variant="secondary" className="sv2-press">
              Abrir ahora
            </Button>
            <Button variant="outline" className="sv2-press">
              Cancelar
            </Button>
            <Button variant="ghost" className="sv2-press">
              Copiar el lunes a todos
            </Button>
          </div>
          <CurvesDemo />
        </Section>

        <Section title="En vivo" description="Topbar con vidrio de barra (al hacer scroll) e indicador de conexión: En vivo, Reconectando y Sin conexión.">
          <LiveIndicators />
        </Section>

        <p className="flex items-center gap-2 text-sec text-fg-2">
          <Icon icon={CircleAlert} size={16} />
          Esta página no está en la navegación ni en el build de producción. Se borra cuando el v2.0 llegue a las pantallas.
        </p>
      </div>
    </main>
  )
}
