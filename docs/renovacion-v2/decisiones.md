# Renovación v2.0 · Registro de decisiones

> Lo más nuevo va arriba. Cada línea dice qué se decidió, quién y por qué. Orden de prioridad cuando dos skills chocan: **usabilidad real > identidad de DiNNo > consistencia > estética**.

## v2.1 "Salón de vidrio" (27 oct 2026, F8, pedido de Sebastián)

| # | Tema | Decisión | Por qué |
|---|---|---|---|
| V1 | El fondo | La luz del login (naranja arriba, petróleo abajo) en gradientes radiales enormes, sin `filter` y fijos. **Gesto propio:** con el restaurante cerrado la luz se apaga a gris | Lo pidió Sebastián ("el fondo del login muy difuminado"); además, el fondo informa el estado en lugar de solo decorar |
| V2 | Navegación | Riel flotante de vidrio petróleo, con ícono + palabra (no ícono solo) y la activa como píldora crema | "Sidebar creativo" sin perder el petróleo de la marca ni la regla de 9 (ícono siempre con texto) |
| V3 | Texto sobre la hoja | `--text-2` pasa a `--text-2-sheet` (tinta al 85%) sobre la hoja y vuelve dentro de las tarjetas | Medido: con la luz fuerte, `--text-2` sobre la hoja daba 3,0–3,5:1; ahora 5,4:1 o más |
| V4 | "Agregar mesa" | Vuelve a `primary`, a la derecha del saludo (primero estuvo en un dock de la página). Revierte D7 | Es la única acción naranja de la pantalla |
| V5 | Tarjetas sobre la hoja | Se aceptan (el detector las marca como `nested-cards`) | La hoja es el plano de trabajo, no una tarjeta; es la composición de la referencia |
| V6 | Tarjetas de mesa y nodos del plano | Siguen sólidos con su tinte, sin desenfoque | El estado se lee igual sobre cualquier luz, y 40 mesas no suman 40 desenfoques |
| V7 | Navegación (segunda ronda) | Un dock abajo, como el de macOS, en todos los tamaños; su vidrio sigue al tema. Reemplaza al riel lateral y al cajón | Pedido de Sebastián; además, una sola navegación en todos los tamaños |
| V8 | Dónde van los toasts | Arriba al centro, bajo la barra | Abajo vive el dock. Arriba a la derecha tapaban "Agregar mesa"; al centro caen en el espacio libre entre el saludo y las acciones |

## Decididas al implementar el plano (27 oct 2026, F4)

| # | Tema | Decisión | Por qué |
|---|---|---|---|
| P1 | El prompt pide "Lista / Distribución"; el manual aprobado dice "Plano · Cuadrícula" | Se conserva **Plano · Cuadrícula** | El manual es la fuente única, y la vista actual es una cuadrícula de tarjetas, no una lista. Cambiar los nombres es una línea en `TablesPage.tsx` si Sebastián lo prefiere |
| P2 | Con la celda de 32 px, "Disponible" se cortaba en un teléfono de 390 | Celda mínima de **36 px**; zoom de 36 a 72; al ajustar al ancho, de 36 a 56 | Regla fija: la palabra del estado siempre visible (medido en captura). Reemplaza el "32 a 56" de R14 |
| P3 | ¿La franja de resumen filtra en el plano? | En el plano **solo resume**; en la cuadrícula filtra | Ocultar mesas rompe la lectura espacial del salón, y atenuarlas exigiría opacidad (R7) |
| P4 | Botones `ghost` (texto naranja) sobre el vidrio del selector y de la barra flotante | Pasan a `outline` | El naranja sobre vidrio no cumple AA (R13, manual 7.3). Por la misma regla, la descripción de `FloatingBar` pasa de `fg-2` a tinta (R12) |
| P5 | "Rectangular" frente a "sin forma" | Elegir "Rectangular" guarda `null` (tamaño por capacidad) | Son el mismo tamaño; así volver a "Rectangular" no cuenta como un cambio sin guardar |
| P6 | El aviso "Reemplazó el que guardaron desde otro dispositivo" (13.10) | Antes de guardar, la web vuelve a leer `GET /v1/tables` (sin tocar la caché) y lo compara con el plano del que partió | Evita una columna de versión en el backend. Gana el último igual que antes; solo cambia el texto del aviso |
| P7 | ¿Quién valida que las mesas no se superpongan? | También el backend, con la misma tabla de tamaños (`table-plan.ts`) | Un cliente con errores no puede dejar un plano roto. Las pruebas de los dos lados fijan los mismos valores |
| P8 | Mesas que sobran o que no caben | "Quitar del plano" en el inspector, que la devuelve a "Sin ubicar" | Sin eso, una mesa en conflicto no tendría salida si el salón está lleno. Costo mínimo |
| P9 | Zonas, varios salones, paredes, evitar superposición | Solo se implementa **evitar la superposición** (al soltar, con el teclado, al guardar y en el backend). Zonas, salones y paredes quedan fuera | Superposición: es barato y evita planos rotos. Zonas o varios salones: piden otro modelo de datos (una tabla de salones o `restaurants.floor_plan jsonb`, la opción B de D4) y otra navegación, y el piloto son restaurantes de un solo salón. Paredes: decorativas, sin efecto en el servicio |

