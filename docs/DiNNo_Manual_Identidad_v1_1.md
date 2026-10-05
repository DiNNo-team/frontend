# DiNNo · Manual de identidad v1.1 (30 sept 2026)

> Fuente única de diseño para el equipo. Si una decisión visual no está aquí, se pregunta antes de inventarla.
> **Marca:** DiNNo · **Promesa:** “Dile no a la espera.” · **Función:** “Encuentra una mesa disponible ahora y asegúrala mientras llegas.”
> Este archivo (.md) y el PDF tienen **el mismo contenido**. El PDF agrega los ejemplos visuales; el .md es el que se pega en prompts, issues y READMEs.

## Instrucción para quien programe o use IA
Antes de generar cualquier pantalla o componente, respeta este documento completo.
1. No escribas colores, radios, sombras ni tamaños sueltos: usa las variables de la sección 16 (en Tailwind, las clases que salen de ellas; nada de `bg-[#...]` ni `rounded-[...]`).
2. Construye las pantallas **solo con los componentes de `src/components/ui`** (sección 9). Si falta uno, se crea ahí y se avisa al equipo; no se estiliza “a mano” dentro de una feature.
3. No agregues íconos de comida (cubiertos, platos, gorros, hamburguesas) ni pins de mapa genéricos. Íconos: solo Lucide (sección 8).
4. Textos de la interfaz en español, tuteando y con las palabras del glosario (sección 14).
5. Antes de hacer merge, pasa el checklist (sección 17).

## Índice
0. Siete reglas · 1. Logo · 2. Color · 3. Estados y modo oscuro · 4. Tipografía · 5. Gradientes · 6. Forma: Soft Layered · 7. Liquid Glass · 8. Iconografía · 9. Componentes base · 10. Formularios · 11. Feedback: alertas, toasts, diálogos, carga y vacío · 12. Layout web y dashboard · 13. Motion · 14. Contenido y tono · 15. Accesibilidad · 16. Implementación y tokens · 17. Checklist de merge · 18. Cambios desde v1.0

---

## 0. Siete reglas
1. **Crema manda.** Cada pantalla es ~72% crema/blanco, ~19% petróleo, ~9% naranja.
2. **Naranja = acción o “ahora”.** Botón principal, pin activo, punto vivo, cifra clave, elemento seleccionado. Nunca fondo de pantalla completa ni color de un estado.
3. **Texto naranja sobre claro = naranja profundo `#B83F14`** (`--accent-text`). El naranja brillante `#F46935` es para formas grandes.
4. **Estado = color + forma + palabra.** Nunca solo color.
5. **Liquid Glass solo en lo que flota sobre el mapa.** Todo lo demás, sólido.
6. **Gradiente solo en momentos de marca** (splash, portada, panel de marca del login, cierre, timer). Nunca detrás de tablas, listas, formularios o texto largo.
7. **Active Dot poco y con sentido:** indica información viva (hay mesa, tiempo corriendo, en vivo, restaurante abierto). No decora.

---

## 1. Logo
- **Nombre:** “Di” en tinta, “NNo” en naranja. La **i es un pin de contorno con el Active Dot (naranja) adentro**, sobre un pie redondeado.
- **Fondo oscuro:** “Di” y pin pasan a crema; “NNo” y el punto en naranja noche (`#FF8456`).
- **Símbolo:** el pin con el punto, solo. **App icon:** tile petróleo `#103B46`, pin crema, punto naranja. Variantes: tile crema (pin tinta) y tile naranja (pin petróleo, punto crema). En tienda se entrega sin bordes (la plataforma redondea).
- **Espacio libre:** el ancho del pin (≈ 0.3 × altura del nombre) por todos lados.
- **Mínimos:** nombre 72 px de ancho en pantalla, 25 mm impreso; símbolo 16 px (favicon). Por debajo de 24 px se quita el halo de las ondas.
- **Dónde va en la web:** arriba del sidebar (versión fondo oscuro, 96 px de ancho), en el login (panel de marca) y como favicon (símbolo). No se repite dentro del contenido.
- **Archivos:** `logo-light.svg` (fondo claro), `logo-dark.svg` (fondo oscuro), `symbol.svg`, `favicon.svg`, `app-icon-1024.png`. Viven en `web/src/assets/brand/`; nunca se recrea el logo con texto + emoji.
- **No hacer:** cambiar colores (p. ej. “NNo” petróleo o “Di” naranja); añadir cubiertos, platos, relojes o pins genéricos; sombras, brillos, 3D o gradiente en las letras; usar naranja brillante como texto pequeño sobre crema; animar el logo en pantallas de uso frecuente (solo splash y carga).

---

## 2. Color
El naranja sale de mezclar tres direcciones exploradas: **A** (coral terracota `#E4573F`, más naranja), **C** (petróleo + crema; su coral `#FF6B57` tiraba a rosado, se descarta) y **D** (mandarina `#FF7A1A`, más brillante). Mezcla 40% A + 20% C + 40% D = **`#F46935`**.

### 2.1 Paleta base
| Nombre | Hex | Uso |
|---|---|---|
| Naranja DiNNo | `#F46935` | Acción, pin activo, punto vivo, selección, cifras clave (5–10%) |
| Naranja profundo | `#B83F14` | Texto y links naranja sobre claro (5.2:1) |
| Naranja noche | `#FF8456` | El naranja en modo oscuro y sobre petróleo (6.0:1) |
| Ámbar | `#F7A43B` | Final del gradiente naranja, highlights |
| Naranja presionado | `#DB5626` | Estado pressed del botón |
| Petróleo profundo | `#103B46` | Marca, navegación (sidebar), superficies oscuras, toasts (15–20%) |
| Petróleo medio | `#1D5661` | Superficies secundarias, ítem activo del sidebar, info |
| Petróleo noche | `#0B2D36` | Fondo modo oscuro, inicio del gradiente |
| Crema | `#FAF7F1` | Fondo de la app (70–75%) |
| Crema 2 | `#F2EFE8` | Superficie secundaria: controles segmentados, skeletons, hover de filas |
| Blanco | `#FFFFFF` | Tarjetas, hojas, campos |
| Tinta | `#10252B` | Texto principal (14.9:1 sobre crema) |
| Texto secundario | `#5E6B70` | Metadatos, ayudas (5.2:1 sobre crema) |
| Borde | `#E2E6E3` | Divisores y contornos de tarjetas |
| Borde fuerte | `#8A9699` | Contorno de campos, switch apagado (3.0:1 sobre blanco) |

