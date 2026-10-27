# Renovación v2.0 · 03 · Informe final (27 oct 2026)

> Cierre de la renovación de identidad de DiNNo: manual v2.0, dashboard web, app del comensal y plano de mesas. **Nada tiene commit todavía**; la guía de git está al final. Lo que no se pudo verificar está en "Pendientes", no en "Hecho".

## 1. Resumen

| Qué | Resultado |
|---|---|
| **Manual v2.0** ("Capas de servicio") | Fuente única de diseño. Conserva la paleta, el logo, Plus Jakarta Sans y "estado = color + forma + palabra"; agrega superficies de estado (tinte + borde), vidrio solo en la capa flotante, tokens de movimiento, componentes nuevos y el plano. Describe lo implementado; lo que falta está en su sección 19 como propuesta futura |
| **Web (dashboard del restaurante)** | Tokens v2.0, kit renovado, `/mesas` con selector de estado junto a la mesa y franja de resumen que filtra, `/restaurante`, `/bitacora` y el layout. El login **no se rediseñó**: solo se corrigió su contraste AA |
| **Móvil (app del comensal)** | Tokens v2.0, kit con presión animada y háptica, login con vidrio real, Explorar con encabezado flotante sobre el mapa y detalle con mapa estático |
| **Plano de mesas** (única funcionalidad nueva) | Vista Plano · Cuadrícula en `/mesas`, modo Servicio y modo Editar, persistido en el backend para todo el restaurante |

## 2. Cómo contribuyó cada skill

Regla para los choques: usabilidad real > identidad de DiNNo > consistencia > estética ([`decisiones.md`](decisiones.md), R1–R16 y P1–P9).

| Skill | Qué aportó (hecho) | Qué no se usó o quedó pendiente |
|---|---|---|
| **Impeccable** (plugin 4.7.1) | **Detector** (`impeccable detect`) sobre pantallas renderizadas, como compuerta de contraste y antipatrones: en la auditoría (F0), en el login (F3) y en esta validación (27 escaneos, 0 fallas de contraste). **Hook** que revisó cada archivo de UI editado. Rúbrica de `audit` en el diagnóstico | `critique` (exige subagentes, R8), el puntaje de `audit` sobre 20 al cierre y `polish` por fase. Sus avisos `cream-palette`, `overused-font` y `repeating-stripes-gradient` se ignoran a propósito (R2, R3, R10) |
| **ux-heuristics** | Severidades P0–P3 y heurísticas de Nielsen del diagnóstico (sección 1 de `01-diagnostico.md`): de ahí salen, por ejemplo, el selector junto a la mesa en vez de la barra fija, y "disponibles" en vez de "libres" | El nuevo puntaje de los flujos después de la renovación |
| **design-taste-frontend** (Taste v2) | La dirección del dashboard: "color en los datos, no en el chrome", métricas como tipografía (`StatStrip`) y "lo que solo tiene este producto" (el plano). Su librería CDP (`cdp.mjs`) sacó **todas las capturas** del antes y el después y corrió las auditorías de responsive, movimiento y píxeles | Sus reglas de casa prohíben vidrio, gradientes, crema con terracota y sidebar oscuro: chocan con la marca y se dejaron fuera (R1, R2, R4). El inspector `inspect --app` no se volvió a correr al cierre |
| **Emil Kowalski** (`animate`, `animate-expo`, `apple-design`, `emil-design-eng`, `find-animation-opportunities`, `improve-animations`, `mobile-native` y otras) | El marco de motion del manual (sección 11): curvas `--ease-enter`, `--ease-move` y `--ease-sheet`; menos de 300 ms; salidas más rápidas; presionar 0,97; reducir movimiento sin quedarse quieto (R6). En el móvil: Reanimated en el hilo de UI, resortes con la velocidad del gesto en la hoja inferior y el arrastre del plano con Pointer Events | `review-animations` por PR, `break-ui` con datos extremos en el plano y `prototype` de variantes del nodo. El plano sí se probó con 40 mesas e identificadores largos (`?mockMany`) |
| **ui-ux-pro-max** | Consultas puntuales: WCAG 2.5.7 (alternativa al arrastre: teclado y botones de mover en el plano), objetivos táctiles y responsive por stack | `--design-system` no se usó, porque propondría otra paleta (R9) |

