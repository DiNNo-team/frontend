# DiNNo · Manual de identidad v2.0 (26 oct 2026)

> **Fuente única de diseño para el equipo.** Reemplaza al [v1.1](DiNNo_Manual_Identidad_v1_1.md), que queda como histórico. Si una decisión visual no está aquí, se pregunta a Sebastián antes de inventarla.
> **Marca:** DiNNo · **Promesa:** "Dile no a la espera." · **Función:** "Encuentra una mesa disponible ahora y asegúrala mientras llegas."
> **Revisión del 26 oct 2026 (Sebastián):** vidrio de panel al 50%; tintes de estado más fuertes (18% / 22%) con borde en el color del estado; `expo-haptics` y `expo-blur` aprobados.
> **v2.1 "Salón de vidrio" (27 oct 2026, Sebastián):** el dashboard deja el fondo plano y pasa a vivir sobre la luz del login: fondo de luz difusa que se apaga al cerrar, la hoja de vidrio centrada con tarjetas encima, barra superior en píldora, saludo grande y la navegación en un **dock abajo, como el de macOS**. Cambian 7, 8, 12, 13.5, 13.8, 13.10 y 16; el resumen está en la sección 20.
> **Cierre del 27 oct 2026:** el manual describe lo implementado en la web, la app y el plano de mesas. Lo que todavía no existe está marcado como *propuesta futura* y reunido en la sección 19.
> Aplica a la web del restaurante (React + Tailwind v4) y a la app del comensal (Expo + NativeWind). La coherencia entre los dos productos es **de marca** (color, tipografía, forma, movimiento), no de pantallas: cada uno responde a un usuario distinto.

## Instrucción para quien programe o use IA

Antes de generar cualquier pantalla o componente, respeta este documento completo.

1. **Solo tokens:** nada de colores, radios, sombras, opacidades ni tamaños sueltos. En Tailwind, las clases que salen de los tokens; nada de `bg-[#...]`, `text-fg/60` ni `rounded-[...]` (sección 16).
2. **Solo el kit:** las pantallas se construyen con `src/components/ui` (sección 12). Si falta una pieza, se crea en el kit siguiendo la sección 17.
3. **El estado se comunica con color, forma y palabra.** Nunca solo con color.
4. **Nada de íconos de comida** ni pins genéricos. Íconos: solo Lucide.
5. **Textos en español**, tuteando y con el glosario (sección 14).
6. **Checklist antes del merge** (sección 17.4).

## Índice

0. Principios y siete reglas · 1. Logo · 2. Color · 3. Estados · 4. Tipografía · 5. Espaciado, tamaños y breakpoints · 6. Forma y elevación · 7. Superficies, transparencias y vidrio · 8. Gradientes · 9. Iconografía · 10. Modo oscuro · 11. Motion · 12. Componentes · 13. Patrones · 14. Contenido y tono · 15. Accesibilidad · 16. Tokens · 17. Reglas para el equipo y checklist · 18. Cambios desde v1.1 · 19. Propuestas futuras · 20. v2.1 "Salón de vidrio"

---

## 0. Principios y siete reglas

**Idea del v2.0: "Capas de servicio".** Un restaurante en servicio funciona por capas: el salón es el suelo, las mesas están encima y lo que está pasando ahora flota. El producto se arma igual:

- **Crema = suelo.**
- **Superficie sólida = el trabajo.**
- **Vidrio = lo que flota y está vivo.**

El login ya cuenta esa historia. El dashboard la hereda con contención, porque es una herramienta.

### Principios

1. **El estado manda.** Lo primero que se ve de una mesa es su estado.
2. **Capas con propósito.** Hay tres niveles de elevación (sección 6) y cada uno tiene su material. Nada flota sin razón.
3. **La marca vive en los bordes de la experiencia.** Gradientes, vidrio fuerte y el Active Dot animado aparecen en el login, la carga, el primer uso y los cierres. Las pantallas de trabajo son calmadas.
4. **El movimiento explica.** Se anima un cambio de estado, el origen de algo o la respuesta a un toque. Nada se mueve por adorno.
5. **Densidad honesta.** Pensado para la tablet del salón: objetivos de 44 px, datos reales, ceros como ceros y "Actualizado" siempre visible.
6. **Un objeto propio.** El plano de mesas y el Active Dot son lo que ningún otro producto tiene. Se cuidan más que cualquier adorno.

### Siete reglas

1. **Crema manda.** Cada pantalla es ~72% crema/blanco, ~19% petróleo, ~9% naranja.
2. **Naranja = acción, selección o "ahora".** Nunca un estado, nunca un fondo de pantalla, y **no se gasta en acciones raras** (por ejemplo, "Agregar mesa" durante el servicio).
3. **El texto nunca pierde opacidad.** El naranja como texto sobre claro es `#B83F14` (`--accent-text`), al 100%. Los textos secundarios usan `--text-2`, no tinta transparente.
4. **Estado = color + forma + palabra.** Nunca solo color.
5. **Vidrio solo en la capa flotante** y nunca debajo de datos (sección 7).
6. **Gradiente solo en momentos de marca** (sección 8). Nunca detrás de tablas, listas, formularios o métricas.
7. **El Active Dot indica información viva:** hay mesa, corre el tiempo, "En vivo", restaurante abierto. No decora.

---

## 1. Logo

Igual que el v1.1.

- **Nombre:** "Di" en tinta, "NNo" en naranja. La **i es un pin de contorno con el Active Dot (naranja) adentro**, sobre un pie redondeado.
- **Fondo oscuro:** "Di" y el pin pasan a crema; "NNo" y el punto van en naranja noche (`#FF8456`).
- **Símbolo:** el pin con el punto, solo. **Ícono de la app:** tile petróleo `#103B46`, pin crema y punto naranja. Variantes: tile crema (pin tinta) y tile naranja (pin petróleo, punto crema). En las tiendas se entrega sin bordes.
- **Espacio libre:** el ancho del pin (≈ 0,3 × la altura del nombre) por todos lados.
- **Mínimos:** nombre de 72 px de ancho en pantalla (25 mm impreso); símbolo de 16 px. Por debajo de 24 px se quita el halo de las ondas.
- **Dónde va:**
  - **Web:** arriba del sidebar (versión oscura, 96 px), en el login y como favicon.
  - **Móvil:** en el login y en la pantalla de carga.
  - No se repite dentro del contenido.
- **Archivos:** `src/assets/brand/` (web) y `src/components/ui/Brand.tsx` + `brand-paths.ts` (móvil). Nunca se recrea el logo con texto o emoji.
- **No hacer:**
  - Cambiar sus colores.
  - Añadir cubiertos, platos, relojes o pins genéricos.
  - Sombras, brillos, 3D o gradiente en las letras.
  - Naranja brillante como texto pequeño.
  - Animarlo en pantallas de uso frecuente (solo en la carga y el splash).

---

## 2. Color

**La paleta es la misma del v1.1, sin un solo color nuevo.** El v2.0 solo agrega **mezclas** de esos colores (tintes de estado y vidrio, sección 16). Cualquier valor que no salga de esta tabla o de una mezcla documentada necesita la aprobación de Sebastián.

### 2.1 Paleta base

| Nombre | Hex | Uso |
|---|---|---|
| Naranja DiNNo | `#F46935` | Acción principal, pin activo, punto vivo, cifra "lo próximo" (5–10%) |
| Naranja profundo | `#B83F14` | Texto y enlaces naranja sobre claro (5,2:1) |
| Naranja noche | `#FF8456` | El naranja en modo oscuro y sobre petróleo; borde de selección en oscuro |
| Ámbar | `#F7A43B` | Final del gradiente naranja |
| Naranja presionado | `#DB5626` | Botón primario presionado; **borde de selección en claro** (3,4–3,9:1, sección 2.3) |
| Petróleo profundo | `#103B46` | Marca, sidebar, superficies oscuras, toasts (15–20%) |
| Petróleo medio | `#1D5661` | Ítem activo del sidebar, info |
| Petróleo noche | `#0B2D36` | Fondo en modo oscuro, inicio del gradiente |
| Crema | `#FAF7F1` | Fondo de la app (70–75%) |
| Crema 2 | `#F2EFE8` | Superficie secundaria: controles segmentados, skeletons, lienzo del plano |
| Blanco | `#FFFFFF` | Tarjetas, hojas, campos |
| Tinta | `#10252B` | Texto principal (14,9:1 sobre crema) |
| Texto secundario | `#5E6B70` | Metadatos, ayudas (5,2:1 sobre crema) |
| Borde | `#E2E6E3` | Divisores y contornos de tarjetas |
| Borde fuerte | `#8A9699` | Contorno de campos, switch apagado (3,0:1 sobre blanco) |

Los colores de estado y de feedback, con sus variantes oscuras, están en la sección 3.

### 2.2 Proporciones y jerarquía

- **Una sola acción naranja por contexto.** El naranja también marca **lo seleccionado** (el borde de la mesa elegida) y el punto vivo.
- **Color en los datos, no en el chrome.** Los estados de las mesas son el color de la pantalla. Botones, pestañas y navegación son neutros, salvo el ítem activo del sidebar.
- **Los estados tienen su gama propia** y nunca se mezclan con la marca: ninguna mesa ni chip de estado es naranja.

### 2.3 Contrastes verificados

Los del v1.1 se mantienen. Estos son los nuevos del v2.0, medidos con la fórmula WCAG 2.x:

| Combinación | Claro | Oscuro | Uso |
|---|---|---|---|
| Tinta sobre tinte de estado (18% claro / 22% oscuro) | 12,4–12,8:1 | 7,7–8,1:1 | Texto de la tarjeta y del nodo de mesa |
| Texto secundario sobre tinte de estado | ✗ (bajo 4,5:1) | ✗ | **Prohibido:** sobre un tinte, todo el texto va en tinta o crema (sección 3.6) |
| Forma de estado sobre su tinte | 3,3–4,0:1 | 3,2–3,5:1 | Forma de 10 px en la tarjeta |
| Tinta sobre tinte "Ocupada" con rayado (20%) | 10,4:1 | 6,3:1 | Tarjeta ocupada |
| Borde de selección (`#DB5626` / `#FF8456`) contra tarjeta, tinte y fondo | 3,1–3,9:1 | 3,4–6,0:1 | Mesa seleccionada (no texto, ≥ 3:1). Por eso el tinte no pasa del 18% / 22%: más fuerte, la selección baja de 3:1 |
| Tinta sobre vidrio de panel (50%) con lo peor detrás | ≥ 4,99:1 | ≥ 4,7:1 sobre mesas y naranja; 2,8:1 si detrás hay una superficie crema maciza | Inspector, selector de estado. En oscuro, el panel nunca se abre sobre un botón crema |
| **Texto secundario sobre vidrio** | 3,6–4,4:1 ✗ | 2,6–4,2:1 ✗ | **Prohibido:** sobre vidrio, todo el texto va en tinta o crema |
| Naranja profundo sobre `surface-2` | 4,9:1 | — | Enlaces sobre superficie secundaria |
| Naranja noche sobre `surface-2` (oscuro) | — | 4,2:1 ✗ | **Prohibido** como texto; en oscuro, el texto naranja va sobre `bg` o `surface` |
| Naranja sobre crema | 2,8:1 ✗ | — | Solo formas grandes, nunca texto (igual que el v1.1) |

**Sí:**
- Texto oscuro sobre los botones naranja.
- Naranja para marcar lo seleccionado.
- Tinta plena sobre el vidrio.

**No:**
- Texto blanco sobre naranja.
- Naranja para un estado.
- Bajar la opacidad de un texto para "suavizarlo".

---

## 3. Estados

Cada estado usa **color + forma + palabra**. Las formas y los colores no cambian respecto al v1.1; lo nuevo es **cómo se presentan** según el tamaño del objeto (3.6).

### 3.1 Formas de estado

| Forma | Significa |
|---|---|
| Punto circular | Disponible / Abierto |
| Rombo | Pocas mesas (disponibilidad del restaurante) |
| Cuadrado | Reservada |
| Cuadrado rayado | Ocupada / Sin mesas |
| Raya horizontal (—) | Inactiva / Cerrado |
| Punto + ícono de alerta | Error |

### 3.2 Estado de una mesa (dashboard)

| Estado | Claro | Oscuro | Forma | Token | Superficie de la tarjeta |
|---|---|---|---|---|---|
| Disponible | `#2B8F62` | `#3FBF86` | punto | `--ok` | Tinte `--tint-ok` + borde `--edge-ok` |
| Reservada | `#4E66C9` | `#8DA2F0` | cuadrado | `--reserved` | Tinte `--tint-reserved` + borde `--edge-reserved` |
| Ocupada | `#6E7C80` | `#8DA0A4` | cuadrado rayado | `--busy` | Tinte `--tint-busy` + borde `--edge-busy` + rayado `hatch-busy` |
| Inactiva | `#8A9699` | `#6F8C92` | raya (—) | `--inactive` | **Sin tinte:** borde punteado de 1,5 px `--border-strong` y texto `--text-2` (5,2:1). **Ya no se baja al 55%**: rompía el AA |

- El estado se cambia con el **selector de estado** (13.10) o con los atajos D, R y O. "Inactiva" no está en el selector: se llega con "Desactivar mesa" y se sale con "Reactivar".
- Cada cambio queda en la bitácora.

### 3.3 Estado operativo del restaurante

| Estado | Color | Forma | Palabra | Dónde |
|---|---|---|---|---|
| Abierto | `--ok` | punto con Active Dot (pulso) | "Abierto" | Switch del topbar |
| Cerrado | `--inactive` | raya (—) | "Cerrado" | Switch del topbar + banner |

Cuando está cerrado, arriba del contenido aparece un `Alert` info: *"Tu restaurante está cerrado. Los comensales no lo ven en DiNNo."* con el botón secundario **"Abrir ahora"** (en servicio es la acción más fuerte de la pantalla, porque "Agregar mesa" va de borde). Cerrar con mesas reservadas pide confirmación; sin reservas, cierra de una vez y ofrece "Deshacer".

### 3.4 Disponibilidad del restaurante para el comensal

| Estado | Claro | Oscuro | Forma | Palabra |
|---|---|---|---|---|
| Disponible | `#2B8F62` | `#3FBF86` | punto | "Disponible" |
| Pocas mesas | `#B7801F` | `#E0A93B` | rombo | "Pocas mesas" |
| Sin mesas | `#6E7C80` | `#8DA0A4` | cuadrado rayado | "Sin mesas ahora" |
| Cerrado | `#8A9699` | `#6F8C92` | raya (—) | "Cerrado" |

### 3.5 Feedback del sistema

| Tipo | Claro | Oscuro | Ícono Lucide | Uso |
|---|---|---|---|---|
| Éxito | `--ok` | `#3FBF86` | `circle-check` | Se guardó, se creó, se cambió |
| Info | `--info` `#1D5661` | `#7FC1CB` | `info` | Contexto neutro |
| Advertencia | `--limited` `#B7801F` | `#E0A93B` | `triangle-alert` | Requiere atención, no falló |
| Error | `--error` `#C8453A` | `#FF7B6E` | `circle-alert` | Falló: ícono + texto + cómo arreglarlo |

### 3.6 Tres tamaños para mostrar un estado

| Tamaño | Dónde | Cómo |
|---|---|---|
| **Chip** (`StatusChip`) | Tablas, bitácora, listas del comensal | Pastilla de 24 px, fondo del color al 15%, forma de 8 px + palabra de 12/16 700 en tinta |
| **Línea de estado** | Dentro de tarjetas teñidas, filas e inspector | Forma de 10 px en el color + palabra de 14/20 700 en tinta, sin pastilla. La superficie ya lleva el color, así que el chip sobraría |
| **Superficie de estado** | Tarjeta y nodo de mesa | Toda la superficie lleva el tinte del estado (18% / 22%) y un borde de 1 px en el color del estado (45% / 50%), para que la mesa se separe del fondo crema y del lienzo del plano. La forma y la palabra siguen presentes (la superficie no reemplaza a la palabra) |

**Sobre una superficie teñida, el texto secundario va en tinta**, con menor tamaño o peso, no en `--text-2`. Así el contraste nunca queda al límite.

---

## 4. Tipografía: Plus Jakarta Sans

Una sola familia, con pesos 500, 700 y 800. **Cambiar la familia requiere la aprobación de Sebastián.** El v2.0 ajusta la escala al uso de producto: títulos más contenidos y nada por debajo de 12 px.

| Rol | Tamaño / alto | Peso | Tracking | Clase (web) / variante (móvil) | Uso |
|---|---|---|---|---|---|
| Display | 48/52 | 800 | −3% | `text-display` | Solo momentos de marca: carga, login, cierre del registro |
| Título 1 | **28/32** | 800 | −2,5% | `text-h1` | Título de página |
| Título 2 | **22/28** | 700 | −1,5% | `text-h2` | Título de sección, diálogo grande |
| Título 3 | 18/24 | 700 | −1% | `text-h3` | Tarjeta, grupo de formulario, diálogo, nombre de mesa |
| Cuerpo | 16/24 | 500 | 0 | `text-body` | Texto general, valor de campos |
| Secundario | 14/20 | 500 | 0 | `text-sec` | Metadatos, ayudas, celdas |
| Etiqueta | **12/16** | 700 | +1% | `text-label` | Encabezados de tabla, etiquetas de métricas, grupos. **Con mayúscula inicial** |
| Kicker | 11/14, mayúsculas | 700 | +8% | `text-kicker` | Como máximo una por pantalla (la etiqueta de 11 px del v1.1) |
| Cifra de métrica | **28/32**, tabular | 800 | −3% | `text-metric` | Franja de métricas del dashboard |
| Cifra | 54/54, tabular | 800 | −4% | `text-figure` | Solo el temporizador y los números protagonistas de marca |
| Botón | 15/20 | 700 | 0 | `text-btn` / `button` | Texto de botón |
| Etiqueta de campo | 14/20 | 700 | 0 | `text-sec font-bold` / `fieldLabel` | Label de campos |

