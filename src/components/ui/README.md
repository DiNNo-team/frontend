# Kit de componentes DiNNo (`@/components/ui`)

> **Si te falta un componente, pídeselo a Sebastián o propónlo en un PR al kit. No lo resuelvas dentro de tu pantalla.**

Las pantallas se arman **solo** con estas piezas. Ninguna feature crea botones, campos, tarjetas, chips, colores, sombras ni estilos propios. Todo sale de los tokens del manual de identidad v1.1 (`docs/DiNNo_Manual_Identidad_v1_1.md`, secciones 9 a 15).

- **Importa siempre desde el índice:** `import { Button, TextField } from '@/components/ui'`.
- **Referencia visual:** `npm run dev` y abre http://localhost:5173/kit. Ahí está cada componente con todos sus estados, en claro y oscuro (solo en desarrollo).
- **Íconos:** `Icon` de `@/lib/icon` con íconos de `lucide-react` (16 / 20 / 24). Los componentes que reciben `icon` esperan el componente de Lucide, no el elemento: `icon={Plus}`.
- **Modo oscuro:** los componentes no necesitan `dark:`; los tokens cambian solos con `data-theme="dark"`.
- **Antes del PR:** `npm run check:ui` tiene que decir "sin problemas".

---

## Button

Botón de texto. **Un solo `primary` por pantalla.** Texto = verbo + objeto ("Agregar mesa", nunca "OK" ni "Enviar").

| Prop | Tipo | Por defecto | Notas |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | `danger` nunca va relleno; úsalo dentro de un diálogo de confirmación |
| `size` | `'md' \| 'sm'` | `'md'` | `md` 48 · `sm` 40 (tablas y barras de escritorio) |
| `loading` | `boolean` | `false` | Spinner + `loadingText`, mismo ancho, `aria-busy`, no se puede volver a pulsar |
| `loadingText` | `string` | el texto normal | Gerundio con "…": "Guardando…" |
| `icon` | `LucideIcon` | — | A la izquierda, 20 px |
| `fullWidth` | `boolean` | `false` | |
| …nativas | `button` | `type="button"` | Para formularios pasa `type="submit"` |

```tsx
<Button icon={Plus} onClick={openCreate}>Agregar mesa</Button>
<Button type="submit" loading={saving} loadingText="Guardando…">Guardar cambios</Button>
<Button variant="outline" onClick={close}>Cancelar</Button>
```

Cuándo usar cada variante: `secondary` para acciones importantes pero no principales ("Abrir ahora"); `outline` para alternativas ("Cancelar", "Editar"); `ghost` para terciarias ("Copiar a todos los días"); `danger` para destructivas ("Desactivar mesa").

## IconButton

Botón de solo ícono (⋯, cerrar, ver contraseña). `label` es **obligatorio**: va al `aria-label` y al tooltip.

| Prop | Tipo | Por defecto |
|---|---|---|
| `icon` | `LucideIcon` | — |
| `label` | `string` | — (obligatorio) |
| `size` | `'sm' \| 'md'` | `'md'` (44 × 44, táctil) · `sm` 40 × 40 |
| `tooltipSide` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` |

```tsx
<IconButton icon={Ellipsis} label="Más acciones de Mesa 04" />
```

## Spinner

`LoaderCircle` girando, 16 o 20. Solo dentro de botones o áreas pequeñas; **nunca a pantalla completa** (para cargar contenido usa `Skeleton`). Si va solo, pásale `label="Cargando"`.

## TextField

Campo de texto con label arriba, ayuda o error abajo. El `ref` y las props nativas van al `<input>`, así que funciona con `register` de react-hook-form.

| Prop | Tipo | Notas |
|---|---|---|
| `label` | `ReactNode` | Siempre visible. Nunca uses el placeholder como label |
| `optional` | `boolean` | Agrega " (opcional)". **Nunca asteriscos** |
| `helperText` | `ReactNode` | Ayuda debajo |
| `error` | `string` | Reemplaza la ayuda, pone `aria-invalid` y lo enlaza con `aria-describedby`. Dice qué hacer: "Escribe el nombre del restaurante", no "Campo requerido" |
| `icon` | `LucideIcon` | A la izquierda, 20 px |
| `type="password"` | | Agrega el botón Mostrar / Ocultar contraseña |
| `className` | `string` | Solo para layout del bloque (p. ej. ocupar dos columnas) |

```tsx
<TextField
  label="Identificador"
  placeholder="Ej.: 04"
  helperText={`Así la verás: ${formatTableName(value)}`}
  error={errors.identifier}
  {...register('identifier')}
