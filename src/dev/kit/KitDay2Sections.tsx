import { useState, type ReactNode } from 'react'
import { ArrowRight, Ban, Ellipsis, Pencil, Plus, RotateCcw, Tag } from 'lucide-react'
import {
  Alert,
  Button,
  ConfirmDialog,
  DataTable,
  Dialog,
  DropdownMenu,
  EmptyState,
  FloatingBar,
  HoursEditor,
  IconButton,
  NumberStepper,
  PageHeader,
  SegmentedControl,
  Select,
  Skeleton,
  StatTile,
  StatusChip,
  Switch,
  TableCard,
  TextField,
  TimeSelect,
  useToast,
  type WeeklyHours,
} from '@/components/ui'
import { formatDateTime } from '@/lib/format'
import { Icon } from '@/lib/icon'

export function KitSection({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-line pt-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-label text-fg-2 uppercase">{title}</h2>
        {note && <p className="text-sec text-fg-2">{note}</p>}
      </div>
      {children}
    </section>
  )
}

const CATEGORIES = [
  { value: 'colombian', label: 'Cocina colombiana' },
  { value: 'italian', label: 'Italiana' },
  { value: 'fast', label: 'Comida rápida' },
]

const SAMPLE_HOURS: WeeklyHours = [
  { day: 'mon', isOpen: true, isOpen24h: false, opensAt: '12:00', closesAt: '22:00' },
  { day: 'tue', isOpen: true, isOpen24h: false, opensAt: '12:00', closesAt: '22:00' },
  { day: 'wed', isOpen: true, isOpen24h: false, opensAt: '12:00', closesAt: '22:00' },
  { day: 'thu', isOpen: true, isOpen24h: true, opensAt: '12:00', closesAt: '22:00' },
  { day: 'fri', isOpen: true, isOpen24h: false, opensAt: '12:00', closesAt: '01:00' },
  { day: 'sat', isOpen: true, isOpen24h: false, opensAt: '12:00', closesAt: '01:00' },
  { day: 'sun', isOpen: false, isOpen24h: false, opensAt: '12:00', closesAt: '22:00' },
]

type TableStatusValue = 'available' | 'reserved' | 'occupied'
const STATUS_OPTIONS = [
  { value: 'available' as const, label: 'Disponible', status: 'available' as const },
  { value: 'reserved' as const, label: 'Reservada', status: 'reserved' as const },
  { value: 'occupied' as const, label: 'Ocupada', status: 'occupied' as const },
]

interface LogRow {
  id: string
  at: Date
  table: string
  from: TableStatusValue
  to: TableStatusValue | 'inactive'
  user: string
}

const LOG_ROWS: LogRow[] = [
  { id: '1', at: new Date(2026, 8, 30, 19, 42), table: 'Mesa 02', from: 'available', to: 'occupied', user: 'Laura M.' },
  { id: '2', at: new Date(2026, 8, 30, 19, 31), table: 'Mesa 08', from: 'available', to: 'reserved', user: 'Laura M.' },
  { id: '3', at: new Date(2026, 8, 30, 18, 48), table: 'Mesa 06', from: 'available', to: 'inactive', user: 'Andrés P.' },
]

function FieldsDemo() {
  const [category, setCategory] = useState<string>()
  const [capacity, setCapacity] = useState(4)
  const [opensAt, setOpensAt] = useState('12:00')
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Select label="Categoría" placeholder="Elige una categoría" icon={Tag} options={CATEGORIES} value={category} onValueChange={setCategory} />
      <Select label="Categoría" options={CATEGORIES} error="Elige la categoría del restaurante" />
      <NumberStepper
        label="Capacidad"
        value={capacity}
        onValueChange={setCapacity}
        decrementLabel="Quitar una persona"
        incrementLabel="Agregar una persona"
        helperText="De 1 a 20 personas"
      />
      <TimeSelect label="Apertura" value={opensAt} onValueChange={setOpensAt} />
      <NumberStepper label="Capacidad" value={4} onValueChange={() => undefined} disabled />
      <Select label="Categoría" options={CATEGORIES} defaultValue="italian" disabled />
    </div>
  )
}

function SwitchDemo() {
  const [open, setOpen] = useState(true)
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Switch label="Estado del restaurante" checked={open} onCheckedChange={setOpen} onLabel="Abierto" offLabel="Cerrado" />
      <Switch aria-label="Domingo" onLabel="Abierto" offLabel="Cerrado" />
      <Switch aria-label="Lunes" defaultChecked disabled onLabel="Abierto" offLabel="Cerrado" />
    </div>
  )
}