### 2.2 Contrastes verificados
| Combinación | Ratio | Uso |
|---|---|---|
| Tinta sobre crema | 14.9:1 | Texto general (AA · AAA) |
| Tinta sobre naranja | 5.2:1 | Texto de botón primario (AA) |
| Naranja profundo sobre crema | 5.2:1 | Links y texto naranja (AA) |
| Crema sobre petróleo | 11.3:1 | Texto en oscuro, sidebar, toasts (AA · AAA) |
| Texto secundario oscuro `#A9BDC0` sobre petróleo | 6.2:1 | Ítems inactivos del sidebar (AA) |
| Naranja noche sobre petróleo | 5.0:1 | Acción dentro de un toast (AA) |
| Naranja sobre petróleo noche | 4.8:1 | En oscuro se usa `#FF8456` (6.0:1) |
| Borde fuerte sobre blanco | 3.0:1 | Contorno de campos (AA para componentes) |
| **Naranja sobre crema** | **2.8:1** | **Solo formas grandes, nunca texto** |
| **Blanco sobre naranja** | **3.0:1** | **No usar para texto** |

**Sí:** una sola acción naranja por pantalla; texto oscuro (tinta) sobre botones naranja; naranja para marcar lo seleccionado (borde de la mesa elegida).
**No:** texto blanco sobre naranja; naranja para estados; naranja como fondo de pantallas, listas o tablas.

---

## 3. Estados y modo oscuro
Cada estado usa **color + forma + palabra**. En chip: fondo 15% del color, forma en el color, texto tinta (claro) o crema (oscuro), peso 700. Los estados tienen su propia gama y no se mezclan con la marca.

### 3.1 Formas de estado (el vocabulario completo)
| Forma | Significa |
|---|---|
| Punto circular | Disponible / Abierto (hay operación, se puede usar) |
| Rombo | Pocas mesas (limitado) |
| Cuadrado | Reservada |
| Cuadrado rayado | Ocupada / Sin mesas |
| Raya horizontal (—) | Inactiva / Cerrado (fuera de operación) |
| Punto + ícono de alerta | Error |

### 3.2 Estado de una mesa (dashboard del restaurante)
Una mesa tiene **uno** de estos cuatro estados. “Pocas mesas” **no** es un estado de mesa (es del restaurante, ver 3.4).

| Estado | Claro | Oscuro | Forma | Token | Cómo se ve la tarjeta |
|---|---|---|---|---|---|
| Disponible | `#2B8F62` | `#3FBF86` | punto | `--ok` | Normal |
| Reservada | `#4E66C9` | `#8DA2F0` | cuadrado | `--reserved` | Normal |
| Ocupada | `#6E7C80` | `#8DA0A4` | cuadrado rayado | `--busy` | Normal |
| Inactiva | `#8A9699` | `#6F8C92` | raya (—) | `--inactive` | Borde punteado, contenido al 55%, sin control de estado, acción “Reactivar” |

- Se cambia manualmente con el control segmentado (Disponible · Reservada · Ocupada). “Inactiva” no está en el control: se llega con “Desactivar mesa” y se sale con “Reactivar”.
- Cada cambio queda en la bitácora (sección 12.4).

### 3.3 Estado operativo del restaurante (Abierto / Cerrado)
| Estado | Color | Forma | Palabra | Dónde |
|---|---|---|---|---|
| Abierto | `--ok` | punto con Active Dot (pulso suave, es info viva) | “Abierto” | Switch del topbar + chip |
| Cerrado | `--inactive` | raya (—) | “Cerrado” | Switch del topbar + chip + banner |

- Control: **switch** en el topbar, con la palabra siempre visible al lado (“Abierto” / “Cerrado”).
- Cuando está cerrado, arriba del contenido aparece un banner informativo: *“Tu restaurante está cerrado. Los comensales no lo ven en DiNNo.”* con botón secundario **“Abrir ahora”**.
- Cerrar con mesas reservadas pide confirmación (diálogo). Sin reservas, cierra de una vez y muestra un toast con **“Deshacer”**.

### 3.4 Disponibilidad del restaurante para el comensal (mapa y listas)
| Estado | Claro | Oscuro | Forma | Palabra |
|---|---|---|---|---|
| Disponible | `#2B8F62` | `#3FBF86` | punto | “Disponible” / “Disponibilidad alta” |
| Pocas mesas | `#B7801F` | `#E0A93B` | rombo | “Pocas mesas” |
| Sin mesas | `#6E7C80` | `#8DA0A4` | cuadrado rayado | “Sin mesas ahora” |
| Cerrado | `#8A9699` | `#6F8C92` | raya (—) | “Cerrado” (no aparece con el filtro “Ahora”) |

### 3.5 Feedback del sistema (alertas y toasts)
| Tipo | Claro | Oscuro | Ícono Lucide | Uso |
|---|---|---|---|---|
| Éxito | `--ok` `#2B8F62` | `#3FBF86` | `circle-check` | Se guardó, se creó, se cambió |
| Info | `--info` `#1D5661` | `#7FC1CB` | `info` | Contexto neutro (p. ej. restaurante cerrado) |
| Advertencia | `--limited` `#B7801F` | `#E0A93B` | `triangle-alert` | Algo requiere atención pero no falló |
| Error | `--error` `#C8453A` | `#FF7B6E` | `circle-alert` | Falló; siempre con ícono + texto + cómo arreglarlo |