- **Mínimo absoluto: 12 px.** La única excepción es el kicker de 11 px.
- Los párrafos llevan `text-wrap: pretty`, para que ninguna palabra quede sola en la última línea. Los títulos llevan `text-wrap: balance`.
- Como máximo tres tamaños por pantalla, sin contar etiquetas ni kicker.
- Números que cambian, siempre con `tabular-nums`.
- Carga:
  - **Web:** `@fontsource/plus-jakarta-sans` (500/700/800) en `main.tsx`.
  - **Móvil:** incrustada con el plugin de `expo-font`.
  - **Respaldo:** `system-ui, sans-serif`.
- **No:** otra familia, cursivas, pesos ≤ 300, párrafos largos ni TODO EN MAYÚSCULAS fuera del kicker.

---

## 5. Espaciado, tamaños y breakpoints

### 5.1 Espaciado

Escala de 4 puntos: **4 · 8 · 12 · 16 · 24 · 32 · 48** (`--s-1` … `--s-7`, que en Tailwind son `1 · 2 · 3 · 4 · 6 · 8 · 12`).

| Contexto | Valor |
|---|---|
| Dentro de un control (ícono ↔ texto) | 8 |
| Entre filas de una lista o tarjetas de una grilla | 12 |
| Padding de tarjeta | 16 en móvil · 24 desde 768 |
| Entre grupos de un formulario | 24 |
| Entre secciones de una página | 32 |
| Margen de pantalla móvil | 16 |
| Margen de contenido web | 16 (< 768) · 24 (768–1023) · 32 (≥ 1024) |

### 5.2 Tamaños

| Elemento | Tamaño |
|---|---|
| Objetivo táctil mínimo | 44 × 44 (también en web: el dashboard se usa en tablet) |
| Botón | 48 (`md`) · 40 (`sm`, solo con puntero fino: tablas y barras de escritorio) · 44 (`float`, sobre el mapa) |
| Campo | 48 |
| Fila de tabla | 52 |
| Ítem de menú | 40 con puntero fino · 44 en táctil (web) · 48 (móvil) |
| Topbar web / sidebar | 64 de alto / 248 de ancho |
| Tarjeta de mesa | mínimo 168 de ancho; todas las de una grilla, de la misma altura |
| Nodo del plano | celda de 36 a 72 px (36 a 56 al ajustar al ancho); una mesa ocupa como mínimo 3 celdas de ancho, para que la palabra del estado siempre quepa |
| Anchos máximos | contenido 1200 · formulario 560 · diálogo 480/560 · toast 400 · estado vacío 360 · selector de estado 260 |

### 5.3 Breakpoints

Los de Tailwind: `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280.

- **Web:** se diseña primero para **1024 (tablet horizontal, el dispositivo del salón)** y se verifica en 1280, 768 y 390.
- **Móvil:** se diseña para 390 y se verifica en 360 (Android pequeño) y 430.

| Rango | Dashboard |
|---|---|
| ≥ 1024 | Sidebar fijo; plano editable; el selector de estado es un popover junto a la mesa |
| 768–1023 | Sidebar en drawer; plano editable en horizontal; popover |
| < 768 | Drawer; métricas en 2 × 2; abre en Cuadrícula. El plano es solo para servicio: se desplaza dentro de su marco (celda de 32 px) y la página nunca se desborda de lado. El selector de estado es una hoja inferior |

---

## 6. Forma y elevación

### 6.1 Radios

Iguales al v1.1, más una regla: **los radios son concéntricos**. El radio interno es igual al radio externo menos el padding.

| Elemento | Radio | Token |
|---|---|---|
| Tarjeta, diálogo, panel flotante | 20 | `--r-card` |
| Tarjeta compacta, mesa, métrica, selector de estado | 16 | `--r-tile` |
| Botón, alerta, toast | 14 | `--r-btn` |
| Campo, ítem de menú, segmento | 12 | `--r-input` |
| Hoja inferior | 28 arriba | `--r-sheet` |
| Chip, switch, pastilla | 999 | `--r-chip` |

### 6.2 Bordes

| Borde | Ancho | Color |
|---|---|---|
| Fino (tarjetas, tablas, divisores) | 1 | `--border` |
| Campo | 1,5 | `--border-strong` |
| Selección | 2 | `--selection` (`#DB5626` en claro, `#FF8456` en oscuro) |
| Inactiva / pendiente / zona de soltar | 1,5 punteado | `--border-strong` |

### 6.3 Elevación: tres niveles más el suelo

| Nivel | Qué es | Material | Ejemplos |
|---|---|---|---|
| **0 · Suelo** | El fondo | `--bg` | Página |
| **1 · Superficie** | El trabajo, en reposo | `--surface` + borde fino, **sin sombra** | Tarjetas, tablas, formularios, franja de métricas, tarjetas de mesa |
| **2 · Levantado** | Algo que se toca o está elegido | Nivel 1 + `--shadow-soft` | Hover de una mesa, mesa seleccionada, mesa que se arrastra |
| **3 · Flotante** | Lo que flota sobre el contenido | Vidrio de panel o `--surface` + `--shadow-float` | Selector de estado, inspector, barras flotantes, menús, toasts, diálogos, hojas, controles sobre el mapa |

- **En reposo, una tarjeta lleva borde o sombra, no los dos.** La sombra es para lo que se levanta o flota.
- **Sin tarjeta dentro de tarjeta.**
- **Capas (z):**

  | Capa | z |
  |---|---|
  | `sticky` | 10 |
  | `dropdown` (también selector y popover) | 20 |
  | `drawer` | 30 |
  | `overlay` | 40 |
  | `modal` | 50 |
  | `toast` | 60 |

### 6.4 Sombras

Iguales al v1.1:

- `--shadow-soft` (nivel 2): `0 1px 2px rgba(16,37,43,.05), 0 10px 28px -12px rgba(16,37,43,.18)`.
- `--shadow-float` (nivel 3): `0 12px 32px -12px rgba(16,37,43,.28)`.
- En oscuro, la sombra cede ante un borde más visible.

---

## 7. Superficies, transparencias y vidrio

El vidrio es el material de la **capa flotante**. Se usa donde hay contenido detrás que conviene seguir viendo, y nunca donde hay que leer datos densos.

### 7.1 Los vidrios

| Vidrio | Fondo | Desenfoque | Dónde | Token / utilidad |
|---|---|---|---|---|
| **Panel** | `--surface` al 50% (claro y oscuro) | 20 px · saturación 1,4 | Selector de estado (≥ 768) y barra flotante de edición del plano (`FloatingBar`) | `--glass-panel-bg` · `glass-panel` |
| **Hoja** (v2.1) | `--surface` al 30% (claro) / 40% (oscuro) | 28 px · saturación 1,5 | La hoja de contenido del dashboard y del registro: todo lo de la página va encima | `--glass-sheet-bg` · `glass-sheet` |
| **Tarjeta** (v2.1) | `--surface` al 72% | 16 px · saturación 1,3 | Tarjetas sobre la hoja: `Card`, las del resumen, los paneles del plano | `--glass-card-bg` · `glass-card` |
| **Píldora** (v2.1) | `--surface` al 64% (claro) / 70% (oscuro) | 20 px | La barra superior y la barra de edición del plano | `--glass-pill-bg` · `glass-pill` |
| **Dock** (v2.1) | Claro: el vidrio de píldora · oscuro: petróleo noche al 76%; con un brillo naranja que sube desde abajo | 24 px | El dock de navegación. **Sigue al tema** | `--dock-bg` · `glass-dock` |
| **Barra** | `--bg` al 85% | 16 px | Sin uso desde v2.1 (la barra superior es una píldora); se conserva para otras barras | `--glass-bar-bg` · `glass-bar` |
| **Mapa** | `--surface` al 70% (claro) / 62% (oscuro) | 16 px (web) · intensidad 40 (móvil) | Lo que flota sobre el mapa del comensal (solo móvil) | `--glass-bg` · móvil: `glassBg` en `GlassSurface level="map"` |
| **Login** | Web: `--surface` al 55% · móvil: velo `glassPanel` al 50% | Web: 44 px · móvil: intensidad 70 | Solo la tarjeta del login web y su equivalente en el móvil | `glass-login` · móvil: `GlassSurface level="login"` |

### 7.2 Cuándo sí y cuándo no

| ✓ Sí | ✗ No |
|---|---|
| v2.1: la hoja de contenido y sus tarjetas (con el texto en las reglas de 7.3) | Detrás de las tarjetas de mesa: van sólidas, con su tinte, para que el estado se lea igual sobre cualquier luz |
| El selector de estado junto a una mesa y la barra de edición del plano | En botones o en chips de estado |
| El dock de navegación y la barra superior en píldora | En un diálogo modal: tiene su propio overlay y va sólido |
| Los controles sobre el mapa del comensal | En toasts y errores (sólidos, para que se lean al instante) |
| La tarjeta del login, sobre las formas de marca | Para "dar estilo" a una pantalla floja |

### 7.3 Reglas del texto sobre vidrio

- **Todo el texto va en tinta (claro) o crema (oscuro).** El texto secundario se diferencia por tamaño o peso, no por color: `--text-2` sobre vidrio falla el AA (sección 2.3).
- **v2.1, sobre la hoja:** `--text-2` pasa solo a `--text-2-sheet` (tinta al 85%, 5,4:1 con la luz más fuerte detrás) y vuelve a su valor dentro de una tarjeta (`glass-card`, `bg-surface`). Sobre una tarjeta al 72%, `--text-2` da 4,7:1 o más.
- **Enlaces naranja sobre vidrio, solo donde el fondo es crema.** Si una forma de marca queda detrás de un enlace, el enlace va en tinta subrayado.
- Si lo que pasa por detrás es muy cargado (el mapa con mucho detalle), el velo es más denso que el del panel: 70% en claro y 62% en oscuro. En Android, sobre el mapa, va sólido (7.4).

### 7.4 Respaldo sólido, siempre

El mismo elemento pasa a `--surface` con borde fino y `--shadow-float` cuando:

- El navegador no soporta `backdrop-filter`.
- La persona pide **reducir la transparencia** (`prefers-reduced-transparency`).
- La persona pide **más contraste** (`prefers-contrast: more`). En ese caso además lleva `--border-strong`.
- Es Android sobre el mapa: el desenfoque no puede leer la superficie del mapa, así que va sólido, como hoy.
- Es Android sin `BlurTargetView` (fuera del login, sección 13.9): se usa el respaldo sólido al 92%.

**Rendimiento:** el desenfoque nunca se anima. Desde v2.1 la hoja desenfoca un área grande, pero es una sola capa sobre un fondo estático (la luz son gradientes, sin `filter`); las tarjetas de mesa y los nodos del plano son sólidos, así que 40 mesas no suman 40 desenfoques.

---

## 8. Gradientes

Siguen siendo **solo dos**, construidos con colores de la paleta:

- **Petróleo:** `linear-gradient(150deg, #0B2D36 0%, #12505A 60%, #1C6A6E 100%)` (`--grad-petrol`).
- **Naranja:** `linear-gradient(135deg, #F46935 0%, #F7A43B 100%)` (`--grad-orange`, con texto en tinta).

| ✓ Sí | ✗ No |
|---|---|
| Login (panel de marca) · pantalla de carga · splash | Detrás de tablas, dashboard, listas, formularios o métricas |
| **Cierre del registro** ("Tu restaurante está listo") | En botones, el sidebar o los chips |
| **Primer uso del plano** (ilustración del lienzo vacío) | Más de uno por pantalla |
| Estados vacíos grandes de la app del comensal | Para rescatar un diseño flojo |
| Barra del temporizador · resplandor del Active Dot | — |

**Uso actual:**
- El panel de marca del login web (`--grad-petrol`).
- **v2.1 · La luz del salón** (`AmbientGround`): las dos formas del login convertidas en luz. Son gradientes radiales enormes de naranja, ámbar y petróleo, sin borde que se lea como círculo, fijos detrás de todo el dashboard. Con el restaurante cerrado se apagan a gris en `--dur-highlight`.
- **v2.1 · El avatar de la cuenta** (`--grad-highlight`): petróleo → verde de la marca, con la inicial en crema.
- **v2.1 · El brillo del dock:** un resplandor naranja que sube desde abajo.

Las demás filas de "✓ Sí" son usos permitidos que todavía no existen *(propuesta futura, sección 19)*. El arranque del móvil va sobre un color sólido (13.6).

**Patrones (no son gradientes):** el rayado de "Ocupada" (`hatch-busy`) y la trama de puntos del lienzo del plano (`plan-canvas`) usan funciones de gradiente de CSS, pero son **texturas de la forma**, no adornos. El rayado es el "cuadrado rayado" del vocabulario de estados (3.1) llevado a toda la tarjeta. No cuentan como gradiente ni se usan fuera de su caso. El detector de Impeccable los marca como adorno (`repeating-stripes-gradient`); es un aviso aceptado.

---

## 9. Iconografía: Lucide

- **Librería única:** `lucide-react` (web) y `lucide-react-native` (móvil). Sin emojis ni otras librerías.
- **Tamaños:** 16 (chips, texto secundario), 20 (botones, campos, sidebar), 24 (acciones sueltas). En los estados vacíos va el símbolo de DiNNo, no un ícono gigante.
- **Trazo:** `strokeWidth={1.75}`, color `currentColor`. Nunca naranja, salvo que el ícono sea parte de la acción principal o de la selección.
- **Siempre con texto** en la navegación y en los botones. Un botón de solo ícono lleva `aria-label` y tooltip.

| Concepto | Ícono | Concepto | Ícono |
|---|---|---|---|
| Mesas · Vista cuadrícula | `layout-grid` | Agregar | `plus` |
| Vista plano | `frame` | Editar | `pencil` |
| Editar plano / mover | `move` | Desactivar | `ban` |
| Acercar / alejar | `zoom-in` / `zoom-out` | Reactivar | `rotate-ccw` |
| Ajustar el plano al ancho | `scan` | Más acciones | `ellipsis` |
| Ubicar automáticamente | `wand-sparkles` | Arrastrar (asa) | `grip-vertical` |
| Restaurante | `store` | Capacidad | `users` |
| Bitácora | `history` | Sin conexión | `wifi-off` |
| Horarios | `clock` | Actualizar | `refresh-cw` |
| Dirección / ubicación | `map` | Categoría | `tag` |
| Buscar | `search` | Cerrar | `x` |
| Ver / ocultar contraseña | `eye` / `eye-off` | Menú (móvil) | `menu` |
| Tema claro / oscuro | `sun` / `moon` | Desplegar | `chevron-down` |
| Éxito | `circle-check` | Error | `circle-alert` |
| Advertencia | `triangle-alert` | Info | `info` |
| Cargando | `loader-circle` (girando) | Ir / siguiente | `arrow-right` |
| Salir | `log-out` | Teléfono | `phone` |

**Prohibidos:** `utensils`, `chef-hat`, `pizza`, `coffee`, `hamburger`, `map-pin` y cualquier pin genérico (el pin de DiNNo es el del logo). El "En vivo" no es un ícono: es el Active Dot.

---

## 10. Modo oscuro

- Fondo `#0B2D36`, superficies `#103B46` / `#164853`, texto `#FAF7F1` / `#A9BDC0`, borde `#24525D` y borde fuerte `#5E8A93`.
- El naranja sube a `#FF8456`; el botón principal conserva el texto oscuro `#0B2D36`.
- La sombra cede ante un borde más visible.
- **Tintes de estado al 22%** (18% en claro), con borde en el color del estado al 50% (45% en claro). El vidrio de panel va al 50%, como en claro.
- **El naranja como texto nunca va sobre `surface-2`** (4,2:1).
- **Activación:**
  - **Web:** claro por defecto, cambiable desde el menú de usuario (Sol / Luna) y recordado en el navegador. Se activa con `data-theme="dark"` en `<html>` (o la clase `.t-dark`). Las variables no cambian de nombre, solo de valor.
  - **Móvil:** el comensal elige Sistema, Claro u Oscuro y se guarda en el teléfono.
- El dashboard tiene versión oscura para turnos de noche y pantallas de cocina. Se verifica cada pantalla en los dos temas.

---

## 11. Motion

### 11.1 Cuándo animar (filtro obligatorio)

Antes de animar algo, responde en orden:

| Pregunta | Regla |
|---|---|
| **¿Cada cuánto se ve?** | Cientos de veces al día o con teclado (atajos, navegación): **nunca se anima**. Decenas al día (hover, cambio de estado): casi imperceptible. Ocasional (menús, diálogos, toasts, paneles): estándar. Raro (primer uso, cierre del registro, éxito): aquí puede haber un momento de marca |
| **¿Para qué?** | Respuesta a un toque, continuidad espacial (de dónde viene y a dónde va), indicar un estado, evitar un salto brusco. "Se ve bonito" no es un motivo |
| **¿Cabe en el presupuesto?** | Interfaz por debajo de 300 ms (tabla 11.2) |
| **¿Ayuda o estorba?** | Un dato que se lee no se mueve por estilo: nada de cifras que cuentan hacia arriba ni gráficas que se dibujan |

