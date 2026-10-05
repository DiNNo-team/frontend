import { useState, type ReactNode } from 'react'
import { Ban, Ellipsis, Moon, Pencil, Phone, Plus, Sun, X } from 'lucide-react'
import {
  Button,
  Card,
  IconButton,
  Logo,
  Spinner,
  STATUS_META,
  StatusChip,
  StatusShape,
  TextField,
  type ButtonVariant,
  type Status,
} from '@/components/ui'
import { useTheme } from '@/lib/theme-context'
import { KitDay2Sections, KitSection } from './KitDay2Sections'

const STATUSES = Object.keys(STATUS_META) as Status[]
const VARIANTS: { variant: ButtonVariant; text: string; icon?: typeof Plus }[] = [
  { variant: 'primary', text: 'Guardar cambios' },
  { variant: 'secondary', text: 'Abrir ahora' },
  { variant: 'outline', text: 'Cancelar' },
  { variant: 'ghost', text: 'Copiar a todos los días' },
  { variant: 'danger', text: 'Desactivar mesa', icon: Ban },
]

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>
}

function LoadingDemo() {
  const [loading, setLoading] = useState(false)
  return (
    <Button
      loading={loading}
      loadingText="Guardando…"
      onClick={() => {
        setLoading(true)
        window.setTimeout(() => setLoading(false), 2000)
      }}
    >
      Guardar cambios
    </Button>
  )
}

function ValidationDemo() {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string>()
  return (
    <TextField
      label="Nombre del restaurante"
      placeholder="Ej.: Casa 72"
      helperText="Sal del campo vacío para ver el error"
      value={value}
      error={error}
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => setError(value.trim() ? undefined : 'Escribe el nombre del restaurante')}
    />
  )
}

/** Visual reference of the kit, only in development (`/kit`). Add every new component here. */
export default function KitPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-bg text-fg">
      <main className="mx-auto flex max-w-300 flex-col gap-8 px-4 py-8 md:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-h1">Kit de componentes</h1>
            <p className="text-sec text-fg-2">
              Referencia visual del equipo · manual v1.1 · usa Tab para ver el foco de cada pieza
            </p>
          </div>
          <Button variant="outline" icon={theme === 'dark' ? Sun : Moon} onClick={toggleTheme}>
            {theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
          </Button>
        </header>

        <KitSection title="Logo" note="Archivos de assets/brand. Auto sigue el tema.">
          <Row>
            <Logo className="w-40" />
            <Logo symbolOnly className="w-12" />
            <span className="inline-flex rounded-input bg-nav p-4">
              <Logo variant="onDark" className="w-24" />
            </span>
          </Row>
        </KitSection>

        <KitSection title="Button" note="Un solo primario por pantalla. Esta página de referencia es la excepción.">
          <Row>
            {VARIANTS.map(({ variant, text, icon }) => (
              <Button key={variant} variant={variant} icon={icon}>
                {text}
              </Button>
            ))}
          </Row>
          <Row>
            {VARIANTS.map(({ variant, text, icon }) => (
              <Button key={variant} variant={variant} icon={icon} disabled>
                {text}
              </Button>
            ))}
          </Row>
          <Row>
            <LoadingDemo />
            <Button loading loadingText="Guardando…">
              Guardar cambios
            </Button>
            <Button variant="outline" loading loadingText="Agregando…">
              Agregar mesa
            </Button>
            <Button size="sm" icon={Plus}>
              Agregar mesa
            </Button>
            <Button size="sm" variant="outline" icon={Pencil}>
              Editar
            </Button>
          </Row>
          <div className="max-w-100">
            <Button fullWidth>Iniciar sesión</Button>
          </div>
        </KitSection>

        <KitSection title="IconButton · Spinner" note="Label obligatorio: va al aria-label y al tooltip.">
          <Row>
            <IconButton icon={Ellipsis} label="Más acciones de Mesa 04" />
            <IconButton icon={X} label="Cerrar aviso" size="sm" />
            <IconButton icon={Ellipsis} label="Más acciones" disabled />
            <Spinner />
            <Spinner size={20} label="Cargando" />
          </Row>
        </KitSection>

        <KitSection title="TextField">
          <div className="grid gap-6 md:grid-cols-2">
            <TextField label="Nombre del restaurante" placeholder="Ej.: Casa 72" />
            <TextField label="Teléfono" optional icon={Phone} placeholder="300 123 4567" helperText="Lo ven los comensales" />
            <TextField label="Dirección" placeholder="Ej.: Calle 72 # 8-21" error="Escribe la dirección del restaurante" />
            <TextField label="Correo de acceso" value="admin@casa72.co" disabled helperText="Se cambia desde Ajustes" />
            <TextField label="Contraseña" type="password" defaultValue="casa72casa72" />
            <TextField label="Restaurante" value="Casa 72" readOnly />
            <ValidationDemo />
          </div>
        </KitSection>

        <KitSection title="StatusChip · StatusShape" note="Color + forma + palabra. Los estados nunca son naranja.">
          <Row>
            {STATUSES.map((status) => (
              <StatusChip key={status} status={status} />
            ))}
            <StatusChip status="error" label="Error · intenta de nuevo" />
          </Row>
          <Row>
            {STATUSES.map((status) => (
              <span key={status} className="inline-flex items-center gap-2 text-sec text-fg-2">
                <StatusShape shape={STATUS_META[status].shape} className="text-fg" />
                {STATUS_META[status].shape}
              </span>
            ))}
          </Row>
        </KitSection>

        <KitSection title="Card" note="Nunca otra Card adentro. Padding 24 (16 en móvil).">
          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Tu restaurante">
              <p className="text-sec text-fg-2">Nombre</p>
              <p className="text-body">Casa 72</p>
            </Card>
            <Card as="section">
              <p className="text-body">Tarjeta sin título.</p>
            </Card>
          </div>
        </KitSection>
        <KitDay2Sections />
      </main>
    </div>
  )
}