## 3. Pantallas y componentes modificados

### Web (`frontend`)

| Zona | Cambios |
|---|---|
| **Estilos** | `tokens.css` (copia exacta del manual 16.3), `globals.css` (mapeo a Tailwind, vidrios, `press`, `plan-node`, `plan-drop`, keyframes y la regla de compatibilidad del login), `cn.ts` |
| **Kit nuevo** | `StatusLine`, `StatStrip`, `StatusPicker` (popover desde 768 y hoja en el teléfono), `DetailList`, `TableNode` |
| **Kit modificado** | `Button`, `IconButton`, `Card`, `StatTile`, `Dialog`, `DropdownMenu`, `Select`, `Toast`, `Switch`, `FloatingBar`, `EmptyState`, `DataTable` (dos líneas en el teléfono), `HoursEditor`, `StatusShape`, `status.ts`, `TableCard` (reescrita: la superficie es el estado, atajos D · R · O) |
| **Eliminado** | `TableStatusBar` (la barra fija de estado) |
| **Layout** | `Topbar` (vidrio de barra al hacer scroll, nombre real con skeleton), `AppShell`, `UserMenu`, `layouts.tsx` |
| **`/mesas`** | Plano · Cuadrícula, franja que filtra, selector junto a la mesa, invitación a armar el plano, anillo de cambio remoto. Plano en `features/tables/plan/` |
| **`/restaurante`** | `DetailList`, "Editar" en `outline` |
| **`/bitacora`** | Filas de dos líneas en el teléfono |
| **Login** | Solo AA: textos al 100% en vez de 60–70% de opacidad, en tres archivos de 7 líneas (`AuthLink`, `SignInForm`, `AccountRequestPanel`) |
| **Herramientas** | `check:ui` suma la regla `text-opacity`; `/sistema` es la página de muestra del manual (solo en desarrollo) |

### Móvil (`dinno-mobile`)

| Zona | Cambios |
|---|---|
| **Tema** | `tokens.ts` (copia del manual 16.5), `css-vars.ts`, `tailwind.config.js` |
| **Kit** | Nuevos: `GlassSurface`, `use-press-scale`, `lib/haptics`. Modificados: `Text`, `Button` (presión + háptica), `IconButton`, `FilterChip`, `Card`, `FloatingSurface`, `BottomSheet` (resorte con la velocidad del gesto), `use-presence` |
| **Sesión** | `AuthScreen` (marco de vidrio) y `AuthTabs` nuevos; login, crear cuenta, verificar correo, recuperar contraseña y conectando |
| **Explorar** | Mapa a pantalla completa con encabezado flotante; `ResultsMap` respeta el encabezado; `RestaurantCard` |
| **Detalle** | `RestaurantMapPreview` (mapa estático) y una sola fila de estado |

### Backend (`backend`)

El módulo de mesas (`restaurant-operations/tables`) recibió:
- `table-plan.ts`
- La entidad, los DTO, el servicio y el controlador
- La migración `1793084146913-AddTablePlan`
- Sus pruebas

## 4. Cómo se adaptó el login móvil

Se trasladaron los principios del login web, no su layout de escritorio (manual 13.9):