### 11.2 Tokens

| Token | Valor | Para qué |
|---|---|---|
| `--ease` | `cubic-bezier(.2,.8,.2,1)` | El del v1.1: hover, color y cambios de estado |
| `--ease-enter` | `cubic-bezier(.23,1,.32,1)` | Entradas y respuesta a un toque (ease-out fuerte) |
| `--ease-move` | `cubic-bezier(.77,0,.175,1)` | Algo que se mueve en pantalla (una mesa que vuelve a su lugar) |
| `--ease-sheet` | `cubic-bezier(.32,.72,0,1)` | Hojas, drawer y paneles |
| `--dur-press` | 120 ms | Escala al presionar |
| `--dur-fast` | 150 ms | Hover, focus, switch y **todas las salidas** |
| `--dur-base` | 200 ms | Cambio de estado, menús, selector, toasts entrando |
| `--dur-slow` | 300 ms | Diálogos, drawer, hojas, una mesa que vuelve a su lugar en el plano |
| `--dur-highlight` | 700 ms | Aviso de cambio remoto (una sola vez) |
| Resorte (móvil) | `{ duration: 350, dampingRatio: 0.9 }` rápido · `{ duration: 500, dampingRatio: 0.8 }` suave | Gestos: hojas, arrastre, pin seleccionado |

**Nunca** `ease-in` en la interfaz (se siente lento), nunca `transition: all`, nunca `scale(0)` (nada aparece de la nada: se parte de 0,95–0,97).

### 11.3 Patrones de microinteracción

| Patrón | Qué hace | Valores |
|---|---|---|
| **Presionar** | Botones, tarjetas y controles se hunden al tocarlos | `scale(.97)` · `--dur-press` · `--ease-enter`, también en las tarjetas (utilidad `press`). Hover solo con `(hover: hover) and (pointer: fine)` |
| **Cambio de estado** | El tinte, la forma y la palabra cambian juntos | `background-color`, `color` · `--dur-base` · `--ease`. Sin rebote ni desplazamiento |
| **Abrir desde su origen** | Selector, menú y popover crecen desde el elemento que los abrió | Opacidad + `scale(.97 → 1)` desde `transform-origin` del disparador (`--radix-*-transform-origin`) · `--dur-base` · `--ease-enter`. **El diálogo no:** se queda centrado |
| **Salida** | Todo lo que entra, sale por el mismo camino | Más rápido que la entrada: `--dur-fast`. Los toasts salen por el mismo borde por el que entraron |
| **Diálogo** | Overlay + tarjeta | Overlay con fundido `--dur-slow`; tarjeta con opacidad + `translateY(8px)` + `scale(.97)` · `--dur-slow` · `--ease-enter` |
| **Hojas y drawer** | Suben o entran por su borde | `translateY(100%)` / `translateX(-100%)` · `--dur-slow` · `--ease-sheet`; en el móvil, resorte con la velocidad del gesto |
| **Cuadrícula ↔ Plano** *(propuesta futura, sección 19)* | Cada mesa se transformaría de tarjeta a nodo | View Transitions API (`view-transition-name` por mesa) · `--dur-slow` · `--ease-move`. **Hoy el cambio es instantáneo**; solo la maqueta `/sistema` lo prueba |
| **Arrastrar una mesa** | La mesa se levanta y se acomoda | Al levantarla: nivel 2 + `scale(1.02)`. Al soltarla: se ajusta a la celda en `--dur-base` · `--ease-enter`. Si el lugar no es válido, vuelve en 300 ms (`--dur-slow`) · `--ease-move`. **Con teclado se mueve sin animación** |
| **Cambio remoto** | Otra persona cambió una mesa | Un anillo de 2 px en el color del estado que crece y se desvanece una sola vez (`--dur-highlight`) |
| **Active Dot** | El punto de "Abierto" en el topbar (y, a futuro, el "En vivo" del `LiveIndicator`) | El pulso: 2 s en bucle, opacidad de 1 a 0,35 |
| **Skeleton** | Carga | Pulso de opacidad de 1,2 s; sin brillo que recorre (shimmer) |

### 11.4 Cuándo no animar

- Atajos de teclado, cambios de foco ni navegación del sidebar (solo color en hover).
- La entrada de la grilla o de la página: el dashboard se abre muchas veces al día.
- Cifras de métricas, tablas ni la bitácora.
- El logo, fuera de la carga y el splash.
- Nada que bloquee una acción: la persona puede seguir tocando mientras algo se anima, y toda animación se puede interrumpir (web: transiciones de CSS, no keyframes, para lo que se repite rápido; móvil: valores compartidos de Reanimated).

### 11.5 Reducir movimiento

**Con reducir movimiento, la interfaz se mueve menos, no deja de explicar.**

- **Se quitan:** desplazamientos, escalas, rebotes, la transformación Cuadrícula ↔ Plano y el arrastre animado.
- **Se conservan:** los fundidos de opacidad y color de 150 ms o menos, para que un cambio de estado siga notándose.
- **Los bucles se detienen:** el pulso del Active Dot y el del skeleton quedan quietos.
- **Implementación web:**
  - Los keyframes de movimiento leen `--motion-rise` y `--motion-scale`, que con `prefers-reduced-motion` valen `0px` y `1` (sección 16.4).
  - El drawer y las hojas pasan a un fundido.
  - Las transiciones de CSS que desplazan algo se apagan donde viven: el login con una regla acotada a `.glass-login` en `globals.css`, la mesa del plano con su `@media` dentro de `plan-node` (conserva el fundido de color) y la perilla del `Switch` con `motion-reduce:transition-none`.
  - No hay una regla global que lo apague todo.
- **Implementación móvil:** `useReducedMotion()` de Reanimated.

---

## 12. Componentes

Todos usan solo tokens y traen sus estados y su versión oscura.

**Estados que todo componente interactivo debe resolver:**

| Estado | Cómo se ve |
|---|---|
| Hover (solo con puntero fino) | Oscurece 6% o pasa a `surface-2` |
| Focus visible | Anillo de 3 px `--focus-ring` |
| Pressed | Escala (11.3) + color presionado |
| Selected | Borde `--selection` de 2 px |
| Disabled | 45% de opacidad, sin cursor. Es lo único que puede bajar la opacidad del texto |
| Loading | Spinner de 16 + gerundio, mismo ancho |
| Error | Borde `--error` + mensaje |

Cuando un estado no aplica, la ficha del componente lo dice.

### 12.1 Componentes compartidos entre web y móvil

| Componente | Web | Móvil | Diferencia justificada |
|---|---|---|---|
| `Button` | ✓ | ✓ | Móvil agrega `size="float"` (44, sobre el mapa) y respuesta háptica en el primario (`expo-haptics`); la web tiene hover |
| `IconButton` | ✓ (tooltip) | ✓ | El móvil no tiene tooltip: lleva `accessibilityLabel` |
| `TextField` | ✓ | ✓ | — |
| `NumberStepper` | ✓ | ✓ | — |
| `SegmentedControl` | ✓ | ✓ | — |
| `StatusShape` / `StatusChip` / `STATUS_META` | ✓ | ✓ | Mismos nombres, colores y formas; un test lo vigila en cada repo |
| `Card` | ✓ | ✓ | — |
| `Alert` · `Toast` · `Dialog` · `EmptyState` · `Skeleton` · `Spinner` | ✓ | ✓ | Toast: arriba al centro, bajo la barra (v2.1: abajo vive el dock de navegación) |
| `Logo` / `Brand` | ✓ (SVG) | ✓ (paths) | El formato del archivo |
| `BottomSheet` | Hoja interna de `StatusPicker` en < 768 (no es un componente aparte) | ✓ | En la web reemplaza al popover en el teléfono |
| `Glass` (niveles de la sección 7) | utilidades CSS | `GlassSurface` | Android 12+: `BlurView` (`expo-blur`) solo en el login; sobre el mapa y en Android 11 o anterior, respaldo sólido. iOS: `BlurView` de `expo-blur` (sin verificar en un iPhone: no hay Xcode en el equipo) |

**Solo web:** `Select`, `TimeSelect`, `HoursEditor`, `Switch`, `DropdownMenu`, `DataTable`, `PageHeader`, `AppShell`, `TableCard`, `TableNode`, `FloorPlan`, `StatusPicker`, `StatStrip`, `DetailList`, `FloatingBar` y, como propuesta futura, `LiveIndicator` (19). Son herramientas del restaurante.

**Solo móvil:** `Text` (React Native necesita un componente de texto), `ScreenHeader`, `FilterChip`, `MapMarkers`, `GoogleLogo`. Son del comensal.

### 12.2 Fichas

#### `Button`

| Variante | Aspecto | Cuándo |
|---|---|---|
| `primary` | Naranja + texto tinta | La acción principal del contexto. **Una por contexto**, y no se gasta en acciones raras |
| `secondary` | `--inverse-bg` + `--inverse-text`: petróleo con crema en claro; crema con tinta en oscuro (**igual en web y móvil**) | Acción importante pero no principal: "Abrir ahora", "Cómo llegar", "Intentar de nuevo" a pantalla completa |
| `outline` | `--surface` + borde fuerte + tinta | Alternativas: "Cancelar", "Editar", "Agregar mesa" en servicio |
| `ghost` | Texto `--accent-text`, subrayado en hover | Terciarias: "Copiar el lunes a todos", "Reactivar" |
| `danger` | `--surface` + borde y texto `--error` | "Desactivar mesa", siempre dentro de un diálogo de confirmación |

- **Estados:** hover (−6%) · pressed (`scale(.97)`; el primario pasa a `--accent-pressed`) · focus (anillo) · disabled (45%) · loading (spinner + gerundio, mismo ancho, no se puede volver a pulsar).
- **Texto:** verbo + objeto ("Guardar plano"). En grupos, el primario va a la derecha (escritorio) o arriba y a lo ancho (móvil).
- **✓** `<Button icon={Plus} variant="outline">Agregar mesa</Button>` en la vista de servicio.
- **✗** Dos botones naranja en la misma vista · un botón "OK" · un `danger` relleno de rojo · un botón deshabilitado porque el formulario tiene errores.

#### `IconButton`

- `sm` de 40 × 40 y `md` de 44 × 44, radio 12, sin fondo; hover `--surface-2`. `label` obligatorio (`aria-label` + tooltip en web). Que el `sm` crezca a 44 en pantallas táctiles es *(propuesta futura, sección 19)*.
- **✓** ⋯ de una mesa con "Más acciones de Mesa 04".
- **✗** Un ícono sin nombre accesible · un ícono suelto como única forma de una acción frecuente.

#### `TextField` · `Select` · `TimeSelect` · `NumberStepper`

- Campo de 48, radio 12, borde de 1,5 `--border-strong`. Label arriba (14/20 700), siempre visible.
- Estados: hover (borde `--text-2`) · focus (borde `--accent` + anillo) · error (borde `--error` + `circle-alert` + mensaje) · disabled (`--surface-2`, texto `--text-2`) · solo lectura (sin borde).
- `NumberStepper`: botones de 44 y valor en `tabular-nums`.
- **✗** Placeholder como label · asteriscos · validar en cada tecla.

#### `Switch`

- Pista de 44 × 26 y perilla de 20. Encendido `--ok`, apagado `--border-strong`. **La palabra siempre al lado**; con `onStatus` / `offStatus` también lleva la forma de estado.
- El objetivo táctil (pista + palabra) mide al menos 44.

#### `SegmentedControl`

- Alto 44, fondo `--surface-2`, padding 4, radio 14. El segmento activo es `--surface` + `--shadow-soft` + texto 700, con la forma del estado si la tiene.
- **Nunca naranja.** Las flechas mueven el foco; Enter o Espacio aplican.
- Usos: Plano · Cuadrícula; Mapa · Lista.

#### `StatusChip` y la línea de estado

- **Chip:** pastilla de 24, fondo del color al 15%, forma de 8 y palabra de 12/16 700 en tinta.
- **Línea de estado** (`StatusLine`): forma de 10 en el color y palabra de 14/20 700 en tinta, sin pastilla. Va dentro de superficies teñidas.
- **✗** Chip dentro de una tarjeta ya teñida · estado sin palabra · estado en naranja.

#### `Card`

- Radio 20, **vidrio de tarjeta** (`glass-card`, v2.1) con borde de vidrio, sin sombra en reposo, padding 16 / 24. Título en Título 3.
- **✗** Card dentro de card (la hoja no cuenta: es el plano de trabajo, no una tarjeta) · borde y sombra a la vez en reposo.

#### `TableCard` (mesa en la cuadrícula)

| Parte | Especificación |
|---|---|
| Superficie | Tinte del estado (3.2); "Ocupada" además lleva el rayado |
| Arriba | "Mesa 04" (Título 3, tinta; hasta dos líneas para identificadores largos, nunca cortado con "…") + ⋯ (`IconButton sm`) |
| Medio | `users` 16 + "4 personas" (14/20, tinta) |
| Abajo | Línea de estado (forma de 10 + palabra) |
| Inactiva | Sin tinte, borde punteado de 1,5, texto `--text-2` y la misma estructura que las demás. Tocarla abre su selector con **"Reactivar mesa"** (también está en ⋯) |
| Tamaño | Mínimo 168 de ancho; todas las de la grilla, de la misma altura (`grid-auto-rows: 1fr`) |

- **Estados:**
  - Reposo: nivel 1.
  - Hover (puntero fino): nivel 2 en `--dur-fast`.
  - Pressed: `scale(.97)` (`press`).
  - Focus visible: anillo.
  - **Abierta / seleccionada:** borde de 2 `--selection` + nivel 2, mientras su selector de estado está abierto.
  - Cambio remoto: anillo (11.3).
- **Interacción:** tocar la tarjeta abre el **selector de estado** junto a ella. Con la tarjeta enfocada, **D**, **R** y **O** cambian el estado sin abrir nada. El ⋯ abre Editar · Desactivar (o Editar · Reactivar).
- **✓** El color de la tarjeta dice el estado y la palabra lo confirma.
- **✗** Chip de estado dentro de la tarjeta teñida · tarjeta de altura distinta a sus vecinas · contenido al 55% · un botón extra en una sola tarjeta que estira toda su fila.

#### `TableNode` (mesa en el plano)

- **Forma:** la elige el restaurante (`square` · `round` · `rect`). Si no la eligió, se toma de la capacidad:

  | Capacidad o forma | Celdas (ancho × alto) |
  |---|---|
  | 1–4 personas | 3 × 2 |
  | 5–8 personas | 4 × 2 |
  | 9 o más | 5 × 2 |
  | `square` | 3 × 3 |
  | `round` (círculo) | 3 × 3 |

  Ninguna mesa mide menos de 3 celdas de ancho: con la celda más pequeña (36 px), "Disponible" cabe completa y la capacidad sigue visible (medido en un teléfono de 390: con 32 px la palabra se cortaba). Entre una mesa y otra queda una separación de 4 px.
  - Elegir "Rectangular" equivale a no elegir forma (se guarda sin forma, `null`): es el tamaño por capacidad.
- **Contenido:** el identificador (14/20 800, tinta), "4 personas" (12/16, tinta) y la línea de estado (12/16 700), **con la palabra siempre visible**.
  - Si el nodo mide menos de 64 px de alto, oculta la capacidad (sigue en su nombre accesible). La palabra del estado nunca se oculta.
  - En la mesa redonda, el contenido va centrado.
- **Superficie, estados e interacción:** iguales a los de `TableCard`.
- **En modo edición:**
  - Aparece el asa `grip-vertical` y el cursor `grab`.
  - Al arrastrar, la mesa sube al nivel 2 con `scale(1.02)` y la celda de destino se marca con un borde punteado `--selection`.
  - Si el lugar está ocupado, el borde punteado pasa a `--error` y la mesa vuelve a su sitio (300 ms, `--ease-move`).
  - Una mesa que ya no cabe donde está (su capacidad creció después de guardar el plano y ahora pisa a otra o se sale de la grilla) lleva borde `--error` y el ícono `triangle-alert` en lugar del asa. El plano no se guarda hasta moverla.
- **Accesibilidad:** cada nodo es un botón con `aria-label` "Mesa 04, 4 personas, Disponible". En modo edición, "Mesa 04, 4 personas, Disponible, fila 3, columna 5. Muévela con las flechas." Las flechas lo mueven una celda y Shift + flecha, cuatro; el movimiento con teclado no se anima (11.4).

#### `FloorPlan` (lienzo)

- Grilla lógica de **20 columnas × 14 filas**, que se ajusta al ancho del contenedor (celda de 36 a 56 px).
  - Si un restaurante necesita más espacio, el lienzo crece hacia abajo, hasta 30 filas. En edición muestra 6 filas libres bajo la última mesa, para poder arrastrar hacia abajo.
  - Las posiciones se guardan en celdas, así que son las mismas en todos los dispositivos.
  - Con menos de 720 px de ancho (una tablet horizontal con sidebar, un teléfono) la celda se queda en 36 y el lienzo se desplaza dentro de su marco.