### 3.6 Modo oscuro
Fondo `#0B2D36`, tarjetas `#103B46` / `#164853`, texto `#FAF7F1` / `#A9BDC0`, borde `#24525D`, borde fuerte `#5E8A93`. El naranja sube a `#FF8456`; el botón principal conserva texto oscuro `#0B2D36`. La sombra cede a un borde más visible. El dashboard tiene versión oscura para turnos de noche o pantallas en cocina.
- **Claro por defecto.** El usuario lo cambia en el menú de usuario (Sol / Luna) y la preferencia se recuerda en su navegador.
- Se activa con `data-theme="dark"` en `<html>` (o la clase `.t-dark`). El nombre de la variable no cambia; el valor sí.

---

## 4. Tipografía: Plus Jakarta Sans (única familia, pesos 500, 700 y 800)
| Rol | Tamaño/alto | Peso | Tracking | Clase Tailwind | Uso típico |
|---|---|---|---|---|---|
| Display | 48/52 | 800 | -3% | `text-display` | Splash, panel del login |
| Título 1 | 32/36 | 800 | -3% | `text-h1` | Título de página |
| Título 2 | 24/28 | 700 | -2% | `text-h2` | Título de sección, diálogo grande |
| Título 3 | 18/24 | 700 | -1% | `text-h3` | Título de tarjeta, grupo de formulario, diálogo |
| Cuerpo | 16/24 | 500 | 0 | `text-body` | Texto general, valor de campos |
| Secundario | 14/20 | 500 | 0 | `text-sec` | Metadatos, ayudas, celdas de tabla |
| Etiqueta | 11/14, mayúsculas | 700 | +8% | `text-label` | Kicker de sección, encabezados de tabla |
| Cifra | 54/54 | 800 | -4%, tabular | `text-figure` | Timer, número protagonista |
| Cifra de tarjeta | 32/36 | 800 | -3%, tabular | `text-h1 tabular-nums` | Métricas del dashboard (3 libres) |

- **Etiqueta de campo** (label): 14/20, peso 700, tinta. **Texto de botón:** 15/20, peso 700.
- Máximo 3 tamaños por pantalla (sin contar la etiqueta de 11). Números siempre con `tabular-nums` cuando cambian (timer, contadores, horas en tablas).
- Carga: paquete `@fontsource/plus-jakarta-sans` (pesos 500, 700, 800) importado en `main.tsx`. Fallback: `system-ui, sans-serif`.
- **No:** otra familia (ni para números); cursivas; pesos ≤ 300; párrafos largos (se convierten en cifra, frase o ícono); TODO EN MAYÚSCULAS fuera de la etiqueta de 11 px.

---

## 5. Gradientes (solo dos)
- **Petróleo:** `linear-gradient(150deg, #0B2D36 0%, #12505A 60%, #1C6A6E 100%)` (`--grad-petrol`)
- **Naranja:** `linear-gradient(135deg, #F46935 0%, #F7A43B 100%)` (`--grad-orange`, texto en tinta)
- **Sí:** splash, portada, **panel de marca del login**, pantalla de cierre, fondo hero del pitch, barra del timer, resplandor del Active Dot, ilustraciones y empty states grandes de la app del comensal.
- **No:** detrás de tablas, dashboard, listas, formularios o texto largo; en botones; en el sidebar; en empty states del dashboard; para rescatar un diseño flojo; más de un gradiente por pantalla.

---

## 6. Forma: Soft Layered (estilo base de toda la app)
| Elemento | Valor | Token |
|---|---|---|
| Tarjeta | radio 20, borde 1px `--border`, sombra soft | `--r-card` |
| Tarjeta compacta (mesa, métrica) | radio 16, borde 1px, sombra soft | `--r-tile` |
| Botón | radio 14, alto 48 (40 en tablas/toolbars de escritorio, 44 en tarjetas flotantes), texto 15/700, padding lateral 20 | `--r-btn` |
| Campo de texto | radio 12, alto 48, borde 1.5px `--border-strong` | `--r-input` |
| Diálogo | radio 20, ancho máx. 480 (formulario corto) o 560 | `--r-card` |
| Hoja inferior | radio 28 arriba | `--r-sheet` |
| Chip / estado / switch | pastilla (999) | `--r-chip` |
| Táctil mínimo | 44 × 44 px (también en web: el dashboard se usa en tablet) | — |
| Espaciado | 4 · 8 · 12 · 16 · 24 · 32 · 48 | `--s-1` … `--s-7` |
| Márgenes | pantalla móvil 16 · contenido web 32 (≥1024) / 24 (768–1023) / 16 (<768) · entre tarjetas 12 · entre secciones 32 | — |
| Sombra soft | `0 1px 2px rgba(16,37,43,.05), 0 10px 28px -12px rgba(16,37,43,.18)` | `--shadow-soft` |
| Sombra flotante | `0 12px 32px -12px rgba(16,37,43,.28)` (diálogos, menús, toasts, flotantes) | `--shadow-float` |

### 6.1 Botones
| Variante | Aspecto | Cuándo |
|---|---|---|
| Primario | Naranja + texto tinta | La acción principal. **Uno por pantalla.** |
| Secundario | Petróleo + texto crema | Acción importante pero no principal (“Abrir ahora”, “Cómo llegar”) |
| Borde | Blanco + borde `--border-strong` + texto tinta | Alternativas: “Cancelar”, “Editar” |
| Texto (ghost) | Sin fondo, texto `--accent-text`, subrayado en hover | Acciones terciarias: “Copiar a todos los días”, links |
| Destructivo | Blanco + borde y texto `--error` | “Desactivar mesa”. Nunca relleno rojo. Siempre dentro de un diálogo de confirmación |
| Ícono | 40 × 40 (44 en táctil), radio 12, sin fondo; hover `--surface-2` | Menú ⋯, cerrar, ver contraseña. Siempre con `aria-label` + tooltip |

**Estados de todo botón:** hover (oscurece 6%: primario pasa a `#DB5626` al presionar), pressed (`--accent-pressed`, sin sombra), focus (anillo 3px naranja 45%), deshabilitado (45% opacidad, sin cursor), **cargando** (spinner 16 px a la izquierda + texto en gerundio: “Guardando…”, mismo ancho, no se puede volver a pulsar).
**Reglas:** un solo primario por pantalla; en grupos, el primario va a la derecha (escritorio) o arriba y a lo ancho (móvil); texto = verbo + objeto (“Guardar cambios”, “Agregar mesa”); sin tarjeta dentro de tarjeta; sombra solo en lo que se eleva.

