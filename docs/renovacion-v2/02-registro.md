# Renovación v2.0 · 02 · Registro de implementación

> Lo más nuevo va arriba. Cada fase lista los archivos que tocó, las decisiones nuevas y lo que quedó pendiente.

## F8 · v2.1 "Salón de vidrio" (27 oct 2026)

**Pedido de Sebastián:**
- El sidebar se "desacomodaba" con un plano muy largo.
- El dashboard seguía viéndose plano.
- Quería degradados, un sidebar creativo y el estilo del "Glassy Dashboard V2", con permiso para pasar por encima del manual y del kit.

**Rama:** `feat/sprint2-dashboard-creativo` en `frontend`, desde `develop` (que ya tiene F2–F4). Sin commit.

**Verificado:**
- Lint, tipos, `check:ui`, build y 341 pruebas en verde.
- Detector de Impeccable en 8 pantallas × 2 anchos: 0 fallas de contraste, después de corregir las palabras del riel.
- Responsive: 0 de 50 con desbordamiento.
- Reducir movimiento y reducir transparencia probados en el navegador.
- Login: 0% de píxeles cambiados frente a lo publicado.
- Capturas en [`capturas-v2-1/`](capturas-v2-1/).

### El sidebar cortado

- Con el navegador desplazado, el sidebar se veía completo: era `fixed` con la altura de la ventana.
- El corte aparecía en las capturas de página completa, que no repiten lo fijo.
- **Ahora:** el riel es una cápsula *sticky* sin la altura de la ventana, y la luz cubre la página. Probado con 40 mesas en una captura de página completa.

### Qué cambió

| Archivo | Cambio |
|---|---|
| `styles/tokens.css` | Bloque v2.1: luz (`--amb-*`), vidrios (`--glass-sheet/card/pill/rail-bg`), brillos, sombras, `--grad-highlight`, `--text-2-sheet`, `--plan-canvas` traslúcido. Ningún color nuevo: mezclas de la paleta y paradas de `--grad-petrol` |
| `styles/globals.css` | `app-ambient`, `amb-open`, `amb-closed`, `glass-sheet`, `glass-card`, `glass-pill`, `glass-rail`, `bg-highlight`, `lift`, `rounded-sheet-lg`, `min-h-shell`, `text-hero`; `--text-2` sobre la hoja; `grid-tables` con dos columnas en el teléfono; `plan-canvas` solo como trama |
| `components/layout/` | Nuevos `AmbientGround` y `NavRail`. Reescritos `AppShell`, `Topbar` (píldora con la cuenta), `UserMenu` (avatar con menú), `Sidebar` (cajón petróleo) y `OnboardingShell` |
| `components/ui/` | Nuevo `FloatingDock`. `StatStrip` (tarjetas con una destacada y `caption`), `PageHeader` (`variant="hero"`, línea en tinta), `Card` (`glass-card`), `TableCard` (`lift`), `FloatingBar` (`glass-pill`), `DropdownMenu` (`header`), `index.ts`, `README.md` |
| `app/layouts.tsx`, `features/restaurant-status/hooks.ts` | La luz sigue al estado (`lit`); la consulta acepta `enabled` |
| `features/tables/` | Saludo con datos reales, dock con Plano · Cuadrícula y "Agregar mesa", "disponibles" destacada; líneas de ayuda del plano en tinta, paneles en vidrio, el lienzo llena su marco. Pruebas ajustadas al resumen nuevo y al saludo |
| `CLAUDE.md` (sección 11), manual (7, 8, 12, 13, 16, 18, 20) | La regla de diseño y las fichas siguen a v2.1 |

### Segunda ronda (27 oct, sobre la revisión de Sebastián)