- Fondo `plan-canvas`: `--surface-2` con una trama de puntos en cada celda. Radio 20; borde fino.
- **Barra de herramientas** (sobre el lienzo, sin vidrio): a la izquierda el modo ("Modo servicio: las mesas no se mueven." o la ayuda de edición); a la derecha "Alejar" (`zoom-out`), "Ajustar" (`scan`, vuelve al ancho del contenedor), "Acercar" (`zoom-in`) y "Editar plano" (`outline`). Pasos del zoom: 36, 44, 52, 60 y 72 px por celda.
- **En edición**, la barra flotante inferior (`FloatingBar`, vidrio de panel) dice "Editando el plano" y lleva "Ubicar automáticamente" (`outline`: el `ghost` naranja no cumple AA sobre vidrio, 7.3), "Cancelar" (`outline`) y **"Guardar plano"** (`primary`).
- **Bajo el lienzo, en edición**, dos paneles lado a lado (uno sobre otro en menos de 768):
  - **"Sin ubicar"**: un botón "Ubicar Mesa 10" por mesa sin posición, que la pone en el primer lugar libre.
  - **"Mesa seleccionada"**: la forma (`SegmentedControl` Rectangular · Cuadrada · Redonda), cuatro botones para moverla una celda (la alternativa al arrastre de WCAG 2.5.7) y "Quitar del plano" (`ghost`, la devuelve a "Sin ubicar").
- **✗** Arrastre como única forma de mover · mesas sin palabra de estado al alejar el zoom · gradiente en el lienzo.

#### `StatusPicker` (selector de estado)

- **≥ 768:** un popover (Radix Popover) anclado a la mesa, que se abre del lado con más espacio. Vidrio de panel, radio 16, padding 8 y ancho de 260.
- **< 768:** una `BottomSheet` con las mismas filas.
- **En el plano** agrega bajo el título los datos reales de la mesa ("4 personas · Redonda") y, abajo, "Editar mesa" y "Desactivar mesa" (`outline`), porque el nodo no tiene menú ⋯.
- **Filas** (de 48): la forma (10) en su color, la palabra (16/24 700, tinta) y la tecla del atajo (D, R, O) a la derecha (14/20, tinta). La fila del estado actual lleva el tinte de su estado y `check`. **Sin "Inactiva".**
- **Con una mesa inactiva**, el selector muestra "Mesa 06 está inactiva. No aparece para los comensales." y el botón **"Reactivar mesa"** (`outline sm`).
- Elegir aplica el cambio de inmediato (optimista) y cierra el selector. El foco vuelve a la mesa, y un toast ofrece "Deshacer".
- **Teclado:** flechas dentro del selector, Enter aplica y Esc cierra.
- **Foco:** al abrir, va al estado actual. Al cerrar, vuelve a la mesa solo si nadie más lo tomó (Esc o una elección). Si se cerró porque la persona tocó otra mesa o el ⋯, el foco se queda donde lo puso.
- **Motion:** abre desde la mesa (11.3) y sale en `--dur-fast`. Con atajos no se abre ni se anima.

#### `StatStrip` (franja de métricas)

- **v2.1:** cuatro tarjetas de vidrio separadas e iguales (radio 20, gap 12, alto mínimo 144). Ninguna se destaca: el estado lo dicen la forma y la palabra.
- **Cada tarjeta:** arriba, la forma del estado y la palabra con mayúscula inicial ("Disponibles", "Reservadas", "Ocupadas", "Inactivas"; `text-sec` 700); abajo, la cifra en `text-display` (48, tabular).
- Cada tarjeta es un botón que **filtra la cuadrícula** (`aria-pressed`, anillo de 2 px `--selection`), con `press` y `lift`. En el plano solo informa.
- **< 1024:** 2 × 2.
- **✗** Íconos en círculos de color · la palabra "libres" (no está en el glosario) · una tarjeta de un color distinto a las demás.

#### `LiveIndicator` *(propuesta futura, sección 19)*

**No está implementado.** Depende del socket del restaurante (decisión D5, fase F5); hoy solo se ve en la página de muestra `/sistema`. Así se vería:

| Estado | Cómo se ve |
|---|---|
| Conectado | Active Dot en `--ok` con pulso + "En vivo" (14/20 700) |
| Reconectando | Raya `--inactive` + "Reconectando…" + "Actualizado 7:42 p. m." |
| Sin conexión | `dot-alert` en `--error` + "Sin conexión" + "Intentar de nuevo" (`ghost`) |

- Va en el topbar, a la izquierda del switch Abierto/Cerrado. Con reducir movimiento, el punto queda quieto.

#### `Alert`

- Cuatro tipos (3.5). Fondo del color al 12%, ícono de 20 en el color, texto en tinta, radio 14 y un botón opcional a la derecha. Sin sombra. **Un error nunca desaparece solo.**

#### `Toast`

- Fondo `--inverse-bg`, texto `--inverse-text`, ícono en el color del estado y acción en `--inverse-accent`. Radio 14 y sombra flotante. **Uno a la vez.**
- Se muestra 4 s, o 6 s si trae acción. Se pausa con hover o foco. **v2.1:** llega arriba al centro, bajo la barra superior, y sale por arriba (el dock de navegación es dueño de la parte de abajo).
- Se anuncia con `aria-live="polite"` (los errores, `assertive`).

#### `Dialog` · `ConfirmDialog`

- Radio 20, ancho 480 / 560 y padding 24. **Sólido, sin vidrio.**
- El título es una pregunta corta; el cuerpo explica la consecuencia; las acciones van abajo a la derecha (el primario al final).
- Esc y clic afuera cierran, salvo mientras guarda. El foco queda atrapado dentro y vuelve al botón que lo abrió.
- Se usa para confirmar algo destructivo o que afecta a comensales, y para formularios cortos (de 3 campos o menos). **No es la primera opción:** si algo se puede resolver en el lugar, se resuelve en el lugar.

#### `BottomSheet`

- Radio 28 arriba, con asa, título y cerrar. Cierra al arrastrar hacia abajo (por distancia o por velocidad), con resorte y resistencia elástica en el borde superior.
- Las acciones van fijas abajo.

#### `DropdownMenu`

- Sombra flotante, radio 12 e ítems de 40 (48 en táctil) con un ícono de 16 y texto 14/500. El destructivo va en `--error`, separado por una línea.
- Abre desde su disparador y tiene salida (11.3).

#### `EmptyState`

- Símbolo de DiNNo en contorno (48, `--text-2`), Título 3, texto secundario y como máximo un botón. Centrado, de 360 de ancho como máximo.
- **`variant="error"`:** el símbolo lleva un punto `--error` y el título dice qué falló. Se anuncia con `role="alert"`.
- En un estado vacío, el botón es el único primario. En un error, el botón es `secondary` ("Intentar de nuevo").

#### `Skeleton`

- Bloques `--surface-2` con **la forma y la medida exactas** del contenido real: la pantalla no debe saltar al llegar los datos. Si la carga dura menos de 300 ms, no se muestra nada.

#### `DataTable`

- Encabezados en `text-label` (12/16 700, `--text-2`, mayúscula inicial). Filas de 52, divisores `--border`, hover `--surface-2`, números alineados a la derecha y en `tabular-nums`. Sin cebra.
- En < 768 se vuelve una **lista de dos líneas por fila** (13.4).

#### `PageHeader`

- Título 1 (28/32), una línea debajo **en tinta** (va sobre la hoja) y las acciones a la derecha. En el móvil, las acciones bajan.
- **`variant="hero"`** (v2.1, solo `/mesas`): el saludo según la hora del dispositivo, solo "Buenas noches" (`text-hero` 36/40 800; el nombre del restaurante ya está en la barra superior), y la línea "Martes, 27 de octubre · 3 mesas disponibles de 7" con datos reales.

#### `DetailList`

- Filas de etiqueta (`text-sec`, `--text-2`) y valor (`text-body`, tinta), con padding de 12 arriba y abajo y divisor fino.
- En ≥ 768, la etiqueta va a la izquierda (160) y el valor a la derecha.
- Reemplaza el `ProfileField` local de `/restaurante`.

#### `AppShell` · `Sidebar` · `Topbar`

- **Fondo (v2.1):** `AmbientGround`, la luz del salón (sección 8), fija detrás de todo. `lit` sigue al estado del restaurante: abierto, cálido; cerrado, apagado.
- **Dock de navegación** `NavDock` (v2.1, en todos los tamaños), como el de macOS: una cápsula de vidrio centrada a 16 del borde inferior (más el área segura del teléfono). De izquierda a derecha: el símbolo de DiNNo (desde 640; el pin visible mide unos 36, sin deformarlo), un separador, cada sección como ícono 20 con su palabra debajo (12/16 700, nunca ícono solo), en ítems de 96 de ancho y unos 52 de alto, otro separador y el cambio de tema. El activo es una píldora: petróleo con texto crema en claro, crema con texto petróleo en oscuro. Al pasar el puntero, el ícono se asoma (sube 4 px y crece al 108%, sin movimiento con reducir movimiento). **El vidrio sigue al tema.** La página reserva abajo `--dock-clearance` (112) para que el dock nunca tape la última fila.
- **Barra superior** `Topbar` (v2.1): una píldora de vidrio de 64 de alto, *sticky* a 16 del borde. A la izquierda, **el nombre real del restaurante en todos los tamaños** (Título 3, recortado si no cabe; skeleton mientras carga, nunca "Restaurante"). A la derecha, el switch Abierto/Cerrado y la cuenta (`UserMenu`): la inicial del restaurante sobre `--grad-highlight`, y un menú con el restaurante y el correo arriba, el tema y "Cerrar sesión". El `LiveIndicator` irá a la izquierda del switch *(propuesta futura, sección 19)*.
- **Hoja de contenido** (v2.1): `glass-sheet`, radio 28 (32 desde 1024), padding 16 / 24 / 32. Todo lo de la página va encima.
- **Centrado:** la barra y la hoja van en una columna centrada de 1280 como máximo. Ya no hay menú lateral ni cajón: el dock es la navegación en todos los tamaños.

#### `FloatingBar`

- Barra flotante de nivel 3 al final del contenido (vidrio de píldora desde v2.1). Es sticky y reserva su propio espacio, así que nunca tapa la última fila ni el foco (WCAG 2.4.11).
- Hoy se usa solo en la edición del plano. Se queda justo encima del dock de navegación (`bottom: --dock-clearance`).

---

## 13. Patrones

### 13.1 Formularios

Sin cambios de fondo respecto al v1.1:

- **Layout:** una columna de 560 como máximo; los campos cortos pueden ir de a dos. Grupos con Título 3 separados por 24.
- **Labels y campos:** el label siempre arriba; "(opcional)" en vez de asteriscos.
- **Validación:** al salir del campo y al enviar. Al enviar con errores, se enfoca el primer campo con error; con más de dos, aparece arriba un `Alert` ("Revisa los 3 campos marcados").
- **Botón de enviar:** no se deshabilita por datos inválidos, solo mientras guarda.
- **Después de guardar:** toast "Cambios guardados".
- **Salir sin guardar:** diálogo "¿Salir sin guardar?" (Seguir editando · Salir sin guardar).
- **Formatos:** hora "7:30 p. m."; fecha "30 sept 2026"; capacidad "4 personas"; teléfono "300 123 4567".

**Horario semanal (v2.0).** Un día cerrado ocupa una sola fila (día + switch + "Cerrado"). "Copiar el lunes a todos" va **debajo del lunes**, cerca de lo que copia.

### 13.2 Modales y capas

| Situación | Patrón |
|---|---|
| Cambiar el estado de una mesa | Selector de estado (popover / hoja), **nunca un diálogo** |
| Confirmar algo destructivo o que afecta a comensales | `ConfirmDialog` |
| Formulario corto (crear o editar mesa) | `Dialog` con formulario |
| Acciones secundarias de un objeto | `DropdownMenu` (⋯) |
| Elegir entre opciones en el teléfono | `BottomSheet` |

### 13.3 Navegación

- **Web:** sidebar con Mesas · Restaurante · Bitácora y el nombre del restaurante visible en el topbar ("¿dónde estoy?" siempre con respuesta). En < 1024, drawer.
- **Móvil:** pestañas Explorar · Perfil y pantallas apiladas (detalle) con "atrás" arriba a la izquierda.
- El título de la página coincide con el ítem de navegación que la abrió.

### 13.4 Listas y tablas

- **Web ≥ 768:** `DataTable`.
- **Web < 768 y móvil:** filas de **dos líneas**. La primera lleva la identidad y el dato clave ("Mesa 04 · Disponible → Ocupada"); la segunda, el resto en 14/20 `--text-2` ("30 sept · 7:30 p. m. · admin@casa72.co"). Ningún campo se pierde.
- Más reciente primero cuando hay fecha.
- Las listas largas cargan en bloques.

### 13.5 Dashboard

- **Una pregunta por pantalla:** en `/mesas` es "¿qué mesas tengo ahora?". Lo más grande de la pantalla responde esa pregunta (las mesas), no las métricas ni un botón.
- **Orden de lectura:**
  1. El aviso si hay uno (cerrado, ubicación, error).
  2. El saludo (`PageHeader variant="hero"`), con la fecha y cuántas mesas hay disponibles, y a su derecha Plano · Cuadrícula y "Agregar mesa".
  3. Las tarjetas del resumen.
  4. Las mesas.
- **El trabajo más frecuente, a un toque:** tocar una mesa abre su selector; con teclado, D, R y O.
- **Datos honestos:** los ceros como "0" y sin cifras inventadas. La marca "Actualizado 7:42 p. m." llega con el `LiveIndicator` *(propuesta futura, sección 19)*.

### 13.6 Estados vacíos y de carga

| Pantalla | Título | Texto | Botón |
|---|---|---|---|
| Mesas | Aún no tienes mesas | Agrega tus mesas para empezar a recibir comensales. | Agregar mesa (primario) |
| Plano sin armar (Cuadrícula) | Arma el plano de tu restaurante. | Ubica tus mesas como están en el salón y ve de un vistazo cuáles están libres. | Ubicar mesas (`outline`, en un `Alert` info) |
| Plano sin armar (Plano) | Aún no hay mesas en el plano | Ubícalas como están en tu salón para ver de un vistazo cuáles están libres. | Ubicar mesas (`outline`) |
| Bitácora | Aún no hay cambios | Aquí verás cada cambio de estado de tus mesas. | — |
| Error de carga | No pudimos cargar tus mesas | Revisa tu conexión e intenta de nuevo. | Intentar de nuevo (secundario) |

- **Arranque:** nunca un spinner a pantalla completa. **Web:** skeletons con la forma del login mientras se comprueba la sesión. **Móvil:** el splash nativo con el símbolo sobre crema (petróleo sólido en oscuro). Un arranque con el Active Dot del logo es *(propuesta futura, sección 19)*.
- **Dentro de una pantalla:** skeletons con la medida real.
- **Error de carga:** siempre **dentro del bloque que falló**. Si falló toda la pantalla, `EmptyState variant="error"`. Si falló una parte, un `Alert` de error en ese bloque con "Intentar de nuevo" (`outline sm`). El mismo patrón en todas las pantallas.

### 13.7 Alertas, notificaciones y tiempo real

| Situación | Componente |
|---|---|
| Algo se guardó o cambió bien | Toast de éxito (4 s) |
| Cambio rápido reversible (estado de mesa, cerrar sin reservas) | Toast con "Deshacer" (6 s) |
| Error al guardar o al cargar | `Alert` de error en el bloque, sin desaparecer solo, con "Intentar de nuevo" |
| Contexto persistente (restaurante cerrado, ubicación incompleta) | `Alert` info arriba del contenido |
| Estado de la conexión en vivo | `LiveIndicator` en el topbar *(propuesta futura, sección 19)* |
| Otra persona cambió una mesa | Anillo de cambio remoto en esa mesa, en la cuadrícula y en el plano (implementado). **Sin toast** (sería ruido). El anuncio para lectores de pantalla (un único `role="status"`, como máximo uno cada 5 s) es *(propuesta futura, sección 19)* |
| Se perdió la conexión | `LiveIndicator` en "Reconectando…" y, si sigue, "Sin conexión" *(propuesta futura, sección 19)*. La pantalla sigue usable con lo último que llegó |

**Tiempo real del dashboard** *(propuesta futura, sección 19)*:

- **Objetivo (D5):** los cambios de otros dispositivos llegan **al instante** por el socket del restaurante. Si el socket cae, la pantalla consulta cada 30 s hasta reconectarse, al volver a la pestaña y al recuperar internet.
- **Hoy:** la lista se vuelve a pedir al volver a la pestaña y después de cada cambio propio. Un cambio de otro dispositivo aparece entonces, con su anillo.

### 13.8 Responsive

| Pieza | ≥ 1024 | 768–1023 | < 768 |
|---|---|---|---|
| Navegación | Dock abajo (v2.1) | Dock abajo | Dock abajo, sin el símbolo |
| Métricas | 4 tarjetas | 2 × 2 | 2 × 2 |
| Grilla de mesas | `minmax(168px, 1fr)` | igual | 2 columnas (`min(168px, 50% − 6px)`) |
| Selector de estado | Popover | Popover | Hoja inferior |
| Plano | Editable | Editable | Solo servicio; abre en Cuadrícula y el plano se desplaza dentro de su marco (celda mínima de 36) |
| Tablas | `DataTable` | `DataTable` | Filas de dos líneas |
| Toasts | Arriba al centro, bajo la barra (v2.1) | igual | igual |

Se verifica en 1280, 1024, 768 y 390 (web) y en 360, 390 y 430 (móvil), en claro y en oscuro.

### 13.9 Login

**Web** (referencia visual del v2.0; **no se rediseña**):