## Aprobadas por Sebastián (26 oct 2026)

| # | Decisión | Cómo se aplica |
|---|---|---|
| D1 | Ramas con la convención de siempre, `<tipo>/sprint2-<descripción>` (todas las ramas de GitHub son `sprint2-…`; el ejemplo con "sprint3" se tomó como errata) | El manual va en `docs/sprint2-manual-v2`, creada desde `develop` |
| D2 | Sebastián es el único que revisa y decide; no hace falta la revisión del equipo | Cuando Sebastián apruebe el manual, los `CLAUDE.md` de los tres repos, el README, `AGENTS.md` y `check:ui` pasan a apuntar al v2.0 |
| D3 | Vidrio: panel al 80% / 72%, barra al 85%, desenfoque de 20 / 16 px | Se ajusta después de verlo; la página `/sistema` tiene un control de opacidad para probarlo |
| D4 | Plano: columnas `plan_x`, `plan_y` y `plan_shape` en `tables` + `PUT /v1/tables/plan` (opción A) | Cambio de backend aprobado; correr la migración en Neon sigue necesitando confirmación |
| D5 | El estado entre dispositivos debe ser "inmediato" | **Cambia la recomendación:** socket del mismo Socket.IO para `restaurant_admin`, en una sala por restaurante, con eventos de mesas; consulta cada 30 s solo como respaldo mientras está desconectado. Cambio de backend aprobado |
| D6 | Arrastre de mesas en el plano | Pointer Events nativos, sin dependencia nueva, con teclado como alternativa (WCAG 2.5.7) |
| D7 | En la vista de servicio, "Agregar mesa" pasa a botón de borde | — |
| D8 | Corregir el AA del login | Solo contraste, sin rediseño. Si una forma de marca queda detrás de un texto, sube la opacidad del vidrio en esa zona (se le muestra antes a Sebastián) |
| D9 | Las pantallas de otras personas las adapto yo, y creo las que falten | — |
| D10 | `PRODUCT.md` / `DESIGN.md` solo si el equipo los necesita | El equipo no usa Impeccable: su fuente es `CLAUDE.md` / `AGENTS.md` y el manual, así que esos archivos quedan fuera del repo |
| D11 | Alcance según el prompt: se pueden modificar la web y el móvil | El móvil entra en la renovación |
| D12 | Las capturas se suben si las demás están en el repo | `docs/mockups/` y `docs/qa/evidencias/` están versionadas, así que `capturas-v1/` se sube con el primer commit autorizado y se borrará después |

## Decididas al escribir el manual v2.0 (26 oct 2026)

