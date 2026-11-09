# Matriz de pruebas · Sprint 3

| | |
|---|---|
| **Sprint** | Sprint 3 · Flujo principal de microreserva y check-in |
| **Objetivo** | Un comensal elige un restaurante con mesa en la app, reserva por unos minutos, recibe un código y un temporizador, y cancela o deja vencer la reserva. El restaurante ve las reservas en la web sin recargar y valida el check-in con el código. Reserva, mesa y disponibilidad quedan sincronizadas entre app, web y backend (Reparto, sección 1). |
| **Ambiente** | Primero en local y después en Render + Neon (Reparto, «Rol de QA») · web en Vercel (`main` ya tiene el Sprint 3, PR #77) · app como development build en el emulador de Android Studio, con Metro contra Render |
| **Fecha** | Matriz creada el 6 nov 2026 con el formato de [`matriz-sprint2.md`](matriz-sprint2.md) · actualizada el 9 nov con los `AVISOS.md` del 8 nov · QA: Días 3 a 6 del sprint · demo: Día 7 |
| **Responsables** | Santiago: M4, M7, M10, M11, M12, T2 y la matriz · Jacobo: M1, M2, M3, M8, M9, T1 · Sergio: M5, M6 (Reparto, secciones 9 y 12) |
| **Fuente de los resultados esperados** | `DiNNo_Sprint3_Reparto.md` (secciones 2.1, 3, 9 y 12) y sección 12 del `CLAUDE.md` del backend (contrato; los nombres de campos son los del `CLAUDE.md`), en `develop` el 9 nov. Lo que no está definido o no coincide está marcado ⚠️ y listado en la [sección 7](#7-por-confirmar). |

> [!WARNING]
> **Capturas sin secretos.** Ninguna captura ni video puede mostrar tokens (por ejemplo el campo *Authorize* de Swagger o una cabecera `Authorization`), llaves (Maps, Firebase), contraseñas ni URLs de base de datos. Si aparece uno, recorta la imagen o vuelve a tomarla antes de subirla.
>
> **El código de una reserva activa tampoco se publica.** Si una captura de la app lo muestra, que sea de una reserva que ya terminó (cancelada, vencida o cumplida).

**Cómo llenar la matriz**
- Cada quien llena **solo las filas de sus casos** (así no chocan los cambios en el archivo).
- **Estado:** `Pendiente` · `Pasa en local` · `Pasa` (en local y en Render) · `Falla` · `Bloqueado (motivo)` · `⚠️ Por confirmar (#n)`.
- **Resultado obtenido:** lo que viste, en una línea. Si falla, crea el Bug en Azure con el [formato de hallazgos](#6-formato-para-reportar-hallazgos) y pega el enlace en **Bug**.
- **Evidencia:** nombre del archivo en [`evidencias/img/`](evidencias/README.md), **con el prefijo `s3-`**, por ejemplo `s3-M10.1-pasa.png`. El prefijo evita choques con las capturas del Sprint 2, que también tiene casos T1 y T2.
- **Cuándo probar:** desde el 8 nov el backend, la web y la app del Sprint 3 están en `develop` (y la web en `main`), así que el QA ya puede empezar (`AVISOS.md` de la web y de mobile, 8 nov). Se prueba apenas llega algo nuevo, no solo al final.
- **Después de `demo:reset`:** recarga la web y reabre la app, porque el reset no emite eventos.

## Índice

1. [Preparación del ambiente](#1-preparación-del-ambiente)
2. [Tabla resumen](#2-tabla-resumen)
3. [Casos de Santiago](#3-casos-de-santiago): M4 · M7 · M10 · M11 · M12 · T2
4. [Casos de Jacobo](#4-casos-de-jacobo): M1 · M2 · M3 · M8 · M9 · T1
5. [Casos de Sergio](#5-casos-de-sergio): M5 · M6
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
Las credenciales van en Discord (#usuarios-comensal y #usuarios-restaurante), nunca en esta matriz, en el repo ni en una captura. Las cuentas nuevas de comensal usan un alias `dinnoteam2026+algo@gmail.com` y se crean desde la app («Crear cuenta»). ⚠️ [#5](#7-por-confirmar): quién las crea.

| Cuenta | Para qué | Notas |
|---|---|---|
| Comensal A: `dinnoteam2026+comensal@gmail.com` | Todos los casos de la app | Hoy es la **única** cuenta de comensal (8 nov) |
| Comensal B | M3.1, M5.4 (reserva de otro comensal), M2.1 | Por crear |
| Comensales C, D y E | M2.2 (5 solicitudes a la vez) | ⚠️ [#5](#7-por-confirmar) |
| Dueño de Casa 72 (web): `dinnoteam2026+casa72@gmail.com` | Check-in, panel de reservas, mesas | Lo crea el seed (`CLAUDE.md` del backend, §11) |
| Otro restaurante con al menos una mesa | M9.2 (código de otro restaurante) | ⚠️ [#6](#7-por-confirmar) |

### 1.3 App en el emulador
- **Development build** (`npx expo run:android`). Un APK de release no lee de Metro, así que no sirve para este QA (`AVISOS.md` de mobile, 8 nov).
- Metro contra Render: `EXPO_PUBLIC_USE_MOCKS=false EXPO_PUBLIC_API_URL=https://dinno-backend.onrender.com npx expo start`.
- Si Render está dormido, la app muestra «Conectando con DiNNo…» y luego «Intentar de nuevo»; la web muestra skeletons. Espera y reintenta.
- Si el emulador tiene internet pero la app dice «No pudimos conectarnos», ábrelo con DNS fijos: `emulator -avd <tu AVD> -dns-server 8.8.8.8,1.1.1.1`.
- **Ubicación en la Calle 72** (primero longitud y luego latitud): `adb emu geo fix -74.0567 4.6576`.

### 1.4 Web y app abiertas a la vez (tiempo real)
1. Pon el emulador y el navegador lado a lado.
2. **Web:** entra como dueño de Casa 72. Deja a la vista el tablero de mesas y la sección «Reservas DiNNo».
3. **App:** entra como comensal, con la ubicación en la Calle 72.
4. Cada cambio debe verse en el otro lado **sin recargar**. Como respaldo, la web de reservas y la pantalla de reserva activa vuelven a consultar cada 30 s, y la app también al volver a primer plano y al reconectar (Reparto, sección 3.6).

### 1.5 Casa 72: estado base y asignación de mesas

> **Casa 72 es el restaurante de la demo. Antes de cambiar sus mesas, avisa en el grupo, y al terminar devuélvelo a su estado base.**

**Estado base del Sprint 3:** el que deja `demo:reset` (`src/scripts/demo-reset/initial-state.ts` del backend). Lo corre **solo Elizabeth**. Es distinto del seed, que deja 2 mesas *Reservada* y 2 *Ocupada* a mano. Compruébalo en la web antes de empezar.

| Mesa | Capacidad | Estado | Activa |
|---|---|---|---|
| Mesa 1 | 2 | Disponible | sí |
| Mesa 2 | 2 | Disponible | sí |
| Mesa 3 | 4 | Disponible | sí |
| Mesa 4 | 4 | Disponible | sí |
| Mesa 5 | 4 | Disponible | sí |
| Mesa 6 | 6 | Disponible | sí |
| Mesa 7 | 6 | Disponible | sí |
| Mesa 8 | 8 | — | **no** (Inactiva) |

**Regla de asignación** (backend, `table-assignment.ts`): la mesa *Disponible* y activa **más pequeña que alcance**; si hay empate, la de etiqueta menor en orden numérico («Mesa 2» antes que «Mesa 10»). Una mesa *Reservada* a mano **nunca** se asigna.

| Personas | Mesa que debe asignar (estado base) |
|---|---|
| 1 o 2 | Mesa 1 |
| 3 o 4 | Mesa 3 |
| 5 o 6 | Mesa 6 |
| 7 o más | Ninguna: 409 `NO_TABLE_AVAILABLE` (Mesa 8 está inactiva) |

**Disponibilidad pública** (regla del Sprint 2): «Disponible» si `libres × 10 > activas × 3`, «Pocas mesas» si hay al menos 1 libre y no se cumple eso, y «Sin mesas» con 0 libres. Una mesa reservada por DiNNo no cuenta como libre.

### 1.6 Horario de Casa 72
Horario del seed (hora de Bogotá; la apertura cuenta y el cierre no). Solo se puede reservar si el restaurante **está abierto ahora** y el switch está en «Abierto».

| Lunes a jueves | Viernes | Sábado | Domingo |
|---|---|---|---|
| 08:00 – 23:00 | 08:00 – 02:00 (día siguiente) | 11:00 – 02:00 (día siguiente) | 11:00 – 21:00 |

### 1.7 Vigencia de la reserva (`RESERVATION_TTL_MINUTES`)
- Variable del backend, entre 2 y 15 minutos. Por defecto 15 (`.env.example`).
- **En local** pon un valor corto (2 o 3) para los casos de expiración: M7, M9.3, M10.3, M12.3 y M5.3.
- **En Render** está en 15. Solo Elizabeth la cambia, a 3 durante la demo y de vuelta a 15 después. Para M7 en Render: pruébalo cuando Render tenga 3 o espera los 15 minutos (`AVISOS.md` de la web, 8 nov). ⚠️ [#4](#7-por-confirmar)

### 1.8 Cambiar la hora del emulador (M4.3)
Se cambia **a mano desde Ajustes**: en el emulador no se puede por comando (`AVISOS.md` de mobile, 8 nov). *Settings → System → Date & time*: desactiva la hora automática y adelanta o atrasa la hora unos minutos. Al terminar, vuelve a activarla. El nombre exacto del menú puede cambiar según la versión de Android.

### 1.9 Comandos útiles (adb)
```bash
adb shell cmd connectivity airplane-mode enable     # sin internet (disable para volver)
adb emu network delay 6000                          # red lenta (none para quitar)
adb emu geo fix -74.0567 4.6576                     # ubicación en la Calle 72
```

### 1.10 Llamadas directas a la API (Swagger)
- Swagger: `https://dinno-backend.onrender.com/docs` (o `http://localhost:3000/docs`). Usa *Authorize* con el token de la cuenta. **Nunca captures el token.**
- El `id` de una reserva sale de `GET /v1/reservations/active` con el token de su dueño.

---

## 2. Tabla resumen

Actualiza los conteos al terminar cada caso.

| Caso | Nombre | Responsable | Variantes | Pasa | Pasa en local | Falla | Pendiente | Bloqueado | ⚠️ Por confirmar |
|---|---|---|---|---|---|---|---|---|---|
| [M4](#m4--reserva-activa) | Reserva activa | Santiago | 3 | 0 | 0 | 0 | 3 | 0 | 0 |
| [M7](#m7--expiración) | Expiración | Santiago | 4 | 0 | 0 | 0 | 4 | 0 | 0 |
| [M10](#m10--tiempo-real) | Tiempo real | Santiago | 6 | 0 | 0 | 0 | 6 | 0 | 0 |
| [M11](#m11--mesa-con-reserva-activa) | Mesa con reserva activa | Santiago | 7 | 0 | 0 | 0 | 7 | 0 | 0 |
| [M12](#m12--bitácora) | Bitácora | Santiago | 4 | 0 | 0 | 0 | 4 | 0 | 0 |
| [T2](#t2--regresión) | Regresión | Santiago | 2 | 0 | 0 | 0 | 2 | 0 | 0 |
| [M1](#m1--crear-reserva) | Crear reserva | Jacobo | 6 | 0 | 0 | 0 | 6 | 0 | 0 |
| [M2](#m2--concurrencia-por-la-última-mesa) | Concurrencia por la última mesa | Jacobo | 2 | 0 | 0 | 0 | 1 | 0 | 1 |
| [M3](#m3--dos-comensales-varias-mesas) | Dos comensales, varias mesas | Jacobo | 1 | 0 | 0 | 0 | 1 | 0 | 0 |
| [M8](#m8--check-in-válido) | Check-in válido | Jacobo | 3 | 0 | 0 | 0 | 3 | 0 | 0 |
| [M9](#m9--check-in-inválido) | Check-in inválido | Jacobo | 6 | 0 | 0 | 0 | 5 | 0 | 1 |
| [T1](#t1--roles) | Roles | Jacobo | 3 | 0 | 0 | 0 | 3 | 0 | 0 |
| [M5](#m5--cancelar) | Cancelar | Sergio | 4 | 0 | 0 | 0 | 4 | 0 | 0 |
| [M6](#m6--mesa-liberada-al-cancelar) | Mesa liberada al cancelar | Sergio | 2 | 0 | 0 | 0 | 2 | 0 | 0 |
| **Total** | | | **53** | **0** | **0** | **0** | **51** | **0** | **2** |

---

## 3. Casos de Santiago

### M4 · Reserva activa
**Responsable:** Santiago · **Precondiciones comunes:** backend despierto (1.1) · comensal A en la app, ubicación en la Calle 72 · Casa 72 abierto y en su estado base (1.5).
**Al terminar:** cancela la reserva.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| M4.1 | Datos de la reserva | Sin reserva activa | 1. Detalle de Casa 72 → «Reservar mesa» → 2 personas → «Reservar ahora». | **Código grande** de 6 caracteres sin `0 O 1 I L` · temporizador mm:ss · restaurante, dirección, mesa (Mesa 1) y personas · «Cómo llegar» y «Cancelar reserva» · en *Explorar*, banner fijo «Tienes una mesa reservada · mm:ss» que lleva a la reserva | | Pendiente | | |
| M4.2 | Reabrir la app | Después de M4.1 | 1. Cierra la app desde Recientes.<br>2. Ábrela. | La reserva se recupera sola (`GET /reservations/active`) y el tiempo sigue correcto, sin reiniciarse | | Pendiente | | |
| M4.3 | Cambiar la hora del teléfono | Reserva activa | 1. Adelanta la hora del emulador 5 minutos (1.8).<br>2. Atrásala 5 minutos.<br>3. Vuelve a la hora automática. | El temporizador **no cambia** en ningún paso: se calcula con `expiresAt` y `serverTime`, no con el reloj del teléfono | | Pendiente | | |

### M7 · Expiración
**Responsable:** Santiago · **Precondiciones comunes:** en local, `RESERVATION_TTL_MINUTES` corto (1.7) · web y app abiertas (1.4).

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| M7.1 | Llega a 0 | Reserva activa | 1. Deja la pantalla de reserva abierta hasta que el temporizador llegue a 0. | «Verificando…» y luego *Vencida*: «Tu reserva se venció. La mesa quedó libre.» + «Buscar otra mesa» · el código desaparece · se quita el banner de *Explorar* | | Pendiente | | |
| M7.2 | La mesa se libera | Después de M7.1 | 1. Mira el tablero de la web. | La mesa vuelve a *Disponible* sola y la reserva sale de «Reservas DiNNo» | | Pendiente | | |
| M7.3 | Backend reiniciado (**solo local**) | Reserva activa con TTL corto | 1. Apaga el backend.<br>2. Espera más que el TTL.<br>3. Préndelo. | Al arrancar, la reserva queda `expired` y la mesa `available`. En Render no se puede reiniciar a mano: queda cubierto en local | | Pendiente | | |
| M7.4 | No-show registrado | Después de M7.1 o M7.3 | 1. `GET /v1/reservations/{id}` con el token del comensal. | `status: expired` · `expiredAt` lleno. En la base, `no_show = true` (lo revisa Elizabeth en Neon o sale en el CSV de `export:data`) | | Pendiente | | |

### M10 · Tiempo real
**Responsable:** Santiago · **Precondiciones comunes:** web y app abiertas a la vez (1.4) · Casa 72 en su estado base · **no recargues** ninguna de las dos.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| M10.1 | Crear | Sin reserva activa | 1. Reserva 2 personas en la app. | La web agrega la fila en «Reservas DiNNo» con nombre, personas, mesa y tiempo restante, **sin código** · la mesa se ve como «Reserva DiNNo» en el tablero | | Pendiente | | |
| M10.2 | Cancelar | Después de M10.1 | 1. Cancela en la app. | La fila sale de la web con un aviso corto · la mesa vuelve a *Disponible* | | Pendiente | | |
| M10.3 | Vencer | Reserva activa, TTL corto | 1. Deja vencer. | La app pasa a *Vencida* y la fila sale de la web | | Pendiente | | |
| M10.4 | Check-in | Reserva activa | 1. En la web, «Validar código» con el código de la app. | La app pasa a *Cumplida*: «¡Listo! Ya hiciste check-in en Casa 72.» · la mesa pasa a *Ocupada* en el tablero | | Pendiente | | |
| M10.5 | Reconexión de la app | Reserva activa | 1. Modo avión en el emulador (1.9).<br>2. En la web, haz check-in con su código.<br>3. Quita el modo avión. | Al reconectar, la app vuelve a consultar y muestra *Cumplida*, sin datos viejos | | Pendiente | | |
| M10.6 | Reconexión de la web | Reserva activa | 1. Desconecta la red del computador.<br>2. Cancela desde la app.<br>3. Reconecta. | Al reconectar, la web vuelve a consultar y la fila desaparece · sin errores en la consola si el socket cae | | Pendiente | | |

### M11 · Mesa con reserva activa
**Responsable:** Santiago · **Precondiciones comunes:** web como dueño de Casa 72 · reserva activa del comensal A (2 personas, Mesa 1) salvo que se diga otra cosa. Reglas del acuerdo 2.1 del Reparto.
**Al terminar:** devuelve Casa 72 a su estado base (capacidad, etiqueta y estado de las mesas que cambiaste, y switch en «Abierto»).

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| M11.1 | Se ve distinta y se libera sola | Reserva activa | 1. Mira la mesa en el tablero.<br>2. Cancela, deja vencer o haz check-in. | Paso 1: «Reserva DiNNo».<br>Paso 2: vuelve sola a *Disponible* (cancelar o vencer) o pasa a *Ocupada* (check-in) | | Pendiente | | |
| M11.2 | Cambiar el estado | Reserva activa | 1. En la web, intenta cambiar el estado de Mesa 1.<br>2. En Swagger, `PATCH /v1/tables/{id}/status`. | Paso 1: sin la opción, con el motivo al pasar el cursor.<br>Paso 2: 409 `TABLE_HAS_ACTIVE_RESERVATION` · «Esta mesa tiene una reserva de DiNNo en curso. Se libera sola cuando el comensal llegue, cancele o se venza la reserva.» | | Pendiente | | |
| M11.3 | Desactivar con reserva DiNNo | Reserva activa | 1. Intenta desactivar Mesa 1 (web y Swagger). | 409 `TABLE_HAS_ACTIVE_RESERVATION` · la web no ofrece la opción | | Pendiente | | |
| M11.4 | Desactivar una mesa marcada a mano | Mesa 2 *Ocupada* a mano, sin reserva | 1. Intenta desactivar Mesa 2. | 409 `TABLE_NOT_AVAILABLE_TO_DEACTIVATE` · «Para desactivar esta mesa, primero márcala como Disponible.» | | Pendiente | | |
| M11.5 | Bajar la capacidad | Reserva activa de **2** personas en Mesa 1 | 1. Edita la capacidad de Mesa 1 a 1.<br>2. Edítala a 2 (igual a las personas). | Paso 1: 409 `TABLE_HAS_ACTIVE_RESERVATION`.<br>Paso 2: se guarda | | Pendiente | | |
| M11.6 | Editar la etiqueta | Reserva activa | 1. Cambia la etiqueta de Mesa 1 y guarda.<br>2. Devuélvela a «Mesa 1». | Se guarda en los dos pasos | | Pendiente | | |
| M11.7 | Cerrar con reservas en curso | Reserva activa | 1. Switch «Estado del restaurante» → cerrar.<br>2. Con el comensal B, intenta reservar en Casa 72 (Swagger). | Paso 1: aviso «Tienes 1 reservas en curso; se mantendrán hasta que lleguen o se venzan.» (⚠️ singular: ver [#7](#7-por-confirmar)) · se cierra igual · la reserva de A sigue activa.<br>Paso 2: 409 `RESTAURANT_CLOSED` | | Pendiente | | |

### M12 · Bitácora
**Responsable:** Santiago · **Precondiciones comunes:** web en la bitácora de Casa 72. Cada evento debe dejar **una** fila (Reparto, sección 3.2).

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| M12.1 | Crear | — | 1. Reserva en la app.<br>2. Abre la bitácora. | `available` → `reserved` · `source = reservation` · usuario: el comensal | | Pendiente | | |
| M12.2 | Cancelar | Después de M12.1 | 1. Cancela. | `reserved` → `available` · `source = reservation` · usuario: el comensal | | Pendiente | | |
| M12.3 | Vencer | Reserva activa, TTL corto | 1. Deja vencer. | `reserved` → `available` · `source = system` · sin usuario | | Pendiente | | |
| M12.4 | Check-in | Reserva activa | 1. Valida el código en la web. | `reserved` → `occupied` · `source = reservation` · usuario: el restaurante | | Pendiente | | |

### T2 · Regresión
**Responsable:** Santiago · Repite los recorridos de las demos anteriores en el ambiente desplegado. Los pasos detallados están en [`matriz-sprint2.md`](matriz-sprint2.md) (T3 para el Sprint 1 y C4, C5, C7, C9 y C10 para el Sprint 2).

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| T2.1 | Demo del Sprint 1 (web) | Casa 72 | 1. Iniciar sesión, ver y editar el restaurante, mesas (crear, cambiar estado, editar, desactivar), Abierto/Cerrado y bitácora. | Todo funciona como en el Sprint 1 · la bitácora muestra los cambios manuales con `source = manual` | | Pendiente | | |
| T2.2 | Demo del Sprint 2 (app) | Comensal A, ubicación en la Calle 72 | 1. Buscar cerca y por zona, lista y mapa, filtros, detalle y disponibilidad en vivo al cambiar mesas en la web. | Todo funciona como en el Sprint 2 | | Pendiente | | |

---

## 4. Casos de Jacobo

### M1 · Crear reserva
**Responsable:** Jacobo · **Precondiciones comunes:** backend despierto · comensal A · Casa 72 abierto y en su estado base (1.5).
**Al terminar:** cancela las reservas y devuelve Casa 72 a su estado base.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| M1.1 | Con mesa | Sin reserva activa | 1. Detalle de Casa 72 → «Reservar mesa» → 2 personas → «Reservar ahora». | `201` · pantalla de reserva activa con código y temporizador · Mesa 1 pasa a «Reserva DiNNo» en la web · el botón muestra «Reservando…» mientras espera (sin doble toque) | | Pendiente | | |
| M1.2 | Personas precargadas | Filtro «Personas» = 4 en *Explorar* | 1. Abre el detalle → «Reservar mesa». | La hoja de personas trae 4 | | Pendiente | | |
| M1.3 | Restaurante cerrado | Casa 72 con el switch en «Cerrado» | 1. Abre el detalle en la app.<br>2. `POST /v1/reservations` en Swagger. | Paso 1: «Reservar mesa» deshabilitado.<br>Paso 2: 409 `RESTAURANT_CLOSED` (la app muestra «Este restaurante acaba de cerrar.») | | Pendiente | | |
| M1.4 | Sin mesa del tamaño | Estado base | 1. Reserva para 7 personas (app o Swagger). | 409 `NO_TABLE_AVAILABLE` · «Alguien acaba de tomar la última mesa. Prueba con otro restaurante.» (texto conocido: ver [#8](#7-por-confirmar)) | | Pendiente | | |
| M1.5 | Ya tiene una activa | Comensal A con reserva activa | 1. Intenta reservar otra vez. | 409 `ACTIVE_RESERVATION_EXISTS` · «Ya tienes una reserva activa» + «Ver mi reserva» | | Pendiente | | |
| M1.6 | Mesa más pequeña que alcanza | Estado base | 1. Reserva para 3 personas.<br>2. Con el comensal B, reserva para 5. | Paso 1: Mesa 3 (de 4), no una de 6.<br>Paso 2: Mesa 6 (de 6) | | Pendiente | | |

### M2 · Concurrencia por la última mesa
**Responsable:** Jacobo · Script de Node o `curl` en paralelo contra `POST /v1/reservations`, con un comensal distinto por solicitud (cada comensal solo puede tener una reserva activa). **El script no guarda credenciales.**
**Preparación:** en la web, marca a mano como *Ocupada* Mesa 1 a Mesa 6. Queda Mesa 7 (de 6) como única libre.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| M2.1 | 2 solicitudes a la vez | Comensales A y B sin reserva | 1. Lanza 2 solicitudes para 2 personas al mismo tiempo. | Exactamente **1** `201` y **1** 409 `NO_TABLE_AVAILABLE` · una sola reserva en Mesa 7 | | Pendiente | | |
| M2.2 | 5 solicitudes a la vez | 5 comensales sin reserva | 1. Lanza 5 solicitudes al mismo tiempo. | **1** `201` y **4** × 409 `NO_TABLE_AVAILABLE` · ninguna reserva ni mesa a medias | | ⚠️ Por confirmar (#5) | | |

### M3 · Dos comensales, varias mesas
**Responsable:** Jacobo

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| M3.1 | Cada uno su mesa | Estado base · comensales A y B sin reserva | 1. Los dos reservan 2 personas en Casa 72 (al mismo tiempo o seguido). | A recibe Mesa 1 y B Mesa 2 (o al revés): nunca la misma mesa | | Pendiente | | |

### M8 · Check-in válido
**Responsable:** Jacobo · **Precondiciones comunes:** reserva activa del comensal A · web como dueño de Casa 72.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| M8.1 | Respuesta | Reserva activa | 1. «Validar código» → escribe el código de la app. | `200` · «Check-in confirmado · Mesa 1 · 2 personas · {nombre}» · el botón muestra «Validando…» mientras espera · el campo se limpia | | Pendiente | | |
| M8.2 | Reserva y mesa | Después de M8.1 | 1. Mira la app y el tablero. | App: *Cumplida* · web: Mesa 1 *Ocupada* y la reserva sale de «Reservas DiNNo» | | Pendiente | | |
| M8.3 | Registro facturable único | Después de M8.1 | 1. Revisa `check_ins` (Swagger o Neon con Elizabeth).<br>2. Repite el código (M9.4). | Exactamente **1** registro para esa reserva, también después de repetir | | Pendiente | | |

### M9 · Check-in inválido
**Responsable:** Jacobo · **Precondiciones comunes:** web como dueño de Casa 72. La web nunca revela si el código existe en otro restaurante.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| M9.1 | Inexistente | — | 1. Valida un código inventado de 6 caracteres. | 404 `RESERVATION_CODE_NOT_FOUND` · «No encontramos una reserva con ese código en tu restaurante.» | | Pendiente | | |
| M9.2 | De otro restaurante | Reserva activa en otro restaurante | 1. Valida ese código en Casa 72. | Igual que M9.1 | | ⚠️ Por confirmar (#6) | | |
| M9.3 | Vencido | Reserva vencida (TTL corto) | 1. Valida su código. | 409 `RESERVATION_EXPIRED` · «Esta reserva se venció a las HH:MM. La mesa ya se liberó.» | | Pendiente | | |
| M9.4 | Ya usado | Después de M8.1 | 1. Valida el mismo código. | 409 `RESERVATION_ALREADY_USED` · «Este código ya se usó a las HH:MM.» | | Pendiente | | |
| M9.5 | Cancelado | Reserva cancelada desde la app | 1. Valida su código. | 409 `RESERVATION_CANCELLED` · «El comensal canceló esta reserva.» | | Pendiente | | |
| M9.6 | Minúsculas y espacios | Reserva activa | 1. Escribe el código en minúsculas y con un espacio (por ejemplo `k7m 4qx`). | Funciona igual que M8.1 | | Pendiente | | |

### T1 · Roles
**Responsable:** Jacobo · Llamadas en Swagger con el token de cada cuenta. **Nunca captures el token.**

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| T1.1 | Un restaurante no reserva | Token de Casa 72 | 1. `POST /v1/reservations`. | `403` `RESTAURANT_ACCOUNT` | | Pendiente | | |
| T1.2 | Un comensal no hace check-in | Token de comensal | 1. `POST /v1/restaurants/me/check-ins`. | `403` `DINER_ACCOUNT` | | Pendiente | | |
| T1.3 | Un comensal no ve las reservas del restaurante | Token de comensal | 1. `GET /v1/restaurants/me/reservations`. | `403` `DINER_ACCOUNT` | | Pendiente | | |

---

## 5. Casos de Sergio

### M5 · Cancelar
**Responsable:** Sergio · **Precondiciones comunes:** comensales A y B · Casa 72 en su estado base.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| M5.1 | Activa | Reserva activa de A | 1. «Cancelar reserva» → «¿Cancelar tu reserva? La mesa quedará libre para otra persona.» → «Sí, cancelar». | `200` · pantalla *Cancelada* · el código desaparece · se quita el banner de *Explorar*. «Mantener reserva» cierra el diálogo sin cancelar | | Pendiente | | |
| M5.2 | Ya cancelada | Después de M5.1 | 1. Repite `POST /v1/reservations/{id}/cancel` en Swagger. | 409 `RESERVATION_NOT_ACTIVE` · la app muestra el estado real | | Pendiente | | |
| M5.3 | Ya vencida | Reserva de A vencida (TTL corto) | 1. Cancela (app o Swagger). | 409 `RESERVATION_NOT_ACTIVE` | | Pendiente | | |
| M5.4 | De otro comensal | Reserva activa de A | 1. Con el token de B, `POST /v1/reservations/{id de A}/cancel`. | 404 `RESERVATION_NOT_FOUND` (igual que si no existiera) · la reserva de A sigue activa | | Pendiente | | |

### M6 · Mesa liberada al cancelar
**Responsable:** Sergio · **Precondiciones comunes:** web y app abiertas a la vez (1.4).
**Al terminar:** devuelve Casa 72 a su estado base.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| M6.1 | La mesa vuelve a Disponible | Reserva activa | 1. Cancela en la app. | La mesa vuelve a *Disponible* sin recargar · la reserva sale de «Reservas DiNNo» | | Pendiente | | |
| M6.2 | La disponibilidad pública sube | En la web, Mesa 1 a Mesa 4 *Ocupada* a mano (quedan libres 5, 6 y 7: 3/7, «Disponible») | 1. Reserva 4 personas (asigna Mesa 5).<br>2. Mira el chip de Casa 72 con el comensal B.<br>3. Cancela. | Paso 2: «Pocas mesas» (2/7).<br>Paso 3: vuelve a «Disponible» (3/7) sin recargar | | Pendiente | | |

---

## 6. Formato para reportar hallazgos

Cada hallazgo va **al grupo y a Azure (Bug)** (Reparto, sección 9, «Rol de QA»). Copia esta plantilla:

```markdown
**[ID de la variante] Título corto**
- Ambiente: local o Render (commit de /v1/health: …) · web (URL o local) · app (development build o APK)
- Pasos para reproducirlo:
  1. …
  2. …
- Resultado esperado: … (copia el de la matriz)
- Resultado obtenido: …
- Captura: evidencias/img/s3-<ID>-falla.png (sin tokens, llaves, contraseñas, URLs de base de datos ni códigos de reservas activas)
- Responsable: Elizabeth (backend) · Sebastián (app y web)
```

Después pega el enlace del Bug en la columna **Bug** de la variante y cambia su estado a «Falla». Santiago anota el dueño y el día de corrección, y el caso se repite después de cada corrección (Reparto, sección 9).

---

## 7. Por confirmar

| # | Punto | Por qué | Preguntar a | Afecta |
|---|---|---|---|---|
| 1 | ✅ Resuelto: reparto de QA | El Reparto corregido (secciones 9 y 12) coincide con los `AVISOS.md` | — | — |
| 2 | Textos de la app y la web | Las pantallas ya están en `develop` (8 nov). Los textos esperados salen del Reparto: si la pantalla dice otra cosa, se anota como hallazgo y Sebastián decide | Sebastián | Todos los casos con pantallas |
| 3 | ✅ Resuelto: URL de la web | `main` ya tiene el Sprint 3 (PR #77): se prueba en Vercel | — | — |
| 4 | Expiración en Render | Con 15 minutos cada prueba de expiración en Render tarda 15 minutos. ¿Se espera, o Elizabeth pone 3 durante una ventana de QA? | Elizabeth | M7, M9.3, M10.3, M12.3, M5.3 |
| 5 | Cuentas de comensal | Hoy hay una sola. El Reparto (9.5) le da a Santiago preparar las cuentas; los `AVISOS.md` del 8 nov le dan a Jacobo crear la segunda. M2.2 necesita 5 comensales distintos | Santiago / Jacobo | M2, M3, M5.4, M10 |
| 6 | Un segundo restaurante con mesas | Para M9.2 hace falta una reserva activa en otro restaurante. Los restaurantes del seed (`restaurante-XX@dinno.test`) no tienen correo real para entrar a la web, pero la reserva la crea el comensal | Elizabeth | M9.2 |
| 7 | Plural del aviso al cerrar | El Reparto dice «Tienes N reservas en curso…». Con 1 reserva, ¿dice «1 reservas» o «1 reserva»? | Sebastián | M11.7 |
| 8 | ✅ Conocido: mensaje con 0 mesas del tamaño | `NO_TABLE_AVAILABLE` muestra «Alguien acaba de tomar la última mesa…» aunque nunca hubo mesa de ese tamaño. Queda como mejora del Sprint 4 (`AVISOS.md`, 8 nov); en M1.4 se espera el texto actual | — | M1.4 |