- Tarjeta `glass-login` sobre dos formas de marca: naranja arriba a la izquierda y petróleo abajo a la derecha.
- Pestañas verticales Iniciar sesión / Crear cuenta, con la barra naranja que se desliza, y el panel de gradiente petróleo que sobresale de la tarjeta (≥ 1024).
- Los paneles se deslizan en `--dur-slow`.
- **Reglas de contraste** (7.3):
  - Texto en tinta plena.
  - Enlaces en `--accent-text` al 100%, solo donde detrás hay crema; donde pasa una forma de marca, el enlace va en tinta subrayado.
  - Ningún texto con opacidad.
- "Crear cuenta" explica cómo pedir una cuenta de restaurante: no hay registro público.
- **Compatibilidad:** el login conserva la escala tipográfica del v1.1 (`text-h1` 32, `text-h2` 24, etiqueta de 11) y su movimiento reducido (sin deslizamientos) con una regla acotada a `.glass-login` en `globals.css`. Así los tokens v2.0 no lo cambian sin tocar sus archivos. Hereda solo lo que es del kit (el presionar de los botones).

**Móvil** (traslada los principios de la web; no copia su layout de escritorio):

| Principio de la web | En el celular |
|---|---|
| Crema con dos formas de marca en esquinas opuestas | Las mismas formas (naranja arriba a la izquierda, petróleo abajo a la derecha, petróleo claro en oscuro), saliendo de las esquinas para no tapar el formulario. Son estáticas |
| Tarjeta de vidrio sobre las formas | Una tarjeta de vidrio de login a lo ancho (margen de 16), con radio 20 y padding 24. **iOS:** desenfoque real. **Android 12+:** desenfoque real con `BlurView` + `BlurTargetView`, que envuelve solo las formas (no el formulario). **Android 11 o anterior, o con "Reducir transparencia":** respaldo sólido al 92% |
| Pestañas Iniciar sesión / Crear cuenta con la barra naranja que se desliza | La misma fila de pestañas arriba de la tarjeta. La barra se desliza en 300 ms (`--ease-move`) **antes** de abrir la otra pantalla, con un toque háptico de selección. Al volver, la barra vuelve a su pestaña |
| Entrada con deslizamiento | La tarjeta sube al abrir (300 ms, `--ease-sheet`); con reducir movimiento, solo aparece |
| Texto en tinta sobre vidrio | Igual: sobre la tarjeta no hay texto `--text-2` |
| Panel de marca con gradiente (≥ 1024) | No existe en el celular: el logo va dentro de la tarjeta, nunca sobre la forma naranja (perdería contraste) |

- **Orden dentro de la tarjeta:** pestañas, logo, "Inicia sesión", la línea "Encuentra una mesa disponible ahora y asegúrala mientras llegas.", correo, contraseña, "¿Olvidaste tu contraseña?", **Iniciar sesión** (primario a lo ancho, con toque háptico), **Continuar con Google** y "¿No tienes cuenta? Crea tu cuenta". El comensal sí tiene registro público.
- Todas las pantallas sin sesión (crear cuenta, verificar correo, recuperar contraseña, conectando, sin conexión, cuenta de restaurante) usan el mismo marco (`AuthScreen`). Las pestañas solo aparecen en iniciar sesión y crear cuenta.
- **Rendimiento en gama media:** un solo desenfoque por pantalla, sobre un fondo estático; el desenfoque nunca se anima, solo la tarjeta que entra.

### 13.10 Vista de mesas: Cuadrícula y Plano

**Estructura de `/mesas`:**

| Bloque | Contenido |
|---|---|
| Encabezado (v2.1) | El saludo "Buenas noches" (sin el nombre, que va en la barra) + "Martes, 27 de octubre · 3 mesas disponibles de 7" (`PageHeader variant="hero"`) |
| Acciones (v2.1) | A la derecha del saludo: `SegmentedControl` **Plano · Cuadrícula** (deshabilitado mientras se edita el plano) + "Agregar mesa" (`primary`, redondo) |
| Resumen | `StatStrip`, cuatro tarjetas iguales |
| Contenido | La vista elegida, recordada en ese dispositivo. Abre en Plano si el restaurante ya tiene plano; si no, en Cuadrícula, con un `Alert` info "Arma el plano de tu restaurante" y el botón "Ubicar mesas" |

**Cuadrícula:**

- `TableCard` en una grilla `minmax(168px, 1fr)` con un gap de 12, todas de la misma altura.
- Orden natural por identificador ("2" antes que "10"); las inactivas van **al final**, sin encabezado propio (un grupo titulado "Inactivas" es *(propuesta futura, sección 19)*).
- Filtrar con la `StatStrip`. Si el filtro no deja ninguna mesa, en lugar de la grilla aparece un recuadro punteado con "No hay mesas reservadas ahora." y el enlace **"Ver todas las mesas"** (`ghost`).

**Resumen:** en Cuadrícula, la `StatStrip` filtra. En Plano solo resume: ocultar mesas rompería la lectura del salón.

**Plano — modo Servicio** (por defecto):

- Las mesas están en su lugar y **no se pueden mover**, para que nadie mueva una mesa por error en pleno servicio.
- Tocar una mesa abre el selector de estado, igual que en la cuadrícula.
- Barra de herramientas: Alejar, Ajustar, Acercar y "Editar plano" (12.2 `FloorPlan`).
- Las mesas inactivas se quedan en su lugar, con borde punteado.
- Si hay mesas sin ubicar, una línea las nombra: "2 mesas no están en el plano: Mesa 09, Mesa 10. Las ves en la cuadrícula."
- Sin ninguna mesa ubicada, el lienzo muestra "Aún no hay mesas en el plano" y "Ubicar mesas" (`outline`), que abre la edición con las mesas ya acomodadas como punto de partida.

**Plano — modo Editar** (≥ 768, botón "Editar plano"):

- Arrastrar con ajuste a la grilla, con el teclado como alternativa (flechas; Shift = 4 celdas) y los botones de mover del inspector.
- Bandeja "Sin ubicar"; "Ubicar automáticamente" acomoda en filas por identificador.
- Forma de la mesa en el inspector: cuadrada, redonda o rectangular.
- **Guardar plano** (primario) · **Cancelar**. Salir con cambios sin guardar pide "¿Salir sin guardar el plano?".
- Mientras se edita, los estados siguen llegando en vivo, pero el selector de estado no se abre, y el `SegmentedControl` Plano · Cuadrícula queda deshabilitado: se sale con "Guardar plano" o "Cancelar".
- Un cambio de estado que llega de otro dispositivo reproduce el anillo de 11.3 en la mesa, en las dos vistas; uno hecho en este dispositivo, no.

**Plano — compartido:**

- Las posiciones se guardan en el servidor y son las mismas en todos los dispositivos.
- Si otro dispositivo guarda un plano mientras alguien edita, al guardar gana el último y aparece el toast "Guardamos tu plano. Reemplazó el que guardaron desde otro dispositivo."

**Teléfono:**
- Abre en Cuadrícula.
- El Plano es solo para servicio y se desplaza dentro de su marco.
- "Editar plano" no aparece; en su lugar va la nota "Edita el plano desde una tablet o un computador".

### 13.11 App del comensal: Explorar y detalle

**Explorar (mapa):**

- El mapa ocupa toda la pantalla.
- Arriba flota un encabezado en vidrio de mapa (sólido en Android) con:
  - "Explorar" (Título 3), el origen ("Cerca de ti · 2 km") y "Cambiar zona", que abre el origen.
  - El selector Mapa · Lista.
  - "Filtros · N" y, al lado, los filtros activos (`FilterChip`).
- Abajo flota el carrusel de restaurantes.
- El título grande solo aparece en la vista de lista. En el mapa, el encabezado flotante lleva "Explorar" (Título 3), el origen y "Cambiar zona", el selector Mapa · Lista y los filtros.
- El encuadre del mapa deja libres el encabezado flotante y el carrusel (`edgePadding` arriba y abajo; nunca `mapPadding`, que se cae en Android).

**Detalle:**

- **Arriba:** "atrás" y el nombre (Título 1).
- **Debajo, un mapa estático de 176** (modo lite en Android: una sola imagen) con el pin del restaurante, en una tarjeta de radio 20. No recibe gestos: "Cómo llegar" abre el mapa real. Sin llave de Maps, no aparece. Que el contenido suba como una hoja sobre el mapa es *(propuesta futura, sección 19)*.
- **Luego, en la misma pantalla:**
  - **Una fila de estado:** el chip de disponibilidad como protagonista + "Abierto ahora" como línea discreta (punto + palabra). Cerrado: solo el chip "Cerrado".
  - Dirección y categoría.
  - "Cómo llegar" (secundario).
  - Los horarios, con el día de hoy resaltado.
- **Nada de dos chips del mismo color** compitiendo.

---

## 14. Contenido y tono

- **Tuteamos.** Frases cortas, directas y amables, sin culpar.
- **Mayúscula inicial solamente.** Mayúsculas completas solo en el kicker.
- **Botones = verbo + objeto:** "Guardar plano", "Agregar mesa", "Desactivar mesa". Nunca "OK", "Enviar" ni "Aceptar" sueltos.
- **Errores:** qué pasó + qué hacer, sin códigos técnicos.
- **Sin emojis ni signos de exclamación** en la interfaz del restaurante. "¡Listo!" se permite solo en la app del comensal, al asegurar una mesa.

### 14.1 Glosario

| Usar | No usar |
|---|---|
| Mesa · "Mesa 04" | Table, puesto |
| Comensal | Cliente, usuario final |
| Restaurante | Local, negocio, establecimiento |
| Disponible · Reservada · Ocupada · Inactiva (y en plural: **disponibles**, reservadas, ocupadas, inactivas) | Libre(s), apartada, en uso, eliminada |
| Abierto · Cerrado | Activo, en línea, offline |
| Capacidad · "4 personas" | Pax, puestos, sillas |
| Bitácora | Log, historial |
| Plano (del restaurante) · Cuadrícula | Mapa de mesas, layout |
| En vivo · Actualizado (con el `LiveIndicator`, 19) | Online, sincronizado |
| Asegurar mesa (comensal) | Reservar, bookear |
| Iniciar sesión · Cerrar sesión · Crear cuenta | Login, logout, salir, regístrate |

### 14.2 Textos comunes

| Momento | Texto |
|---|---|
| Toast al guardar | Cambios guardados |
| Toast al crear mesa | Mesa 04 agregada |
| Toast al cambiar estado | Mesa 04 ahora está Ocupada · Deshacer |
| Toast al desactivar | Mesa 04 desactivada · Deshacer |
| Toast al guardar el plano | Plano guardado |
| Toast al cerrar | Restaurante cerrado. Los comensales ya no lo ven · Deshacer |
| Conexión *(propuesta futura, sección 19)* | En vivo · Reconectando… · Sin conexión |
| Error de red | No pudimos conectarnos. Revisa tu conexión e intenta de nuevo. |
| Sesión vencida | Tu sesión terminó. Inicia sesión de nuevo. |
| Sin permiso | No tienes acceso a esta sección. |

---

## 15. Accesibilidad

- **Contraste AA** en todo texto (2.3); componentes, bordes de campos, forma de estado sobre su tinte y borde de selección ≥ 3:1. **Ningún texto con opacidad.**
- **Foco visible siempre** con `:focus-visible` (anillo de 3 px `--focus-ring`). **No queda tapado** por barras flotantes ni por el topbar (WCAG 2.4.11).
- **Teclado:**
  - Tab sigue el orden lógico; Enter y Espacio activan.
  - Flechas en el control segmentado, en el selector de estado y en el plano (modo edición).
  - Esc cierra.
  - D, R y O, con una mesa enfocada.
- **Arrastre con alternativa** (WCAG 2.5.7): toda mesa se mueve también con el teclado y con los botones del inspector.
- **Labels reales**, errores enlazados con `aria-describedby` y `aria-invalid` en los campos con error.
- **Estados = color + forma + palabra**, también para el lector de pantalla: la palabra es texto real.
- **Anuncios:** un `role="status"` en `/mesas` anuncia los movimientos del plano ("Mesa 04, fila 3, columna 16", "no cabe ahí"). Los errores se anuncian como `alert`. Anunciar ahí los cambios remotos (como máximo uno cada 5 s) es *(propuesta futura, sección 19)*.
- **Objetivos táctiles ≥ 44 px**, salvo el ⋯ de las tarjetas (`IconButton sm`, 40), que cumple el mínimo AA de 24 px; llevarlo a 44 es *(propuesta futura, sección 19)*.
- **Preferencias del sistema:** se respetan `prefers-reduced-motion` (11.5), `prefers-reduced-transparency` y `prefers-contrast` (7.4).
- **Idioma:** `lang="es-CO"` en `<html>`. En el móvil, `accessibilityRole`, `accessibilityLabel` y `accessibilityState` en todo lo interactivo.

---

## 16. Tokens

### 16.1 Stack de interfaz

- **Web:** Tailwind CSS v4 con estos tokens, los componentes propios de `src/components/ui`, `lucide-react` y `@fontsource/plus-jakarta-sans`. Radix UI sin estilos para el comportamiento accesible (diálogo, menú, select, switch, popover, tooltip). Sin MUI, Chakra, Bootstrap ni kits con estilos propios.
- **Móvil:** los mismos valores en `src/theme/tokens.ts`, NativeWind v4 (Tailwind v3), Reanimated 4 + Gesture Handler para el motion y `lucide-react-native`.
- **Dependencias nuevas:** se proponen con su motivo, su peso y sus alternativas, y esperan la aprobación de Sebastián. Aprobadas el 26 oct 2026 (se instalan con `npx expo install` en la fase del móvil):
  - **`expo-haptics`:** respuesta háptica en el móvil.
  - **`expo-blur`:** desenfoque real del login móvil en Android.

### 16.2 Estructura

```
web/src/
  styles/tokens.css     copia exacta de 16.3 (no se edita en otro lado)
  styles/globals.css    Tailwind + mapeo 16.4 + utilidades del manual
  components/ui/        el kit (sección 12) + README
mobile/src/
  theme/tokens.ts       copia exacta de 16.5
  theme/css-vars.ts     nombres de clase → claves de tokens.ts
  tailwind.config.js    mapeo 16.6
```

### 16.3 `tokens.css` (web, copiar tal cual)