| Pedido | Qué se hizo |
|---|---|
| El sidebar, abajo como el dock de macOS, con el mismo estilo | `NavDock` reemplaza al riel y al cajón en todos los tamaños: centrado abajo, con separadores, ícono + palabra y el ícono que se asoma al pasar el puntero. Se borraron `NavRail`, `Sidebar` y `FloatingDock` |
| Decidir dónde van las notificaciones | Los toasts pasan arriba al centro, bajo la barra: en escritorio caen entre el saludo y las acciones, sin tapar "Agregar mesa"; la barra de edición del plano se acomoda encima del dock. Se quitó `ToastLayoutContext` |
| Plano · Cuadrícula dentro del dashboard | A la derecha del saludo, con "Agregar mesa" (`primary`) |
| El dashboard centrado | La barra y la hoja van en una columna centrada de 1280 |
| El sidebar no cambiaba con el tema | El dock usa `--dock-*`: vidrio claro con la activa en petróleo en claro, petróleo con la activa en crema en oscuro |
| Las tarjetas del resumen | Las cuatro iguales, sin "de 7 mesas activas", con la palabra en mayúscula ("Disponibles") |
| El nombre del restaurante en la barra | Estaba vacío porque con `VITE_USE_MOCKS=true` las mesas usan datos de ejemplo pero `/restaurants/me` no tenía mock y fallaba. Se agregó `features/restaurant/api.mock.ts` (GET y PATCH, solo en ese modo y cargado bajo demanda). El nombre ahora se ve en todos los tamaños |

**Verificado:** lint, tipos, `check:ui`, build y 341 pruebas; responsive 0 de 50; detector sin fallas de contraste (claro, oscuro, teléfono).

### Decisiones nuevas

Están en `decisiones.md` como V1–V8.

### Limitaciones

- La hoja desenfoca un área grande. Es una sola capa sobre un fondo estático, pero en equipos muy débiles el desplazamiento puede costar más que en v2.0. El respaldo de "Reducir transparencia" la deja sólida.
- El saludo usa la hora del dispositivo y se fija al abrir la pantalla.
- La app móvil no cambió: este pedido fue para el dashboard.

## F4 · Plano de mesas (27 oct 2026)

**Ramas, sin commit:**
- `backend`: `feat/sprint2-plano-mesas`, desde `develop` actualizado.
- `frontend`: sobre los cambios de F2–F3, también sin commit, en `refactor/sprint2-dashboard-v2`. Al autorizar los commits conviene separarlos en `feat/sprint2-plano-mesas`.

**Verificado:**
- **Backend:** lint, typecheck y build en verde; 729 pruebas unitarias y 292 e2e.
  - Dos e2e de geocodificación y edición del restaurante fallaron una vez por carga y pasaron en tres corridas seguidas; no tocan el plano.
- **Migración, en un PostgreSQL 17 local y desechable** (Docker, nunca Neon ni el `.env`):
  - Corre sobre toda la cadena de migraciones.
  - Los 4 checks rechazan lo inválido.
  - `migration:generate` no encuentra diferencias entre la entidad y la base.
  - `migration:revert` deja `tables` como estaba.
- **Web:** lint, `check:ui`, build y 341 pruebas en verde (14 nuevas del plano y 8 de la geometría).
- **Capturas en el arnés:** 1440, 1024, 768 y 390, en claro y en oscuro; con 8 y con 40 mesas.

### Qué se persiste y dónde

| Dato | Dónde | Quién lo ve |
|---|---|---|
| Celda (`plan_x`, `plan_y`) y forma (`plan_shape`) de cada mesa | Columnas nuevas de `tables` en el backend (migración `1793084146913-AddTablePlan`) | Todos los usuarios y dispositivos del restaurante; sobrevive a una recarga |
| Cambios mientras se edita | Solo en memoria (`use-plan-editor.ts`), hasta "Guardar plano" | Nadie más; "Cancelar" o salir los descarta |
| Vista elegida (Plano · Cuadrícula) | `localStorage` (`dinno:mesas:vista`) | Solo ese dispositivo: es una comodidad, no un dato del restaurante |

### Backend