/>
```

Valida al salir del campo y al enviar, **nunca en cada tecla** (manual 10).

## Card

Tarjeta de contenido: radio 20, borde, sombra soft, padding 24 (16 en móvil). **Nunca pongas otra `Card` dentro de una `Card`.**

| Prop | Tipo | Por defecto |
|---|---|---|
| `title` | `ReactNode` | — (se ve como Título 3) |
| `titleAs` | `'h2' \| 'h3'` | `'h2'` |
| `as` | `'div' \| 'section' \| 'article' \| 'aside'` | `'div'` |

```tsx
<Card title="Tu restaurante" as="section">…</Card>
```

## StatusChip y StatusShape

Estado = **color + forma + palabra**, siempre los tres. La palabra es texto real (la lee el lector de pantalla); la forma es decorativa.

| `status` | Palabra | Color | Forma |
|---|---|---|---|
| `available` | Disponible | `ok` | punto |
| `reserved` | Reservada | `reserved` | cuadrado |
| `occupied` | Ocupada | `busy` | cuadrado rayado |
| `inactive` | Inactiva | `inactive` | raya |
| `limited` | Pocas mesas | `limited` | rombo (solo disponibilidad para el comensal, **no** es estado de mesa) |
| `open` | Abierto | `ok` | punto con pulso (Active Dot) |
| `closed` | Cerrado | `inactive` | raya |
| `error` | Error | `error` | punto + ícono de alerta |

```tsx
<StatusChip status="occupied" />
<StatusChip status="error" label="Error · intenta de nuevo" />
<StatusShape shape={STATUS_META.reserved.shape} className="text-reserved" />
```

`STATUS_META` (en `status.ts`) es **la única fuente** de nombres, colores y formas de estado del front. La bitácora, las tarjetas de mesa y el control segmentado lo leen de ahí. Los estados **nunca** son naranja.

## Logo

Archivos de `src/assets/brand/`. **Nunca** recrees el logo con texto, emoji o íconos.

| Prop | Tipo | Por defecto |
|---|---|---|
| `variant` | `'onLight' \| 'onDark' \| 'auto'` | `'auto'` (sigue el tema) |
| `symbolOnly` | `boolean` | `false` |

```tsx
<Logo variant="onDark" className="w-24" />
```

---

## Utilidades compartidas (`@/lib`)

| Archivo | Qué hace |
|---|---|
| `cn.ts` | `cn(...)` = `clsx` + `tailwind-merge` configurado con las clases del manual (`text-h1`, `text-btn`…) |
| `icon.tsx` | `<Icon icon={Plus} size={16 \| 20 \| 24} />` con trazo 1.75. Importa `Map` como `MapIcon` |
| `format.ts` | `formatTime12h('19:30')` → "7:30 p. m." · `formatDate` → "30 sept 2026" · `formatDateTime` → "30 sept · 7:30 p. m." · `formatCapacity(4)` → "4 personas" · `formatTableName('4')` → "Mesa 04" · `normalizeTableIdentifier` |
| `theme.tsx` / `theme-context.ts` | `ThemeProvider` y `useTheme()` → `{ theme, setTheme, toggleTheme }`. Claro por defecto |

## Select

Lista desplegable con la misma carcasa que `TextField` (label, ayuda, error, "(opcional)"). Basado en Radix Select.

| Prop | Tipo | Notas |
|---|---|---|
| `options` | `{ value: string; label: string }[]` | |
| `value` / `defaultValue` / `onValueChange` | `string` | Controlado o no controlado |
| `placeholder` | `string` | Ejemplo mientras no hay valor |
| `label`, `optional`, `helperText`, `error`, `disabled`, `icon` | | Igual que `TextField` |
| `hideLabel` | `boolean` | Label solo para lector de pantalla (filas donde el contexto ya lo nombra) |

```tsx
<Select label="Categoría" placeholder="Elige una categoría" options={CATEGORIES} value={category} onValueChange={setCategory} error={errors.category} />
<Select label="Mesa" options={[{ value: 'all', label: 'Todas las mesas' }, ...tables]} value={filter} onValueChange={setFilter} />
```

## TimeSelect

`Select` de horas cada 30 min (00:00 … 23:30). **El valor es `"HH:mm"` en 24 h**; se muestra en 12 h ("7:30 p. m."). Mismas props que `Select` menos `options` e `icon`.

## NumberStepper

Número con − / + (capacidad). Se puede escribir; se valida y ajusta al rango al salir del campo. Teclado: ↑ ↓ Inicio Fin.

| Prop | Tipo | Por defecto |
|---|---|---|
| `value` / `onValueChange` | `number` | — (controlado) |
| `min` / `max` | `number` | `1` / `20` |
| `decrementLabel` / `incrementLabel` | `string` | "Disminuir" / "Aumentar" |
| `label`, `helperText`, `error`, `disabled` | | |

```tsx
<NumberStepper label="Capacidad" value={capacity} onValueChange={setCapacity} decrementLabel="Quitar una persona" incrementLabel="Agregar una persona" />
```

## Switch

Interruptor con **la palabra siempre al lado**. Encendido verde (`ok`), apagado gris.

| Prop | Tipo | Notas |
|---|---|---|
| `checked` / `defaultChecked` / `onCheckedChange` | `boolean` | |
| `onLabel` / `offLabel` | `string` | "Abierto" / "Cerrado" |
| `label` | `ReactNode` | Nombre visible antes del switch ("Estado del restaurante") |
| `aria-label` | `string` | Nombre si no hay `label` visible (p. ej. "Lunes") |

```tsx
<Switch label="Estado del restaurante" checked={isOpen} onCheckedChange={setOpen} onLabel="Abierto" offLabel="Cerrado" />
```

## HoursEditor

Horario semanal: 7 filas (Lun–Dom) con switch Abierto/Cerrado y apertura – cierre. Muestra "Cerrado todo el día", "(día siguiente)" y el botón "Copiar a todos los días" (copia el lunes). Se adapta al ancho de su contenedor.

**"Abierto 24 horas"** es la primera opción del selector de apertura: al elegirla, `isOpen24h` pasa a `true` y desaparece el cierre; al elegir una hora vuelve a `false`, con las horas anteriores. En el backend corresponde a `restaurant_schedules.is_open_24h`.

```ts
type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
type DayHours = { day: DayOfWeek; isOpen: boolean; isOpen24h: boolean; opensAt: string; closesAt: string } // 'HH:mm'
type WeeklyHours = DayHours[]
```

```tsx
<HoursEditor value={hours} onChange={setHours} errors={{ sat: 'Elige la hora de cierre del sábado' }} />
```

`errors` muestra un mensaje por fila, con el estilo de error de los campos. También se exportan `DAYS_OF_WEEK`, `DAY_LABELS`, `closesNextDay` y `copyMondayToAll`.

## SegmentedControl

Control segmentado para estados (**nunca naranja**). Las flechas mueven el foco; **Enter o Espacio aplican** (cada cambio puede llamar al backend). Pulsar el segmento activo no lo deselecciona.

| Prop | Tipo |
|---|---|
| `options` | `{ value; label; status? }[]` (`status` pinta la forma del estado) |
| `value` / `onValueChange` | |
| `aria-label` | `string` (obligatorio: "Estado de Mesa 04") |
| `fullWidth` | `boolean` |

## Alert

Aviso en línea. `type`: `success | info | warning | error`. Fondo del color al 12 %, sin sombra. `role="alert"` en error y `role="status"` en el resto. **Un error nunca desaparece solo.**

```tsx
<Alert type="info" action={<Button size="sm" variant="secondary">Abrir ahora</Button>}>
  Tu restaurante está cerrado. Los comensales no lo ven en DiNNo.