---

## 7. Liquid Glass (selectivo)
**Se usa en:** chips de filtro flotantes (Ahora, < 10 min, personas), tarjeta del restaurante seleccionado sobre el mapa, barra inferior flotante del mapa, aviso del timer si se ve el mapa detrás.
**No se usa en:** listas, tarjetas de contenido, formularios, ajustes, **todo el dashboard web**, tablas, métricas, sidebar, botón primario, modales, toasts y errores.

```css
.glass .float {
  background: var(--glass-bg);            /* 70% superficie claro · 62% oscuro */
  backdrop-filter: blur(16px) saturate(1.5);
  -webkit-backdrop-filter: blur(16px) saturate(1.5);
  border: 1px solid var(--glass-border);  /* blanco 65% claro · 16% oscuro */
  box-shadow: 0 8px 24px -14px rgba(0,0,0,.35);
}
/* Fallback sólido (sin soporte, reducir transparencia, mapa sin cargar) */
@supports not (backdrop-filter: blur(1px)) { .glass .float { background: var(--surface); } }
@media (prefers-reduced-transparency: reduce) { .glass .float { background: var(--surface); backdrop-filter: none; } }
```
**Sin Liquid Glass** el mismo elemento usa `background: var(--surface)`, borde suave y sombra flotante. El texto sobre vidrio siempre es tinta (claro) o crema (oscuro) y debe cumplir AA; si el mapa detrás es muy cargado, sube el fondo a 80%.

---

## 8. Iconografía: Lucide
- **Librería única:** Lucide (`lucide-react` en web, `lucide-react-native` en móvil). No se mezclan otras librerías ni emojis.
- **Tamaños:** 16 (dentro de chips y texto secundario), 20 (botones, campos, sidebar), 24 (acciones sueltas, empty states usan el símbolo DiNNo, no íconos gigantes).
- **Trazo:** `strokeWidth={1.75}`; color `currentColor` (hereda del texto). Nunca naranja salvo que el ícono sea parte de la acción principal.
- **Siempre con texto** en navegación y botones; un botón de solo ícono lleva `aria-label` y tooltip.

| Concepto | Ícono | Concepto | Ícono |
|---|---|---|---|
| Mesas | `layout-grid` | Agregar | `plus` |
| Restaurante | `store` | Editar | `pencil` |
| Bitácora | `history` | Desactivar | `ban` |
| Salir | `log-out` | Reactivar | `rotate-ccw` |
| Horarios | `clock` | Más acciones | `ellipsis` |
| Dirección / ubicación | `map` | Capacidad | `users` |
| Categoría | `tag` | Teléfono | `phone` |
| Buscar | `search` | Cerrar | `x` |
| Ver / ocultar contraseña | `eye` / `eye-off` | Menú (móvil) | `menu` |
| Tema claro / oscuro | `sun` / `moon` | Desplegar | `chevron-down` |
| Éxito | `circle-check` | Error | `circle-alert` |
| Advertencia | `triangle-alert` | Info | `info` |
| Cargando | `loader-circle` (girando) | Ir / siguiente | `arrow-right` |

**Prohibidos:** `utensils`, `chef-hat`, `pizza`, `coffee`, `hamburger`, `map-pin` y cualquier pin genérico (el pin de DiNNo es el del logo).

---

## 9. Componentes base (`src/components/ui`)
Todo el front se arma con estas piezas. Cada una usa solo tokens y trae sus estados (hover, focus, deshabilitado, cargando, error cuando aplica) y su versión oscura.

| Componente | Qué es | Especificación clave |
|---|---|---|
| `Button` | Botón | Variantes `primary · secondary · outline · ghost · danger`, tamaños `md` (48) y `sm` (40), prop `loading`, ícono opcional a la izquierda |
| `IconButton` | Botón de solo ícono | 40/44, radio 12, `aria-label` obligatorio |
| `TextField` | Campo de texto | Label arriba, ayuda o error abajo, ícono opcional, `(opcional)` en el label si no es obligatorio; variante contraseña con `eye` |
| `Select` | Lista desplegable | Mismo aspecto que `TextField`, `chevron-down` a la derecha; menú con sombra flotante, radio 12, opción activa en `--surface-2` |
| `NumberStepper` | Número con − / + | Para capacidad (1–20); botones de 44; valor en `tabular-nums` |
| `TimeSelect` | Hora | Pasos de 30 min, formato 12 h “7:30 p. m.” |
| `HoursEditor` | Horario semanal | 7 filas Lun–Dom: switch Abierto + apertura + cierre; “Copiar a todos los días” (ghost); si el cierre es menor que la apertura muestra “(día siguiente)” |
| `Switch` | Interruptor | Pista 44 × 26 pastilla, perilla 20 blanca con sombra soft; encendido `--ok`, apagado `--border-strong`; **palabra siempre al lado** |
| `SegmentedControl` | Control segmentado | Alto 44, fondo `--surface-2`, padding 4, radio 14; segmento activo blanco + sombra soft + forma del estado en su color + texto 700; inactivos `--text-2`; flechas del teclado para moverse. **No es naranja** (es un estado, no una acción) |
| `StatusChip` | Chip de estado | Pastilla, alto 24, padding 0 10, fondo 15% del color, forma 8 px + palabra 12/16 700 |
| `Card` | Tarjeta | Radio 20, borde, sombra soft, padding 24 (16 en móvil); **nunca otra tarjeta adentro** |
| `TableCard` | Tarjeta de mesa | Radio 16, padding 16, mín. 168 de ancho; “Mesa 04” (Título 3), “4 personas” (secundario + `users`), `StatusChip`; menú ⋯ arriba a la derecha. **Seleccionada:** borde 2px `--accent`. **Inactiva:** borde punteado, contenido al 55% |
| `StatTile` | Métrica | Radio 16, cifra 32/36 800 tabular + etiqueta secundaria (“libres”); la cifra solo va en naranja (`--accent-text`) si es “lo próximo” (próxima llegada) |
| `Alert` | Aviso en línea | 4 tipos (sección 3.5); fondo 12% del color, ícono 20 en el color, texto tinta, radio 14, botón opcional a la derecha; sin sombra |
| `Toast` | Aviso temporal | Fondo `--inverse-bg` (petróleo en claro, crema en oscuro), texto `--inverse-text`, ícono en color de estado, acción opcional en `--inverse-accent`; radio 14, sombra flotante |
| `Dialog` | Modal | Radio 20, ancho 480/560, padding 24, overlay `--overlay`; título Título 3, cuerpo secundario/cuerpo, acciones abajo a la derecha; sólido, sin vidrio |
| `DropdownMenu` | Menú de acciones (⋯) | Sombra flotante, radio 12, ítems de 40 con ícono 16 + texto 14/500; ítem destructivo en `--error` separado por línea |
| `EmptyState` | Estado vacío | Símbolo DiNNo en contorno (48 px, `--text-2`) + Título 3 + secundario + un botón; centrado, máx. 360 de ancho |
| `Skeleton` | Carga de contenido | Bloques `--surface-2` con el radio del elemento real; pulso de opacidad 1.2 s (quieto con movimiento reducido) |
| `Spinner` | Carga puntual | `loader-circle` 16/20 girando; solo dentro de botones o áreas pequeñas |
| `DataTable` | Tabla | Encabezado Etiqueta (11/14 700 mayúsculas, `--text-2`), filas de 52, divisores `--border`, sin rayas cebra ni bordes verticales, hover `--surface-2`; en móvil se vuelve lista de tarjetas compactas |
| `PageHeader` | Encabezado de página | Título 1 + secundario debajo + acciones a la derecha (el primario de la página va aquí) |
| `AppShell` | Estructura | Sidebar + topbar + contenido (sección 12) |