| Archivo | Cambio |
|---|---|
| `tables/table-plan.ts` (nuevo) | La grilla (20 × 30), las formas y el tamaño de cada mesa (`tableFootprint`); `findPlanProblem` (fuera de la grilla o encima de otra) |
| `tables/table.entity.ts` | `planX`, `planY` y `planShape` (nullable) y sus 4 checks |
| `migrations/1793084146913-AddTablePlan.ts` (nueva) | Escrita a mano: 3 columnas NULL y `CHK_tables_plan_pair` / `_x` / `_y` / `_shape` |
| `tables/dto/save-table-plan.dto.ts` (nuevo) | `{ tables: [{ id, x, y, shape? }] }`, máximo 100, mensajes en español |
| `tables/dto/table-response.dto.ts` | Agrega `planX`, `planY` y `planShape` a todas las respuestas de `/v1/tables` (aditivo) |
| `tables/tables.service.ts` | `savePlan`: transacción con bloqueo de las mesas del restaurante, `404` si una mesa no es suya, `400` si hay repetidas, superpuestas o fuera de la grilla; reemplaza el plano completo y solo escribe las columnas del plano de las mesas que cambiaron. Sin bitácora ni evento |
| `tables/tables.controller.ts` | `PUT /v1/tables/plan` documentado en Swagger |
| Pruebas | `table-plan.spec.ts`, `tables.service.plan.spec.ts`, `AddTablePlan.spec.ts` y `test/tables-plan.e2e-spec.ts`. Las expectativas de forma de `tables.e2e` y `tables-edit.e2e` suman los 3 campos |
| `docs/database.md`, `AVISOS.md` | Columnas, regla de tamaño, y el orden obligatorio: migración en Neon antes del merge |

### Web

| Archivo | Cambio |
|---|---|
| `features/tables/types.ts`, `api.ts`, `hooks.ts` | Campos del plano, `savePlan` (`PUT /tables/plan`) y `useSaveTablePlan`. `api.ts` lee los campos que falten como `null`, así que la web funciona antes y después del backend |
| `features/tables/api.mock.ts` | Mismas reglas que el backend; las mesas empiezan sin ubicar. `?mockPlan` trae un plano armado y `?mockPlan&mockMany` trae 40 mesas |
| `features/tables/plan/plan-geometry.ts` (+ prueba) | La misma tabla de tamaños que el backend, `fitsAt`, conflictos, primer lugar libre y filas |
| `features/tables/plan/use-plan-editor.ts` | Borrador del modo edición sobre las mesas en vivo; "dirty"; detecta si otro dispositivo guardó mientras tanto |
| `features/tables/plan/FloorPlan.tsx` | Lienzo y nodos. Arrastre con Pointer Events y ajuste a la celda (el arrastre vivo va en una ref, para no perder movimientos rápidos), flechas, celda de destino, vuelta a su lugar, D · R · O en servicio |
| `features/tables/plan/TablesPlanView.tsx` | Barra (modo, zoom, "Editar plano"), marco con desplazamiento, estado vacío, "Sin ubicar", "Mesa seleccionada", `FloatingBar`, guardado, aviso de cambios sin guardar (`useBlocker` + `beforeunload`) |
| `features/tables/use-remote-highlights.ts` | Anillo de "cambio desde otro dispositivo": solo para estados que llegan en una recarga de la lista, nunca para los de este dispositivo (TanStack Query marca `setQueryData` como `manual`) |
| `features/tables/TablesPage.tsx` | `SegmentedControl` Plano · Cuadrícula, la invitación "Arma el plano de tu restaurante.", la región `role="status"` y el anillo también en la cuadrícula |
| `components/TablesStats.tsx`, `components/TablesGrid.tsx` | Filtro opcional (en el plano solo resume) y `highlights` |
| Kit: `TableNode.tsx` (nuevo), `StatusPicker.tsx` (`details`, `actions`, `anchorStyle`), `FloatingBar.tsx` (descripción en tinta sobre vidrio, R12), `index.ts`, `README.md` | — |
| `styles/globals.css` | `plan-node` (transiciones de mover y de estado, arrastre, vuelta) y `plan-drop` |
| `test/setup.ts` | Stub de `setPointerCapture` |
| Pruebas | `TablesPage.plan.test.tsx` (14). Las de cuadrícula nombran su `radiogroup`, porque ahora hay dos |

### Decisiones nuevas (en `decisiones.md` como P1–P9; las visuales ya están en el manual 12.2 y 13.10)