```css
/* No editar: copia exacta del Manual de identidad v2.0, sección 16.3 */
/* ===== DiNNo design tokens v2.0 ===== */
:root{
  /* marca: no cambian con el tema (idénticos a v1.1) */
  --petrol:#103B46; --petrol-mid:#1D5661; --petrol-deep:#0B2D36;
  --orange:#F46935; --orange-deep:#B83F14; --orange-pressed:#DB5626; --orange-night:#FF8456; --amber:#F7A43B;
  --cream:#FAF7F1; --white:#FFFFFF; --ink:#10252B;
  --grad-petrol:linear-gradient(150deg,#0B2D36 0%,#12505A 60%,#1C6A6E 100%);
  --grad-orange:linear-gradient(135deg,#F46935 0%,#F7A43B 100%);
  /* forma */
  --r-card:20px; --r-tile:16px; --r-btn:14px; --r-input:12px; --r-sheet:28px; --r-chip:999px;
  /* espacio */
  --s-1:4px; --s-2:8px; --s-3:12px; --s-4:16px; --s-5:24px; --s-6:32px; --s-7:48px;
  /* tipografía */
  --font:"Plus Jakarta Sans",system-ui,sans-serif;
  /* motion */
  --ease:cubic-bezier(.2,.8,.2,1);
  --ease-enter:cubic-bezier(.23,1,.32,1); --ease-move:cubic-bezier(.77,0,.175,1); --ease-sheet:cubic-bezier(.32,.72,0,1);
  --dur-press:120ms; --dur-fast:150ms; --dur-base:200ms; --dur-slow:300ms; --dur-highlight:700ms;
  --motion-rise:8px; --motion-scale:.97;
  /* Espacio que el dock de navegación reserva abajo (v2.1): su alto + su margen + aire. */
  --dock-clearance:112px;
  /* vidrio */
  --glass-blur-panel:20px; --glass-blur-bar:16px; --glass-blur-map:16px; --glass-saturate:1.4;
  /* capas */
  --z-sticky:10; --z-dropdown:20; --z-drawer:30; --z-overlay:40; --z-modal:50; --z-toast:60;
}
@media (prefers-reduced-motion: reduce){ :root{ --motion-rise:0px; --motion-scale:1; } }

/* semánticos: claro (por defecto) */
:root, .t-light, [data-theme="light"]{
  --bg:#FAF7F1; --surface:#FFFFFF; --surface-2:#F2EFE8;
  --text:#10252B; --text-2:#5E6B70; --border:#E2E6E3; --border-strong:#8A9699;
  --accent:#F46935; --accent-pressed:#DB5626; --accent-text:#B83F14; --on-accent:#10252B;
  --brand:#103B46; --on-brand:#FAF7F1;
  --ok:#2B8F62; --limited:#B7801F; --reserved:#4E66C9; --busy:#6E7C80; --inactive:#8A9699; --error:#C8453A; --info:#1D5661;
  --nav-bg:#103B46; --nav-active:#1D5661; --nav-text:#FAF7F1; --nav-text-2:#A9BDC0;
  --inverse-bg:#103B46; --inverse-text:#FAF7F1; --inverse-accent:#FF8456;
  --overlay:rgba(11,45,54,.55); --focus-ring:0 0 0 3px rgba(244,105,53,.45);
  --glass-bg:rgba(255,255,255,.70); --glass-border:rgba(255,255,255,.65);
  --shadow-soft:0 1px 2px rgba(16,37,43,.05),0 10px 28px -12px rgba(16,37,43,.18);
  --shadow-float:0 12px 32px -12px rgba(16,37,43,.28);
  --m-ground:#E6E9E3; --m-block:#F6F4EE; --m-park:#D3E2D3; --m-water:#CBDFE3; --m-ave:#D5DCD7;
  /* v2.0 */
  --selection:#DB5626;
  --tint-ok:color-mix(in srgb,var(--ok) 18%,var(--surface));
  --tint-reserved:color-mix(in srgb,var(--reserved) 18%,var(--surface));
  --tint-busy:color-mix(in srgb,var(--busy) 18%,var(--surface));
  --tint-limited:color-mix(in srgb,var(--limited) 18%,var(--surface));
  --edge-ok:color-mix(in srgb,var(--ok) 45%,var(--surface));
  --edge-reserved:color-mix(in srgb,var(--reserved) 45%,var(--surface));
  --edge-busy:color-mix(in srgb,var(--busy) 45%,var(--surface));
  --edge-limited:color-mix(in srgb,var(--limited) 45%,var(--surface));
  --hatch-busy:color-mix(in srgb,var(--busy) 20%,transparent);
  --glass-panel-bg:color-mix(in srgb,var(--surface) 50%,transparent);
  --glass-bar-bg:color-mix(in srgb,var(--bg) 85%,transparent);
  --plan-canvas:var(--surface-2); --plan-dot:color-mix(in srgb,var(--border-strong) 45%,transparent);
}
/* semánticos: oscuro */
.t-dark, [data-theme="dark"]{
  --bg:#0B2D36; --surface:#103B46; --surface-2:#164853;
  --text:#FAF7F1; --text-2:#A9BDC0; --border:#24525D; --border-strong:#5E8A93;
  --accent:#FF8456; --accent-pressed:#F46935; --accent-text:#FF8456; --on-accent:#0B2D36;
  --brand:#103B46; --on-brand:#FAF7F1;
  --ok:#3FBF86; --limited:#E0A93B; --reserved:#8DA2F0; --busy:#8DA0A4; --inactive:#6F8C92; --error:#FF7B6E; --info:#7FC1CB;
  --nav-bg:#0B2D36; --nav-active:#164853; --nav-text:#FAF7F1; --nav-text-2:#A9BDC0;
  --inverse-bg:#FAF7F1; --inverse-text:#10252B; --inverse-accent:#B83F14;
  --overlay:rgba(0,0,0,.6); --focus-ring:0 0 0 3px rgba(255,132,86,.55);
  --glass-bg:rgba(16,59,70,.62); --glass-border:rgba(255,255,255,.16);
  --shadow-soft:0 1px 2px rgba(0,0,0,.25),0 10px 28px -12px rgba(0,0,0,.5);
  --shadow-float:0 12px 32px -12px rgba(0,0,0,.6);
  --m-ground:#0F3540; --m-block:#134451; --m-park:#14463F; --m-water:#0E4B5A; --m-ave:#1A5360;
  /* v2.0 */
  --selection:#FF8456;
  --tint-ok:color-mix(in srgb,var(--ok) 22%,var(--surface));
  --tint-reserved:color-mix(in srgb,var(--reserved) 22%,var(--surface));
  --tint-busy:color-mix(in srgb,var(--busy) 22%,var(--surface));
  --tint-limited:color-mix(in srgb,var(--limited) 22%,var(--surface));
  --edge-ok:color-mix(in srgb,var(--ok) 50%,var(--surface));
  --edge-reserved:color-mix(in srgb,var(--reserved) 50%,var(--surface));
  --edge-busy:color-mix(in srgb,var(--busy) 50%,var(--surface));
  --edge-limited:color-mix(in srgb,var(--limited) 50%,var(--surface));
  --hatch-busy:color-mix(in srgb,var(--busy) 20%,transparent);
  --glass-panel-bg:color-mix(in srgb,var(--surface) 50%,transparent);
  --glass-bar-bg:color-mix(in srgb,var(--bg) 85%,transparent);
  --plan-canvas:var(--surface-2); --plan-dot:color-mix(in srgb,var(--border-strong) 45%,transparent);
}

/* ===== v2.1 "Salón de vidrio" (27 oct 2026): el dashboard vive sobre la luz del login =====
   Fondo: las dos formas de marca del login, convertidas en luz difusa (sin bordes). Abierto = cálido; cerrado = apagado.
   Vidrio: hoja de contenido + tarjetas encima; riel de navegación en petróleo. Solo mezclas de la paleta. */
:root, .t-light, [data-theme="light"]{
  --amb-base:var(--cream);
  --amb-warm:color-mix(in srgb,var(--orange) 55%,transparent);
  --amb-glow:color-mix(in srgb,var(--amber) 36%,transparent);
  --amb-cool:color-mix(in srgb,var(--petrol) 42%,transparent);
  --amb-off:color-mix(in srgb,var(--inactive) 34%,transparent);
  --glass-sheet-bg:color-mix(in srgb,var(--surface) 30%,transparent);
  /* Texto secundario sobre la hoja: casi tinta (AA con la luz más fuerte detrás); en tarjetas vuelve a --text-2-base. */
  --text-2-sheet:color-mix(in srgb,var(--ink) 85%,var(--white)); --text-2-base:#5E6B70;
  --glass-card-bg:color-mix(in srgb,var(--surface) 72%,transparent);
  --glass-pill-bg:color-mix(in srgb,var(--surface) 64%,transparent);
  /* Dock de navegación (v2.1): sigue al tema. Claro: vidrio claro con la activa en petróleo. */
  --dock-bg:var(--glass-pill-bg); --dock-fg:var(--text); --dock-active-bg:var(--petrol); --dock-active-fg:var(--cream);
  --dock-hover:color-mix(in srgb,var(--petrol) 8%,transparent); --dock-glow:color-mix(in srgb,var(--orange) 14%,transparent);
  --glass-edge:rgba(255,255,255,.62);
  --glass-sheen:inset 0 1px 0 rgba(255,255,255,.7);
  --shadow-sheet:0 2px 8px -4px rgba(16,37,43,.10),0 48px 96px -56px rgba(16,37,43,.45);
  --shadow-lift:0 2px 6px -2px rgba(16,37,43,.08),0 22px 40px -22px rgba(16,37,43,.38);
  --grad-highlight:linear-gradient(140deg,var(--petrol-deep) 0%,var(--petrol) 42%,#1C6A6E 72%,var(--ok) 100%);
  --plan-canvas:color-mix(in srgb,var(--surface) 56%,transparent);
}
.t-dark, [data-theme="dark"]{
  --amb-base:var(--petrol-deep);
  --amb-warm:color-mix(in srgb,var(--orange) 34%,transparent);
  --amb-glow:color-mix(in srgb,var(--amber) 14%,transparent);
  --amb-cool:color-mix(in srgb,#1C6A6E 55%,transparent);
  --amb-off:color-mix(in srgb,var(--inactive) 18%,transparent);
  --glass-sheet-bg:color-mix(in srgb,var(--surface) 40%,transparent);
  --text-2-sheet:#A9BDC0; --text-2-base:#A9BDC0;
  --glass-card-bg:color-mix(in srgb,var(--surface) 72%,transparent);
  --glass-pill-bg:color-mix(in srgb,var(--surface) 70%,transparent);
  --dock-bg:color-mix(in srgb,var(--petrol-deep) 76%,transparent); --dock-fg:var(--cream); --dock-active-bg:var(--cream); --dock-active-fg:var(--petrol);
  --dock-hover:rgba(255,255,255,.08); --dock-glow:color-mix(in srgb,var(--orange) 20%,transparent);
  --glass-edge:rgba(255,255,255,.10);
  --glass-sheen:inset 0 1px 0 rgba(255,255,255,.08);
  --shadow-sheet:0 2px 8px -4px rgba(0,0,0,.3),0 48px 96px -56px rgba(0,0,0,.7);
  --shadow-lift:0 2px 6px -2px rgba(0,0,0,.3),0 22px 40px -22px rgba(0,0,0,.7);
  --grad-highlight:linear-gradient(140deg,#12505A 0%,#1C6A6E 48%,#2B8F62 78%,var(--ok) 100%);
  --plan-canvas:color-mix(in srgb,var(--surface) 62%,transparent);
}
```

Los nombres de los tokens de motion y de vidrio **no coinciden a propósito** con los de Tailwind (`--ease-out`, `--blur-*`), para que el mapeo de 16.4 no se pise.

### 16.4 `globals.css` (web, Tailwind v4)

Copia del archivo implementado (`frontend/src/styles/globals.css`, 27 oct 2026). Mapea los tokens de 16.3 a Tailwind con `@theme inline` y define las utilidades que el manual nombra sin token: vidrios, texturas, `press`, `plan-node`, `plan-drop` y los keyframes de 11.3. Si cambia el archivo, se cambia aquí en el mismo PR.