---

## 10. Formularios
- **Layout:** una columna, ancho máx. 560 (campos cortos como capacidad u hora pueden ir de a dos). Grupos con Título 3 y 24 de separación. Acciones al final: escritorio a la derecha (Cancelar · **Guardar**); móvil a lo ancho y fijas abajo.
- **Label siempre visible arriba** (14/20, 700). El placeholder solo es un ejemplo (“Ej.: Casa 72”), nunca reemplaza al label.
- **Obligatorios vs opcionales:** se marca lo opcional con “(opcional)” en el label; no se usan asteriscos.
- **Campo:** alto 48, radio 12, fondo `--surface`, borde 1.5px `--border-strong`, texto Cuerpo; hover borde `--text-2`; **focus** borde `--accent` + anillo; deshabilitado fondo `--surface-2` y texto `--text-2`; solo lectura sin borde.
- **Error:** borde `--error`, debajo `circle-alert` 16 + mensaje 14/20 en `--error` (oscuro `#FF7B6E`). El mensaje dice qué hacer: *“Escribe el nombre del restaurante”*, no *“Campo requerido”*.
- **Ayuda:** debajo del campo, 14/20 `--text-2`. Si hay error, el error reemplaza la ayuda.
- **Cuándo validar:** al salir del campo y al enviar; nunca en cada tecla. Al enviar con errores: se enfoca el primer campo con error y, si hay más de 2, arriba aparece un `Alert` de error *“Revisa los 3 campos marcados”*.
- **Enviar:** el botón no se deshabilita por datos inválidos (para poder mostrar los errores); solo mientras guarda (`loading`, “Guardando…”).
- **Después de guardar:** toast de éxito (*“Cambios guardados”*) y se vuelve a modo lectura o a la pantalla siguiente.
- **Cambios sin guardar:** si el usuario intenta salir, diálogo *“¿Salir sin guardar?”* (Seguir editando · Salir sin guardar).
- **Formatos:** hora 12 h “7:30 p. m.”; fecha “30 sept 2026”; fecha y hora en tablas “30 sept · 7:30 p. m.”; capacidad “4 personas”; teléfono “300 123 4567”.

---

## 11. Feedback: alertas, toasts, diálogos, carga y vacío
### 11.1 ¿Qué uso?
| Situación | Componente |
|---|---|
| Algo se guardó o cambió bien | Toast de éxito (4 s) |
| Cambio rápido que se puede revertir (estado de mesa, cerrar restaurante sin reservas) | Toast con “Deshacer” (6 s) |
| Error al guardar o al cargar | `Alert` de error en la pantalla o el formulario (no desaparece solo) + botón “Intentar de nuevo” |
| Contexto persistente (restaurante cerrado) | `Alert` info arriba del contenido |
| Acción destructiva o que afecta a comensales (desactivar mesa, cerrar con reservas) | `Dialog` de confirmación |
| Formulario corto (≤ 3 campos: crear/editar mesa) | `Dialog` con formulario |
| Contenido cargando | `Skeleton` con la forma real; si tarda < 300 ms no se muestra nada |
| Acción en curso | `Button` con `loading` |
| No hay datos todavía | `EmptyState` |

### 11.2 Toasts
Abajo a la derecha en escritorio (24 del borde), abajo al centro en móvil (sobre la barra inferior). **Uno a la vez**; el nuevo reemplaza al anterior. Ancho máx. 400. Se anuncian con `aria-live="polite"` (errores `assertive`). Cambios de estado de mesa **no piden confirmación**: se aplican y el toast ofrece “Deshacer”.

### 11.3 Diálogos
Título en pregunta corta (*“¿Desactivar Mesa 04?”*), cuerpo que explica la consecuencia (*“No aparecerá para los comensales. Puedes reactivarla cuando quieras.”*), botones: “Cancelar” (borde) + acción concreta (“Desactivar mesa”, destructivo). `Esc` y clic afuera cierran (salvo mientras guarda); el foco queda atrapado dentro y vuelve al botón que lo abrió.