- **P1:** el selector se llama **Plano · Cuadrícula** (manual aprobado) y no "Lista / Distribución" (prompt). Cambiarlo es una línea.
- **P2:** la celda mínima sube de 32 a 36 px. Con 32, "Disponible" se cortaba en el teléfono.
- **P3:** la franja resume en el plano y filtra en la cuadrícula.
- **P4:** los botones sobre vidrio son `outline`, nunca `ghost` naranja.
- **P5:** "Rectangular" se guarda como `null`.
- **P6:** el aviso de "otro dispositivo guardó" se calcula en la web, sin versión en el backend.
- **P7:** el tamaño también se valida en el backend.
- **P8:** "Quitar del plano".
- **P9:** sin zonas ni varios salones.

### Limitaciones conocidas

- **Gana el último que guarda.** Si dos personas editan a la vez, la segunda reemplaza el plano de la primera. Se le avisa con el toast de 13.10, pero no se fusionan.
- **Editar la capacidad no mueve la mesa.** Si crece y queda encima de otra o fuera de la grilla, se ve marcada en el modo edición y el plano no se guarda hasta moverla. En servicio se dibuja dentro de la grilla, aunque pueda solaparse.
- **Un solo salón de 20 × 30 celdas.**
  - Caben unas 35 mesas con "Ubicar automáticamente" (deja una celda libre alrededor) y hasta unas 90 acomodándolas a mano.
  - Las que no caben se nombran arriba del plano y se ven en la cuadrícula.
- **Sin paredes, zonas ni elementos decorativos** (barra, puertas).
- **El zoom es con botones.** Sin pellizcar ni rueda: en el teléfono el gesto de pellizcar acerca toda la página, como en el resto del dashboard.
- **El tiempo real es el de siempre.** Los estados de otro dispositivo llegan al volver a la pestaña o al recargar, y el anillo se ve entonces. El socket para `restaurant_admin` (D5) sigue pendiente.
- **En el teléfono** el plano es solo de consulta y se desplaza dentro de su marco.

### Orden para desplegar

1. Elizabeth revisa el PR del backend y **aplica la migración en Neon** (necesita confirmación explícita).
2. Se fusiona el backend; Render despliega.
3. Se fusiona la web; funciona también si el backend llega después.

## F6 · App móvil y login móvil (26 oct 2026, noche)

**Rama:** `refactor/sprint2-app-v2` en `dinno-mobile`, desde `develop` actualizado. **Sin commit.** Al cerrar cada bloque: `npx expo lint`, `npm run typecheck` y `npm test` (118/118) en verde.

### Dependencias (aprobadas por Sebastián)
- `expo-blur ~57.0.3` y `expo-haptics ~57.0.3`, instaladas con `npx expo install`. Obligan a recompilar (`prebuild --clean` + `run:android`); quedó avisado en el `AVISOS.md` del móvil.

### Archivos

| Archivo | Cambio |
|---|---|
| `src/theme/tokens.ts` | Copia exacta del manual 16.5 |
| `src/theme/css-vars.ts`, `tailwind.config.js` | Colores v2.0 (selección, tintes y bordes); escala tipográfica (h1 28, h2 22, label 12, `kicker`, `metric`) |
| `src/components/ui/Text.tsx` | `label` sin mayúsculas; variantes `kicker` y `metric` |
| `src/components/ui/use-press-scale.ts` (nuevo) | Presionar con Reanimated en el hilo de UI: 0,97 en 120 ms; sin escala con reducir movimiento |
| `src/lib/haptics.ts` (nuevo) | Toque ligero para el primario y tic de selección, sin fallar si el teléfono no vibra |
| `src/components/ui/GlassSurface.tsx` (nuevo) | Vidrio con respaldos (detalle abajo) |
| `Button.tsx` | Presionar + háptica en el primario; `secondary` = `inverse`, igual que la web |
| `IconButton.tsx`, `FilterChip.tsx`, `Card.tsx` | Presionar. `Card` sin sombra en reposo (`elevation: resting · floating`), y la selección y los chips usan `border-selection` |
| `FloatingSurface.tsx` | Usa `GlassSurface` (vidrio de mapa): iOS desenfoca el mapa; Android, sólido |
| `BottomSheet.tsx`, `use-presence.ts` | Resorte con la velocidad del gesto, resistencia elástica hacia arriba, un solo dedo; entradas con `--ease-sheet` y salidas más rápidas (150 ms) |
| `features/session/components/AuthScreen.tsx` | Marco nuevo de todas las pantallas sin sesión: formas de marca + tarjeta de vidrio que sube al abrir |
| `features/session/components/AuthTabs.tsx` (nuevo) | Pestañas con la barra naranja que se desliza |
| `app/(auth)/login.tsx`, `crear-cuenta.tsx` | Pestañas; texto en tinta sobre el vidrio. `crear-cuenta` es de **Jacobo** |
| `app/(auth)/verificar-correo.tsx`, `recuperar-contrasena.tsx`, `conectando.tsx` | Texto en tinta sobre el vidrio (sin `tone="secondary"`). De **Jacobo** |
| `app/(app)/(tabs)/index.tsx` (Explorar) | En mapa, mapa a pantalla completa con encabezado flotante (título, origen, "Cambiar zona", Mapa · Lista y filtros). La lista no cambió |
| `features/search/components/ResultsMap.tsx` | `topInset`, para que el encuadre no esconda pines bajo el encabezado |
| `features/search/components/RestaurantCard.tsx` | `elevation` nueva |
| `features/search/components/RestaurantMapPreview.tsx` (nuevo) | Mapa estático (lite) del detalle |
| `app/(app)/restaurante/[id].tsx` | Mapa estático arriba; una sola fila de estado |
| `features/session/*.test.tsx` | Los mocks de `react-native-reanimated` y `expo-router` agregan `useReducedMotion` y `useFocusEffect` |