```css
@import "tailwindcss";
@import "./tokens.css";
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *, .t-dark, .t-dark *));

@theme inline {
  --font-sans: var(--font);
  --color-bg: var(--bg);            --color-surface: var(--surface);   --color-surface-2: var(--surface-2);
  --color-fg: var(--text);          --color-fg-2: var(--text-2);
  --color-line: var(--border);      --color-line-strong: var(--border-strong);
  --color-accent: var(--accent);    --color-accent-pressed: var(--accent-pressed);
  --color-accent-text: var(--accent-text); --color-on-accent: var(--on-accent);
  --color-brand: var(--brand);      --color-on-brand: var(--on-brand);
  --color-ok: var(--ok); --color-limited: var(--limited); --color-reserved: var(--reserved);
  --color-busy: var(--busy); --color-inactive: var(--inactive); --color-error: var(--error); --color-info: var(--info);
  --color-nav: var(--nav-bg); --color-nav-active: var(--nav-active); --color-nav-fg: var(--nav-text); --color-nav-fg-2: var(--nav-text-2);
  --color-inverse: var(--inverse-bg); --color-on-inverse: var(--inverse-text); --color-inverse-accent: var(--inverse-accent);
  --color-selection: var(--selection);
  --color-tint-ok: var(--tint-ok); --color-tint-reserved: var(--tint-reserved);
  --color-tint-busy: var(--tint-busy); --color-tint-limited: var(--tint-limited);
  --color-edge-ok: var(--edge-ok); --color-edge-reserved: var(--edge-reserved);
  --color-edge-busy: var(--edge-busy); --color-edge-limited: var(--edge-limited);
  --color-glass-panel: var(--glass-panel-bg); --color-glass-bar: var(--glass-bar-bg);
  --radius-card: var(--r-card); --radius-tile: var(--r-tile); --radius-btn: var(--r-btn);
  --radius-input: var(--r-input); --radius-sheet: var(--r-sheet);
  --shadow-card: var(--shadow-soft); --shadow-lifted: var(--shadow-float);
  --ease-dinno: var(--ease);
  --ease-dinno-enter: var(--ease-enter); --ease-dinno-move: var(--ease-move); --ease-dinno-sheet: var(--ease-sheet);
  --blur-panel: var(--glass-blur-panel); --blur-bar: var(--glass-blur-bar); --blur-map: var(--glass-blur-map);
  /* tipografía v2.0 (manual 4): text-display, text-h1, text-h2, text-h3, text-body, text-sec, text-label, text-kicker, text-metric, text-figure */
  --text-display: 48px; --text-display--line-height: 52px; --text-display--letter-spacing: -0.03em; --text-display--font-weight: 800;
  --text-h1: 28px; --text-h1--line-height: 32px; --text-h1--letter-spacing: -0.025em; --text-h1--font-weight: 800;
  --text-h2: 22px; --text-h2--line-height: 28px; --text-h2--letter-spacing: -0.015em; --text-h2--font-weight: 700;
  --text-h3: 18px; --text-h3--line-height: 24px; --text-h3--letter-spacing: -0.01em; --text-h3--font-weight: 700;
  --text-body: 16px; --text-body--line-height: 24px; --text-body--font-weight: 500;
  --text-sec: 14px; --text-sec--line-height: 20px; --text-sec--font-weight: 500;
  --text-label: 12px; --text-label--line-height: 16px; --text-label--letter-spacing: 0.01em; --text-label--font-weight: 700;
  --text-kicker: 11px; --text-kicker--line-height: 14px; --text-kicker--letter-spacing: 0.08em; --text-kicker--font-weight: 700;
  --text-metric: 28px; --text-metric--line-height: 32px; --text-metric--letter-spacing: -0.03em; --text-metric--font-weight: 800;
  --text-figure: 54px; --text-figure--line-height: 54px; --text-figure--letter-spacing: -0.04em; --text-figure--font-weight: 800;
}

@layer base {
  html { font-family: var(--font); background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }
  p { text-wrap: pretty; }
  h1, h2, h3 { text-wrap: balance; }
  :focus-visible { outline: none; box-shadow: var(--focus-ring); }
  /* Reducir movimiento (manual 11.5): los keyframes leen --motion-rise/--motion-scale, que valen 0 y 1; aquí se
     detienen los bucles y lo que recorre la pantalla entera pasa a un fundido. Los fundidos se conservan. */
  @media (prefers-reduced-motion: reduce) {
    .animate-live-pulse, .animate-skeleton { animation: none !important; }
    .animate-drawer-in, .animate-sheet-in { animation-name: fade-in !important; }
    ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; }
  }
}
@layer base { [data-theme="dark"], .t-dark { color-scheme: dark; } }               /* controles nativos en oscuro */

/* ===== Login (no se rediseña, manual 13.9): conserva la escala tipográfica y el movimiento reducido del v1.1 ===== */
.glass-login .text-h1 { font-size: 32px; line-height: 36px; letter-spacing: -0.03em; font-weight: 800; }
.glass-login .text-h2 { font-size: 24px; line-height: 28px; letter-spacing: -0.02em; font-weight: 700; }
.glass-login .text-label { font-size: 11px; line-height: 14px; letter-spacing: 0.08em; font-weight: 700; }
@media (prefers-reduced-motion: reduce) {
  .glass-login, .glass-login * { transition-duration: .01ms !important; }
}

/* ===== Utilidades del manual v2.0 (16.4): valores sin token y piezas compuestas ===== */
@utility text-btn { font-size: 15px; line-height: 20px; font-weight: 700; }      /* texto de botón 15/20 700 · manual 4 */
@utility border-field { border-width: 1.5px; }                                      /* borde de campos · manual 6.2 */
@utility grid-tables { grid-template-columns: repeat(auto-fill, minmax(min(168px, calc(50% - 6px)), 1fr)); grid-auto-rows: 1fr; } /* dos columnas también en el teléfono */ /* grilla de mesas · manual 13.10 */

/* Vidrio (manual 7) con su respaldo sólido. Encima, solo texto en tinta o crema. */
@utility glass-panel {
  background: var(--glass-panel-bg); border: 1px solid var(--glass-border); box-shadow: var(--shadow-float);
  backdrop-filter: blur(var(--glass-blur-panel)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur-panel)) saturate(var(--glass-saturate));
  @supports not (backdrop-filter: blur(1px)) { background: var(--surface); }
  @media (prefers-reduced-transparency: reduce) { background: var(--surface); backdrop-filter: none; -webkit-backdrop-filter: none; }
  @media (prefers-contrast: more) { background: var(--surface); border-color: var(--border-strong); backdrop-filter: none; -webkit-backdrop-filter: none; }
}
@utility glass-bar {
  background: var(--glass-bar-bg);
  backdrop-filter: blur(var(--glass-blur-bar)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur-bar)) saturate(var(--glass-saturate));
  @supports not (backdrop-filter: blur(1px)) { background: var(--bg); }
  @media (prefers-reduced-transparency: reduce) { background: var(--bg); backdrop-filter: none; -webkit-backdrop-filter: none; }
}
/* Login: formas de marca en dos esquinas y tarjeta de vidrio encima (manual 7.1 y 13.9, sin cambios). */
@utility login-blob-start { position: fixed; top: -55vmin; left: -55vmin; width: 110vmin; height: 110vmin; border-radius: 47% 53% 61% 39% / 45% 51% 49% 55%; pointer-events: none; }
@utility login-blob-end { position: fixed; right: -55vmin; bottom: -55vmin; width: 110vmin; height: 110vmin; border-radius: 47% 53% 61% 39% / 45% 51% 49% 55%; pointer-events: none; }
@utility glass-login {
  background: color-mix(in srgb, var(--surface) 55%, transparent);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(44px) saturate(1.5);
  -webkit-backdrop-filter: blur(44px) saturate(1.5);
  @supports not (backdrop-filter: blur(1px)) { background: var(--surface); }
  @media (prefers-reduced-transparency: reduce) { background: var(--surface); backdrop-filter: none; -webkit-backdrop-filter: none; }
}

/* Texturas de la forma (manual 8): el "cuadrado rayado" de Ocupada y la trama del plano. No son gradientes de adorno. */
@utility hatch-busy { background-image: repeating-linear-gradient(135deg, var(--hatch-busy) 0 2px, transparent 2px 8px); }
/* La trama del plano. El color lo pone su marco (v2.1), así el lienzo y el borde del marco nunca dejan una costura. */
@utility plan-canvas {
  background-image: radial-gradient(circle, var(--plan-dot) 1px, transparent 1.5px);
  background-size: var(--plan-cell, 44px) var(--plan-cell, 44px);
}

/* Mesa en el plano (manual 13.10 y 11.3): se desliza a su celda al soltarla (200 ms, --ease-enter), vuelve con
   --ease-move si no cabía, y el estado cambia con un fundido de color. Con el teclado se mueve sin animar (11.4).
   Reducir movimiento: solo el color. */
@utility plan-node {
  position: absolute; top: 0; left: 0;
  transition: transform var(--dur-base) var(--ease-enter), background-color var(--dur-base) var(--ease), border-color var(--dur-base) var(--ease), box-shadow var(--dur-fast) var(--ease);
  &[data-editing="true"] { cursor: grab; touch-action: none; }
  &[data-dragging="true"] { transition: none; z-index: 2; cursor: grabbing; box-shadow: var(--shadow-float); }
  &[data-returning="true"] { transition-duration: var(--dur-slow); transition-timing-function: var(--ease-move); }
  &[data-instant="true"] { transition: none; }
  @media (prefers-reduced-motion: reduce) { transition-property: background-color, border-color, box-shadow; }
}
/* Celda de destino mientras se arrastra: naranja de selección si cabe, rojo de error si no. */
@utility plan-drop {
  position: absolute; top: 0; left: 0; pointer-events: none;
  border: 2px dashed var(--selection);
  &[data-valid="false"] { border-color: var(--error); }
}

/* ===== v2.1 "Salón de vidrio" (manual 7 y 8): luz de fondo, hoja, tarjetas, píldoras y riel =====
   La luz es fija y no pesa: tres gradientes radiales enormes, sin desenfoque. Abierto = cálido (naranja + ámbar);
   cerrado = apagado (gris). Se cruzan en --dur-highlight. Todo vidrio tiene su respaldo sólido. */
@utility app-ambient { position: fixed; inset: 0; z-index: -1; pointer-events: none; background-color: var(--amb-base); }
@utility amb-open {
  background-image:
    radial-gradient(64vmax 52vmax at 22% -16%, var(--amb-warm), transparent 66%),
    radial-gradient(46vmax 40vmax at 96% 6%, var(--amb-glow), transparent 66%),
    radial-gradient(58vmax 52vmax at -8% 108%, var(--amb-cool), transparent 64%),
    radial-gradient(78vmax 66vmax at 112% 116%, var(--amb-cool), transparent 64%);
}
@utility amb-closed {
  background-image:
    radial-gradient(64vmax 52vmax at 22% -16%, var(--amb-off), transparent 66%),
    radial-gradient(58vmax 52vmax at -8% 108%, var(--amb-cool), transparent 64%),
    radial-gradient(78vmax 66vmax at 112% 116%, var(--amb-cool), transparent 64%);
}
@utility glass-sheet {
  background: var(--glass-sheet-bg); border: 1px solid var(--glass-edge); box-shadow: var(--glass-sheen), var(--shadow-sheet);
  backdrop-filter: blur(28px) saturate(1.5); -webkit-backdrop-filter: blur(28px) saturate(1.5);
  @supports not (backdrop-filter: blur(1px)) { background: var(--bg); }
  @media (prefers-reduced-transparency: reduce) { background: var(--bg); backdrop-filter: none; -webkit-backdrop-filter: none; }
  @media (prefers-contrast: more) { background: var(--bg); border-color: var(--border-strong); backdrop-filter: none; -webkit-backdrop-filter: none; }
}
/* Sobre la hoja, el texto secundario usa --text-2-sheet; dentro de una tarjeta o superficie sólida vuelve al de siempre. */
.glass-sheet { --text-2: var(--text-2-sheet); }
.glass-sheet :is(.glass-card, .bg-surface, .bg-surface-2) { --text-2: var(--text-2-base); }
@utility glass-card {
  background: var(--glass-card-bg); border: 1px solid var(--glass-edge); box-shadow: var(--glass-sheen);
  backdrop-filter: blur(16px) saturate(1.3); -webkit-backdrop-filter: blur(16px) saturate(1.3);
  @supports not (backdrop-filter: blur(1px)) { background: var(--surface); }
  @media (prefers-reduced-transparency: reduce) { background: var(--surface); backdrop-filter: none; -webkit-backdrop-filter: none; }
  @media (prefers-contrast: more) { background: var(--surface); border-color: var(--border-strong); backdrop-filter: none; -webkit-backdrop-filter: none; }
}
@utility glass-pill {
  background: var(--glass-pill-bg); border: 1px solid var(--glass-edge); box-shadow: var(--glass-sheen), var(--shadow-float);
  backdrop-filter: blur(20px) saturate(1.5); -webkit-backdrop-filter: blur(20px) saturate(1.5);
  @supports not (backdrop-filter: blur(1px)) { background: var(--surface); }
  @media (prefers-reduced-transparency: reduce) { background: var(--surface); backdrop-filter: none; -webkit-backdrop-filter: none; }
  @media (prefers-contrast: more) { background: var(--surface); border-color: var(--border-strong); backdrop-filter: none; -webkit-backdrop-filter: none; }
}
/* Dock de navegación (v2.1): vidrio que sigue al tema, con un brillo cálido que sube desde abajo. Flota centrado. */
@utility glass-dock {
  background: radial-gradient(70% 120% at 50% 130%, var(--dock-glow), transparent 70%), var(--dock-bg);
  border: 1px solid var(--glass-edge); box-shadow: var(--glass-sheen), var(--shadow-sheet);
  backdrop-filter: blur(24px) saturate(1.5); -webkit-backdrop-filter: blur(24px) saturate(1.5);
  @supports not (backdrop-filter: blur(1px)) { background: var(--surface); }
  @media (prefers-reduced-transparency: reduce) { background: var(--surface); backdrop-filter: none; -webkit-backdrop-filter: none; }
  @media (prefers-contrast: more) { background: var(--surface); border-color: var(--border-strong); backdrop-filter: none; -webkit-backdrop-filter: none; }
}
@utility dock-position { position: fixed; left: 50%; bottom: calc(16px + env(safe-area-inset-bottom)); translate: -50% 0; z-index: var(--z-sticky); }
/* El ícono del dock se asoma al pasar el puntero, como en macOS. `translate` + `scale`, así se suma a `press`. */
@utility dock-magnify {
  transition-property: translate, scale; transition-duration: var(--dur-base); transition-timing-function: var(--ease-enter);
  @media (hover: hover) and (pointer: fine) { :where(a, button):hover > & { translate: 0 -4px; scale: 1.08; } }
  @media (prefers-reduced-motion: reduce) { :where(a, button):hover > & { translate: none; scale: none; } }
}
/* Degradado petróleo → verde de la marca (el avatar de la cuenta). */
@utility bg-highlight { background-image: var(--grad-highlight); }
/* Levantar al pasar el puntero: `translate` (no `transform`), así se suma a `press` sin pelear. */
@utility lift {
  transition-property: translate, box-shadow, background-color, border-color;
  transition-duration: var(--dur-base); transition-timing-function: var(--ease-enter);
  @media (hover: hover) and (pointer: fine) { &:hover { translate: 0 -3px; box-shadow: var(--glass-sheen), var(--shadow-lift); } }
  @media (prefers-reduced-motion: reduce) { &:hover { translate: none; } }
}
@utility rounded-sheet-lg { border-radius: 32px; }  /* la hoja de contenido (v2.1) */
@utility text-hero { font-size: 36px; line-height: 40px; letter-spacing: -0.03em; font-weight: 800; text-wrap: balance; }  /* saludo de /mesas (v2.1) */

/* Presionar (manual 11.3): escala 0,97 (1 con reducir movimiento). */
@utility press {
  transition-property: transform, color, background-color, border-color, box-shadow, filter, opacity;
  transition-duration: var(--dur-press);
  transition-timing-function: var(--ease-enter);
  &:active:not(:disabled):not([aria-disabled="true"]) { transform: scale(var(--motion-scale)); }
}

/* ===== Motion (manual 11.3): los keyframes leen --motion-rise / --motion-scale ===== */
@theme { --animate-rise-in: rise-in var(--dur-slow) var(--ease-enter); }          /* diálogos */
@theme { --animate-rise-in-fast: rise-in var(--dur-base) var(--ease-enter); }     /* toasts y barras entrando */
@keyframes rise-in { from { opacity: 0; transform: translateY(var(--motion-rise)) scale(var(--motion-scale)); } to { opacity: 1; transform: none; } }
@theme { --animate-drop-in: drop-in var(--dur-base) var(--ease-enter); }          /* toasts, que llegan desde arriba (v2.1) */
@keyframes drop-in { from { opacity: 0; transform: translateY(calc(var(--motion-rise) * -1)) scale(var(--motion-scale)); } to { opacity: 1; transform: none; } }
@theme { --animate-lift-out: lift-out var(--dur-fast) var(--ease-enter) forwards; }
@keyframes lift-out { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateY(calc(var(--motion-rise) * -1)) scale(var(--motion-scale)); } }
@theme { --animate-sink-out: sink-out var(--dur-fast) var(--ease-enter) forwards; } /* salida de diálogos y toasts */
@keyframes sink-out { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateY(var(--motion-rise)) scale(var(--motion-scale)); } }
@theme { --animate-pop-in: pop-in var(--dur-base) var(--ease-enter); }            /* menús y selector, desde su origen */
@theme { --animate-pop-out: pop-out var(--dur-fast) var(--ease-enter) forwards; }
@keyframes pop-in { from { opacity: 0; transform: scale(var(--motion-scale)); } to { opacity: 1; transform: none; } }
@keyframes pop-out { from { opacity: 1; transform: none; } to { opacity: 0; transform: scale(var(--motion-scale)); } }
@theme { --animate-fade-in: fade-in var(--dur-slow) var(--ease); }               /* overlays */
@theme { --animate-fade-in-fast: fade-in var(--dur-base) var(--ease); }
@theme { --animate-fade-out: fade-out var(--dur-fast) var(--ease) forwards; }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
@theme { --animate-drawer-in: drawer-in var(--dur-slow) var(--ease-sheet); }     /* drawer del sidebar en < 1024 */
@keyframes drawer-in { from { transform: translateX(-100%); } to { transform: none; } }
@theme { --animate-sheet-in: sheet-in var(--dur-slow) var(--ease-sheet); }       /* hoja inferior en < 768 */
@keyframes sheet-in { from { transform: translateY(100%); } to { transform: none; } }
@theme { --animate-remote-change: remote-change var(--dur-highlight) var(--ease-enter) 1 forwards; } /* cambio desde otro dispositivo */
@keyframes remote-change { from { opacity: .9; transform: scale(1); } to { opacity: 0; transform: scale(calc(2 - var(--motion-scale))); } }
@theme { --animate-live-pulse: live-pulse 2s var(--ease) infinite; }              /* pulso del Active Dot "Abierto" / "En vivo" */
@keyframes live-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
@theme { --animate-skeleton: skeleton-pulse 1.2s var(--ease) infinite; }        /* pulso de opacidad del skeleton */
@keyframes skeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
```

### 16.5 `tokens.ts` (móvil, copiar tal cual)

```ts
// DiNNo design tokens (manual de identidad v2.0, sección 16.5). Único archivo con valores crudos.
export const light = {
  bg:'#FAF7F1', surface:'#FFFFFF', surface2:'#F2EFE8', text:'#10252B', text2:'#5E6B70',
  border:'#E2E6E3', borderStrong:'#8A9699', accent:'#F46935', accentPressed:'#DB5626', accentText:'#B83F14', onAccent:'#10252B',
  brand:'#103B46', onBrand:'#FAF7F1', ok:'#2B8F62', limited:'#B7801F', reserved:'#4E66C9', busy:'#6E7C80',
  inactive:'#8A9699', error:'#C8453A', info:'#1D5661', inverseBg:'#103B46', inverseText:'#FAF7F1', inverseAccent:'#FF8456',
  // v2.0: mezclas de la paleta (tinte 18% y borde 45% sobre surface), selección
  selection:'#DB5626', tintOk:'#D9EBE3', tintReserved:'#DFE3F5', tintBusy:'#E5E7E8', tintLimited:'#F2E8D7',
  edgeOk:'#A0CDB8', edgeReserved:'#AFBAE7', edgeBusy:'#BEC4C6', edgeLimited:'#DFC69A',
};
export const dark: typeof light = {
  bg:'#0B2D36', surface:'#103B46', surface2:'#164853', text:'#FAF7F1', text2:'#A9BDC0',
  border:'#24525D', borderStrong:'#5E8A93', accent:'#FF8456', accentPressed:'#F46935', accentText:'#FF8456', onAccent:'#0B2D36',
  brand:'#103B46', onBrand:'#FAF7F1', ok:'#3FBF86', limited:'#E0A93B', reserved:'#8DA2F0', busy:'#8DA0A4',
  inactive:'#6F8C92', error:'#FF7B6E', info:'#7FC1CB', inverseBg:'#FAF7F1', inverseText:'#10252B', inverseAccent:'#B83F14',
  // v2.0: tinte 22% y borde 50% sobre surface
  selection:'#FF8456', tintOk:'#1A5854', tintReserved:'#2C526B', tintBusy:'#2C515B', tintLimited:'#3E5344',
  edgeOk:'#287D66', edgeReserved:'#4F6F9B', edgeBusy:'#4F6E75', edgeLimited:'#787241',
};
export const lightExtras = {
  overlay:'rgba(11,45,54,.55)', focusRing:'rgba(244,105,53,.45)',
  glassBg:'rgba(255,255,255,.70)', glassBorder:'rgba(255,255,255,.65)',
  glassPanel:'rgba(255,255,255,.50)', glassBar:'rgba(250,247,241,.85)', glassSolid:'rgba(255,255,255,.92)',
  shadowSoft:'0 1px 2px rgba(16,37,43,.05), 0 10px 28px -12px rgba(16,37,43,.18)',
  shadowFloat:'0 12px 32px -12px rgba(16,37,43,.28)',
  mapGround:'#E6E9E3', mapBlock:'#F6F4EE', mapPark:'#D3E2D3', mapWater:'#CBDFE3', mapAvenue:'#D5DCD7',
};
export const darkExtras: typeof lightExtras = {
  overlay:'rgba(0,0,0,.6)', focusRing:'rgba(255,132,86,.55)',
  glassBg:'rgba(16,59,70,.62)', glassBorder:'rgba(255,255,255,.16)',
  glassPanel:'rgba(16,59,70,.50)', glassBar:'rgba(11,45,54,.85)', glassSolid:'rgba(16,59,70,.92)',
  shadowSoft:'0 1px 2px rgba(0,0,0,.25), 0 10px 28px -12px rgba(0,0,0,.5)',
  shadowFloat:'0 12px 32px -12px rgba(0,0,0,.6)',
  mapGround:'#0F3540', mapBlock:'#134451', mapPark:'#14463F', mapWater:'#0E4B5A', mapAvenue:'#1A5360',
};
export const radius = { card:20, tile:16, btn:14, input:12, sheet:28, chip:999 };
export const space = { 1:4, 2:8, 3:12, 4:16, 5:24, 6:32, 7:48 };
export const type = {
  display:{ fontSize:48, lineHeight:52, fontFamily:'PlusJakartaSans_800ExtraBold', letterSpacing:-1.44 },
  h1:{ fontSize:28, lineHeight:32, fontFamily:'PlusJakartaSans_800ExtraBold', letterSpacing:-0.7 },
  h2:{ fontSize:22, lineHeight:28, fontFamily:'PlusJakartaSans_700Bold', letterSpacing:-0.33 },
  h3:{ fontSize:18, lineHeight:24, fontFamily:'PlusJakartaSans_700Bold', letterSpacing:-0.18 },
  body:{ fontSize:16, lineHeight:24, fontFamily:'PlusJakartaSans_500Medium' },
  sec:{ fontSize:14, lineHeight:20, fontFamily:'PlusJakartaSans_500Medium' },
  label:{ fontSize:12, lineHeight:16, fontFamily:'PlusJakartaSans_700Bold', letterSpacing:0.12 },
  kicker:{ fontSize:11, lineHeight:14, fontFamily:'PlusJakartaSans_700Bold', letterSpacing:0.88, textTransform:'uppercase' as const },
  metric:{ fontSize:28, lineHeight:32, fontFamily:'PlusJakartaSans_800ExtraBold', letterSpacing:-0.84, fontVariant:['tabular-nums'] as const },
  figure:{ fontSize:54, lineHeight:54, fontFamily:'PlusJakartaSans_800ExtraBold', letterSpacing:-2.16, fontVariant:['tabular-nums'] as const },
};
export const motion = {
  press:120, fast:150, base:200, slow:300, highlight:700,
  easing:[0.2,0.8,0.2,1] as const,          // --ease
  enter:[0.23,1,0.32,1] as const,           // --ease-enter
  move:[0.77,0,0.175,1] as const,           // --ease-move
  sheet:[0.32,0.72,0,1] as const,           // --ease-sheet
  pressScale:0.97,
  spring:{ snappy:{ duration:350, dampingRatio:0.9 }, gentle:{ duration:500, dampingRatio:0.8 } },
};
export const textExtras = {
  button:{ fontSize:15, lineHeight:20, fontFamily:'PlusJakartaSans_700Bold' },
  fieldLabel:{ fontSize:14, lineHeight:20, fontFamily:'PlusJakartaSans_700Bold' },
  chip:{ fontSize:12, lineHeight:16, fontFamily:'PlusJakartaSans_700Bold' },
};
```

Los tintes del móvil son los mismos colores que la web obtiene con `color-mix` (tinte al 18% y borde al 45% en claro; 22% y 50% en oscuro, sobre `surface`). Si cambia un color de estado, se recalculan los dos.