### 11.4 Estados vacíos (textos del Sprint 1)
| Pantalla | Título | Texto | Botón |
|---|---|---|---|
| Mesas | Aún no tienes mesas | Agrega tus mesas para empezar a recibir comensales. | Agregar mesa |
| Bitácora | Aún no hay cambios | Aquí verás cada cambio de estado de tus mesas. | — |
| Error de carga | No pudimos cargar tus mesas | Revisa tu conexión e intenta de nuevo. | Intentar de nuevo |

### 11.5 Carga
Pantalla completa (arranque de la app): Active Dot del logo sobre crema, sin gradiente en el dashboard. Dentro de pantallas: skeletons. Nunca un spinner a pantalla completa.

---

## 12. Layout web y dashboard del restaurante
Herramienta de trabajo: **sin vidrio, sin gradientes** (salvo el panel de marca del login), estados siempre visibles con color + forma + palabra, misma paleta y formas que la app del comensal.

### 12.1 AppShell
- **Sidebar** (≥ 1024 px): 248 de ancho, fijo, fondo `--nav-bg` (petróleo), logo versión oscura arriba (padding 24). Ítems de 44 de alto, radio 12, ícono 20 + texto 15/700: inactivo `--nav-text-2`, hover fondo `--nav-active` al 50%, **activo** fondo `--nav-active` + texto `--nav-text` + barra naranja de 3 px a la izquierda. Abajo: bloque de usuario (nombre del restaurante + correo, menú con tema y “Cerrar sesión”).
- **Topbar:** 64 de alto, fondo `--bg`, borde inferior `--border`. Izquierda: nombre del restaurante (Título 3). Derecha: switch Abierto/Cerrado.
- **Contenido:** ancho máx. 1200, padding 32 / 24 / 16 según breakpoint, 32 entre secciones.
- **< 1024 px:** el sidebar se vuelve un cajón (drawer) que abre el botón `menu` del topbar; el overlay usa `--overlay`.

### 12.2 Breakpoints (los de Tailwind)
`sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280. Se diseña primero para 1280 (escritorio) y se verifica en 768 (tablet vertical) y 390 (móvil).

### 12.3 Grilla de mesas
`grid-template-columns: repeat(auto-fill, minmax(168px, 1fr))`, gap 12. Métricas arriba en fila (4 columnas en ≥ 1024, 2 en menos). Jerarquía: 1) mesas ahora y su estado; 2) próxima llegada en naranja (`--accent-text`); 3) acción de cambio de estado.

### 12.4 Pantallas del Sprint 1
| Ruta | Pantalla | Estructura |
|---|---|---|
| `/login` | Iniciar sesión | Escritorio: 50/50. Izquierda panel `--grad-petrol` con logo oscuro, “Dile no a la espera.” (Display, crema) y una línea secundaria. Derecha, sobre crema, formulario de 400: “Inicia sesión” (Título 1), “Administra tu restaurante en DiNNo” (secundario), Correo, Contraseña (con `eye`), botón primario a lo ancho “Iniciar sesión”. Error: `Alert` arriba del formulario *“Correo o contraseña incorrectos. Revisa e intenta de nuevo.”* (no decir cuál de los dos). < 1024: sin panel, logo claro arriba |
| `/onboarding` | Registro del restaurante | Sin sidebar; topbar solo con logo. Título 1 “Configura tu restaurante” + secundario. Grupos: **Tu restaurante** (Nombre, Categoría), **Ubicación** (Dirección), **Horarios** (`HoursEditor`). Primario “Guardar y continuar” → `/mesas` con su estado vacío |
| `/restaurante` | Información del restaurante | `PageHeader` “Restaurante” + botón borde “Editar”. Modo lectura: una `Card` por grupo, filas label (secundario) + valor (cuerpo). Modo edición: el mismo formulario del onboarding, acciones “Cancelar” + “Guardar cambios” |
| `/mesas` | Mesas (inicio) | `PageHeader` “Mesas” + “Actualiza el estado de cada mesa en tiempo real” + primario “Agregar mesa”. Fila de `StatTile` (libres · reservadas · ocupadas · inactivas). Grilla de `TableCard`. Al seleccionar una mesa aparece abajo una barra fija (tarjeta, sombra flotante) con “Mesa 04 · 4 personas” + `SegmentedControl` + menú ⋯ (Editar · Desactivar). Crear/editar: `Dialog` con Identificador y Capacidad |
| `/bitacora` | Bitácora | `PageHeader` “Bitácora” + “Cambios de estado de tus mesas”. Filtro `Select` por mesa. `DataTable`: Fecha y hora · Mesa · Cambio (chip anterior `arrow-right` chip nuevo) · Usuario. Más reciente primero |

---

## 13. Motion
### 13.1 Active Dot (logo)
Secuencia (1.4 s): pin cae 15 u y se ancla (0 · 450 ms) → pie de la i crece desde abajo (120 · 320 ms) → punto con pop leve (380 · 260 ms) → dos ondas ×3.3 que se disipan (480 y 680 · 700 ms). Curva `cubic-bezier(.2,.8,.2,1)`; ondas `ease-out`. Se usa en splash, carga y cuando aparece una disponibilidad nueva.
### 13.2 Interfaz
| Qué | Duración | Token |
|---|---|---|
| Hover, pressed, focus, switch | 150 ms | `--dur-fast` |
| Cambio de estado de mesa (color del chip), menús, toasts entrando | 200 ms | `--dur-base` |
| Diálogos y drawer (fade + subir 8 px) | 300 ms | `--dur-slow` |
| Pulso del punto “Abierto” / “En vivo” | 2 s, en bucle, opacidad 1 → .35 | — |

Todas con `--ease`. **Reglas:** solo para explicar algo (hay mesa, corre el tiempo, cambió la disponibilidad); sin rebotes largos, giros ni elementos volando; con “reducir movimiento” todo aparece en su estado final y el pulso se detiene; la app se entiende igual sin animación.

---

## 14. Contenido y tono
- **Tuteamos** (“Agrega tu primera mesa”). Frases cortas, directas y amables; sin culpar (“No pudimos guardar”, no “Hiciste algo mal”).
- **Mayúscula inicial solamente** (“Agregar mesa”, no “Agregar Mesa”). Mayúsculas completas solo en la Etiqueta de 11 px.
- **Botones = verbo + objeto:** “Guardar cambios”, “Agregar mesa”, “Desactivar mesa”. Nunca “OK”, “Enviar” o “Aceptar” sueltos.
- **Errores:** qué pasó + qué hacer. Sin códigos técnicos a la vista.
- **Sin emojis ni signos de exclamación** en la interfaz del restaurante. Un “¡Listo!” se permite solo en la app del comensal al asegurar mesa.

### 14.1 Glosario (usar siempre estas palabras)
| Usar | No usar |
|---|---|
| Mesa · “Mesa 04” (número de 2 dígitos si es numérica) | Table, puesto |
| Comensal | Cliente, usuario final |
| Restaurante | Local, negocio, establecimiento (en la interfaz) |
| Disponible · Reservada · Ocupada · Inactiva | Libre, apartada, en uso, eliminada |
| Abierto · Cerrado | Activo, en línea, offline |
| Capacidad · “4 personas” | Pax, puestos, sillas |
| Bitácora | Log, historial de cambios |
| Asegurar mesa (comensal) | Reservar, bookear |
| Iniciar sesión · Cerrar sesión | Login, logout, salir |

### 14.2 Textos comunes del Sprint 1
| Momento | Texto |
|---|---|
| Toast al guardar | Cambios guardados |
| Toast al crear mesa | Mesa 04 agregada |
| Toast al cambiar estado | Mesa 04 ahora está Ocupada · Deshacer |
| Toast al desactivar | Mesa 04 desactivada · Deshacer |
| Toast al cerrar | Restaurante cerrado. Los comensales ya no lo ven · Deshacer |
| Error de red | No pudimos conectarnos. Revisa tu conexión e intenta de nuevo. |
| Sesión vencida | Tu sesión terminó. Inicia sesión de nuevo. |
| Sin permiso | No tienes acceso a esta sección. |

---

## 15. Accesibilidad (mínimos)
- Contraste AA en todo texto (tabla 2.2); componentes y bordes de campos ≥ 3:1.
- **Foco visible siempre** con `:focus-visible` (anillo 3px `--focus-ring`); nunca `outline: none` sin reemplazo.
- Todo se puede usar con teclado: Tab en orden lógico, Enter/Espacio activan, flechas en el control segmentado, `Esc` cierra diálogos y menús.
- Labels reales (`<label for>`), errores enlazados con `aria-describedby`, `aria-invalid` en campos con error.
- Estados = color + forma + palabra (también en el lector de pantalla: el chip dice la palabra).
- Objetivos táctiles ≥ 44 px. Respeta `prefers-reduced-motion` y `prefers-reduced-transparency`.
- Idioma `lang="es-CO"` en `<html>`.

---

## 16. Implementación y tokens
### 16.1 Stack de interfaz (decidido)
- **Web (React):** Tailwind CSS v4 leyendo los tokens de este manual + componentes propios en `src/components/ui` + `lucide-react` + `@fontsource/plus-jakarta-sans`. **No** se usan MUI, Chakra, Bootstrap, Ant ni kits de componentes con estilos propios (pelean con los tokens). Para comportamiento accesible (diálogo, menú, select, switch) se puede usar Radix UI **sin estilos** y vestirlo con los tokens.
- **Móvil (React Native):** los mismos valores exportados en `tokens.ts` (16.4) + `lucide-react-native`.

### 16.2 Estructura
```
web/src/
  assets/brand/         logo-light.svg · logo-dark.svg · symbol.svg · favicon.svg
  styles/tokens.css     copia exacta de 16.3 (no se edita en otro lado)
  styles/globals.css    Tailwind + mapeo 16.4 + base
  components/ui/        Button, IconButton, TextField, Select, NumberStepper, TimeSelect, HoursEditor,
                        Switch, SegmentedControl, StatusChip, Card, TableCard, StatTile, Alert, Toast,
                        Dialog, DropdownMenu, EmptyState, Skeleton, Spinner, DataTable, PageHeader
  components/layout/    AppShell, Sidebar, Topbar
  features/             auth · restaurant · tables · activity-log  (solo componen piezas de ui/)