### Vidrio y rendimiento en gama media (`GlassSurface`)

| Caso | Qué se ve |
|---|---|
| iOS | `BlurView` real |
| Android 12+ con `BlurTargetView` (login) | `BlurView` real con `dimezisBlurViewSdk31Plus` |
| Android 11 o anterior | Esa misma opción cae sola a una vista semitransparente (la gama media antigua no paga el costo) |
| Sobre el mapa en Android | Sólido (el desenfoque no puede leer la superficie nativa del mapa) |
| Con "Reducir transparencia" | Sólido al 92% |

- **Un solo desenfoque por pantalla**, sobre un fondo estático, y nunca se anima: solo se anima la tarjeta.
- **Las animaciones** (presionar, pestañas, hoja inferior, entrada de la tarjeta) corren en el hilo de UI con Reanimated 4.

### Decisiones nuevas, ya agregadas al manual (13.9 y 13.11)

| # | Tema | Decisión |
|---|---|---|
| M1 | Cómo trasladar el login web al celular | Tabla de principios → celular en el manual 13.9. Sin el panel de marca de escritorio; el logo dentro de la tarjeta, nunca sobre la forma naranja |
| M2 | Forma petróleo en modo oscuro | `surface-2` (el petróleo claro), porque `brand` desaparece sobre el fondo oscuro (la web usa petróleo medio) |
| M3 | El React Compiler no deja asignar `.value` en callbacks | Se usa `sharedValue.set()` de Reanimated 4 |

### Verificación en el emulador (Pixel 9a, Android 16, development build)

- `prebuild --clean` + `run:android`: compila e instala sin errores. Metro y `logcat` (`ReactNativeJS`) sin errores ni advertencias nuevas.
- **Recorrido probado, en claro y en oscuro:**
  - Login con el vidrio desenfocando las formas de marca.
  - Pestañas a "Crear cuenta" y de vuelta, con la barra regresando bajo su pestaña.
  - Entrar con un correo de ejemplo.
  - Explorar en mapa, con el encabezado flotante y los pines visibles bajo él.
  - Explorar en lista.
  - Detalle con el mapa estático, la fila de estado y "Cómo llegar".
  - Diálogo "¿Cerrar sesión?" y cierre de sesión.
- **Reducir movimiento** (escalas de animación de Android en 0): las pestañas cambian de pantalla al instante en ambos sentidos.
- Capturas del "después" en [`capturas-v2/mobile/`](capturas-v2/mobile/).
- **No es de la app:** el círculo gris arriba a la derecha de las capturas es el botón "Tools" del development build. No sale en producción.

### Expo Go