</Alert>
<Alert type="error" title="Revisa los 3 campos marcados" />
```

Props: `title?`, `children`, `action?` (un `Button size="sm"`), `onClose?`.

## Toast (`useToast`)

Aviso temporal, **uno a la vez** (el nuevo reemplaza al anterior). 4 s; 6 s si trae acción. Se pausa con hover o foco. El `ToastProvider` ya está en `app/providers.tsx`.

```tsx
const toast = useToast()
toast.show({ type: 'success', message: 'Cambios guardados' })
toast.show({ message: 'Restaurante cerrado. Los comensales ya no lo ven', action: { label: 'Deshacer', onClick: undo } })
toast.show({ type: 'error', message: 'No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.' })
```

## Dialog y ConfirmDialog

`Dialog`: modal sólido. Se puede abrir desde un ítem del menú ⋯: al cerrar, el foco vuelve al botón ⋯ que abrió el menú. `title` (Título 3), `description`, contenido, `footer` con las acciones (**el primario va de último**: queda a la derecha en escritorio y arriba en móvil). `size`: `sm` 480 | `md` 560. `preventClose` mientras guarda (Esc y clic afuera no cierran). El foco queda atrapado y vuelve al botón que lo abrió.

Si las acciones viven dentro de tu propio `<form>` (para que Enter envíe), no uses `footer`: pon `<DialogFooter>` al final del formulario.

```tsx
<Dialog open={open} onOpenChange={setOpen} title="Agregar mesa" preventClose={saving}>
  <form onSubmit={submit} className="flex flex-col gap-6">
    …campos…
    <DialogFooter>
      <Button variant="outline" onClick={close}>Cancelar</Button>
      <Button type="submit" loading={saving} loadingText="Agregando…">Agregar mesa</Button>
    </DialogFooter>
  </form>