```

### 16.3 `tokens.css` (copiar tal cual)
```css
/* ===== DiNNo design tokens v1.1 ===== */
:root{
  /* marca: no cambian con el tema */
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
  --ease:cubic-bezier(.2,.8,.2,1); --dur-fast:150ms; --dur-base:200ms; --dur-slow:300ms;
  /* capas */
  --z-sticky:10; --z-dropdown:20; --z-drawer:30; --z-overlay:40; --z-modal:50; --z-toast:60;
}
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
}
```

### 16.4 `globals.css` (Tailwind v4)
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
  --radius-card: var(--r-card); --radius-tile: var(--r-tile); --radius-btn: var(--r-btn);
  --radius-input: var(--r-input); --radius-sheet: var(--r-sheet);
  --shadow-card: var(--shadow-soft); --shadow-lifted: var(--shadow-float);
  --ease-dinno: var(--ease);
  /* tipografía: text-display, text-h1, text-h2, text-h3, text-body, text-sec, text-label, text-figure */
  --text-display: 48px; --text-display--line-height: 52px; --text-display--letter-spacing: -0.03em; --text-display--font-weight: 800;
  --text-h1: 32px; --text-h1--line-height: 36px; --text-h1--letter-spacing: -0.03em; --text-h1--font-weight: 800;
  --text-h2: 24px; --text-h2--line-height: 28px; --text-h2--letter-spacing: -0.02em; --text-h2--font-weight: 700;
  --text-h3: 18px; --text-h3--line-height: 24px; --text-h3--letter-spacing: -0.01em; --text-h3--font-weight: 700;
  --text-body: 16px; --text-body--line-height: 24px; --text-body--font-weight: 500;
  --text-sec: 14px; --text-sec--line-height: 20px; --text-sec--font-weight: 500;
  --text-label: 11px; --text-label--line-height: 14px; --text-label--letter-spacing: 0.08em; --text-label--font-weight: 700;
  --text-figure: 54px; --text-figure--line-height: 54px; --text-figure--letter-spacing: -0.04em; --text-figure--font-weight: 800;
}

@layer base {
  html { font-family: var(--font); background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }
  :focus-visible { outline: none; box-shadow: var(--focus-ring); }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
  }
}
```
Uso: `bg-surface text-fg border-line rounded-card shadow-card`, `text-accent-text`, `bg-accent text-on-accent rounded-btn`, `text-h1`, `text-label uppercase`. La etiqueta de 11 px lleva además `uppercase`; las cifras, `tabular-nums`.