- La app **no corre en Expo Go desde antes de esta fase**, y no es una regresión. Desde el commit `62a37b0` (Google Sign-In) usa código nativo que Expo Go no trae: Google Sign-In, la llave propia de Maps y el paquete `com.dinno.app`. El `CLAUDE.md`, el `AGENTS.md` y el README del móvil dicen "nunca Expo Go".
- Lo que agrega esta fase **no empeora eso**:
  - `expo-blur`, `expo-haptics` y Reanimated 4 vienen dentro de Expo Go SDK 57.
  - Las dos dependencias nuevas están en la versión exacta del SDK.
- `npx expo-doctor`: pasan 20 de 21 revisiones. La que falla son 4 parches menores que ya estaban antes de esta fase y no se tocaron:
  - `expo` 57.0.30 → 57.0.31
  - `expo-router` 57.0.28 → 57.0.29
  - `expo-location` 57.0.21 → 57.0.22
  - `@expo/ui` 57.0.25 → 57.0.26

### Login web (punto 1 pendiente de la fase anterior)

- **Aplicado**, porque era necesario y no rompe nada: los enlaces naranja estaban al 70% (3,2:1) y los textos de apoyo al 60% (4,2:1), y ambos fallaban el AA que el prompt exige mantener.
- **Cambio mínimo:**
  - `AuthLink` sin `opacity-70` (subrayado al pasar el mouse en lugar de subir la opacidad).
  - `text-fg/60` → `text-fg` en `SignInForm` y `AccountRequestPanel`.
  - Nada más del diseño cambió.
- **Medido con el detector:** 0 fallas de contraste en 1440, 768 y 390.
- Con esto se agregó a `check:ui` la regla **`text-opacity`** (texto con opacidad prohibido), que antes habría marcado el login.

## F2 + F3 · Tokens, kit y dashboard web (26 oct 2026)

**Rama:** `refactor/sprint2-dashboard-v2`, apilada sobre `docs/sprint2-manual-v2` (la del manual). **Sin commit:** la renovación no tiene autorización para commits. Cuando se autorice, conviene separarlos: primero el manual y la página `/sistema`, después el código.

**Verificación al cerrar cada bloque:** `npm run lint`, `npm run check:ui`, `npm run build` y `npm test` en verde. Al final: 312 pruebas (eran 310; se sumaron las de atajos D/R/O y filtro por la franja). El bundle pasó de 770 a 776 kB, por el Popover de Radix, que ya venía en el paquete `radix-ui`: **sin dependencias nuevas**. La página `/sistema` no entra al build de producción.

### Correcciones de Sebastián aplicadas al manual antes de implementar

| Corrección | Cómo quedó | Por qué así |
|---|---|---|
| Vidrio entre 40% y 50% | **50%** en claro y oscuro | En claro, el 45% deja la tinta en 4,31:1 sobre lo peor que puede pasar detrás; el 50% es el único valor del rango que cumple AA (≥ 4,99:1). En oscuro, el 50% cumple sobre mesas y naranja (≥ 4,7:1); falla solo sobre una superficie crema maciza, que nunca queda bajo un panel |
| Colores muy pastel, se pierden con el fondo (también en el plano) | Tintes al **18%** (claro) / **22%** (oscuro), antes 12/14%. Se suma un **borde en el color del estado** (45% / 50%) y el rayado de Ocupada pasa al 20% | Es el máximo que mantiene el borde de selección ≥ 3:1 contra el tinte (manual 2.3). El borde es lo que separa la mesa del crema y del lienzo |
| Instalar `expo-haptics` y `expo-blur` | Aprobadas en el manual (16.1). **Se instalan en la fase del móvil** con `npx expo install`, porque obligan a recompilar (`prebuild`) | Instalarlas hoy dejaría al equipo con un build nativo viejo sin ningún uso todavía |
| Copia del v1.1 en la raíz | Marcada como histórica, con un enlace al v2.0 del repo | Que nadie la tome como vigente |

### Bloque 1 · Tokens y estilos globales