| En la web | En el celular |
|---|---|
| Tarjeta de vidrio sobre dos formas de marca | Las mismas formas (naranja arriba a la izquierda, petróleo abajo a la derecha) y una tarjeta de vidrio a lo ancho. Desenfoque real en Android 12+ (`BlurView` + `BlurTargetView`, que envuelve solo las formas); respaldo sólido al 92% en Android 11 o con "Reducir transparencia" |
| Pestañas con barra naranja que se desliza | La fila de pestañas arriba de la tarjeta: la barra se desliza en 300 ms **antes** de abrir la otra pantalla, con un toque háptico, y vuelve a su pestaña al regresar |
| Entrada con deslizamiento | La tarjeta sube al abrir; con reducir movimiento, solo aparece |
| Texto en tinta sobre el vidrio | Igual, para cumplir AA |
| Panel de marca con gradiente | No existe en el celular: el logo va dentro de la tarjeta |

**Rendimiento:** hay un solo desenfoque por pantalla, sobre un fondo quieto. El desenfoque nunca se anima: solo se anima la tarjeta, en el hilo de UI.

## 5. Plano de mesas

### Cómo funciona

- **Modo Servicio** (por defecto):
  - Cada mesa está en su lugar con número, capacidad y estado.
  - Tocarla abre su estado y sus datos reales; D, R u O la cambian con el teclado.
  - Las posiciones no se mueven.
  - Zoom con los botones Alejar, Ajustar y Acercar; el plano se desplaza dentro de su marco.
- **Modo Editar** (desde 768 px):
  - Arrastre con ajuste a la celda, con la celda de destino marcada (roja si no cabe, y la mesa vuelve).
  - Flechas (Shift: 4 celdas) y botones de mover como alternativa.
  - "Sin ubicar", "Ubicar automáticamente", forma (rectangular, cuadrada o redonda) y "Quitar del plano".
  - "Guardar plano" o "Cancelar", con aviso si hay cambios sin guardar al cancelar, al salir o al recargar.
- **Animaciones:**
  - La mesa se levanta al arrastrarla y se acomoda en su celda.
  - El cambio de estado es un fundido de color, y el anillo marca un cambio que llegó de otro dispositivo.
  - Con reducir movimiento solo queda el color.

### Persistencia

| Dato | Dónde |
|---|---|
| Celda y forma de cada mesa | En el backend: columnas `plan_x`, `plan_y` y `plan_shape` de `tables`. `PUT /v1/tables/plan` reemplaza el plano completo, valida que las mesas sean del restaurante y que ninguna se salga de la grilla ni quede encima de otra |
| Cambios en edición | Solo en memoria, hasta "Guardar plano" |
| Vista elegida (Plano · Cuadrícula) | `localStorage` de cada dispositivo: es una comodidad, no un dato del restaurante |

### Limitaciones

- **Gana el último que guarda.** Si dos personas editan a la vez, se avisa, pero los planos no se combinan.
- **Editar la capacidad no mueve la mesa.** Si queda encima de otra, se marca en rojo en el modo Editar y el plano no se guarda hasta moverla.
- **Un solo salón de 20 × 30 celdas.** Caben unas 35 mesas con la ubicación automática y hasta unas 90 a mano.
- **No hay** zonas, paredes ni zoom con pellizco.
- **El tiempo real llega al volver a la pestaña.** El socket del restaurante (D5) sigue pendiente.
- **La migración no está aplicada en Neon** (ver "Pendientes").

## 6. Manual y documentación

| Archivo | Qué es |
|---|---|
| [`../DiNNo_Manual_Identidad_v2_0.md`](../DiNNo_Manual_Identidad_v2_0.md) | **El manual v2.0.** Sección 19: propuestas futuras |
| [`../DiNNo_Manual_Identidad_v1_1.md`](../DiNNo_Manual_Identidad_v1_1.md) | El v1.1, marcado como histórico. Hay otra copia fuera de los repos, en la carpeta raíz del proyecto, también marcada |
| [`README.md`](README.md) | Estado por fase y cómo se toman las capturas |
| [`01-diagnostico.md`](01-diagnostico.md) | La auditoría inicial |
| [`decisiones.md`](decisiones.md) | D1–D12 (tuyas), R1–R16 y P1–P9 |
| [`02-registro.md`](02-registro.md) | Archivos y decisiones por fase |
| [`capturas-comparativa.md`](capturas-comparativa.md) | Antes y después, lado a lado |
| `capturas-v1/`, `capturas-v2/` | Las capturas (temporales, D12) |
| **`CLAUDE.md` (los tres repos)** | Las secciones 2 y 8 (iguales en los tres) apuntan al v2.0 y suman la decisión del plano. La sección 11 de la web y la del móvil siguen las reglas del v2.0 |
| `AVISOS.md` (los tres repos), `README.md` de la web, `README.md` del kit, `docs/database.md` del backend | Avisos al equipo, esquema y componentes |

