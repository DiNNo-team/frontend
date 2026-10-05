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

`LoaderCircle` girando, 16 o 20. Solo dentro de botones o áreas pequeñas; **nunca a pantalla completa** (para cargar contenido usa `Skeleton`, llega en el Día 2). Si va solo, pásale `label="Cargando"`.

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

## Próximos componentes (Día 2)

`Select`, `NumberStepper`, `TimeSelect`, `HoursEditor`, `Switch`, `SegmentedControl`, `Alert`, `Toast`, `Dialog`, `ConfirmDialog`, `DropdownMenu`, `EmptyState`, `Skeleton`, `StatTile`, `TableCard`, `DataTable`, `PageHeader` y el `AppShell`.
