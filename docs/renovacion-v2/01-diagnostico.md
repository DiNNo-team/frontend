# Renovación v2.0 · 01 · Diagnóstico

> Fase de auditoría, **sin cambios de código**. Fecha: 26 oct 2026. Hecha sobre `frontend` (`fix/sprint2-login-pestanas`, ya fusionada en `develop` con el PR #54), `dinno-mobile` (`main` = `develop`) y `backend` (`develop`). Los tres repos estaban limpios.
> Siguiente paso: revisión de Sebastián. **No se implementa nada hasta que lo apruebe.**

## Cómo se hizo

- **Lectura de código:** tokens, `globals.css`, el kit (`components/ui`, `components/layout`), las cinco pantallas web, el kit y las pantallas del móvil, y el módulo de mesas del backend (entidad, DTO, controlador, migraciones, socket).
- **Pantallas renderizadas:** las de la web, con un arnés propio fuera del repo (en el scratchpad de la sesión). Reusa `routes`, `Providers` y los `api.mock.ts` del equipo con una sesión simulada; `/restaurants/me`, que no tiene mock, responde con un restaurante de ejemplo. Las del móvil, en el emulador Pixel 9a con `EXPO_PUBLIC_USE_MOCKS=true`. Las capturas están en [`capturas-v1/`](capturas-v1/) y son el "antes".
- **Medición automática:**
  - `npm run check:ui`: sin problemas.
  - Pruebas: web 310/310 (33 archivos) y móvil 118/118 (18 suites). El backend tiene 50 archivos `.spec` (no se corrieron).
  - Detector de Impeccable (`impeccable detect`) sobre el código y sobre las pantallas renderizadas.
  - `vite build`, para ver el peso del bundle.
- **Marcos de evaluación:** las reglas leídas de cada skill instalada (sección 4), aplicadas a lo que se ve en las capturas.

Escala de severidad: **P0** bloquea la tarea · **P1** dificultad grande o falla AA · **P2** molestia con alternativa · **P3** pulido. Entre paréntesis va la heurística de Nielsen (H1…H10) o la regla que se rompe.

---

## 1. Problemas visuales y de usabilidad, priorizados

### Web (dashboard del restaurante)

| # | Sev. | Problema | Evidencia |
|---|---|---|---|
| W1 | **P1** | **Cambiar el estado de una mesa, la tarea más frecuente del turno, cuesta dos pasos y un salto de vista.** Primero se selecciona la tarjeta y después se usa la barra fija del fondo, a unos 480 px en escritorio. En el teléfono la barra tapa unas tres filas de la grilla. (H7 eficiencia, ley de Fitts) | [`mesas-seleccion-desktop.jpg`](capturas-v1/web/mesas-seleccion-desktop.jpg), [`mesas-seleccion-phone.jpg`](capturas-v1/web/mesas-seleccion-phone.jpg) |
| W2 | **P1** | **El estado no es lo protagonista de la tarjeta.** Es un chip de 12 px con una forma de 8 px. Lo que domina es el nombre y la capacidad, que casi nunca cambian. Para saber cuántas mesas hay disponibles hay que leer chip por chip. (H8, "lo primero es la mesa y su estado", manual 12.3) | [`mesas-desktop.jpg`](capturas-v1/web/mesas-desktop.jpg) |
| W3 | **P1** | **El topbar y el bloque de usuario muestran el `displayName` de Firebase, no el nombre del restaurante.** Con cuentas de correo, que no tienen `displayName`, dice "Restaurante"; con Google mostraría el nombre de la persona. Con un `displayName` vacío, el topbar queda en blanco. (H1, Trunk Test de Krug) | [`src/app/layouts.tsx:24`](../../src/app/layouts.tsx#L24), [`mesas-sin-nombre-topbar.jpg`](capturas-v1/web/mesas-sin-nombre-topbar.jpg) |
| W4 | **P1** | **Fallas de contraste AA**, medidas por el detector sobre la página renderizada. Ver la tabla debajo de esta. | |
| W5 | **P1** | **No hay sincronización entre dispositivos del mismo restaurante.** La lista se actualiza solo al volver a la pestaña (`staleTime` 30 s, `refetchOnWindowFocus`). No hay intervalo ni socket, y el socket del backend solo acepta comensales. Si dos meseros usan dos tablets, cada uno ve un estado viejo, aunque el subtítulo promete "en tiempo real". (H1) | [`src/app/query-client.ts:7`](../../src/app/query-client.ts#L7), `backend/src/modules/identity-access/realtime/diner-socket-authenticator.ts:63` |
| W6 | P2 | **Las métricas ocupan mucho y dicen poco.** Son cuatro tarjetas grandes, con borde y sombra, para cuatro números. En el teléfono empujan la primera mesa más allá de la mitad de la pantalla. Además: <br>• No sirven para filtrar. <br>• La etiqueta "libres" choca con la palabra del estado, "Disponible" (H4, glosario 14.1). | [`mesas-phone.jpg`](capturas-v1/web/mesas-phone.jpg), [`TablesStats.tsx:12`](../../src/features/tables/components/TablesStats.tsx#L12) |
| W7 | P2 | **El único naranja de la pantalla se gasta en "Agregar mesa"**, una acción de configuración que es rara durante el servicio. El acento debería marcar la selección y "lo de ahora". (Taste, app screens §13; Impeccable, Operate) | [`mesas-desktop.jpg`](capturas-v1/web/mesas-desktop.jpg) |
| W8 | P2 | **La grilla tiene alturas dispares.** El "Reactivar" de la mesa inactiva estira toda su fila, así que las tarjetas vecinas quedan con unos 70 px vacíos. La segunda fila es más baja. La mesa inactiva queda en medio del orden. Además: <br>• Las tarjetas seleccionables no cambian con el hover. <br>• Hay un salto h1 → h3 (falta el h2). | [`mesas-desktop.jpg`](capturas-v1/web/mesas-desktop.jpg), detector `skipped-heading` |
| W9 | P2 | **El skeleton no tiene la medida real.** Las tarjetas miden unos 124 px cargando y entre 136 y 186 px ya cargadas, así que la pantalla salta al llegar los datos. El bloque `surface-2` sobre blanco casi no se ve. | [`mesas-cargando-desktop.jpg`](capturas-v1/web/mesas-cargando-desktop.jpg) |
| W10 | P2 | **Los errores de carga se ven distinto en cada pantalla.** <br>• Mesas y bitácora: `EmptyState variant="error"` con el botón primario. <br>• `/restaurante`: un `Alert` con un botón de borde pequeño. <br>Además, el error de mesas es idéntico al estado vacío salvo el texto: mismo símbolo y sin ninguna señal de error. (H4, H9) | [`mesas-error-desktop.jpg`](capturas-v1/web/mesas-error-desktop.jpg) vs [`mesas-vacio-desktop.jpg`](capturas-v1/web/mesas-vacio-desktop.jpg) |
| W11 | P2 | **En `/restaurante`:** <br>• "Editar" es primario naranja; el manual 12.4 dice botón de borde. <br>• En los horarios, el valor pega con el divisor (`divide-y` sin padding). <br>• Valores cortos a 1128 px de ancho. <br>• La ubicación es solo texto, aunque hay coordenadas para un mapa. | [`RestaurantPage.tsx:191`](../../src/features/restaurant/RestaurantPage.tsx#L191), [`:223`](../../src/features/restaurant/RestaurantPage.tsx#L223), [`restaurante-desktop.jpg`](capturas-v1/web/restaurante-desktop.jpg) |
| W12 | P2 | **La bitácora en el teléfono usa cuatro líneas de etiqueta y valor por cambio**, así que caben unas cuatro entradas por pantalla. Los encabezados de la tabla van en mayúsculas de 11 px. | [`bitacora-phone.jpg`](capturas-v1/web/bitacora-phone.jpg) |
| W13 | P2 | **El horario del registro es largo.** Son siete filas de unos 100 px que dicen "Cerrado todo el día", y "Copiar a todos los días" (que copia el lunes) queda debajo del domingo, lejos de lo que copia. | [`onboarding-desktop.jpg`](capturas-v1/web/onboarding-desktop.jpg) |
| W14 | P2 | **Motion incompleto.** <br>• Diálogos, menús y toasts no tienen salida animada: Radix los desmonta de golpe. <br>• Los botones no responden al presionar con escala. <br>• El menú no crece desde su disparador. <br>• La regla global de reducir movimiento (0,01 ms) también quita los fundidos útiles. | [`globals.css:35`](../../src/styles/globals.css#L35) |
| W15 | P3 | **El bundle es un solo chunk de 770 kB (238 kB gzip),** sin dividir por ruta. Se nota en las tablets de los restaurantes. | `vite build` |
| W16 | P3 | **Con el restaurante cerrado compiten dos botones fuertes**: "Abrir ahora", petróleo relleno, y "Agregar mesa", naranja. | [`mesas-cerrado-desktop.jpg`](capturas-v1/web/mesas-cerrado-desktop.jpg) |
| W17 | P3 | **En el login, "Términos y condiciones" lleva un ícono de descarga pero no es un enlace** y está en un panel `aria-hidden`, así que parece accionable y no lo es (H4). Ya tiene un TODO con dueño. | [`AuthHero.tsx:27`](../../src/features/auth/components/AuthHero.tsx#L27) |

**W4 · Fallas de contraste AA**

| Dónde | Contraste | Necesario | Causa |
|---|---|---|---|
| Login: enlaces "¿Olvidaste tu contraseña?" y "Crear cuenta" | 3,2:1 | 4,5:1 | `opacity-70` ([`AuthLink.tsx:10`](../../src/features/auth/components/AuthLink.tsx#L10)) |
| Login: "¿Aún no tienes cuenta?" y "O inicia sesión con" | 4,2:1 | 4,5:1 | `text-fg/60` ([`SignInForm.tsx:90`](../../src/features/auth/components/SignInForm.tsx#L90), [`:146`](../../src/features/auth/components/SignInForm.tsx#L146)) |
| Mesa inactiva: capacidad y chip | 3,6:1 y 2,2:1 | 4,5:1 | `opacity-55` ([`TableCard.tsx:68`](../../src/components/ui/TableCard.tsx#L68)), que aplica la regla del manual 3.2 |

Sobre la mesa inactiva: el propio manual se contradice entre 3.2 ("contenido al 55%") y 15 ("AA en todo texto").

### Móvil (app del comensal)

| # | Sev. | Problema | Evidencia |
|---|---|---|---|
| M1 | **P1** | **En Explorar, el encabezado se come el mapa.** El título de 32 px, el subtítulo, el control Mapa/Lista y Filtros ocupan alrededor del 30% de la pantalla antes del mapa, que es el producto. Ningún control flota sobre el mapa, aunque es justo donde el manual 7 pone el vidrio. | [`02-explorar-mapa.jpg`](capturas-v1/mobile/02-explorar-mapa.jpg) |
| M2 | P2 | **El detalle del restaurante es una lista sin momento de marca.** Además: <br>• No hay mapa ni vista de la ubicación, aunque hay coordenadas. <br>• Queda un 35% de pantalla vacío. <br>• Los dos chips verdes, "Abierto" y "Disponible", se leen como redundantes (H8). | [`04-detalle-restaurante.jpg`](capturas-v1/mobile/04-detalle-restaurante.jpg) |
| M3 | P2 | **El login móvil es plano y sólido; el web es vidrio con formas de marca.** Es la mayor distancia de marca entre los dos productos. Dueño: Jacobo. | [`01-login.jpg`](capturas-v1/mobile/01-login.jpg) vs [`login-phone.jpg`](capturas-v1/web/login-phone.jpg) |
| M4 | P3 | **Al presionar, los botones solo cambian de color:** sin escala y sin háptica, y `expo-haptics` no está instalado. La hoja inferior cierra con `withTiming`, sin resorte ni resistencia elástica en el borde. | `src/components/ui/Button.tsx`, `BottomSheet.tsx` |
| M5 | P3 | **El botón `secondary` no es igual en los dos repos.** <br>• En la web usa `bg-inverse`, que en oscuro se vuelve crema. <br>• En el móvil usa `bg-brand`, que en oscuro queda petróleo sobre petróleo. | web `Button.tsx:25` · móvil `Button.tsx:17` |
| M6 | P3 | **`expo-glass-effect` está instalado desde la plantilla pero no se usa.** Solo actúa en iOS 26; en Android es un `View`. Sirve para el port a iPhone. | `package.json` |

### Lo que funciona y se conserva

- **El kit web.** Es accesible y consistente: foco visible, `aria-*` correctos, retorno del foco, Radix sin estilos y `STATUS_META` como única fuente de los estados. Es sólido y la v2.0 se construye encima, sin reemplazarlo.
- **El cambio de estado.** Es optimista, sin confirmación, con "Deshacer" y con un reintento claro. Es justo lo que pide la heurística "deshacer mejor que confirmar".
- **Los pines del mapa móvil.** Usan las formas de estado y el punto naranja con radar del comensal: ya son lenguaje propio.
- **El login web.** Es la mejor pieza de marca del producto (sección 5).

---

## 2. Desviaciones entre el código y el Manual v1.1

| Dónde | Manual v1.1 | Código | Lectura |
|---|---|---|---|
| Login (`features/auth`, `glass-login` en `globals.css`) | 12.4: dos columnas 50/50 con el panel de marca a la izquierda. 7: vidrio solo sobre el mapa, al 70% con 16 px de desenfoque | Tarjeta de vidrio al 55% con 44 px de desenfoque sobre dos formas de marca; panel de gradiente que sobresale de la tarjeta; pestañas verticales; hero "Hola de nuevo" en vez de "Dile no a la espera." | Desviación aprobada (PR #35 y #54). **Es la referencia visual del v2.0.** |
| Login: enlaces y textos de apoyo | 2.2 y 15: AA | `opacity-70` y `text-fg/60` (3,2:1 y 4,2:1) | **Falla técnica** (decisión D8) |
| Login: "O inicia sesión con" | 4: la etiqueta de 11 px va en mayúsculas | `text-label` sin `uppercase` | Menor |
| Mesa inactiva | 3.2: contenido al 55% | Igual | La regla del manual rompe AA: se corrige en la v2.0 |
| `/restaurante` | 12.4: botón de borde "Editar" | Primario naranja | Desviación |
| `StatTile` | 9: "libres" | "libres" | El manual choca con su glosario ("Disponible") |
| Botón `secondary` | 6.1: petróleo con texto crema | Web: `bg-inverse` (crema en oscuro). Móvil: `bg-brand` | Los dos repos difieren |
| Móvil: lo que flota sobre el mapa | 7: Liquid Glass | Respaldo sólido en todo (`FloatingSurface`), decidido así porque el desenfoque no lee el mapa en Android | Es el respaldo previsto por el manual |
| Movimiento reducido | 13: "todo aparece en su estado final" | Eliminación global a 0,01 ms | El manual se cumple, pero Impeccable (audit) y Emil la señalan como dañina: quita también los fundidos que ayudan a entender |
| Copy | 14 | Web "Crear cuenta" · móvil "Crea tu cuenta" | Menor |

Los tokens (`tokens.css` y `tokens.ts`) son copia exacta del v1.1. `check:ui` sale limpio: **fuera del login no hay hex, radios ni sombras sueltos.**

---

## 3. Componentes: reutilizar, refactorizar, unificar

**Se reutilizan tal cual** (se les agrega motion o estados cuando haga falta): `Button`, `IconButton`, `TextField`/`FieldWrapper`, `Select`, `TimeSelect`, `NumberStepper`, `Switch`, `SegmentedControl`, `StatusShape` + `STATUS_META`, `StatusChip`, `Dialog`/`ConfirmDialog`, `DropdownMenu`, `Toast`, `Alert`, `DataTable`, `PageHeader`, `Logo`, `useDelayedFlag`, `use-return-focus`.

**Se refactorizan:**

| Pieza | Cambio | Por qué |
|---|---|---|
| `TableCard` | Pasa a poner el estado primero: superficie teñida por el estado (fondo del 15%, forma y palabra), identificador grande, capacidad secundaria y control de estado directo en la tarjeta. Comparte la base visual con el nodo del plano | W1, W2, W8 |
| `StatTile` → franja de métricas | Un solo contenedor dividido, con las cifras como tipografía y no como tarjetas. Cada cifra filtra la vista | W6 |
| `FloatingBar` / `TableStatusBar` | Se vuelve inspector contextual: panel lateral en ≥ 1024 junto al plano y hoja inferior en el teléfono | W1 |
| `Card` | Borde **o** sombra, no los dos, en reposo | Elevación v2.0 |
| `EmptyState` (`variant="error"`) | Señal visual de error en el mismo layout | W10 |
| `Topbar` / `UserMenu` / `layouts.tsx` | Nombre real del restaurante e indicador "En vivo" | W3, W5 |
| `TablesSkeleton` | Medidas reales de la tarjeta | W9 |
| `Button`, `Dialog`, `DropdownMenu`, `Toast` | Escala al presionar, salidas animadas y origen en el disparador | W14 |

**Se unifican:**

1. **Error de carga.** Un solo patrón en todas las pantallas: dentro del bloque que falló, con una frase y "Intentar de nuevo" del mismo tipo.
2. **Esqueletos de tarjeta.** Hoy se arman a mano dentro de las funcionalidades (`TablesSkeleton`, `RestaurantPage`, `AuthLoading`). Se reemplazan por una pieza del kit.
3. **`ProfileField`.** Es local de `/restaurante`. Pasa al kit como lista de detalles, que también sirve al inspector de la mesa.
4. **Vidrio.** `glass-login` (solo login) y `.glass .float` (manual) se convierten en una familia de niveles en los tokens. **El login conserva su aspecto exacto.**
5. **Botón `secondary`** y **tokens de motion**, iguales en la web y el móvil.

**Componentes nuevos** para el v2.0 y el plano: `FloorPlan` (lienzo), `TableNode`, panel inspector, `LiveIndicator` con su marca de "Actualizado", y el selector de vista Plano/Cuadrícula (reusa `SegmentedControl`).

---

## 4. Mapa de skills

Las leí todas antes de asignarlas. Nombres exactos:

| Skill (nombre real) | Qué dicen sus instrucciones | Papel en este trabajo | Cuidado |
|---|---|---|---|
| **`impeccable`** (plugin `impeccable@impeccable` 4.7.1) | 24 comandos, modos Persuade/Operate/Read/Experience, piso de calidad (`craft-floor.md`), detector (`impeccable detect`) y hook que revisa cada edición de UI | **Calidad visual y técnica.** El dashboard va en modo **Operate**: precisión y contención. Usos: `audit` (a11y, theming, responsive, puntaje sobre 20), `polish` al cerrar cada fase, `layout`/`typeset` puntuales y el detector como compuerta | `critique` exige subagentes y guarda en `.impeccable/critique/`. `init` y `document` escriben `PRODUCT.md`/`DESIGN.md` en la raíz (D10). Sus reglas `cream-palette` y `overused-font` chocan con la marca y se ignoran a propósito |
| **`ux-heuristics`** | Nielsen 10, leyes de Krug, Trunk Test, severidad 0–4, puntaje sobre 10, patrones oscuros | **Usabilidad.** Puntúa los flujos (cambio de estado, plano, registro) antes y después; da la severidad de este diagnóstico | Ninguno |
| **`design-taste-frontend`** (Taste v2) | Dirección de arte anti-plantilla. Para dashboards tiene su propia corrida (`app-screens.md`, `draw.mjs --app`, `inspect.mjs --app`) con reglas de casa | **Dirección de arte del dashboard.** Aporta: <br>• "Color en los datos, no en el chrome". <br>• Métricas como tipografía. <br>• "Un elemento que solo tiene este producto", que aquí es **el plano de mesas**. <br>• El inspector, que mide antes y después en 1440, 768 y 390 | **Prohíbe el vidrio, los gradientes, el crema con terracota, las etiquetas en mayúsculas espaciadas y el sidebar oscuro.** Choca con la identidad de DiNNo, así que se usa con `--keep palette,type` y `--allow` para lo que fija la marca. Escribe en `.taste-skill/`; se redirige con `--out` |
| **Emil Kowalski:** `emil-design-eng`, `animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `animation-performance`, `animation-vocabulary`, `apple-design`, `animate-expo`, `mobile-native`, `break-ui`, `prototype`, `pick-ui-library`, `ask-sonner`, `write-swift` | Marco de decisión del motion (frecuencia → propósito → curva → duración), curvas fuertes, menos de 300 ms, salidas, interrupción, gestos con velocidad | **Motion.** <br>• `find-animation-opportunities` y `improve-animations` para auditar (sección 6). <br>• `animate` y `animate-expo` para construir. <br>• `review-animations` en cada PR. <br>• `break-ui` para el plano con datos extremos. <br>• `prototype` para las variantes del nodo de mesa. <br>• `pick-ui-library` para la decisión del arrastre. <br>• `mobile-native` para el dashboard en tablet. | `improve-animations` escribe en `plans/`: se redirige a esta carpeta. `ask-sonner` no aplica (hay un Toast propio). `write-swift` queda para el port a iOS |
| **`ui-ux-pro-max`** + `design-system`, `ui-styling`, `brand`, `design`, `banner-design`, `slides` | Base consultable: 119 guías de UX, guías por stack (`react`, `react-native`) y checklist antes de entregar | **Patrones, componentes y responsive.** Consultas puntuales; ya dio la regla WCAG 2.5.7 (alternativa al arrastre) para el plano. `design-system` sirve para la arquitectura de tokens en tres capas | **No se usa `--design-system`**, porque propondría una paleta nueva. `ui-styling` (shadcn), `banner-design`, `slides` y `design` no aplican |

**Regla para resolver choques** (la de tu prompt): usabilidad real > identidad de DiNNo > consistencia > estética. Los choques que ya aparecieron y cómo se resolvieron están en [`decisiones.md`](decisiones.md).

---

## 5. Propuesta de dirección visual v2.0: "Capas de servicio"

**Idea.** Un restaurante en servicio funciona por capas: el salón es el suelo, las mesas están encima y lo que pasa ahora flota. El v2.0 traduce eso al producto:

- **Crema = suelo.**
- **Superficies sólidas = el trabajo.**
- **Vidrio = lo que flota y está vivo.**

El login ya cuenta esa historia (formas de marca abajo, tarjeta de vidrio encima). El dashboard la hereda con contención, porque es una herramienta.

### Principios

1. **El estado manda.** En la mesa, lo que más se ve es su estado: color, forma y palabra. El naranja se queda en la acción, la selección y "lo de ahora".
2. **Capas con propósito.** Hay tres niveles de elevación y cada nivel tiene su material:

   | Nivel | Material | Ejemplo |
   |---|---|---|
   | Suelo | Crema | Fondo de la app |
   | Superficie | Sólido, con borde fino y sin sombra en reposo | Tarjetas, tablas, formularios |
   | Flotante | Vidrio con su respaldo, o sólido con sombra flotante | Inspector de la mesa, barras sobre el plano, menús, toasts |

3. **La marca vive en los bordes de la experiencia.** Gradientes y vidrio fuerte aparecen en el login, la carga, el primer uso y el cierre del registro. Las pantallas de trabajo son calmadas.
4. **El movimiento explica.** Solo se anima un cambio de estado, la continuidad espacial (de la tarjeta al plano, el panel que sale de la mesa) o la respuesta a un toque. Dura entre 120 y 280 ms; las salidas son más rápidas que las entradas; con movimiento reducido quedan los fundidos, no se apaga todo.
5. **Densidad honesta.** Pensado primero para la tablet: objetivos de 44 px, datos reales, los ceros como ceros y una marca de "Actualizado" visible.
6. **Un objeto propio.** El plano de mesas y el Active Dot son lo que ningún otro dashboard tiene.

### Superficies y vidrio

- **Dónde va el vidrio en el dashboard** (cada uso, justificado):

  | Uso | Por qué |
  |---|---|
  | Inspector y barra de la mesa seleccionada, sobre la grilla o el plano | Mantiene a la vista el contexto que queda detrás |
  | Barra de herramientas del plano (zoom, Editar plano) | Flota sobre el lienzo sin taparlo |
  | Topbar fija al hacer scroll | El contenido se ve pasar por debajo y el topbar solo tiene pocos elementos grandes, así que la lectura no sufre |

- **Dónde nunca va el vidrio:** detrás de tablas, formularios, texto largo ni métricas, y tampoco en el sidebar.
- **Respaldos obligatorios:**

  | Situación | Comportamiento |
  |---|---|
  | `@supports not (backdrop-filter)` | Superficie sólida |
  | `prefers-reduced-transparency` | Superficie sólida |
  | `prefers-contrast: more` | Sólido con borde fuerte |
  | Android sobre el mapa | Sólido (como hoy) |
  | Fondo cargado | Si no hay certeza de AA, el fondo del vidrio sube |

- **Valores:** necesitan aprobación porque son decisiones de color (D3). Propuesta:
  - **Panel flotante:** superficie al 80% en claro y al 72% en oscuro, desenfoque de 20 px y saturación 1,4.
  - **Barra:** fondo al 85%, con 16 px.
  - **Login:** se queda en 55% y 44 px, sin cambios.

### Forma

- Se conservan los radios 20, 16, 14, 12, 28 y pastilla.
- Se agregan dos reglas:
  - **Radios concéntricos:** radio interno = radio externo − padding.
  - **Una sola tarjeta seleccionada:** borde naranja de 2 px y elevación al nivel flotante.
- En reposo, una tarjeta lleva borde o sombra, no los dos (Taste e Impeccable coinciden).

### Tipografía

Plus Jakarta Sans se queda. El detector de Impeccable la marca como "fuente muy usada", pero es parte de la identidad.

| Rol | v1.1 | v2.0 |
|---|---|---|
| Título de página | 32 px | 28/32 |
| Cifra de métrica | 32 px | 28/32 tabular |
| Etiqueta de tabla | 11 px en mayúsculas espaciadas | 12/16 700, mayúscula inicial |
| Display y Cifra de 54 px | En pantallas de uso | Solo para momentos de marca (temporizador, carga) |

- Mínimo 12 px para cualquier texto.
- La etiqueta de 11 px en mayúsculas queda para un único *kicker* por pantalla.

### Motion: tokens propuestos (los mismos en la web y el móvil)

| Token | Valor | Uso |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Entradas, respuesta a toques |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Movimiento en pantalla (mover una mesa) |
| `--ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Hojas, drawer, inspector |
| `--dur-press` | 120 ms | Escala 0,97 al presionar |
| `--dur-fast` / `--dur-base` / `--dur-slow` | 150 / 200 / 280 ms | Hover; chips, menús y toasts; paneles y diálogos |
| Salida | ≈ 0,75 de la entrada | Asimetría entrada y salida |

`--ease` (v1.1) queda como alias mientras se migra. Con movimiento reducido no hay traslación ni escala, y los cambios de opacidad o de color duran como máximo 150 ms.

### Reglas del v1.1: se conservan, se modifican o se eliminan

| Regla v1.1 | Decisión | Por qué |
|---|---|---|
| 0.1 Crema manda (72/19/9) | **Se conserva** | Identidad |
| 0.2 Naranja = acción o "ahora" | **Se conserva**, con una aclaración: el naranja no se gasta en acciones raras | W7 |
| 0.3 Texto naranja sobre claro = `#B83F14` | **Se conserva**, con una regla nueva: el texto nunca baja de opacidad | W4 |
| 0.4 Estado = color + forma + palabra | **Se conserva** (fijada por ti) | — |
| 0.5 / 7 Liquid Glass solo sobre el mapa; nada de vidrio en el dashboard | **Se modifica:** vidrio en la capa flotante (mapa, plano, inspector, barras, login), nunca bajo datos, con sus respaldos | Jerarquía de capas; el login como referencia |
| 0.6 / 5 Gradiente solo en momentos de marca | **Se modifica:** la lista se amplía con el cierre del registro, el primer uso del plano y los estados vacíos grandes. Siguen solo los dos gradientes | — |
| 0.7 Active Dot poco y con sentido | **Se conserva**, y se suma el indicador "En vivo" del dashboard, que es información viva | W5 |
| 1 Logo | **Se conserva** (fijada) | — |
| 2 Color | **Se conserva toda la paleta.** Solo se proponen valores de opacidad del vidrio (D3) | — |
| 3.2 Inactiva con el contenido al 55% | **Se elimina la opacidad.** Queda borde punteado, texto `fg-2` y raya, cumpliendo AA | W4 |
| 4 Escala tipográfica | **Se modifica** (tabla de tipografía). La familia y los pesos se conservan | Modo Operate, legibilidad |
| 6 Soft Layered | **Se modifica:** tres niveles de elevación, borde o sombra, radios concéntricos | Taste, Impeccable |
| 6.1 Un primario por pantalla | **Se modifica:** un primario por contexto. En la vista de servicio, "Agregar mesa" pasa a borde; el primario vuelve en el estado vacío y en "Guardar plano" | W7 |
| 8 Iconos Lucide | **Se conserva**, con íconos nuevos para el plano: cuadrícula `layout-grid`, plano `frame`, editar `move`, acercar y alejar `zoom-in`/`zoom-out`, centrar `scan` | — |
| 9 Catálogo de componentes | **Se modifica** (sección 3) | — |
| 10 Formularios | **Se conserva** | — |
| 11 Feedback | **Se modifica:** el error de carga va dentro del bloque y con señal de error; las salidas se animan | W10, W14 |
| 12 Layout del dashboard ("sin vidrio, sin gradientes") | **Se modifica:** <br>• Vidrio solo en la capa flotante. <br>• Métricas en franja. <br>• `/mesas` con Plano y Cuadrícula. <br>• Topbar con el nombre real y "En vivo". | W1–W6 |
| 13 Motion | **Se modifica** (tokens de arriba; reducir movimiento = suave, no cero) | W14 |
| 14 Glosario | **Se conserva**, y se corrige "libres" por "disponibles" | W6 |
| 15 Accesibilidad | **Se amplía** con WCAG 2.2: <br>• 2.5.7: alternativa al arrastre. <br>• 2.4.11: el foco no queda tapado por barras flotantes. <br>• `prefers-contrast`. | Plano |
| 16 Tokens ("copia exacta, no se edita") | **Se conserva la regla** con los tokens v2.0. Los valores de color no cambian; solo se agregan tokens | — |
| 17 Checklist | **Se modifica** con los puntos nuevos | — |

---

## 6. Oportunidades de animación

Cada una pasó el filtro de Emil (frecuencia, propósito, presupuesto de tiempo y función). La lista es corta a propósito.

| # | Dónde | Hoy | Propósito | Frecuencia | Movimiento propuesto |
|---|---|---|---|---|---|
| 1 | Estado de la mesa (tarjeta y nodo) | Cambio instantáneo | Indicar el estado | Decenas al día | Fundido del tinte y del chip a 200 ms `--ease-out`; la forma cambia sin desplazamiento. Sin rebote |
| 2 | Inspector / barra de la mesa | `rise-in`, sin salida | Continuidad espacial | Decenas al día | Entra desde el borde con `--ease-drawer` a 240 ms y sale a 160 ms por el mismo borde |
| 3 | Diálogo, menú ⋯, toast | Solo entrada | Evitar el corte brusco | Ocasional | Salida con `data-[state=closed]`: escala 0,97 + fundido a 150 ms. El menú crece desde `--radix-dropdown-menu-content-transform-origin`; el diálogo se queda centrado |
| 4 | `Button` (web y móvil) | Solo color | Respuesta al toque | Decenas al día | `:active` → `scale(0.97)` a 120 ms `--ease-out` |
| 5 | Cuadrícula ↔ Plano | — | Continuidad espacial | Ocasional | View Transitions: cada mesa se transforma de tarjeta a nodo, a 280 ms. API nativa, sin dependencia; donde no existe, cambio instantáneo |
| 6 | Arrastrar una mesa en el plano | — | Respuesta y estado | Rara (configuración) | Captura del puntero; al soltar se acomoda a la grilla a 180 ms `--ease-out`; si la posición no es válida vuelve a 220 ms `--ease-in-out`. Con teclado, sin animación |
| 7 | Cambio hecho desde otro dispositivo | — | Indicar el estado (hace visible el tiempo real) | Ocasional | Un anillo en el color del estado que pulsa una sola vez durante 700 ms; estático con movimiento reducido |
| 8 | Móvil: hoja inferior y pin seleccionado | `withTiming` | Gesto | Ocasional | Resorte de Reanimated con la velocidad del gesto y resistencia elástica en el borde (`animate-expo`); el pin crece a 1,15 con resorte suave |

**Rechazadas:**

- Contar las cifras de las métricas hacia arriba: son datos que se leen y se ven muchas veces al día.
- Entrada escalonada de la grilla al cargar: la pantalla se abre muchas veces al día.
- Animar el hover del sidebar más allá del color: más de 100 veces al día.
- Animar el logo en el dashboard: el manual lo prohíbe.
- Brillo en movimiento sobre el skeleton: Taste lo veta y el pulso de opacidad basta.

---

## 7. Estrategia para el plano de mesas

### Experiencia

- **Dónde vive.** En `/mesas` hay un selector **Plano · Cuadrícula**. La elección se recuerda por dispositivo, que es una comodidad de cada persona. Si el restaurante aún no tiene plano, la pantalla abre en Cuadrícula con una invitación: "Arma el plano de tu restaurante".
- **Dos modos:**

  | Modo | Qué se puede hacer |
  |---|---|
  | **Servicio** (por defecto) | Tocar una mesa abre el inspector (estado, capacidad, ⋯). Las posiciones están bloqueadas, para que nadie mueva una mesa por error en pleno servicio |
  | **Editar plano** (botón explícito) | Arrastrar con ajuste a la grilla; ↑↓←→ mueve una celda y Shift + flecha, cuatro; "Guardar plano" y "Cancelar"; aviso de cambios sin guardar (el mismo patrón de `/restaurante`) |

- **Mesas sin ubicar.** Esperan en una bandeja "Sin ubicar". "Ubicar automáticamente" las acomoda en filas por identificador, como punto de partida.
- **El nodo de mesa:**
  - La forma sale de la capacidad, salvo que el restaurante la elija: hasta 2, cuadrado pequeño; 3–4, cuadrado; 5–6, rectángulo; 7 o más, rectángulo largo.
  - Muestra el identificador, la capacidad y **el estado con color, forma y palabra** (la palabra siempre visible).
  - Mide al menos 88 × 88 px al 100%.
- **El lienzo:**
  - Es una grilla lógica fija (por ejemplo 24 × 16 celdas) que se escala al ancho del contenedor. Como las posiciones están en celdas, son iguales en todos los dispositivos.
  - El fondo es una trama de puntos en `surface-2`, un guiño al Active Dot, sin gradiente.
- **En el teléfono:** el plano se muestra completo y solo para servicio; la edición queda para la tablet o el escritorio.
- **Accesibilidad:**
  - En el DOM, las mesas son una lista de botones en orden de identificador, con `aria-label` "Mesa 04, 4 personas, Disponible".
  - En el modo de edición hay teclado y botones "Mover" en el inspector, como alternativa al arrastre que pide WCAG 2.5.7.
  - Los cambios se anuncian con un solo `role="status"`.

### Backend: el cambio mínimo para que el plano se comparta

Hoy la entidad `tables` no guarda posición (`table.entity.ts`), y `PATCH /tables/:id` rechaza los campos desconocidos. **Sin un cambio en el backend, el plano no se puede compartir entre usuarios ni dispositivos.** Guardarlo en el navegador quedaría solo en ese dispositivo: se descarta.

**Recomendación (opción A):**

1. **Una migración escrita a mano en `tables`:**
   - Agrega `plan_x smallint NULL` y `plan_y smallint NULL`, y opcionalmente `plan_shape varchar(10) NULL` con un check `IN ('square','round','rect')`.
   - Dos checks: "las dos coordenadas o ninguna" y el rango de la grilla.
2. **`TableResponseDto`** agrega `planX`, `planY` (y `planShape`), que son `null` mientras no estén ubicadas. Es un cambio aditivo: no rompe a nadie, y el móvil no usa `/tables`.
3. **Endpoint nuevo `PUT /v1/tables/plan`** con `{ tables: [{ id, x, y, shape? }] }`:
   - Guarda todo en una transacción.
   - Valida que las mesas sean del restaurante y que no haya dos en la misma celda.
   - Responde con la lista completa.
   - No escribe en la bitácora (igual que editar) ni emite `availability.changed`, porque la posición no cambia la disponibilidad.
4. **Concurrencia:** gana el último que guarda. Editar el plano es raro, y después de guardar la lista se vuelve a pedir.
5. **Lo que acompaña el cambio:** `docs/database.md`, Swagger y `AVISOS.md` en los tres repos; una línea en la sección 8 del `CLAUDE.md`, y la revisión de Elizabeth. Correr la migración en Neon necesita tu confirmación explícita.

**Alternativa (opción B):** una columna `restaurants.floor_plan jsonb`. Es un solo campo y un solo endpoint, pero no puede verificar que las mesas existan y al guardar sobrescribe el documento entero. Su ventaja es que más adelante admite zonas ("Salón", "Terraza") sin otra migración.

### Estado en vivo entre dispositivos

Decisión D5. La recomendación es consultar cada 15 s mientras la pestaña está visible. No cambia el backend ni cuesta nada, y la marca "Actualizado hace X s" con el `LiveIndicator` vuelve visible el tiempo real. El socket para `restaurant_admin` queda para después.

### Arrastre

Decisión D6. La recomendación es usar Pointer Events nativos con captura del puntero y teclado: no pesa nada y la grilla con ajuste es simple. La alternativa es `@dnd-kit/core`, que pesa 43,7 kB minificado (14,2 kB gzip), trae su sensor de teclado y ahorra trabajo si el plano crece.

---

## 8. Riesgos técnicos y archivos por fase

### Riesgos

| Riesgo | Mitigación |
|---|---|
| **Conflictos de merge.** El kit, `TablesPage` y `layouts.tsx` los usa todo el equipo | PR pequeños por fase; traer `develop` a diario; avisar en `AVISOS.md` **antes** de tocar archivos compartidos |
| **El v1.1 "manda" en el `CLAUDE.md` de los tres repos**, y sus secciones 1–10 deben ser iguales en todos | Cambiar el `CLAUDE.md` solo cuando el equipo apruebe el v2.0, en PRs del mismo día |
| **`check:ui` marca `rgba()` en `globals.css`** | Los valores de vidrio van como tokens en `tokens.css` (único archivo ignorado) y se actualiza el script |
| **`backdrop-filter` en tablets modestas** | Desenfoque solo en áreas pequeñas; medir con `animation-performance` |
| **View Transitions sin soporte en algún navegador** | Respaldo instantáneo |
| **Las 310 pruebas web se apoyan en roles y textos** | Conservar roles y textos; cada cambio de texto actualiza su prueba en el mismo PR |
| **Las skills escriben en el repo:** `.impeccable/` (hooks y critique), `.taste-skill/`, `plans/` | Redirigirlas a esta carpeta o al scratchpad (D10) |
| **Pantallas de otras personas:** `/restaurante` (Jacobo), `/bitacora` y el estado (Sergio), `/onboarding` (Santiago), login (Jacobo y Sebastián), auth móvil (Jacobo), Perfil móvil (Sergio) | D9 |

### Fases propuestas y archivos

| Fase | Qué | Archivos | Choque con el equipo |
|---|---|---|---|
| **F1** | Manual v2.0 (borrador) + tokens v2.0 propuestos. Sin código | `docs/renovacion-v2/DiNNo_Manual_Identidad_v2.0.md` | Ninguno |
| **F2** | Fundamentos web | **Tokens y estilos:** `src/styles/tokens.css` (solo agrega), `src/styles/globals.css`, `scripts/check-ui.mjs` <br>**Kit:** `src/components/ui/{Button,Dialog,ConfirmDialog,DropdownMenu,Toast,IconButton,Card,Skeleton,EmptyState}.tsx` y sus pruebas | Alto en alcance (todo usa el kit), bajo en diff. Es de Sebastián |
| **F3** | Shell y `/mesas` en cuadrícula v2.0 | **Shell:** `src/components/layout/*`, `src/app/layouts.tsx` (compartido) <br>**Kit:** `TableCard`, `StatTile`/franja, `FloatingBar` <br>**Mesas:** `src/features/tables/{TablesPage.tsx, components/*, hooks.ts}` y sus pruebas | Medio: `layouts.tsx` monta los slots de Sergio y Santiago |
| **F4** | Plano de mesas | **Backend:** migración, `table.entity.ts`, DTO, `tables.service.ts`, `tables.controller.ts`, specs, `docs/database.md` <br>**Web:** `features/tables/{types,api,api.mock,hooks}.ts`, `features/tables/plan/*` (nuevos), `TablesPage.tsx` | Backend: revisión de Elizabeth |
| **F5** | Resto de pantallas web | `features/restaurant/{RestaurantPage,OnboardingPage}.tsx`, `components/RestaurantForm.tsx`, `features/activity-log/*`, `features/restaurant-status/components/*`, `HoursEditor`, `DataTable`; login solo si se aprueba D8 | Alto: código de Jacobo, Sergio y Santiago |
| **F6** | Móvil v2.0 | `src/theme/tokens.ts`, `tailwind.config.js`, `src/components/ui/{Button,BottomSheet,FloatingSurface,Dialog,Toast}.tsx`, `src/app/(app)/(tabs)/index.tsx` (Explorar), `src/app/(app)/restaurante/[id].tsx`; auth (Jacobo) y Perfil (Sergio) con su revisión | Medio |
| **F7** | Pulido y QA | <br>**Repasos:** `impeccable audit` + `polish`, `taste inspect --app` antes y después, `ux-heuristics` (nuevo puntaje), `break-ui`, `review-animations` <br>**Documentación:** `CLAUDE.md` (tres repos, secciones 8 y 11), README, `AVISOS.md` | Bajo |

---

## 9. Decisiones que necesitan tu aprobación

Cada una tiene el problema, las alternativas y la recomendación. Las que bloquean la siguiente fase están marcadas.

| # | Problema | Alternativas | Recomendación |
|---|---|---|---|
| **D1** (bloquea F1) | Rama y número de sprint. El `CLAUDE.md` exige `<tipo>/sprint<N>-…` y tu prompt sugiere `feat/manual-v2` | a) `docs/sprint3-manual-v2` para el manual y después una rama por fase (`refactor/sprint3-fundamentos-v2`, `feat/sprint3-plano-mesas`…) · b) una sola `feat/manual-v2` | **a)**, desde `develop` actualizado; dime si es Sprint 3. La carpeta `docs/renovacion-v2/` está sin seguimiento en git, así que se pasa sola a la rama nueva |
| **D2** (bloquea F1) | Cómo se adopta el v2.0, si reemplaza al v1.1 que "manda" en los tres repos | a) El borrador lo revisa el equipo y después se cambian los `CLAUDE.md` · b) Se aplica sin revisión del equipo | **a)** |
| **D3** | Valores de opacidad del vidrio (decisión de color) | Los de la sección 5 o los tuyos | Panel 80% / 72%, barra 85%, desenfoque 20 / 16 px; el login queda igual |
| **D4** | Cómo guardar el plano | A) columnas en `tables` + `PUT /tables/plan` · B) `jsonb` en `restaurants` | **A con `x`, `y` y `shape`.** Necesita la revisión de Elizabeth y tu permiso para correr la migración |
| **D5** | Sincronizar el estado entre dispositivos | a) consultar cada 15 s · b) socket para `restaurant_admin` (cambio de backend) | **a) ahora, b) después** |
| **D6** | Librería de arrastre | a) Pointer Events nativos (0 kB) · b) `@dnd-kit/core` (14,2 kB gzip) | **a)**, sin dependencias nuevas |
| **D7** | El primario en la vista de servicio | a) "Agregar mesa" pasa a borde y no hay naranja relleno en servicio · b) queda primario, como ahora | **a)** |
| **D8** | Falla AA en el login (3,2:1 y 4,2:1) | a) corrección mínima: sin `opacity-70` y `fg/60` → `fg-2`; no cambia el diseño · b) no tocarlo | **a)**. Es técnica y no rediseña nada |
| **D9** | Pantallas de otras personas | a) Las adapto yo en PRs separados, con cada dueño como revisor y aviso previo · b) Entrego la guía y ellos las adaptan | **a)**, para que el resultado sea uniforme |
| **D10** | Archivos que crean las skills (`PRODUCT.md`, `DESIGN.md`, `.impeccable/`, `.taste-skill/`, `plans/`) | a) Nada en la raíz: el manual v2.0 es la fuente y los resultados van a esta carpeta · b) Crear `PRODUCT.md` y `DESIGN.md` en la raíz | **a)** |
| **D11** | Alcance móvil en esta renovación | a) Incluir F6 (con `expo-haptics` como dependencia propuesta) · b) Solo web por ahora | **a)**, porque la coherencia de marca necesita los dos productos |
| **D12** | ¿Se suben las capturas `capturas-v1/` (1,6 MB) al repo? | a) Sí, como referencia del "antes" · b) No | **a)** |

> **Parada obligatoria.** Este documento cierra la fase de auditoría. No sigo con nada hasta tu revisión.