## 7. Validaciones

### Pruebas ejecutadas (27 oct 2026, sobre el estado final)

| Repo | Lint | Tipos | Pruebas | Build / otros |
|---|---|---|---|---|
| Web | ✓ | ✓ | **341 de 341** (35 archivos) | Build ✓; `check:ui` ✓ |
| Móvil | ✓ | ✓ | **118 de 118** (18 suites) | — |
| Backend | ✓ | ✓ | **729 de 729** unitarias (53 archivos) y **292 de 292** e2e (18 archivos) | Build ✓ |
| Migración | — | — | En un PostgreSQL 17 local y desechable (Docker): corre sobre toda la cadena, los 4 checks rechazan lo inválido, la entidad coincide con la base (`migration:generate` sin cambios) y `revert` la deshace | — |

- **Web:** el bundle de JS pesa 801 kB (246 kB gzip). Vite avisa que pasa de 500 kB; el aviso ya existía antes de la renovación.
- **Backend:** dos e2e ajenas al plano fallaron una vez por carga en una corrida anterior y pasaron en todas las demás.

### Verificaciones manuales y medidas

| Qué | Cómo | Resultado |
|---|---|---|
| **Paleta intacta** | Colores hex de los tokens, `develop` contra el estado final | Web: los mismos 43, sin agregar ni quitar ninguno. Móvil: 16 hex nuevos, que son exactamente las mezclas de la paleta (tinte y borde de estado; React Native no tiene `color-mix`) |
| **Login web intacto** | Diferencia de píxeles entre el antes y el después, y diff del código | Cambió el 0,16% de los píxeles (0,16% en oscuro y 0,56% en el teléfono), todo dentro de la zona de los tres textos de la corrección AA. La tipografía v1.1 se conserva con la regla `.glass-login` |
| **Contraste AA** | Detector de Impeccable en 9 pantallas × 3 anchos, más cálculo WCAG de los pares clave | 0 fallas de contraste. Texto: 5,15:1 o más; tinta sobre tintes: 12,4:1; crema sobre tintes oscuros: 7,6:1. Bordes de selección y de error: 3,15:1 o más |
| **Reducir movimiento** | Navegador con `prefers-reduced-motion` y lectura de los valores calculados; emulador con las escalas de animación en 0 (F6) | Desplazamiento 0 y escala 1; el plano solo anima el color; drawer y hojas pasan a fundido; los bucles se detienen; el login anula sus transiciones. El móvil cambia de pantalla al instante |
| **Responsive** | 10 pantallas × 5 anchos (1440, 1024, 768, 390, 360): desbordamiento horizontal | 0 de 50 con desbordamiento. El marco del plano se desplaza dentro de sí a propósito |
| **Flujos existentes** | Pruebas (crear, editar, desactivar, reactivar, cambiar estado y deshacer, filtrar, bitácora, registro, sesión) y capturas revisadas a mano | Sin regresiones. El selector de estado, el toast con "Deshacer", la hoja del teléfono, `/restaurante` y `/bitacora` funcionan |
| **Vista de lista (cuadrícula)** | Pruebas de `TablesPage` y capturas | Conserva todo: orden natural, inactivas al final, filtro por la franja, menú ⋯ |
| **Móvil en el emulador** (F6, 26 oct, después del último cambio del código móvil) | Development build en un Pixel 9a con datos de ejemplo | Login, pestañas, Explorar en mapa y lista, detalle y cierre de sesión, en claro y oscuro |
| **Plano** (F4) | Arnés con arrastres sintéticos, teclado, 8 y 40 mesas, cuatro anchos, claro y oscuro | Funciona. En el camino se corrigieron el corte de "Disponible" en el teléfono y el naranja sobre vidrio |
| **Manual = implementación** | Revisión de las secciones 7, 8, 11, 12, 13, 15, 16 y 18 contra el código; los tokens, comparados texto contra texto | 39 correcciones. Tokens idénticos. 16.4 muestra el `globals.css` real. Lo no implementado quedó en la sección 19 |