function SegmentedDemo() {
  const [value, setValue] = useState<TableStatusValue>('available')
  return (
    <div className="flex flex-col gap-3">
      <SegmentedControl aria-label="Estado de Mesa 04" options={STATUS_OPTIONS} value={value} onValueChange={setValue} />
      <div className="max-w-100">
        <SegmentedControl aria-label="Estado de Mesa 05" options={STATUS_OPTIONS} value="occupied" onValueChange={() => undefined} fullWidth />
      </div>
    </div>
  )
}

function FeedbackDemo() {
  const toast = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [capacity, setCapacity] = useState(4)

  return (
    <div className="flex flex-col gap-4">
      <Alert type="info" action={<Button size="sm" variant="secondary">Abrir ahora</Button>}>
        Tu restaurante está cerrado. Los comensales no lo ven en DiNNo.
      </Alert>
      <Alert type="error" action={<Button size="sm" variant="outline">Intentar de nuevo</Button>}>
        No pudimos cambiar el estado de Mesa 04. Revisa tu conexión e intenta de nuevo.
      </Alert>
      <Alert type="success" onClose={() => undefined}>
        Cambios guardados
      </Alert>
      <Alert type="warning" title="Revisa los 3 campos marcados" />
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => toast.show({ type: 'success', message: 'Cambios guardados' })}>
          Mostrar toast
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.show({
              type: 'success',
              message: 'Mesa 04 ahora está Ocupada',
              action: { label: 'Deshacer', onClick: () => toast.show({ message: 'Mesa 04 ahora está Disponible' }) },
            })
          }
        >
          Toast con Deshacer
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.show({ type: 'error', message: 'No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.' })}
        >
          Toast de error
        </Button>
        <Button variant="outline" icon={Plus} onClick={() => setDialogOpen(true)}>
          Abrir diálogo
        </Button>
        <Button variant="danger" icon={Ban} onClick={() => setConfirmOpen(true)}>
          Desactivar mesa
        </Button>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Agregar mesa"
        footer={
          <>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setDialogOpen(false)}>Agregar mesa</Button>
          </>
        }
      >
        <div className="flex flex-col gap-6">
          <TextField label="Identificador" placeholder="Ej.: 04" helperText="Así la verás: Mesa 04" />
          <NumberStepper
            label="Capacidad"
            value={capacity}
            onValueChange={setCapacity}
            decrementLabel="Quitar una persona"
            incrementLabel="Agregar una persona"
          />
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="¿Desactivar Mesa 04?"
        description="No aparecerá para los comensales. Puedes reactivarla cuando quieras."
        confirmLabel="Desactivar mesa"
        loadingText="Desactivando…"
        loading={confirming}
        onConfirm={() => {
          setConfirming(true)
          window.setTimeout(() => {
            setConfirming(false)
            setConfirmOpen(false)
          }, 1500)
        }}
      />
    </div>
  )
}

function TableCardsDemo() {
  const [selected, setSelected] = useState<string | null>('04')
  const menu = [
    { label: 'Editar', icon: Pencil, onSelect: () => undefined },
    { label: 'Desactivar', icon: Ban, onSelect: () => undefined, destructive: true },
  ]
  const toggle = (id: string) => setSelected((current) => (current === id ? null : id))
  return (
    <div className="grid grid-tables gap-3">
      <TableCard name="Mesa 01" capacity={4} status="available" selected={selected === '01'} onSelect={() => toggle('01')} menuItems={menu} />
      <TableCard name="Mesa 02" capacity={2} status="occupied" selected={selected === '02'} onSelect={() => toggle('02')} menuItems={menu} />
      <TableCard name="Mesa 03" capacity={4} status="reserved" selected={selected === '03'} onSelect={() => toggle('03')} menuItems={menu} />
      <TableCard name="Mesa 04" capacity={2} status="available" selected={selected === '04'} onSelect={() => toggle('04')} menuItems={menu} />
      <TableCard
        name="Mesa 06"
        capacity={1}
        status="inactive"
        onReactivate={() => undefined}
        menuItems={[
          { label: 'Editar', icon: Pencil, onSelect: () => undefined },
          { label: 'Reactivar', icon: RotateCcw, onSelect: () => undefined },
        ]}
      />
    </div>
  )
}

function FloatingBarDemo() {
  const [value, setValue] = useState<TableStatusValue>('available')
  return (
    <FloatingBar title="Mesa 04" description="2 personas">
      <SegmentedControl aria-label="Estado de Mesa 04 (ejemplo)" options={STATUS_OPTIONS} value={value} onValueChange={setValue} fullWidth className="md:w-fit" />
    </FloatingBar>
  )
}