| Archivo | Cambio |
|---|---|
| `src/styles/tokens.css` | Copia exacta del manual v2.0, 16.3. Agrega: selección, tintes y bordes de estado, rayado, vidrio de panel y de barra, trama del plano, curvas, duraciones y variables de movimiento. **Ningún color existente cambió de valor** |
| `src/styles/globals.css` | Mapeo v2.0 (16.4): colores nuevos, curvas, desenfoques y escala tipográfica (H1 28, H2 22, etiqueta 12 con mayúscula inicial, `text-kicker`, `text-metric`). <br>Utilidades: `glass-panel`, `glass-bar`, `hatch-busy`, `plan-canvas` y `press`. <br>Keyframes de entrada y salida (`sink-out`, `pop-in/out`, `fade-out`, `sheet-in`, `remote-change`). <br>`text-wrap: pretty/balance`. <br>Reducir movimiento sin regla global que lo apague todo. <br>**Compatibilidad del login** (ver decisiones) |
| `src/lib/cn.ts` | `tailwind-merge` conoce `text-kicker` y `text-metric` |

### Bloque 2 · Kit (`src/components/ui`)

| Archivo | Cambio |
|---|---|
| `Button.tsx`, `IconButton.tsx` | `press`: escala 0,97 en 120 ms (1 con reducir movimiento) |
| `Card.tsx` | Nivel 1: borde, sin sombra en reposo |
| `StatTile.tsx` | Sin sombra; queda para cifras sueltas (`StatStrip` es el resumen) |
| `Dialog.tsx` | Entrada (rise) y **salida** (`sink-out`) de la tarjeta; fundido de entrada y salida del overlay |
| `DropdownMenu.tsx`, `Select.tsx` | Crecen desde su disparador (`transform-origin` de Radix) y tienen salida; ítems de 44 px en pantallas táctiles |
| `Toast.tsx` | Salida animada por el mismo borde |
| `Switch.tsx` | La perilla no se desliza con reducir movimiento |
| `FloatingBar.tsx` | Vidrio de panel (nivel 3); ahora para la edición del plano y acciones masivas |
| `EmptyState.tsx` | `variant="error"` con un punto rojo sobre el símbolo |
| `DataTable.tsx` | Encabezados con mayúscula inicial; en el teléfono, **dos líneas por fila** con `mobileLine` |
| `HoursEditor.tsx` (+ test) | Día cerrado en una sola fila; "Copiar el lunes a todos" debajo del lunes |
| `status.ts` | `TONE_SURFACE`: tinte + borde (+ rayado) por estado |
| `StatusShape.tsx` | Tamaño de 10 px para las líneas de estado |
| `TableCard.tsx` (+ test) | Reescrita: **superficie de estado**, inactiva sin opacidad, `aria-expanded` del selector, atajos D/R/O, `highlight` (anillo de cambio remoto, listo para el tiempo real), `headingAs` |
| **Nuevos:** `StatusLine.tsx`, `StatStrip.tsx`, `StatusPicker.tsx`, `DetailList.tsx` y `src/lib/use-media-query.ts` | Según el manual 12.2. `StatusPicker`: popover de vidrio desde 768 px y hoja inferior abajo |
| `index.ts`, `README.md` | Exportaciones y documentación v2.0 |

### Bloque 3 · Layout

| Archivo | Cambio |
|---|---|
| `src/app/layouts.tsx` | El topbar y el menú de usuario muestran el **nombre real del restaurante** (`GET /restaurants/me`), no el `displayName` de Firebase (hallazgo W3) |
| `src/features/restaurant/hooks.ts` | `useRestaurantQuery({ enabled })`, para no consultar en las pantallas de cuenta equivocada o sin verificar. **Archivo de Santiago y Jacobo** (aditivo, no cambia nada para quien lo usa sin parámetros) |
| `src/components/layout/Topbar.tsx` | Skeleton mientras carga el nombre; **vidrio de barra al hacer scroll** |
| `AppShell.tsx`, `UserMenu.tsx` | Nombre opcional; sin nombre, el bloque de usuario muestra solo el correo |
| `src/app/router.test.tsx`, `features/restaurant-status/RestaurantStatus.layout.test.tsx` | Simulan `GET /restaurants/me` (el nombre ya no sale de la sesión) |

### Bloque 4 · Pantallas