</Dialog>
```

`ConfirmDialog`: atajo para confirmar acciones destructivas o que afectan a comensales.

```tsx
<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="¿Cerrar el restaurante?"
  description="…consecuencia…"
  confirmLabel="Cerrar restaurante"
  loadingText="Cerrando…"
  confirmVariant="danger"
  loading={saving}
  error={errorText}
  onConfirm={close}
/>
```

## DropdownMenu

Menú de acciones (⋯). Recibe el disparador y una lista de ítems; los `destructive` van en rojo y separados por una línea.

```tsx
<DropdownMenu
  trigger={<IconButton icon={Ellipsis} label="Más acciones de Mesa 04" />}
  items={[
    { label: 'Editar', icon: Pencil, onSelect: edit },
    { label: 'Desactivar', icon: Ban, onSelect: deactivate, destructive: true },
  ]}
/>
```

## EmptyState

Símbolo DiNNo en contorno + título + texto + un botón opcional. `variant="error"` para errores de carga (mismo layout, se anuncia).

```tsx
<EmptyState title="Aún no hay cambios" description="Aquí verás cada cambio de estado de tus mesas." />
```

## Skeleton y useDelayedFlag

Bloques con la forma del contenido real. Úsalos con `useDelayedFlag(isLoading)` (`@/lib/use-delayed-flag`): si la carga dura menos de 300 ms no se muestra nada.

```tsx
const showSkeleton = useDelayedFlag(query.isPending)
{showSkeleton && <Skeleton radius="tile" className="h-24" />}
```

## StatTile

Métrica: cifra `text-h1 tabular-nums` + etiqueta. `highlight` pone la cifra en naranja (solo "lo próximo").

## TableCard

Tarjeta de mesa (pieza visual; la lógica va en `features/tables`). Props: `name` ("Mesa 04"), `capacity`, `status` (`available | reserved | occupied | inactive`), `selected`, `onSelect`, `toggleId` (id del botón de selección, para devolverle el foco), `menuItems`, `menuTriggerId` (id del botón ⋯), `onReactivate`, `reactivating`.

## FloatingBar

Barra flotante abajo del contenido (barra de estado de la mesa seleccionada). **Va de último en la pantalla**: se queda visible al hacer scroll, no tapa el sidebar y ocupa su propio espacio, así que nunca esconde la última fila. Mientras está visible, los toasts suben para no taparla. En móvil los controles bajan debajo del título.

```tsx
<FloatingBar title="Mesa 04" description="2 personas">
  <SegmentedControl aria-label="Estado de Mesa 04" options={options} value={status} onValueChange={change} fullWidth className="md:w-fit" />
</FloatingBar>
```

## DataTable

Tabla genérica (bitácora). En < 768 px se vuelve una lista compacta (label + valor).

```tsx
<DataTable
  caption="Bitácora de cambios de mesas"
  rows={entries}
  getRowId={(entry) => entry.id}
  loading={showSkeleton}
  emptyState={<EmptyState title="Aún no hay cambios" description="Aquí verás cada cambio de estado de tus mesas." />}
  columns={[
    { key: 'at', header: 'Fecha y hora', cell: (e) => formatDateTime(e.createdAt), className: 'tabular-nums whitespace-nowrap' },
    { key: 'table', header: 'Mesa', cell: (e) => formatTableName(e.tableIdentifier) },
    { key: 'change', header: 'Cambio', cell: (e) => <>…StatusChip → StatusChip…</> },
    { key: 'user', header: 'Usuario', cell: (e) => e.userName },
  ]}
/>
```

## PageHeader

`<h1>` de la página + descripción + `actions` a la derecha (aquí va el único primario). En móvil las acciones bajan.

```tsx
<PageHeader title="Bitácora" description="Cambios de estado de tus mesas" />
```

---

## Layout (`@/components/layout`)

- **`AppShell`**: sidebar (≥ 1024) o drawer (< 1024), topbar y contenido de 1200 máx. Ya está montado en el router para `/mesas`, `/restaurante` y `/bitacora`: **tu pantalla solo renderiza su contenido** (empieza con `PageHeader`). Props: `restaurantName`, `userEmail`, `onSignOut`, `statusSlot` (switch de Sergio en el topbar), `banner` (aviso de cerrado arriba del contenido).
- **`OnboardingShell`**: topbar solo con el logo y contenido centrado de 560 máx. Ya envuelve `/onboarding`.
- Los datos de sesión de ejemplo ("Casa 72" · "admin@casa72.co") están en un solo lugar: `src/app/layouts.tsx`.