| # | Tema | Decisión | Por qué |
|---|---|---|---|
| R10 | El detector de Impeccable marca el rayado de "Ocupada" como adorno (`repeating-stripes-gradient`) | Se conserva: es la forma "cuadrado rayado" del vocabulario de estados llevada a la tarjeta | Usabilidad (estado legible sin color) > aviso de estética |
| R11 | Borde de selección: el naranja `#F46935` da 2,84:1 contra el crema | En claro, `--selection` = naranja presionado `#DB5626` (3,35–3,91:1); en oscuro, naranja noche | AA para componentes (≥ 3:1), sin color nuevo |
| R12 | El texto secundario sobre vidrio falla el AA con lo peor detrás | Sobre vidrio, todo el texto va en tinta o crema | Medido (manual 2.3) |
| R13 | Los enlaces naranja del login fallan donde una forma de marca pasa detrás, incluso con el vidrio al 75% | Naranja solo sobre crema; sobre una forma, enlace en tinta subrayado (aplica D8) | Medido; el texto en tinta pasa siempre |
| R14 | Plano: con 24 columnas y mesas de 2 × 2, la palabra del estado no cabía a 1024 px con sidebar (~712 px) | Grilla de 20 × 14 (crece hasta 30 filas) y mesas de al menos 3 celdas de ancho; celda de 32 a 56 px (**ajustada a 36 en P2**) | Regla fija: la palabra del estado siempre visible. **Para el backend (D4):** `plan_x` de 0 a 19 y `plan_y` de 0 a 29 |
| R15 | El "Reactivar" de la tarjeta inactiva estiraba su fila y cortaba "Inactiva" | Tocar la mesa inactiva abre su selector con "Reactivar mesa" (también en ⋯) | Mismas alturas y la palabra completa |
| R16 | Tintes de estado en oscuro al 18%: el texto secundario quedaba en 4,47:1 | 12% en claro y 14% en oscuro | Medido |

## Decididas (26 oct 2026, fase de auditoría)

| # | Choque o tema | Decisión | Regla que la resuelve |
|---|---|---|---|
| R1 | Taste prohíbe el vidrio y los gradientes, y el brief pide vidrio inspirado en el login | El vidrio se usa en la capa flotante, con criterio y con respaldos. Al inspector de Taste se le pasa `--allow` con esas reglas | Identidad > estética |
| R2 | Taste veta el crema con terracota ("paleta de asistente") y Impeccable marca `cream-palette` | La paleta queda intacta; esos avisos se ignoran a propósito | Identidad (fijada por Sebastián) |
| R3 | Impeccable marca Plus Jakarta Sans como `overused-font` | Se conserva. Cambiar la familia necesita aprobación y no hay razón de usabilidad | Identidad |
| R4 | Taste veta el sidebar oscuro sobre una pantalla clara | El sidebar petróleo se conserva (el 19% petróleo de la marca) y se refina | Identidad > estética |
| R5 | Taste pide encabezados en mayúscula inicial y el manual usa una etiqueta de 11 px en mayúsculas | Propuesta: encabezados y etiquetas a 12 px con mayúscula inicial; las mayúsculas quedan para un solo *kicker* | Usabilidad (legibilidad) |
| R6 | Emil e Impeccable: reducir movimiento significa movimiento suave, no ninguno. El manual 13 dice "estado final" | Propuesta: sin traslación ni escala, pero con los fundidos de opacidad y color de 150 ms o menos | Usabilidad (a11y) |
| R7 | El manual 3.2 pide la mesa inactiva al 55% y eso rompe AA | Se elimina la opacidad; quedan el borde punteado, `fg-2` y la raya | Usabilidad (AA) |
| R8 | `critique` de Impeccable exige subagentes y escribe en `.impeccable/` | En la auditoría se usaron el detector y la rúbrica de `audit`, sin `critique` | Restricción de la fase (solo `docs/renovacion-v2/`) |
| R9 | `--design-system` de UI UX Pro Max propondría otra paleta | No se usa; solo consultas por dominio (`ux`, `style`, por stack) | Identidad |

## Pendientes de aprobación

Las decisiones D1 a D12 están en [`01-diagnostico.md`, sección 9](01-diagnostico.md#9-decisiones-que-necesitan-tu-aprobación). Cuando Sebastián responda, se pasan aquí con su fecha.