| Archivo | Cambio |
|---|---|
| `features/tables/TablesPage.tsx` | "Agregar mesa" de borde en servicio (primario solo en el estado vacío); franja que filtra; inactivas al final; selector por mesa; error de carga con botón secundario |
| `features/tables/components/TablesGrid.tsx` | Cada tarjeta dentro de su `StatusPicker`; con una mesa inactiva, el selector ofrece "Reactivar mesa" |
| `features/tables/components/TablesStats.tsx` | `StatStrip` con "disponibles" (glosario) |
| `features/tables/components/TablesSkeleton.tsx` | Medidas reales de la franja y las tarjetas |
| `features/tables/table-status.ts` | Atajos en las opciones y `activeFirst` |
| `features/tables/use-table-selection.ts` | Reescrito: qué selector está abierto |
| `features/tables/components/TableStatusBar.tsx` | **Eliminado**: lo reemplaza el selector junto a la mesa (solo lo usaba `TablesPage`) |
| `features/tables/*.test.tsx` | Pruebas del flujo nuevo: selector, atajos, filtro, reactivar desde el selector, inactivas al final |
| `features/restaurant/RestaurantPage.tsx` | "Editar" de borde con `pencil`; modo lectura con `DetailList`. **Pantalla de Jacobo** |
| `features/activity-log/ActivityLogPage.tsx` (+ test) | Filas de dos líneas en el teléfono. **Pantalla de Sergio** |
| `src/dev/kit/KitDay2Sections.tsx` | `/kit` con `StatStrip` y la `TableCard` nueva |
| `src/dev/sistema/*` | Valores corregidos (50%, 18/22%, bordes de estado), rango del control de 30 a 95% y corrección del foco inicial |

### Decisiones nuevas, ya agregadas al manual

| # | Tema | Decisión |
|---|---|---|
| I1 | El login usa `text-h1`, `text-h2` y `text-label`, y la escala v2.0 lo cambiaría | Una regla acotada a `.glass-login` en `globals.css` le conserva la escala y el movimiento reducido del v1.1, **sin tocar sus archivos** (manual 13.9). Hereda solo el presionar de los botones del kit |
| I2 | El manual se contradecía: "Abrir ahora" de borde (3.3) y secundario (12.2) | Secundario, como ya estaba en el código. En servicio es la acción más fuerte de la pantalla |
| I3 | Al cerrarse el selector de una mesa, el foco volvía a su tarjeta y le quitaba el toque a la siguiente | El foco vuelve a la mesa solo si nadie más lo tomó (manual 12.2) |
| I4 | Filtro sin resultados | Recuadro punteado con "No hay mesas reservadas ahora." y "Ver todas las mesas" (manual 13.10) |
| I5 | Celda activa de la franja | `surface-2` + anillo interior de 2 px `--selection` (manual 12.2) |
| I6 | Salto de encabezados h1 → h3 (detector) | `TableCard` acepta `headingAs`; en `/mesas` las tarjetas son h2 |
| I7 | Teclas D/R/O en la hoja del teléfono | Ocultas: solo ayudan con teclado |

### Medido con el detector de Impeccable (pantallas renderizadas)

- **Antes:** 3 fallas de contraste en `/mesas` (la mesa inactiva al 55%: 3,6:1 y 2,2:1) y el salto de encabezados.
- **Después:** **0 fallas** en `/mesas`, `/bitacora` y `/restaurante`. Quedan los dos avisos de marca aceptados (crema y Plus Jakarta Sans, decisiones R2 y R3).

### Pendiente (fases siguientes)

1. ~~Login (D8)~~: aplicado en la fase F6 (ver arriba).
2. **Plano de mesas (F4):** backend (migración `plan_x` / `plan_y` / `plan_shape` y `PUT /v1/tables/plan`) + vista Plano · Cuadrícula. La interacción ya está validada en `/sistema`.
3. **Tiempo real del dashboard (D5):** socket para `restaurant_admin` + `LiveIndicator` + anillo de cambio remoto (`TableCard` ya tiene `highlight`). Requiere backend.
4. ~~`check:ui` con la regla de opacidad en texto~~: hecho en F6.
5. **`CLAUDE.md` (tres repos), `AGENTS.md` y el README del frontend:** apuntar al manual v2.0.
6. ~~Móvil (F6)~~: hecho (ver arriba).
7. **Bundle de 776 kB en un solo chunk** (hallazgo W15): dividir por ruta, en una fase de rendimiento.