### 16.5 `tokens.ts` (React Native)
```ts
export const light = {
  bg:'#FAF7F1', surface:'#FFFFFF', surface2:'#F2EFE8', text:'#10252B', text2:'#5E6B70',
  border:'#E2E6E3', borderStrong:'#8A9699', accent:'#F46935', accentPressed:'#DB5626', accentText:'#B83F14', onAccent:'#10252B',
  brand:'#103B46', onBrand:'#FAF7F1', ok:'#2B8F62', limited:'#B7801F', reserved:'#4E66C9', busy:'#6E7C80',
  inactive:'#8A9699', error:'#C8453A', info:'#1D5661', inverseBg:'#103B46', inverseText:'#FAF7F1', inverseAccent:'#FF8456',
};
export const dark: typeof light = {
  bg:'#0B2D36', surface:'#103B46', surface2:'#164853', text:'#FAF7F1', text2:'#A9BDC0',
  border:'#24525D', borderStrong:'#5E8A93', accent:'#FF8456', accentPressed:'#F46935', accentText:'#FF8456', onAccent:'#0B2D36',
  brand:'#103B46', onBrand:'#FAF7F1', ok:'#3FBF86', limited:'#E0A93B', reserved:'#8DA2F0', busy:'#8DA0A4',
  inactive:'#6F8C92', error:'#FF7B6E', info:'#7FC1CB', inverseBg:'#FAF7F1', inverseText:'#10252B', inverseAccent:'#B83F14',
};
export const radius = { card:20, tile:16, btn:14, input:12, sheet:28, chip:999 };
export const space = { 1:4, 2:8, 3:12, 4:16, 5:24, 6:32, 7:48 };
export const type = {
  display:{ fontSize:48, lineHeight:52, fontFamily:'PlusJakartaSans_800ExtraBold', letterSpacing:-1.44 },
  h1:{ fontSize:32, lineHeight:36, fontFamily:'PlusJakartaSans_800ExtraBold', letterSpacing:-0.96 },
  h2:{ fontSize:24, lineHeight:28, fontFamily:'PlusJakartaSans_700Bold', letterSpacing:-0.48 },
  h3:{ fontSize:18, lineHeight:24, fontFamily:'PlusJakartaSans_700Bold', letterSpacing:-0.18 },
  body:{ fontSize:16, lineHeight:24, fontFamily:'PlusJakartaSans_500Medium' },
  sec:{ fontSize:14, lineHeight:20, fontFamily:'PlusJakartaSans_500Medium' },
  label:{ fontSize:11, lineHeight:14, fontFamily:'PlusJakartaSans_700Bold', letterSpacing:0.88, textTransform:'uppercase' as const },
  figure:{ fontSize:54, lineHeight:54, fontFamily:'PlusJakartaSans_800ExtraBold', letterSpacing:-2.16, fontVariant:['tabular-nums'] as const },
};
export const motion = { fast:150, base:200, slow:300, easing:[0.2,0.8,0.2,1] as const };
```

---

## 17. Checklist antes de hacer merge
- [ ] No hay hex, radios, sombras ni tamaños sueltos (ni valores arbitrarios de Tailwind): todo sale de tokens.
- [ ] La pantalla se armó con componentes de `components/ui`; lo nuevo quedó ahí y el equipo lo sabe.
- [ ] Un solo botón primario naranja por pantalla, con texto tinta.
- [ ] Texto naranja sobre claro usa `--accent-text`.
- [ ] Cada estado tiene color + forma + palabra, con los nombres del glosario.
- [ ] Sin gradiente ni vidrio en el dashboard (el vidrio solo en `.float` sobre el mapa, con fallback sólido).
- [ ] Formularios: label arriba, “(opcional)”, error con ícono y mensaje útil, botón con estado de carga.
- [ ] Hay estado de carga (skeleton), vacío y error.
- [ ] Funciona en claro y oscuro, en 1280 / 768 / 390 y con movimiento reducido.
- [ ] Se puede usar con teclado y el foco se ve. Objetivos táctiles ≥ 44 px.
- [ ] Íconos solo de Lucide; sin íconos de comida ni pins genéricos.
- [ ] Textos tuteando, mayúscula inicial, botones con verbo + objeto.

---

## 18. Cambios desde v1.0
- **Nuevo:** iconografía (8), catálogo de componentes (9), formularios (10), feedback (11), layout web y pantallas del Sprint 1 (12), contenido y tono (14), accesibilidad (15), stack e implementación (16.1–16.2, 16.4–16.5).
- **Estados:** se agrega **Inactiva** (mesa) y **Abierto / Cerrado** (restaurante) con la forma “raya”; se separan los estados de mesa de la disponibilidad para el comensal (“Pocas mesas” ya no aparece como estado de una mesa); se agregan Éxito, Info y Advertencia.
- **Tokens:** `--orange-night`, `--border-strong`, `--accent-pressed`, `--inactive`, `--info`, `--nav-*`, `--inverse-*`, `--overlay`, `--focus-ring`, `--r-tile`, `--s-*`, `--font`, `--dur-*`, `--z-*`, gradientes como variables; el modo oscuro se activa también con `[data-theme="dark"]`.
- **Forma:** tarjeta compacta de radio 16; botón `sm` de 40 para escritorio; variantes texto, destructivo e ícono; estado de carga.
- **Gradientes:** se permite el petróleo en el panel de marca del login.
- **Ajustes de coherencia:** la regla 4 dice “forma” en ambos formatos (antes el PDF decía “ícono”); el PDF ya no corta contenido entre páginas.
