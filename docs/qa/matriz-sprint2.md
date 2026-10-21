# Matriz de pruebas · Sprint 2

| | |
|---|---|
| **Sprint** | Sprint 2 · Búsqueda y disponibilidad para el comensal (15–21 oct 2026) |
| **Objetivo** | Un comensal entra a la app móvil, busca restaurantes cerca o por zona, los ve con su indicador de disponibilidad, filtra, abre el detalle y ve los cambios en vivo cuando el restaurante cambia sus mesas o cierra desde la web (Reparto, sección 1). |
| **Ambiente** | Backend en Render + base en Neon · web en Vercel (⚠️ ver [Por confirmar #16](#7-por-confirmar)) · app como development build o APK de QA en el emulador de Android Studio, contra Render |
| **Fecha** | Matriz creada el 20 oct 2026 · QA: 20 oct (noche) · demo: 21 oct |
| **Responsables** | Jacobo: C1, C2, C12, R1, T1 · Santiago: C3, C4, C5, C6, C9, R2 · Sergio: C7, C8, C10, C11, R3, R4, T2, T3 (Reparto, sección 9) |
| **Fuente de los resultados esperados** | `DiNNo_Sprint2_Reparto.md` (secciones 2, 10 y 12), sección 10 del `CLAUDE.md` (contrato) y los textos del código en `develop` el 20 oct. Lo que no está definido o no coincide está marcado ⚠️ y listado en la [sección 7](#7-por-confirmar). |

> [!WARNING]
> **Capturas sin secretos.** Ninguna captura ni video puede mostrar tokens (por ejemplo el campo *Authorize* de Swagger o una cabecera `Authorization`), llaves (Maps, Firebase), contraseñas ni URLs de base de datos. Si aparece uno, recorta la imagen o vuelve a tomarla antes de subirla.

**Cómo llenar la matriz**
- Cada quien llena **solo las filas de sus casos** (así no chocan los cambios en el archivo).
- **Estado:** `Pendiente` · `Pasa` · `Falla` · `Bloqueado (motivo)` · `⚠️ Por confirmar (#n)`.
- **Resultado obtenido:** lo que viste, en una línea. Si falla, crea el Bug en Azure con el [formato de hallazgos](#6-formato-para-reportar-hallazgos) y pega el enlace en **Bug**.
- **Evidencia:** nombre del archivo en [`evidencias/`](evidencias/README.md), por ejemplo `C10.1-pasa.png`.

## Índice

1. [Preparación del ambiente](#1-preparación-del-ambiente)
2. [Tabla resumen](#2-tabla-resumen)
3. [Casos de Sergio](#3-casos-de-sergio-prioridad-de-esta-noche): C10 · R3 · R4 · C7 · C8 · C11 · T2 · T3
4. [Casos de Jacobo](#4-casos-de-jacobo): C1 · C2 · C12 · R1 · T1
5. [Casos de Santiago](#5-casos-de-santiago): C3 · C4 · C5 · C6 · C9 · R2
6. [Formato para reportar hallazgos](#6-formato-para-reportar-hallazgos)
7. [Por confirmar ⚠️](#7-por-confirmar)

---

## 1. Preparación del ambiente

### 1.1 Despertar el backend
Render duerme el servicio cuando no se usa. Antes de probar, abre en el navegador:

```
https://dinno-backend.onrender.com/v1/health
```

Debe responder `{ "status": "ok", "commit": "…" }`. La primera vez puede tardar casi un minuto. Anota el `commit` en tus hallazgos: dice qué versión del backend probaste.

### 1.2 Cuentas de prueba
Las credenciales se comparten **solo por privado**, nunca en esta matriz ni en una captura.

| Cuenta | Para qué | Notas |
|---|---|---|
| Comensal de prueba (correo y clave de Firebase, correo verificado) | Todos los casos de la app | ⚠️ [#13](#7-por-confirmar): pedirla por privado |
| Dueño de Casa 72 (web) | Cambiar mesas, abrir y cerrar (C10, R3, R4, T2, T3) | ⚠️ [#1](#7-por-confirmar): el seed se la asigna a `casa72@example.com` |
| Restaurante habilitado sin restaurante: `dinnoteam2026@gmail.com` (Google) | R1.1 | **No registres un restaurante con ella** |
| Correo no habilitado (cualquier Gmail que no esté en `users`) | R1.2 | |
| Cuenta de restaurante en la app (por ejemplo la de Casa 72) | T1.2 | |

### 1.3 App en el emulador
- **Development build** (`npx expo run:android`, con Metro corriendo) o **APK de QA** de Sebastián (`adb install -r app-release.apk`; ver README de mobile, sección 3, «APK para QA»). En los dos casos, contra Render y con `EXPO_PUBLIC_USE_MOCKS=false`.
- Si el emulador tiene internet pero la app dice «No pudimos conectarnos», ábrelo con DNS fijos: `emulator -avd <tu AVD> -dns-server 8.8.8.8,1.1.1.1`.

### 1.4 Simular la ubicación
Con el emulador encendido. **Primero longitud y luego latitud.** También se puede en *⋯ (Extended controls) → Location*.

```bash
adb emu geo fix -74.0567 4.6576     # Calle 72: aparece Casa 72 (a 200 m)
adb emu geo fix -75.5812 6.2442     # Medellín, fuera de Bogotá: sin resultados
adb emu geo fix -74.0567 4.6576     # volver a la Calle 72 al terminar
```

- El emulador arranca en California: hasta que envíes una posición, «Usar mi ubicación» no encuentra restaurantes.
- La primera vez Android puede mostrar *Location Accuracy*: toca **Turn on**. Si tardas más de 10 s, la app dice que no encontró tu ubicación a tiempo.

### 1.5 Web y app abiertas a la vez (tiempo real)
1. Pon el emulador y el navegador lado a lado.
2. **Web:** entra como dueño de Casa 72 y abre `/mesas`. Deja a la vista el switch «Estado del restaurante» del topbar.
3. **App:** entra como comensal, con la ubicación en la Calle 72, en *Explorar* (lista). Debe aparecer Casa 72.
4. Cada cambio en la web debe verse en la app en **1–2 s, sin recargar** (README de mobile, «Probar el tiempo real»). Como respaldo, la app vuelve a consultar cada 60 s, al volver a primer plano y al recuperar internet.

### 1.6 Casa 72: estado base y límites de disponibilidad

> **Casa 72 es el restaurante de la demo. Antes de cambiar sus mesas, avisa en el grupo, y al terminar devuélvelo a su estado base.**

**Estado base** (seed del backend; el seed no restaura las mesas, así que compruébalo en `/mesas` antes de empezar):

| Mesa | Capacidad | Estado | Activa |
|---|---|---|---|
| Mesa 1 | 2 | Disponible | sí |
| Mesa 2 | 2 | Ocupada | sí |
| Mesa 3 | 4 | Reservada | sí |
| Mesa 4 | 4 | Disponible | sí |
| Mesa 5 | 4 | Ocupada | sí |
| Mesa 6 | 6 | Reservada | sí |
| Mesa 7 | 6 | Disponible | sí |
| Mesa 8 | 8 | — | **no** (Inactiva) |

Con el estado base hay **3 libres de 7 activas (42,9 %) → «Disponible»**.

**Regla** (backend, `table-availability.ts`): libres = activas y *Disponible*. Es **«Disponible» si `libres × 10 > activas × 3`**, «Pocas mesas» si hay al menos 1 libre y no se cumple eso, y «Sin mesas» con 0 libres. Las mesas inactivas no cuentan.

| Libres / activas | % | Indicador | Cómo llegar desde el estado base |
|---|---|---|---|
| 3 / 7 | 42,9 % | Disponible | Estado base |
| 2 / 7 | 28,6 % | Pocas mesas | Mesa 7 → Ocupada |
| 1 / 7 | 14,3 % | Pocas mesas | Mesa 4 y Mesa 7 → Ocupada |
| 0 / 7 | 0 % | Sin mesas | Mesa 1, Mesa 4 y Mesa 7 → Ocupada |
| 2 / 6 | 33,3 % | Disponible | Desactivar Mesa 4 |
| 1 / 5 | 20 % | Pocas mesas | Desactivar Mesa 4 y Mesa 1 |
| **3 / 10** | **30 % exacto** | **Pocas mesas** | ⚠️ [#2](#7-por-confirmar): necesita 10 activas; no se modifica Neon antes de la demo |

### 1.7 Ventana horaria de Casa 72
Horario del seed (hora de Bogotá; la apertura cuenta y el cierre no):

| Lunes a jueves | Viernes y sábado | Domingo |
|---|---|---|
| 11:00 – 23:00 | 11:00 – 02:00 (día siguiente) | 11:00 – 21:00 |

- **Hoy, martes 20 oct, cierra a las 23:00.** Todo lo que necesite ver Casa 72 en la app (C7, C8, C10, C11, R4, T2) se prueba **antes de las 23:00**.
- R3.1 y R3.2 se prueban **justo después de las 23:00**, sin editar nada.

### 1.8 Comandos útiles (adb)
```bash
adb shell cmd connectivity airplane-mode enable     # sin internet (disable para volver)
adb emu network delay 6000                          # red lenta: «Conectando con DiNNo…» (none para quitar)
adb shell cmd location set-location-enabled false   # GPS apagado (true para encender)
adb shell pm revoke com.dinno.app android.permission.ACCESS_FINE_LOCATION     # volver a ver la explicación del permiso
adb shell pm revoke com.dinno.app android.permission.ACCESS_COARSE_LOCATION
```

---

## 2. Tabla resumen

Actualiza los conteos al terminar cada caso.

| Caso | Nombre | Responsable | Variantes | Pasa | Falla | Pendiente | Bloqueado | ⚠️ Por confirmar |
|---|---|---|---|---|---|---|---|---|
| [C10](#c10--disponibilidad-en-vivo) | Disponibilidad en vivo | Sergio | 13 | 0 | 0 | 12 | 0 | 1 |
| [R3](#r3--horario-y-disponibilidad) | Horario y disponibilidad | Sergio | 6 | 0 | 0 | 4 | 0 | 2 |
| [R4](#r4--sin-mesas-activas) | Sin mesas activas | Sergio | 4 | 0 | 0 | 4 | 0 | 0 |
| [C7](#c7--filtrar) | Filtrar | Sergio | 10 | 0 | 0 | 10 | 0 | 0 |
| [C8](#c8--sin-resultados) | Sin resultados | Sergio | 6 | 0 | 0 | 6 | 0 | 0 |
| [C11](#c11--errores-de-red) | Errores de red | Sergio | 6 | 0 | 0 | 4 | 0 | 2 |
| [T2](#t2--los-estados-se-llaman-igual) | Los estados se llaman igual | Sergio | 6 | 0 | 0 | 5 | 1 | 0 |
| [T3](#t3--regresión-del-sprint-1) | Regresión del Sprint 1 | Sergio | 10 | 0 | 0 | 7 | 0 | 3 |
| [C1](#c1--iniciar-sesión) | Iniciar sesión | Jacobo | 7 | 0 | 0 | 5 | 1 | 1 |
| [C2](#c2--crear-cuenta) | Crear cuenta | Jacobo | 5 | 0 | 0 | 0 | 5 | 0 |
| [C12](#c12--perfil) | Perfil | Jacobo | 6 | 0 | 0 | 0 | 6 | 0 |
| [R1](#r1--login-con-google-web) | Login con Google (web) | Jacobo | 4 | 0 | 0 | 3 | 1 | 0 |
| [T1](#t1--roles) | Roles | Jacobo | 6 | 0 | 0 | 5 | 1 | 0 |
| [C3](#c3--permiso-de-ubicación) | Permiso de ubicación | Santiago | 6 | 0 | 0 | 6 | 0 | 0 |
| [C4](#c4--buscar-cerca) | Buscar cerca | Santiago | 6 | 0 | 0 | 3 | 0 | 3 |
| [C5](#c5--buscar-por-zona) | Buscar por zona | Santiago | 5 | 0 | 0 | 5 | 0 | 0 |
| [C6](#c6--ver-resultados) | Ver resultados | Santiago | 7 | 0 | 0 | 3 | 3 | 1 |
| [C9](#c9--detalle) | Detalle | Santiago | 7 | 0 | 0 | 6 | 0 | 1 |
| [R2](#r2--ubicación-web) | Ubicación (web) | Santiago | 6 | 0 | 0 | 0 | 6 | 0 |
| **Total** | | | **126** | **0** | **0** | **88** | **24** | **14** |

---

## 3. Casos de Sergio (prioridad de esta noche)

### C10 · Disponibilidad en vivo
**Responsable:** Sergio · **Precondiciones comunes:** backend despierto (1.1) · app con el comensal de prueba, ubicación en la Calle 72 (1.4), en la lista de *Explorar* · web en `/mesas` como dueño de Casa 72 (1.5) · Casa 72 en su estado base (1.6) · antes de las 23:00 (1.7).
**Al terminar:** devuelve Casa 72 a su estado base.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| C10.1 | Cambio de mesa: de Disponible a Pocas mesas | Estado base | 1. En la web, Mesa 7 → *Ocupada*.<br>2. Mira la app sin tocarla. | En 1–2 s, sin recargar, el chip de Casa 72 pasa de «Disponible» a «Pocas mesas» (2/7 = 28,6 %) | | Pendiente | | |
| C10.2 | Límite: 0 libres | Después de C10.1 | 1. En la web, Mesa 1 y Mesa 4 → *Ocupada*. | El chip pasa a «Sin mesas». Casa 72 **sigue en la lista**, porque tiene mesas activas | | Pendiente | | |
| C10.3 | De 0 a 1 libre | Después de C10.2 | 1. En la web, Mesa 1 → *Disponible*. | El chip vuelve a «Pocas mesas» (1/7) | | Pendiente | | |
| C10.4 | Límite: exactamente 30 % | 10 mesas activas con 3 libres. **No se prepara en Neon antes de la demo** | — | «Pocas mesas» (3 × 10 = 30, que no es mayor que 10 × 3 = 30) | | ⚠️ Por confirmar (#2) | Prueba unitaria: [`table-availability.spec.ts`](https://github.com/DiNNo-team/backend/blob/develop/src/modules/search-availability/availability/table-availability.spec.ts) · «3 of 10 free (exactly 30 %) → few» | |
| C10.5 | Límite: justo por encima del 30 % | Estado base | 1. Revisa el chip con 3 libres de 7 (42,9 %), el valor más cercano por encima del 30 % con 7 activas. | «Disponible». Con 10 activas sería 4/10 (40 %), cubierto por la prueba «4 of 10 free → available» | | Pendiente | | |
| C10.6 | Desactivar mesa: la inactiva no cuenta | Estado base | 1. En la web, menú de Mesa 4 → «Desactivar» → «Desactivar mesa».<br>2. Igual con Mesa 1. | Paso 1: 2/6 = 33,3 %, sigue «Disponible».<br>Paso 2: 1/5 = 20 %, pasa a «Pocas mesas» | | Pendiente | | |
| C10.7 | Reactivar mesa | Después de C10.6 | 1. Menú de Mesa 1 → «Reactivar».<br>2. Igual con Mesa 4. | Vuelven como *Disponible* y el chip vuelve a «Disponible» (3/7) | | Pendiente | | |
| C10.8 | Cerrar restaurante con la lista abierta | Estado base (tiene mesas reservadas) | 1. En la web, switch «Estado del restaurante» → diálogo «¿Cerrar el restaurante?» → «Cerrar restaurante». | Web: toast «Restaurante cerrado. Los comensales ya no lo ven».<br>App: Casa 72 desaparece de la lista en 1–2 s, sin recargar | | Pendiente | | |
| C10.9 | Cerrar con el detalle abierto | Casa 72 abierto · detalle de Casa 72 abierto en la app | 1. Cierra el restaurante desde la web, como en C10.8. | El detalle muestra el chip «Cerrado» y el aviso «Este restaurante está cerrado ahora. Revisa su horario para saber cuándo abre.» | | Pendiente | | |
| C10.10 | Abrir restaurante | Casa 72 cerrado | 1. En la web, «Abrir ahora» en el aviso «Tu restaurante está cerrado. Los comensales no lo ven en DiNNo.». | Web: toast «Restaurante abierto. Los comensales ya lo ven».<br>App: Casa 72 vuelve a la lista con su chip, en pocos segundos y sin recargar | | Pendiente | | |
| C10.11 | Volver a la app | Estado base | 1. Manda la app a segundo plano (botón Inicio).<br>2. En la web, Mesa 7 → *Ocupada*.<br>3. Vuelve a la app. | Al volver, el chip muestra «Pocas mesas» sin que hagas nada | | Pendiente | | |
| C10.12 | Sin conexión y reconexión | Estado base, lista abierta | 1. `adb shell cmd connectivity airplane-mode enable`.<br>2. En la web, Mesa 7 → *Ocupada*.<br>3. Espera la siguiente consulta (hasta 60 s).<br>4. `adb shell cmd connectivity airplane-mode disable`. | Pasos 1–3: la lista se conserva con «No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.» e «Intentar de nuevo».<br>Paso 4: se actualiza sola a «Pocas mesas» | | Pendiente | | |
| C10.13 | Nunca se muestra el número de mesas | Durante C10.1–C10.12 | 1. Revisa la tarjeta de la lista y el detalle en cada cambio. | Solo las palabras «Disponible», «Pocas mesas», «Sin mesas» o «Cerrado»; **nunca** un número de mesas libres ni totales | | Pendiente | | |

### R3 · Horario y disponibilidad
**Responsable:** Sergio · **Precondiciones comunes:** Casa 72 con el switch en «Abierto» en la web · horario del seed (1.7) · **no se edita el horario en Neon antes de la demo**.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| R3.1 | *Abierto* fuera de horario no aparece en la app | **Martes 20 oct, después de las 23:00** (Bogotá) · switch en «Abierto» · ubicación en la Calle 72 | 1. En la app, busca cerca (o «Intentar de nuevo» / vuelve a *Explorar*). | Casa 72 **no aparece**. Si es el único: «No encontramos restaurantes con mesa» / «No hay restaurantes abiertos a 2 km de tu ubicación en este momento.» | | Pendiente | | |
| R3.2 | Detalle abierto cuando pasa la hora de cierre | Detalle de Casa 72 abierto **antes de las 23:00** | 1. Deja el detalle abierto hasta después de las 23:00.<br>2. Espera hasta 60 s (no hay evento por horario: lo cubre la consulta de respaldo). | El detalle pasa a «Cerrado» con el aviso «Este restaurante está cerrado ahora. Revisa su horario para saber cuándo abre.» | | Pendiente | | |
| R3.3 | La web sigue en «Abierto» | Después de las 23:00 | 1. Mira el switch «Estado del restaurante» en la web. | La web no cambia el switch: «Abierto» es la decisión del dueño; el horario solo afecta lo que ve el comensal | | Pendiente | | |
| R3.4 | La apertura cuenta, el cierre no | Prueba de reglas | — | A las 23:00 en punto ya está cerrado; a las 11:00 en punto ya está abierto | | Pendiente | Prueba unitaria: [`opening-hours.spec.ts`](https://github.com/DiNNo-team/backend/blob/develop/src/modules/search-availability/availability/opening-hours.spec.ts) · «regular hours (Friday 12:00-22:00)» | |
| R3.5 | Horario que cierra al día siguiente | Necesita editar el horario de Casa 72 o esperar al viernes después de medianoche | — | Abierto después de medianoche hasta la hora de cierre, con la fila del día anterior | | ⚠️ Por confirmar (#3) | Prueba unitaria: [`opening-hours.spec.ts`](https://github.com/DiNNo-team/backend/blob/develop/src/modules/search-availability/availability/opening-hours.spec.ts) · «closing the next day (Friday 18:00-02:00)» | |
| R3.6 | Horario de 24 horas | Necesita editar el horario de Casa 72 | — | Abierto todo el día (00:00–23:59), sin pasar al día siguiente | | ⚠️ Por confirmar (#3) | Prueba unitaria: [`opening-hours.spec.ts`](https://github.com/DiNNo-team/backend/blob/develop/src/modules/search-availability/availability/opening-hours.spec.ts) · «open 24 hours (Friday)» | |

### R4 · Sin mesas activas
**Responsable:** Sergio · **Precondiciones comunes:** como C10 · antes de las 23:00.
**Al terminar:** reactivar deja las mesas en *Disponible*, así que hay que devolver Mesa 2, 3, 5 y 6 a su estado base.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| R4.1 | Sin mesas activas no aparece en la app | Estado base · lista abierta en la app | 1. En la web, desactiva Mesa 1 a Mesa 7 («Desactivar» → «Desactivar mesa»). | Al desactivar la última, Casa 72 desaparece de la lista en 1–2 s, sin recargar | | Pendiente | | |
| R4.2 | Detalle abierto al desactivar la última | Detalle de Casa 72 abierto, con una sola mesa activa | 1. Desactiva la última mesa activa. | El detalle muestra «Abierto» y «Sin mesas» (sigue abierto, pero sin mesas: CLAUDE.md §10, tiempo real) | | Pendiente | | |
| R4.3 | Búsqueda nueva sin mesas activas | Después de R4.1 | 1. En la app, «Cambiar zona» → «Calle 72». | Casa 72 no aparece | | Pendiente | | |
| R4.4 | Reactivar una mesa → vuelve | Después de R4.3 | 1. En la web, Mesa 1 → «Reactivar». | Casa 72 vuelve a la lista con «Disponible» (1/1 libre) | | Pendiente | | |

### C7 · Filtrar
**Responsable:** Sergio · **Precondiciones comunes:** Casa 72 en su estado base (capacidades activas: 2, 2, 4, 4, 4, 6 y 6; libres: Mesa 1 de 2, Mesa 4 de 4 y Mesa 7 de 6) · ubicación en la Calle 72 · antes de las 23:00. El botón «Filtros» abre la hoja con «Categoría», «Distancia» y «Personas»; se aplica con «Ver restaurantes».

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| C7.1 | Categoría que coincide | Sin filtros | 1. «Filtros» → «Categoría» → «Colombiana» → «Ver restaurantes». | Casa 72 aparece. Arriba, chip «Colombiana» y «Limpiar filtros» | | Pendiente | | |
| C7.2 | Categoría que no coincide | Sin filtros | 1. «Filtros» → «Italiana» → «Ver restaurantes». | Sin resultados (ver C8) | | Pendiente | | |
| C7.3 | Distancia | Zona «Chapinero» (Casa 72 queda a ~1,36 km) | 1. «Filtros» → «Distancia» → «1 km» → «Ver restaurantes».<br>2. Cambia a «2 km». | Paso 1: Casa 72 no aparece; chip «A 1 km».<br>Paso 2: aparece «a 1,4 km» y desaparece el chip (2 km es el valor por defecto) | | Pendiente | | |
| C7.4 | Personas con mesa libre suficiente | Sin filtros | 1. «Filtros» → «Personas» → «Elegir personas» → 6 → «Ver restaurantes». | Casa 72 aparece (Mesa 7, de 6, libre). Chip «6 personas» | | Pendiente | | |
| C7.5 | Personas y cambio en vivo | Después de C7.4 | 1. En la web, Mesa 7 → *Ocupada*. | Casa 72 desaparece de la lista: ya no hay mesa libre de 6 o más (Mesa 6 está reservada) | | Pendiente | | |
| C7.6 | Límite: más personas que todas las capacidades | Estado base | 1. «Personas» → 7 → «Ver restaurantes». | Sin resultados: no hay mesa activa de 7 o más (Mesa 8, de 8, está inactiva). Ver C8.3 | | Pendiente | | |
| C7.7 | Filtros combinados | Estado base | 1. «Colombiana» + «Distancia» 5 km + «Personas» 4 → «Ver restaurantes». | Casa 72 aparece. Chips «Colombiana», «A 5 km» y «4 personas» | | Pendiente | | |
| C7.8 | Quitar un chip | Después de C7.7 | 1. Toca el chip «A 5 km». | Se quita solo ese filtro (vuelve a 2 km); los demás siguen | | Pendiente | | |
| C7.9 | Limpiar filtros | Con filtros activos | 1. «Limpiar filtros». | Vuelven «Todas», 2 km y «Cualquier cantidad»; desaparecen los chips | | Pendiente | | |
| C7.10 | Se conservan al volver del detalle | Con «Colombiana» + 4 personas | 1. Abre el detalle de Casa 72.<br>2. Vuelve. | Los mismos filtros, chips y resultados | | Pendiente | | |

### C8 · Sin resultados
**Responsable:** Sergio · **Precondiciones comunes:** Casa 72 en su estado base · antes de las 23:00. Los radios van 1 → 2 → 5 → 10 km.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| C8.1 | Mensaje por zona | Zona «Usaquén» (Casa 72 queda a ~5,24 km), 2 km | 1. Elige la zona «Usaquén». | «No encontramos restaurantes con mesa» · «No hay restaurantes abiertos a 2 km de Usaquén en este momento.» · «Ampliar a 5 km» · «Cambiar filtros» · «Cambiar zona» | | Pendiente | | |
| C8.2 | Ampliar radio | Después de C8.1 | 1. «Ampliar a 5 km».<br>2. «Ampliar a 10 km». | Paso 1: sigue sin resultados, ahora con «Ampliar a 10 km».<br>Paso 2: aparece Casa 72 «a 5,2 km» | | Pendiente | | |
| C8.3 | Sin resultados con filtros | Ubicación en la Calle 72, «Personas» 7 | 1. Aplica el filtro. | «No hay restaurantes abiertos a 2 km de tu ubicación con estos filtros en este momento.» · «Ampliar a 5 km» · «Cambiar filtros» | | Pendiente | | |
| C8.4 | Cambiar filtros desde sin resultados | Después de C8.3 | 1. «Cambiar filtros» → «Limpiar filtros» → «Ver restaurantes». | Se abre la hoja de filtros; al limpiar, Casa 72 aparece | | Pendiente | | |
| C8.5 | Cambiar zona desde sin resultados | Después de C8.1 | 1. «Cambiar zona» → «Calle 72». | Casa 72 aparece | | Pendiente | | |
| C8.6 | Fuera de Bogotá, radio máximo | Ubicación en Medellín (1.4) | 1. «Usar mi ubicación».<br>2. Amplía hasta 10 km. | Sin resultados; con 10 km ya no hay «Ampliar a…» y el botón principal es «Cambiar filtros» | | Pendiente | | |

### C11 · Errores de red
**Responsable:** Sergio · **Precondiciones comunes:** ubicación en la Calle 72 · antes de las 23:00.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| C11.1 | Backend dormido o lento | — | 1. `adb emu network delay 6000`.<br>2. Busca o pulsa «Intentar de nuevo».<br>3. `adb emu network delay none`. | Después de 5 s aparece arriba «Conectando con DiNNo…»; desaparece al responder | | ⚠️ Por confirmar (#11) | | |
| C11.2 | Sin internet en la primera carga | App abierta, sin resultados en pantalla | 1. Modo avión (1.8).<br>2. «Usar mi ubicación» o elige una zona.<br>3. Quita el modo avión y pulsa «Intentar de nuevo». | Pasos 1–2: «No pudimos cargar los restaurantes» · «No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.» · «Intentar de nuevo».<br>Paso 3: aparecen los resultados | | Pendiente | | |
| C11.3 | Sin internet con resultados en pantalla | Lista con Casa 72 | 1. Modo avión y espera la siguiente consulta (hasta 60 s).<br>2. Quita el modo avión. | Se conserva la lista con un aviso «No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.» + «Intentar de nuevo»; al volver internet, se actualiza sola | | Pendiente | | |
| C11.4 | Sin internet en el detalle | Lista con Casa 72 | 1. Modo avión.<br>2. Abre el detalle de Casa 72 (si no estaba en caché).<br>3. Quita el modo avión y pulsa «Intentar de nuevo». | «No pudimos cargar el restaurante» + mensaje de red + «Intentar de nuevo»; al reintentar, se ve el detalle | | Pendiente | | |
| C11.5 | Error del servidor | Necesita un `500` real de Render | — | «Algo falló de nuestro lado. Intenta de nuevo en un momento.» + «Intentar de nuevo» | | ⚠️ Por confirmar (#10) | | |
| C11.6 | Sin internet al abrir la app con sesión | Sesión guardada | 1. Cierra la app.<br>2. Modo avión.<br>3. Abre la app. | Pantalla «No pudimos conectarnos con DiNNo» con el mensaje de red, «Intentar de nuevo» y «Cerrar sesión» | | Pendiente | | |

### T2 · Los estados se llaman igual
**Responsable:** Sergio · Compara backend (Swagger: `https://dinno-backend.onrender.com/docs`), web, bitácora y app. **Nunca** «Libre» como estado.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| T2.1 | Estados de mesa en la web | `/mesas` | 1. Revisa los chips y el selector de estado de cada mesa. | `available` · `reserved` · `occupied` = «Disponible» · «Reservada» · «Ocupada»; mesa desactivada = «Inactiva» | | Pendiente | | |
| T2.2 | Estados en la bitácora | Después de C10 | 1. Abre `/bitacora`. | Mismos chips («Disponible», «Reservada», «Ocupada», «Inactiva»), con la flecha entre el estado anterior y el nuevo | | Pendiente | | |
| T2.3 | Estado del restaurante | Web y detalle en la app | 1. Compara el switch de la web con el chip del detalle. | «Abierto» / «Cerrado» en los dos | | Pendiente | | |
| T2.4 | Disponibilidad en lista y detalle | Durante C10 | 1. Compara la tarjeta y el detalle en cada nivel. | `available` · `few` · `none` · `closed` = «Disponible» · «Pocas mesas» · «Sin mesas» · «Cerrado», iguales en lista y detalle | | Pendiente | | |
| T2.5 | Disponibilidad en el mapa | Mapa con llave de Maps | 1. Compara el pin con la tarjeta. | Mismo texto y color que la tarjeta | | Bloqueado (sin llave de Maps, hallazgo 2) | | |
| T2.6 | La API nunca expone el número de mesas | Swagger | 1. Revisa las respuestas de `GET /v1/search/restaurants` y `GET /v1/restaurants/{id}/public`. | Solo `availability`, sin campos de cantidad de mesas | | Pendiente | Prueba unitaria: [`compute-availability.spec.ts`](https://github.com/DiNNo-team/backend/blob/develop/src/modules/search-availability/availability/compute-availability.spec.ts) · «never returns how many tables there are or how many are free» | |

### T3 · Regresión del Sprint 1
**Responsable:** Sergio · Recorrido de la demo del Sprint 1 (`docs/DiNNo_Sprint1_Reparto.md`, sección 9), en la web. Los pasos 1–3 crean datos en Neon con un usuario sin restaurante, por eso quedan ⚠️. Los pasos 4–9 se hacen con Casa 72 y se deshacen al final.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| T3.1 | Usuario sin restaurante → registro | Usuario sin restaurante | 1. Inicia sesión. | Llega a `/onboarding` «Configura tu restaurante» | | ⚠️ Por confirmar (#12) | | |
| T3.2 | Registrar el restaurante | Después de T3.1 | 1. «Guardar y continuar» sin nombre (error de validación).<br>2. Completa y guarda. | Paso 1: «Escribe el nombre de tu restaurante.».<br>Paso 2: «Cambios guardados» y llega a `/mesas` vacío: «Aún no tienes mesas» | | ⚠️ Por confirmar (#12) | | |
| T3.3 | Crear 4 mesas | Después de T3.2 | 1. «Agregar mesa» cuatro veces.<br>2. Intenta repetir un identificador. | Las 4 aparecen; el repetido muestra «Ya tienes una Mesa 04. Usa otro identificador.» | | ⚠️ Por confirmar (#12) | | |
| T3.4 | Cambiar estados y Deshacer | Casa 72 en `/mesas` | 1. Mesa 1: *Disponible* → *Ocupada* → *Reservada*.<br>2. «Deshacer» en el toast.<br>3. Devuelve Mesa 1 a *Disponible*. | Cada cambio guarda («Cambios guardados»); «Deshacer» devuelve el estado anterior | | Pendiente | | |
| T3.5 | Editar capacidad; desactivar y reactivar | Casa 72 | 1. Edita la capacidad de Mesa 1 a 3 y guarda; devuélvela a 2.<br>2. Desactiva Mesa 4 («Desactivar mesa») y reactívala. | Los cambios se guardan; la mesa desactivada aparece «Inactiva» y vuelve al reactivarla | | Pendiente | | |
| T3.6 | Bitácora | Después de T3.4 y T3.5 | 1. Abre `/bitacora`. | Aparecen los cambios de estado, desactivar y reactivar con «Fecha y hora», mesa, cambio y usuario; no aparecen los cambios de capacidad | | Pendiente | | |
| T3.7 | Cerrar y abrir el restaurante | Casa 72 | 1. Cierra con el switch («¿Cerrar el restaurante?» → «Cerrar restaurante»).<br>2. «Abrir ahora». | Paso 1: aviso «Tu restaurante está cerrado. Los comensales no lo ven en DiNNo.».<br>Paso 2: desaparece el aviso | | Pendiente | | |
| T3.8 | Editar el restaurante y volver a entrar | Casa 72 · anota la dirección original: «Av. Calle 72 con Cra. 9, Chapinero, Bogotá» | 1. En `/restaurante`, «Editar» la dirección y guarda.<br>2. Cierra sesión y vuelve a entrar.<br>3. Devuelve la dirección original. | «Cambios guardados»; al volver a entrar, todo sigue igual | | Pendiente | | |
| T3.9 | Pantalla privada sin sesión | Sin sesión | 1. Abre `/mesas` directamente. | Manda al login | | Pendiente | | |
| T3.10 | Modo oscuro y tablet | — | 1. Repite T3.4–T3.7 en modo oscuro y a 768 px. | Se ve bien, con el contraste y los tokens del manual | | Pendiente | | |

---

## 4. Casos de Jacobo

### C1 · Iniciar sesión
**Responsable:** Jacobo · **Precondiciones comunes:** app contra Render · cuenta de comensal de prueba.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| C1.1 | Correo y clave correctos | Sin sesión | 1. «Correo» y «Contraseña» → «Iniciar sesión». | «Iniciando sesión…» y llega a *Explorar* | | Pendiente | | |
| C1.2 | Credenciales inválidas | Sin sesión | 1. Clave incorrecta → «Iniciar sesión». | «Correo o contraseña incorrectos. Revisa e intenta de nuevo.» (no dice cuál de los dos falló) | | Pendiente | | |
| C1.3 | Google | — | 1. «Continuar con Google». | Entra a *Explorar*; el nombre de Google llega al perfil | | Bloqueado (no está en develop: botón de Google en la app, Jacobo) | | |
| C1.4 | Sesión persistente al reabrir | Con sesión | 1. Cierra la app desde Recientes.<br>2. Ábrela. | Entra directo a *Explorar*, sin pedir login | | Pendiente | | |
| C1.5 | Sesión vencida | Token inválido o vencido | — | Vuelve al login con «Tu sesión terminó. Inicia sesión de nuevo.» | | ⚠️ Por confirmar (#17) | | |
| C1.6 | Cerrar sesión | Con sesión | 1. *Perfil* → «Cerrar sesión». | Vuelve al login (con confirmación: ver C12) | | Pendiente | | |
| C1.7 | Muchos intentos | Sin sesión | 1. Repite una clave incorrecta varias veces. | «Hay demasiados intentos. Espera un momento e inténtalo de nuevo.» | | Pendiente | | |

### C2 · Crear cuenta
**Responsable:** Jacobo · Las pantallas `/crear-cuenta`, `/verificar-correo` y `/recuperar-contrasena` siguen provisionales en `develop` (hallazgo 4).

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| C2.1 | Correo nuevo | — | 1. «Crea tu cuenta» → nombre, correo y contraseña. | «Creando cuenta…» y pasa a la verificación de correo | | Bloqueado (no está en develop: crear cuenta, Jacobo) | | |
| C2.2 | Correo ya usado | — | 1. Usa un correo existente. | «Ya hay una cuenta con este correo. Inicia sesión o usa otro correo.» | | Bloqueado (no está en develop: crear cuenta, Jacobo) | | |
| C2.3 | Contraseña corta | — | 1. Contraseña de menos de 8 caracteres. | «Usa una contraseña más segura, de al menos 8 caracteres.» | | Bloqueado (no está en develop: crear cuenta, Jacobo) | | |
| C2.4 | Verificación de correo | Cuenta sin verificar | 1. «Reenviar» y «Ya lo verifiqué». | Comportamiento igual al de la web; al verificar, crea el perfil y entra | | Bloqueado (no está en develop: verificación, Jacobo) | | |
| C2.5 | Recuperar contraseña | — | 1. «¿Olvidaste tu contraseña?». | Envía el correo sin decir si la cuenta existe | | Bloqueado (no está en develop: recuperar contraseña, Jacobo) | | |

### C12 · Perfil
**Responsable:** Jacobo · La pantalla real está en el PR `feat/sprint2-diner-profile`, sin fusionar. En `develop` hay una provisional sin confirmación.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| C12.1 | Ver datos | Con sesión | 1. Abre *Perfil*. | Nombre (o la parte del correo antes de `@`), correo y «Versión 1.0.0»; skeleton si tarda | | Bloqueado (no está en develop: feat/sprint2-diner-profile) | | |
| C12.2 | Error al cargar | Modo avión | 1. Abre *Perfil*. | «No pudimos cargar tu perfil» + mensaje de red + «Intentar de nuevo» | | Bloqueado (no está en develop: feat/sprint2-diner-profile) | | |
| C12.3 | Cancelar el cierre | Con sesión | 1. «Cerrar sesión» → «Cancelar». | Se cierra el diálogo «¿Cerrar sesión?» y sigue en *Perfil* | | Bloqueado (no está en develop: feat/sprint2-diner-profile) | | |
| C12.4 | Cerrar sesión con confirmación | Con sesión | 1. «Cerrar sesión» → «Cerrar sesión». | Diálogo «¿Cerrar sesión?» / «Tendrás que iniciar sesión de nuevo para buscar mesa.»; «Cerrando sesión…» y llega al login | | Bloqueado (no está en develop: feat/sprint2-diner-profile) | | |
| C12.5 | Botón atrás después de cerrar sesión | Después de C12.4 | 1. Botón atrás de Android. | No vuelve a *Perfil* ni a *Explorar* | | Bloqueado (no está en develop: feat/sprint2-diner-profile) | | |
| C12.6 | Sin datos de la cuenta anterior | Después de C12.4 | 1. Entra con otra cuenta de comensal. | *Perfil* muestra solo sus datos; *Explorar* empieza sin filtros ni resultados anteriores | | Bloqueado (no está en develop: feat/sprint2-diner-profile) | | |

### R1 · Login con Google (web)
**Responsable:** Jacobo · **Precondiciones comunes:** web con el login de Google (PR #42, en `develop`; ⚠️ #16 sobre la URL).

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| R1.1 | Correo habilitado → panel | `dinnoteam2026@gmail.com` | 1. «Continuar con Google» → elige la cuenta. | «Conectando con Google…» y entra. Como no tiene restaurante, va a `/onboarding` «Configura tu restaurante» (no lo registres) | | Pendiente | | |
| R1.2 | Correo no habilitado → mensaje | Gmail que no está en `users` | 1. «Continuar con Google». | «Esta cuenta no está habilitada como restaurante. Si eres comensal, encuentra mesa desde la app DiNNo.» + «Cerrar sesión» | | Bloqueado (no está en develop: feat/sprint2-cuenta-equivocada-web) | | |
| R1.3 | Ventana cerrada por el usuario | — | 1. «Continuar con Google» → cierra la ventana. | No aparece ningún error; sigue en el login | | Pendiente | | |
| R1.4 | Ventanas emergentes bloqueadas | Bloquea las ventanas emergentes del sitio | 1. «Continuar con Google». | «No pudimos abrir la ventana de Google. Permite las ventanas emergentes e intenta de nuevo.» | | Pendiente | | |

### T1 · Roles
**Responsable:** Jacobo · Las variantes de API se prueban en Swagger (`/docs`) con el token de cada cuenta. **Nunca captures el token.**

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| T1.1 | Comensal en la web | Cuenta de comensal | 1. Entra a la web. | «Esta es una cuenta de comensal. Para buscar mesa, usa la app DiNNo.» + «Cerrar sesión» | | Bloqueado (no está en develop: feat/sprint2-cuenta-equivocada-web) | | |
| T1.2 | Restaurante en la app | Cuenta de Casa 72 | 1. Inicia sesión en la app. | «Esta es una cuenta de restaurante» · «Administra tu restaurante desde la web.» · «Cerrar sesión» | | Pendiente | | |
| T1.3 | Comensal llamando un endpoint de restaurante | Token de comensal | 1. `GET /v1/tables`. | `403` `DINER_ACCOUNT` · «Esta es una cuenta de comensal. Para buscar mesa, usa la app DiNNo.» | | Pendiente | | |
| T1.4 | Restaurante llamando un endpoint de comensal | Token de restaurante | 1. `GET /v1/search/zones`. | `403` `RESTAURANT_ACCOUNT` · «Esta es una cuenta de restaurante. Administra tu restaurante desde la web.» | | Pendiente | | |
| T1.5 | Cuenta sin perfil en un endpoint de restaurante | Token de una cuenta de Firebase sin fila en `users` | 1. `GET /v1/tables`. | `403` `ACCOUNT_NOT_ENABLED` · «Esta cuenta no está habilitada como restaurante. Si eres comensal, encuentra mesa desde la app DiNNo.» | | Pendiente | | |
| T1.6 | Sin token | — | 1. `GET /v1/me` sin *Authorize*. | `401` · «Tu sesión terminó. Inicia sesión de nuevo.» | | Pendiente | | |

---

## 5. Casos de Santiago

### C3 · Permiso de ubicación
**Responsable:** Santiago · Para volver a ver la explicación, revoca el permiso (1.8).

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| C3.1 | Explicación antes de pedir permiso | Permiso revocado | 1. Abre *Explorar*. | «Encuentra mesa cerca de ti» · «Usamos tu ubicación solo para mostrarte restaurantes con mesa a tu alrededor. Si prefieres, elige una zona de Bogotá.» · «Usar mi ubicación» · «Elegir una zona» | | Pendiente | | |
| C3.2 | Concedido | Ubicación en la Calle 72 | 1. «Usar mi ubicación» → permitir. | «Buscando tu ubicación…» y luego resultados con «Cerca de ti · 2 km» | | Pendiente | | |
| C3.3 | Rechazado | Permiso revocado | 1. «Usar mi ubicación» → rechazar. | «No usaremos tu ubicación. Elige una zona para ver restaurantes cerca de ella.» y la opción de zona | | Pendiente | | |
| C3.4 | Bloqueado (rechazado dos veces) | Permiso revocado | 1. Rechaza dos veces. | «DiNNo no tiene permiso para usar tu ubicación. Actívalo en los ajustes del teléfono o elige una zona.» + «Abrir ajustes» | | Pendiente | | |
| C3.5 | GPS apagado | `adb shell cmd location set-location-enabled false` | 1. «Usar mi ubicación». | «La ubicación del teléfono está apagada. Actívala e intenta de nuevo, o elige una zona.» | | Pendiente | | |
| C3.6 | Tiempo agotado | — | 1. «Usar mi ubicación» y deja abierto el aviso *Location Accuracy* más de 10 s. | «No pudimos encontrar tu ubicación a tiempo. Intenta de nuevo o elige una zona.» | | Pendiente | | |

### C4 · Buscar cerca
**Responsable:** Santiago · **Precondiciones comunes:** ubicación en la Calle 72 · antes de las 23:00.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| C4.1 | Radio por defecto | Sin filtros | 1. «Usar mi ubicación». | Encabezado «Cerca de ti · 2 km»; Casa 72 «a 200 m» | | Pendiente | | |
| C4.2 | Orden por distancia | Varios restaurantes en Render | 1. Revisa el orden. | Del más cercano al más lejano | | ⚠️ Por confirmar (#8) | | |
| C4.3 | Cerrado no aparece | — | Ver C10.8 y R3.1 | No aparece | | Pendiente | | |
| C4.4 | Sin mesas activas no aparece | — | Ver R4.1 | No aparece | | Pendiente | | |
| C4.5 | Sin coordenadas no aparece | Un restaurante sin coordenadas | — | No aparece | | ⚠️ Por confirmar (#8) | Prueba unitaria: [`compute-availability.spec.ts`](https://github.com/DiNNo-team/backend/blob/develop/src/modules/search-availability/availability/compute-availability.spec.ts) · «without coordinates: not searchable even if open with tables» | |
| C4.6 | Máximo 50 resultados | Más de 50 restaurantes | — | Máximo 50 | | ⚠️ Por confirmar (#8) | | |

### C5 · Buscar por zona
**Responsable:** Santiago · **Precondiciones comunes:** antes de las 23:00.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| C5.1 | Zona de la lista | — | 1. «Elegir una zona» → «¿Dónde buscamos?» → «Calle 72». | Encabezado «Calle 72 · 2 km»; Casa 72 «a 50 m» (la distancia mínima que se muestra) | | Pendiente | | |
| C5.2 | Cambiar de zona | Después de C5.1 | 1. «Cambiar zona» → «Chapinero». | «Chapinero · 2 km»; Casa 72 «a 1,4 km» | | Pendiente | | |
| C5.3 | Volver a usar la ubicación | Después de C5.2 · ubicación en la Calle 72 | 1. «Cambiar zona» → «Usar mi ubicación». | «Cerca de ti · 2 km»; Casa 72 «a 200 m» | | Pendiente | | |
| C5.4 | Lista completa de zonas | — | 1. Abre «¿Dónde buscamos?». | Las 20 zonas de la sección 10 del `CLAUDE.md` (Chapinero, Calle 72, Zona G, Zona T, Usaquén, Teusaquillo, Parque 93, Cedritos, Salitre, Centro, La Candelaria, Galerías, Modelia, Suba, Kennedy, Colina, Niza, Chicó, Quinta Camacho y Normandía) | | Pendiente | | |
| C5.5 | Error al cargar las zonas | Modo avión | 1. Abre «¿Dónde buscamos?». | «No pudimos cargar las zonas» + mensaje de red + «Intentar de nuevo» | | Pendiente | | |

### C6 · Ver resultados
**Responsable:** Santiago · **Precondiciones comunes:** ubicación en la Calle 72 · antes de las 23:00.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| C6.1 | Tarjeta de la lista | — | 1. Revisa la tarjeta de Casa 72. | Nombre, categoría («Colombiana»), distancia («a 200 m») y chip de disponibilidad | | Pendiente | | |
| C6.2 | Formato de distancia | Ubicación en la Calle 72 y zona Chapinero | 1. Compara las dos distancias. | Menos de 1 km: metros redondeados a 50 («a 200 m»); desde 1 km, un decimal con coma («a 1,4 km») | | Pendiente | | |
| C6.3 | Tocar tarjeta | — | 1. Toca la tarjeta. | Abre el detalle de Casa 72 | | Pendiente | | |
| C6.4 | Ver como mapa | Llave de Maps | 1. «Ver resultados como» → mapa. | Pines con su disponibilidad | | Bloqueado (sin llave de Maps, hallazgo 2) | | |
| C6.5 | Lista y mapa sincronizados | Llave de Maps | 1. Desliza las tarjetas del mapa. | El pin resaltado sigue a la tarjeta | | Bloqueado (sin llave de Maps, hallazgo 2) | | |
| C6.6 | Tocar pin | Llave de Maps | 1. Toca un pin. | Se resalta su tarjeta | | Bloqueado (sin llave de Maps, hallazgo 2) | | |
| C6.7 | Los tres niveles a la vez | Varios restaurantes en Render | 1. Revisa la lista. | «Disponible», «Pocas mesas» y «Sin mesas» en distintas tarjetas | | ⚠️ Por confirmar (#8) | | |

### C9 · Detalle
**Responsable:** Santiago · **Precondiciones comunes:** antes de las 23:00.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| C9.1 | Datos completos | Ubicación en la Calle 72 | 1. Abre el detalle de Casa 72. | Chips «Abierto» + disponibilidad, «Av. Calle 72 con Cra. 9, Chapinero, Bogotá · a 200 m», «Colombiana», «Cómo llegar» y «Horarios» con la semana (hoy en negrita) | | Pendiente | | |
| C9.2 | Cerrado | Casa 72 cerrado | Ver C10.9 | Chip «Cerrado» y «Este restaurante está cerrado ahora. Revisa su horario para saber cuándo abre.» | | Pendiente | | |
| C9.3 | Cierre al día siguiente | — | 1. Revisa el viernes y el sábado en «Horarios». | «11:00 a. m. – 2:00 a. m. (día siguiente)» | | Pendiente | | |
| C9.4 | 24 horas | Restaurante con un día de 24 horas | — | «Abierto 24 horas» | | ⚠️ Por confirmar (#3) | Prueba unitaria: [`schedule.test.ts`](https://github.com/DiNNo-team/mobile/blob/develop/src/features/search/schedule.test.ts) · «normal day, closing the next day, 24 hours and closed» | |
| C9.5 | «Cómo llegar» | — | 1. «Cómo llegar». | Abre Google Maps con la ruta a Casa 72 | | Pendiente | | |
| C9.6 | Restaurante inexistente | — | 1. `adb shell am start -a android.intent.action.VIEW -d "dinno://restaurante/00000000-0000-0000-0000-000000000000"` | «Este restaurante ya no está disponible» · «Puede que haya cambiado su información. Busca otros restaurantes cerca.» · «Volver a explorar» | | Pendiente | | |
| C9.7 | Error de red | Modo avión, detalle no cargado | 1. Abre el detalle. | «No pudimos cargar el restaurante» + mensaje de red + «Intentar de nuevo» | | Pendiente | | |

### R2 · Ubicación (web)
**Responsable:** Santiago · El pin de ubicación y la geocodificación no están en `develop` (hallazgo 8, «en curso»).

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| R2.1 | Registro con pin | — | 1. Registra un restaurante y confirma el pin. | Se guardan `latitude` y `longitude` | | Bloqueado (no está en develop: pin de ubicación web, Santiago) | | |
| R2.2 | Edición con pin | — | 1. Mueve el pin en `/restaurante`. | Se guarda y el restaurante se mueve en la app | | Bloqueado (no está en develop: pin de ubicación web, Santiago) | | |
| R2.3 | Dirección no encontrada | — | 1. Busca una dirección que no existe. | Mensaje claro (`404` `ADDRESS_NOT_FOUND`) | | Bloqueado (no está en develop: pin de ubicación web, Santiago) | | |
| R2.4 | Geocodificación caída | — | — | Mensaje claro (`503` `GEOCODING_UNAVAILABLE`) | | Bloqueado (no está en develop: pin de ubicación web, Santiago) | | |
| R2.5 | Aviso si falta la ubicación | Restaurante sin coordenadas | 1. Entra al panel. | Aviso «Completa tu ubicación» | | Bloqueado (no está en develop: pin de ubicación web, Santiago) | | |
| R2.6 | Lo que se guarda en la web es lo que muestra la app | Después de R2.2 | 1. Compara la ubicación en la web y en la app. | Coinciden | | Bloqueado (no está en develop: pin de ubicación web, Santiago) | | |

---

## 6. Formato para reportar hallazgos

Cada hallazgo va **al grupo y a Azure (Bug)** (Reparto, sección 9, «Rol de QA»). Copia esta plantilla:

```markdown
**[ID de la variante] Título corto**
- Ambiente: Render (commit de /v1/health: …) · web (URL o local) · app (development build o APK)
- Pasos para reproducirlo:
  1. …
  2. …
- Resultado esperado: … (copia el de la matriz)
- Resultado obtenido: …
- Captura: evidencias/<ID>-falla.png (sin tokens, llaves, contraseñas ni URLs de base de datos)
- Responsable: Elizabeth (backend) · Sebastián (app y web) · Jacobo · Santiago · Sergio
```

Después pega el enlace del Bug en la columna **Bug** de la variante y cambia su estado a «Falla».

---

## 7. Por confirmar

| # | Punto | Por qué | Preguntar a | Afecta |
|---|---|---|---|---|
| 1 | ¿Qué cuenta entra a la web como dueña de Casa 72? | El seed se la asigna a `casa72@example.com`; `dinnoteam2026@gmail.com` no tiene restaurante (hallazgo 6, abierto) | Elizabeth | C10, R3, R4, T2, T3 |
| 2 | 30 % exacto | Con 7 activas no se llega al 30 %. No se modifica Neon antes de la demo; queda cubierto por la prueba unitaria | Elizabeth | C10.4 |
| 3 | Horarios de 24 horas y que cierra al día siguiente | Hay que editar el horario de Casa 72 en Neon; no se hace antes de la demo | Elizabeth | R3.5, R3.6, C9.4 |
| 4 | Pantallas de cuenta equivocada en la web | `ACCOUNT_NOT_ENABLED` y `DINER_ACCOUNT` no están en `develop` (`feat/sprint2-cuenta-equivocada-web`) | Jacobo / Sebastián | R1.2, T1.1 |
| 5 | Pin de ubicación y geocodificación en la web | No están en `develop` (hallazgo 8, «en curso») | Santiago / Sebastián | R2 |
| 6 | Google, crear cuenta, verificación y recuperar contraseña en la app | Siguen provisionales (hallazgo 4) | Jacobo / Sebastián | C1.3, C2 |
| 7 | Mapa | No hay llave de Maps (hallazgo 2) | Equipo de Google Cloud / Sebastián | C6.4–C6.6, T2.5 |
| 8 | Varios restaurantes en Render | Solo existe Casa 72 (hallazgo 3): no se puede ver el orden, varios pines ni los tres niveles a la vez | Santiago / Elizabeth | C4.2, C4.5, C4.6, C6.7 |
| 9 | Etiquetas de categoría | El reparto 2.3 dice «Pescados y mariscos» y «Café»; la web y la app dicen «Mariscos» y «Cafetería». La matriz usa los del código | Sebastián | C7 |
| 10 | Cómo provocar un «error del servidor» en Render | No hay una forma definida sin tocar la base | Elizabeth | C11.5 |
| 11 | «Backend dormido» | No se puede forzar. ¿Se acepta `adb emu network delay 6000` como sustituto? | Sebastián | C11.1 |
| 12 | Usuario sin restaurante para T3 | `onboarding@example.com` puede tener ya restaurante y reiniciarlo lo hace Elizabeth; `demo@example.com` está reservado para la demo | Elizabeth | T3.1–T3.3 |
| 13 | Credenciales de la cuenta de comensal de prueba | Compartirlas por privado, nunca en la matriz | Elizabeth / Sebastián | Todos los casos de la app |
| 14 | C12 Perfil | Depende del PR `feat/sprint2-diner-profile`, sin fusionar | Sebastián (revisión del PR) | C12 |
| 15 | Tiempo máximo de un cambio en vivo | El reparto no lo fija; la matriz usa «1–2 s» del README de mobile | Sebastián | C10, R4 |
| 16 | **Nuevo:** ¿con qué URL se prueba la web? | Vercel despliega desde `main`, y `main` todavía no tiene lo del Sprint 2 que ya está en `develop` (por ejemplo, Google en la web, PR #42). ¿Vista previa de Vercel o `npm run dev` contra Render? | Sebastián / Elizabeth | R1, T1, T3 |
| 17 | **Nuevo:** cómo forzar una sesión vencida | El comportamiento está definido, pero no hay un método acordado para provocarlo en la app | Jacobo | C1.5 |