### Pendientes (no verificado o no hecho)

- **Migración en Neon y despliegue del backend.** Necesitan la revisión de Elizabeth y tu confirmación. El plano **no se probó contra el backend real**: solo con el mock, las pruebas y la base local.
- **Sesión real de Firebase:** el arnés simula la sesión y el móvil usó datos de ejemplo. Los flujos con cuentas reales no se repitieron en esta validación.
- **iOS:** no hay Xcode. El vidrio y la háptica en iPhone están sin probar.
- **Expo Go:** la app no corre ahí desde antes de esta renovación (Google Sign-In); se usa development build.
- **Dispositivos reales:**
  - El arrastre se probó con eventos sintéticos y jsdom, no con el dedo en una tablet.
  - El rendimiento del vidrio en gama media se razonó y se probó en el emulador, no en un teléfono físico.
- **Lectores de pantalla:** hay nombres accesibles y pruebas por rol, pero no una sesión con VoiceOver o TalkBack.
- **Skills no ejecutadas al cierre:**
  - Nuevo puntaje de `ux-heuristics`.
  - `review-animations`, `break-ui` y el puntaje de `audit` de Impeccable.
  - `inspect --app` de Taste.
- **Propuestas futuras del manual** (sección 19): `LiveIndicator` y socket del restaurante (D5), View Transitions entre vistas, grupo "Inactivas", ⋯ de 44 px en táctil, entre otras.
- **Deuda:**
  - División del bundle.
  - Comentarios de código que todavía citan secciones del v1.1.
  - La página `/sistema` (desarrollo) sigue, porque muestra propuestas futuras.

## 8. Dependencias añadidas

| Repo | Dependencia | Motivo |
|---|---|---|
| Móvil | `expo-blur ~57.0.3` | Desenfoque real del vidrio del login (Android 12+ con `BlurTargetView`, iOS). Aprobada |
| Móvil | `expo-haptics ~57.0.3` | Toque háptico en el botón principal y en las pestañas del login. Aprobada |
| Web | Ninguna | El arrastre del plano usa Pointer Events nativos, sin `@dnd-kit` (D6) |
| Backend | Ninguna | Se corrió `npm ci` porque faltaban dependencias ya fijadas en `develop` |

Las dos del móvil obligan a recompilar: `npx expo prebuild --clean` y luego `npx expo run:android` (está en `AVISOS.md`).

## 9. Archivos y repos afectados

| Repo | Rama local | Cambios sin commit |
|---|---|---|
| `frontend` | `refactor/sprint2-dashboard-v2` (desde `develop`) | 60 modificados, 1 eliminado y 85 nuevos. Los nuevos son 60 capturas y 25 archivos más: el manual, la carpeta `docs/renovacion-v2/`, el kit nuevo, `features/tables/plan/` y `src/dev/sistema/` |
| `backend` | `feat/sprint2-plano-mesas` (desde `develop`) | 11 modificados y 7 nuevos |
| `dinno-mobile` | `refactor/sprint2-app-v2` (desde `develop`) | 28 modificados y 5 nuevos |

Las tres ramas están al día con `origin/develop` (revisado el 27 oct) y no existen en el remoto. La lista de cada archivo está en [`02-registro.md`](02-registro.md), fase por fase.