export function KitDay2Sections() {
  const [hours, setHours] = useState(SAMPLE_HOURS)

  return (
    <>
      <KitSection title="PageHeader" note="El único primario de la página va en actions.">
        <PageHeader
          title="Mesas"
          description="Actualiza el estado de cada mesa en tiempo real"
          actions={<Button icon={Plus}>Agregar mesa</Button>}
        />
      </KitSection>

      <KitSection title="Select · NumberStepper · TimeSelect">
        <FieldsDemo />
      </KitSection>

      <KitSection title="Switch" note="La palabra va siempre al lado.">
        <SwitchDemo />
      </KitSection>

      <KitSection title="SegmentedControl" note="Flechas mueven el foco; Enter o Espacio aplican. Nunca naranja.">
        <SegmentedDemo />
      </KitSection>

      <KitSection title="HoursEditor" note="Valor controlado: { day, isOpen, isOpen24h, opensAt, closesAt }[] con horas HH:mm. El jueves está en Abierto 24 horas (primera opción de la apertura).">
        <div className="max-w-140">
          <HoursEditor value={hours} onChange={setHours} errors={{ sat: 'La hora de cierre no puede ser igual a la de apertura' }} />
        </div>
      </KitSection>

      <KitSection title="Alert · Toast · Dialog · ConfirmDialog">
        <FeedbackDemo />
      </KitSection>

      <KitSection title="DropdownMenu">
        <div>
          <DropdownMenu
            trigger={<IconButton icon={Ellipsis} label="Más acciones de Mesa 04" />}
            items={[
              { label: 'Editar', icon: Pencil, onSelect: () => undefined },
              { label: 'Desactivar', icon: Ban, onSelect: () => undefined, destructive: true },
            ]}
          />
        </div>
      </KitSection>

      <KitSection title="StatTile · TableCard" note="Seleccionada: borde naranja de 2 px sin cambiar de tamaño. Inactiva: punteada al 55 %.">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile value={3} label="libres" />
          <StatTile value={2} label="reservadas" />
          <StatTile value={2} label="ocupadas" />
          <StatTile value="09:42" label="próxima llegada" highlight />
        </div>
        <TableCardsDemo />
      </KitSection>

      <KitSection title="EmptyState · Skeleton">
        <div className="grid gap-6 md:grid-cols-2">
          <EmptyState
            title="Aún no tienes mesas"
            description="Agrega tus mesas para empezar a recibir comensales."
            action={<Button icon={Plus}>Agregar mesa</Button>}
          />
          <EmptyState
            variant="error"
            title="No pudimos cargar tus mesas"
            description="Revisa tu conexión e intenta de nuevo."
            action={<Button variant="outline">Intentar de nuevo</Button>}
          />
        </div>
        <div className="grid grid-tables gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex flex-col gap-3 rounded-tile border border-line bg-surface p-4 shadow-card">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-5 w-24" />
              <Skeleton radius="full" className="h-6 w-24" />
            </div>
          ))}
        </div>
      </KitSection>

      <KitSection
        title="FloatingBar"
        note="Va de último en la pantalla: queda fija abajo del contenido mientras haces scroll, sin tapar el sidebar ni la última fila. Los toasts suben para no taparla."
      >
        <FloatingBarDemo />
      </KitSection>

      <KitSection title="DataTable" note="En menos de 768 px se vuelve lista compacta.">
        <DataTable
          caption="Bitácora de ejemplo"
          rows={LOG_ROWS}
          getRowId={(row) => row.id}
          columns={[
            { key: 'at', header: 'Fecha y hora', cell: (row) => formatDateTime(row.at), className: 'tabular-nums whitespace-nowrap' },
            { key: 'table', header: 'Mesa', cell: (row) => <span className="font-bold">{row.table}</span> },
            {
              key: 'change',
              header: 'Cambio',
              cell: (row) => (
                <span className="inline-flex flex-wrap items-center gap-2">
                  <StatusChip status={row.from} />
                  <Icon icon={ArrowRight} size={16} className="text-fg-2" />
                  <StatusChip status={row.to} />
                </span>
              ),
            },
            { key: 'user', header: 'Usuario', cell: (row) => row.user },
          ]}
        />
        <DataTable caption="Cargando" rows={[]} getRowId={() => ''} loading columns={[{ key: 'a', header: 'Fecha y hora', cell: () => null }, { key: 'b', header: 'Mesa', cell: () => null }]} />
      </KitSection>
    </>
  )
}