### 16.6 `tailwind.config.js` y `css-vars.ts` (móvil)

- **`colorNames`** agrega: `'selection', 'tint-ok', 'tint-reserved', 'tint-busy', 'tint-limited'`.
- **`colorTokens`** (`css-vars.ts`) agrega: `selection: 'selection'`, `'tint-ok': 'tintOk'`, `'tint-reserved': 'tintReserved'`, `'tint-busy': 'tintBusy'` y `'tint-limited': 'tintLimited'`. El test que compara las dos listas sigue igual.
- **`fontSize`:**
  - Cambian `h1: ['28px', { lineHeight: '32px', letterSpacing: '-0.7px' }]`, `h2: ['22px', { lineHeight: '28px', letterSpacing: '-0.33px' }]` y `label: ['12px', { lineHeight: '16px', letterSpacing: '0.12px' }]`.
  - Se agregan `kicker: ['11px', { lineHeight: '14px', letterSpacing: '0.88px' }]` y `metric: ['28px', { lineHeight: '32px', letterSpacing: '-0.84px' }]`.
- **`Text`:** agrega las variantes `kicker` (`text-kicker font-bold uppercase`) y `metric` (`text-metric font-extrabold`, con `tabular`). `label` deja de llevar `uppercase`.
- **Vidrio:** los colores con alfa (`glassPanel`, `glassBar`, `glassSolid`) se leen con `useTheme().colors` dentro de `GlassSurface`, porque la opacidad cambia por tema.

---

## 17. Reglas para el equipo

### 17.1 Cómo usar tokens y componentes

- **Arma la pantalla con el kit.** Primero busca en `src/components/ui` (README y `/kit` en desarrollo). Solo si no existe, crea una pieza (17.2).
- **Solo clases de tokens:** `bg-surface`, `text-fg-2`, `rounded-tile`, `shadow-lifted`, `bg-tint-ok`. Si un token no tiene clase, usa `bg-(--token)`. Nada de hex, `rgb()`, valores arbitrarios (`-[…]`), paleta, radios ni sombras por defecto de Tailwind, ni opacidad en texto (`text-fg/60`, `opacity-70`).
- **Estados de mesa y disponibilidad:** solo desde `STATUS_META`. Formatos: solo desde `@/lib/format`.
- **Motion:** solo con los tokens de 11.2 y las utilidades de 16.4. Ninguna duración ni curva suelta.

### 17.2 Cómo crear un componente nuevo sin romper la consistencia

1. **Primero se busca.** ¿Lo resuelve una variante de algo que ya existe? Las variantes se prefieren a los componentes nuevos.
2. **Vive en el kit** (`src/components/ui` en los dos repos), nunca dentro de una funcionalidad. Se exporta desde `index.ts`.
3. **Usa solo tokens** y trae todos sus estados (sección 12), modo oscuro, reducir movimiento y transparencia, objetivos de 44 px y nombre accesible.
4. **Tiene su prueba** (Vitest + Testing Library en la web; jest-expo en el móvil) y su entrada en `/kit` y en el README del kit.
5. **Si existe en los dos productos**, tiene el mismo nombre y las mismas props en la web y en el móvil (12.1). Cualquier diferencia se justifica en el README.
6. **Se avisa en `AVISOS.md`** del repo con qué cambió, para quién y en qué rama.

### 17.3 Qué no se cambia arbitrariamente

Esto se cambia solo con la aprobación de Sebastián y con una nueva versión del manual:

- La paleta y sus mezclas (opacidades, tintes, vidrio).
- El logo.
- El vocabulario de estados (colores, formas y palabras).
- La familia tipográfica y la escala.
- Los radios, la elevación y los tokens de motion.
- El glosario.
- El login web.

Los tokens (`tokens.css`, `tokens.ts`) **son copia exacta de la sección 16 y no se editan a mano**: si cambia el manual, se copia de nuevo.

### 17.4 Checklist antes de hacer merge

- [ ] Sin hex, `rgb()`, valores arbitrarios ni opacidad en texto: todo sale de tokens. `npm run check:ui` en verde.
- [ ] La pantalla usa el kit; lo nuevo quedó en el kit, con prueba, en `/kit` y avisado.
- [ ] Un solo primario naranja por contexto, con texto en tinta; ninguna acción rara en naranja.
- [ ] Texto naranja sobre claro = `--accent-text` al 100%.
- [ ] Cada estado tiene color + forma + palabra, con las palabras del glosario.
- [ ] El vidrio solo está en la capa flotante, nunca bajo datos, con tinta encima y respaldo sólido.
- [ ] Ningún gradiente fuera de un momento de marca.
- [ ] Formularios: label arriba, "(opcional)", error con ícono y mensaje útil, botón con estado de carga.
- [ ] Hay carga (skeleton con la medida real), vacío y error dentro del bloque.
- [ ] Funciona en claro y oscuro; en 1280 / 1024 / 768 / 390 (web) o 360 / 390 / 430 (móvil); con reducir movimiento y reducir transparencia.
- [ ] Teclado completo, foco visible y nunca tapado, objetivos ≥ 44 px, y alternativa a todo arrastre.
- [ ] Cada animación pasó el filtro de 11.1, dura menos de 300 ms (salvo el aviso remoto), sale por donde entró y se puede interrumpir.
- [ ] Íconos solo de Lucide, sin comida ni pins genéricos.
- [ ] Textos tuteando, con mayúscula inicial y botones con verbo + objeto.

---

## 18. Cambios desde v1.1

| Regla del v1.1 | En el v2.0 | Motivo |
|---|---|---|
| 0 · Crema manda 72/19/9 | **Se conserva** | Identidad |
| 0 · Naranja = acción o "ahora" | **Se conserva**, y se agrega "no se gasta en acciones raras" | El naranja de "Agregar mesa" competía con lo importante en servicio |
| 0 · Texto naranja = `#B83F14` | **Se conserva**, y se agrega "el texto nunca pierde opacidad" | El login y la mesa inactiva fallaban el AA por opacidad |
| 0 · Estado = color + forma + palabra | **Se conserva** | Regla fija |
| 0 y 7 · Liquid Glass solo sobre el mapa; nada de vidrio en el dashboard | **Se modifica:** cuatro vidrios en la capa flotante (panel, barra, mapa, login), nunca bajo datos, tinta encima y respaldo sólido | Jerarquía de capas; el login como referencia; el contexto queda visible detrás de lo que flota |
| 0 y 5 · Gradiente solo en momentos de marca | **Se modifica:** se suman el cierre del registro y el primer uso del plano; siguen siendo dos gradientes; rayado y trama se documentan como texturas | Más momentos de marca, sin tocar las pantallas de trabajo |
| 0 · Active Dot poco y con sentido | **Se conserva**; el "En vivo" del `LiveIndicator` es *(propuesta futura, 19)* | El tiempo real se verá cuando exista el socket del restaurante |
| 1 · Logo | **Se conserva** | Regla fija |
| 2 · Paleta | **Se conserva toda.** Se agregan mezclas (tintes al 18/22%, bordes de estado al 45/50%, vidrio al 50% y 85%) y `--selection` | Las superficies de estado y el vidrio, sin colores nuevos |
| 2.2 · Contrastes | **Se amplía** con las combinaciones nuevas, y se prohíben el texto secundario sobre vidrio y el naranja noche sobre `surface-2` | Medido; fallaban el AA |
| 3.2 · Inactiva "contenido al 55%" | **Se elimina la opacidad:** borde punteado + `--text-2` + raya | 2,2:1 y 3,6:1 medidos: rompía la sección 15 |
| 3.2 · Mesas con chip de estado | **Se modifica:** "superficie de estado" (tinte + forma + palabra) en tarjetas y nodos; el chip queda para tablas y listas | El estado era lo menos visible de la tarjeta |
| 3.2 · Cambio con control segmentado en una barra al fondo | **Se modifica:** selector de estado junto a la mesa + atajos D, R y O | La tarea más frecuente pedía un salto de vista; en el teléfono, la barra tapaba tres filas |
| 4 · Escala tipográfica | **Se modifica:** H1 32 → 28; H2 24 → 22; etiqueta de 11 en mayúsculas → 12 con mayúscula inicial; nuevos `text-kicker` y `text-metric`; mínimo 12 | Modo de producto (escala más contenida) y legibilidad |
| 4 · Familia y pesos | **Se conserva** | Identidad; cambiarla requiere aprobación |
| 5 · Breakpoints, "diseña primero para 1280" | **Se modifica:** se diseña primero para 1024 (tablet del salón) | El dispositivo real del restaurante |
| 6 · Soft Layered (tarjeta con borde y sombra) | **Se modifica:** tres niveles de elevación; en reposo, borde o sombra; radios concéntricos; borde de selección `--selection` | Superficies más limpias; la selección fallaba el 3:1 contra el crema |
| 6.1 · Un primario por pantalla | **Se modifica:** uno por contexto; "Agregar mesa" pasa a borde en servicio; en la web y el móvil, `secondary` = `--inverse-*` | Jerarquía y consistencia entre repos |
| 8 · Iconografía | **Se conserva**, con íconos nuevos para el plano y la conexión | Funcionalidad nueva |
| 9 · Catálogo | **Se modifica:** nuevos `TableNode`, `FloorPlan` (`features/tables/plan`), `StatusPicker` (con su hoja en < 768), `StatStrip`, `StatusLine`, `DetailList` y `GlassSurface` (móvil); `LiveIndicator` queda como *(propuesta futura, 19)*; `StatTile` se reemplaza por `StatStrip` en las pantallas (sigue en `/kit`); `FloatingBar` pasa a vidrio y a la edición del plano | Plano, tiempo real y fallas W1–W11 del diagnóstico |
| 10 · Formularios | **Se conserva**, con el horario compacto | — |
| 11 · Feedback | **Se modifica:** el error de carga va dentro del bloque, con un patrón único; los toasts y menús tienen salida; aviso de cambio remoto | Errores inconsistentes entre pantallas |
| 11.5 · Carga: "nunca spinner a pantalla completa" | **Se conserva**; los skeletons deben medir lo mismo que el contenido | La grilla saltaba al cargar |
| 12 · Dashboard "sin vidrio, sin gradientes" | **Se modifica:** vidrio en la capa flotante; métricas en franja; Plano · Cuadrícula; topbar con el nombre real ("En vivo", *(propuesta futura, 19)*) | Diagnóstico W1–W6 |
| 12.4 · `/restaurante` con botón de borde "Editar" | **Se conserva** (el código usaba primario, se corrige); se agrega `DetailList` | Desviación del código |
| 13 · Motion | **Se modifica:** filtro de cuándo animar, curvas `--ease-enter` / `--ease-move` / `--ease-sheet`, presionar, salidas, origen, arrastre y aviso remoto (View Transitions entre vistas, *(propuesta futura, 19)*) | Faltaban salidas y respuesta al toque |
| 13 · Reducir movimiento: "todo aparece en su estado final" | **Se modifica:** se quitan desplazamientos y escalas, pero se conservan los fundidos de 150 ms o menos | Quitarlo todo también borraba los fundidos que explican un cambio de estado |
| v2.0 · Fondo plano y vidrio solo en la capa flotante | **Se modifica en v2.1 ("Salón de vidrio"):** luz del salón detrás de todo, hoja de vidrio centrada con tarjetas, barra en píldora, saludo y navegación en un dock abajo | Pedido de Sebastián (27 oct): un dashboard más creativo y moderno, sobre la misma luz del login |
| 14 · Glosario | **Se conserva** y se corrige: "libres" → "disponibles"; se agregan Plano, Cuadrícula, En vivo y Actualizado | La etiqueta de la métrica contradecía el glosario |
| 15 · Accesibilidad | **Se amplía:** WCAG 2.5.7 (alternativa al arrastre), 2.4.11 (foco no tapado), `prefers-reduced-transparency` y `prefers-contrast`; atajos; anuncios de cambios remotos | Plano y tiempo real |
| 16 · Tokens: copia exacta, no se edita | **Se conserva la regla** con los tokens v2.0; ningún color existente cambia de valor; los nombres nuevos no chocan con Tailwind | Compatibilidad con todo lo construido |
| 17 · Checklist | **Se modifica** (17.4) | Reglas nuevas |
| — | **Nuevo:** reglas para crear componentes (17.2) y qué no se cambia arbitrariamente (17.3) | Trabajo en equipo |

---

## 19. Propuestas futuras (no implementadas a 27 oct 2026)

Lo que este manual describe y todavía no existe en el código. Cada punto se implementa en su propia fase o PR, y al hacerlo se quita de aquí y de su sección.

| Propuesta | Sección | Depende de | Hoy |
|---|---|---|---|
| `LiveIndicator` ("En vivo", "Reconectando…", "Sin conexión", "Actualizado 7:42 p. m.") en el topbar | 12.2, 13.5, 13.7, 14 | Socket de `restaurant_admin` (D5, fase F5) | No aparece. Solo en la página de muestra `/sistema` |
| Tiempo real del dashboard por socket, con respaldo cada 30 s | 13.7 | D5 (cambio de backend aprobado, sin hacer) | La lista se vuelve a pedir al volver a la pestaña y tras cada cambio propio |
| Anuncio de cambios remotos en `role="status"` (uno cada 5 s como máximo) | 13.7, 15 | — | Solo el anillo visual. `role="status"` anuncia los movimientos del plano |
| Transición Cuadrícula ↔ Plano con View Transitions | 11.3 | — | Cambio instantáneo. La maqueta `/sistema` la prueba |
| Grupo con título "Inactivas" en la cuadrícula | 13.10 | — | Las inactivas van al final, sin encabezado |
| `IconButton sm` de 44 en pantallas táctiles | 12.2, 15 | — | 40 px (cumple el mínimo AA de 24) |
| Barra de herramientas del plano en vidrio, flotando sobre el lienzo | 7.2 | — | Sólida, encima del marco |
| Gradientes en el cierre del registro, el primer uso del plano, los estados vacíos grandes del comensal y la barra del temporizador | 8 | El temporizador es del Sprint 3 | Solo el login usa gradiente |
| Arranque con el Active Dot del logo | 13.6 | — | Web: skeletons; móvil: splash con el símbolo |
| Detalle del comensal con la hoja de contenido sobre el mapa | 13.11 | — | Mapa en tarjeta y contenido debajo |
| Zonas, varios salones y paredes en el plano | 13.10 | Otro modelo de datos (opción B de D4) | Un solo salón de 20 × 30 celdas |
| Zoom del plano con pellizco o rueda | 12.2 `FloorPlan` | — | Botones Alejar · Ajustar · Acercar |
| Vidrio verificado en iOS | 7, 13.9 | Un Mac con Xcode o un iPhone | Implementado con `expo-blur`, sin probar en iOS |

---

## 20. v2.1 · "Salón de vidrio" (27 oct 2026)

Sebastián pidió un dashboard menos plano, con degradados, un sidebar creativo y el estilo del "Glassy Dashboard V2", con permiso para pasar por encima del manual y del kit. Esta sección resume lo que cambió; los detalles están en cada sección.

**La idea:** el restaurante es un salón con luz. El fondo es la luz del login (naranja arriba, petróleo abajo), tan difusa que no se ve ninguna forma, y **dice el estado**: con el restaurante abierto es cálida; al cerrarlo, se apaga a gris. El trabajo flota encima, en vidrio.

| Pieza | Qué es | Dónde |
|---|---|---|
| Luz del salón | `AmbientGround` con `amb-open` / `amb-closed`: gradientes radiales de la paleta, fijos | 8, 12.2 `AppShell` |
| Dock de navegación | `NavDock`, abajo y centrado como el de macOS, con ícono + palabra; su vidrio sigue al tema | 12.2 `AppShell` |
| Barra superior | `Topbar` en píldora de vidrio, con la cuenta (`UserMenu`) a la derecha | 12.2 `AppShell` |
| Hoja de contenido | `glass-sheet`: todo lo de la página va encima | 7.1, 12.2 |
| Tarjetas | `Card`, el resumen y los paneles del plano en `glass-card`; las mesas siguen sólidas, con su tinte | 7.1, 12.2 |
| Saludo | `PageHeader variant="hero"` con datos reales | 12.2, 13.10 |
| Resumen | `StatStrip` en cuatro tarjetas iguales, con la palabra en mayúscula inicial | 12.2 |
| Notificaciones | Los toasts llegan arriba al centro, bajo la barra: abajo vive el dock | 12.2 `Toast` |
| Movimiento | `lift`: la tarjeta sube 3 px al pasar el puntero (con `translate`, así se suma a `press`); la luz se cruza en `--dur-highlight` | 11.3 |

**Lo que no cambia:**
- La paleta: ningún color nuevo; todo son mezclas de los de 2.1.
- El logo, Plus Jakarta Sans y "estado = color + forma + palabra".
- El login web.
- Las reglas de AA (7.3, con `--text-2-sheet` sobre la hoja) y los respaldos sólidos (7.4).

**Decisiones de v2.1:**
- **"Agregar mesa" vuelve a ser `primary`**, a la derecha del saludo junto a Plano · Cuadrícula. Revierte la decisión D7 (outline).
- **Las tarjetas sobre la hoja no cuentan como "tarjeta dentro de tarjeta".** La hoja es el plano de trabajo; el detector de Impeccable las marca (`nested-cards`) y es un aviso aceptado.
- **La navegación no tiene la altura de la ventana.** Primero fue un riel flotante y después un dock abajo; con eso se corrigió el sidebar cortado de las capturas de página completa con un plano muy largo.

