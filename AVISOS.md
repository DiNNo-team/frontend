# Avisos del frontend

> Lo que el equipo necesita saber de los cambios en `frontend`. **Lo más nuevo va arriba.**
> Si algo no te queda claro o te falta un componente, escríbele a Sebastián o propónlo en un PR al kit.

---

## 10 nov 2026 · Sebastián · Zonas de mesas, búsqueda y filtros en /mesas

**Requiere el backend de zonas** (backend `feat/sprint3-zonas-mesas`, migración `CreateTableAreas` en Neon). Si el backend todavía no lo tiene, `/mesas` funciona como antes: sin zonas, la barra muestra solo «Crear zonas», y crear una mesa sin zona no envía `areaId`.

- **Qué hay nuevo:** para restaurantes grandes, con muchas mesas o varios pisos.
  - **Zonas** con nombre libre («Piso 1», «Terraza»), que se crean, renombran y eliminan en el diálogo «Zonas».
  - **Cuadrícula agrupada por zona,** con «Buscar mesa» y los filtros de zona y de personas.
  - **Plano por zona:** cada zona tiene su propio plano.
  - **Formulario de mesa con el campo «Zona».**
  - Manual 13.10 actualizado.
- **Código:**
  - `features/tables/areas/`: `api.ts` con su mock, `hooks.ts` (query key `['table-areas']`), `area-form.ts` y `AreasDialog.tsx`.
  - `features/tables/table-filters.ts`: búsqueda, filtros y agrupación, como funciones puras.
  - `components/TablesToolbar.tsx`.
  - `usePlanEditor(tablesDeLaZona, todasLasMesas)`: `PUT /v1/tables/plan` reemplaza el plano completo, así que el editor manda también las mesas de las otras zonas con su lugar actual.
- **Tipos:** `Table` trae `areaId` (`string | null`). Si construyes mesas a mano en una prueba, agrega `areaId: null`.
- **Mock** (con `VITE_USE_MOCKS=true`):
  - `?mockAreas` deja las mesas 01–04 en «Salón», las 05–07 en «Terraza» y la 08 sin zona. Se combina con `?mockPlan`.
  - `?mockError=areas-list` y `?mockError=areas-save` fuerzan errores de zonas.

---

## 8 nov 2026 · Sebastián · Qué le falta a cada uno para cerrar el Sprint 3

**El código del Sprint 3 está completo:** el backend (Elizabeth), la web y la app (Sebastián) están en `develop`, y probamos todo de punta a punta contra Render. Ninguna tarea de código del flujo principal está pendiente. Lo que queda es probar, ensayar la demo y cerrar las tareas del reparto que no son del flujo principal.

### Elizabeth
- **Ensayo de la demo (Día 6, con Sebastián)**, siguiendo la sección 10 del reparto:
  - Correr `demo:reset` antes de empezar.
  - Poner `RESERVATION_TTL_MINUTES=3` en Render solo para el paso de expiración y **volver a 15 al terminar**.
  - Despertar Render con `/v1/health`.
- **Paso 11 de la demo:** mostrar en Swagger o en Neon la fila de `check_ins` del check-in.
- **Vencimiento con 3 min contra Render:** el front solo lo probó con datos de ejemplo. Hay que verlo en el ensayo (la app pasa a «Vencida» y la fila sale del panel de la web).
- **Para el Sprint 4 (no bloquea):** cuando ninguna mesa alcanza para el número de personas, el backend responde `NO_TABLE_AVAILABLE` y la app dice «Alguien acaba de tomar la última mesa…», que no describe ese caso. Propuesta: un `errorCode` distinto o un texto más general.
- **CSV para la IA:** correr `export:data` y pasarle la carpeta a Santiago y Sergio cuando la pidan.

### Jacobo
- **QA:** M1, M2, M3, M8, M9 y T1, en la matriz de Santiago, con evidencia.
- **Segunda cuenta de comensal:** hoy hay **una sola** (`dinnoteam2026+comensal@gmail.com`). Para M2 y M3 (dos comensales a la vez) crea otra con un alias `dinnoteam2026+algo@gmail.com` desde la app («Crear cuenta») y publica las credenciales en Discord (#usuarios-comensal), nunca en el repo.
- **Script de concurrencia** (M2): varias peticiones `POST /v1/reservations` a la vez contra la última mesa de un restaurante → exactamente una 201 y las demás `409 NO_TABLE_AVAILABLE`. Sin credenciales en el script.
- **Azure (PBI 7.1), según el reparto:** grupo de recursos `rg-dinno`, Container App de prueba con escala a cero, revisión de PostgreSQL y Redis (sin crearlos) y `docs/azure-migracion.md` en el backend.

### Santiago
- **QA:** M4, M7, M10, M11, M12 y T2, y consolidar la matriz.
  - **M4:** cambiar la hora del teléfono **a mano desde Ajustes** (en el emulador no se puede por comando) y comprobar que el temporizador no cambia. Cerrar y abrir la app también debe conservar el tiempo.
  - **M7:** probarlo cuando Render tenga `RESERVATION_TTL_MINUTES=3`, o esperar los 15 min.
  - **M10:** web y app abiertas a la vez. Reservar, cancelar, vencer y hacer check-in deben cambiar las dos sin recargar.
- **IA (PBI 6.1, con Sergio):** documento `docs/ia-diseno.md` y prototipo en `ai-prototype/`, en el backend.

### Sergio
- **QA:** M5 y M6 (cancelar: activa, ya cancelada, ya vencida y de otro comensal; la mesa vuelve a Disponible y la disponibilidad pública sube).
- **IA (PBI 6.1, con Santiago).**
- **Ajustes de dirección en la web** (prioridad baja, solo si el QA está completo). Sebastián revisa el PR.

### Sebastián
- Fusionar el PR `develop` → `main` de la web (Vercel publica `main`).
- Mover en Azure las tareas de front, y pasar los PBIs 2.1 y 4.1 a Done cuando QA marque sus casos.
- Ensayo con Elizabeth.
- Ajustes visuales de la demo del Sprint 2 (después del Sprint 3).

### Para todos los que prueben
- **App:** usen el development build (`npx expo run:android`); un APK de release no lee de Metro. Corran Metro contra Render con `EXPO_PUBLIC_USE_MOCKS=false EXPO_PUBLIC_API_URL=https://dinno-backend.onrender.com npx expo start`.
- **Render dormido:** la app muestra «Conectando con DiNNo…» y luego «Intentar de nuevo»; la web muestra skeletons. Esperen y reintenten.
- **Después de `demo:reset`:** recarguen la web y reabran la app, porque el reset no emite eventos.
- **Cada hallazgo** va a la matriz y a Azure (Bug), con pasos, resultado esperado, resultado obtenido, captura y a quién le corresponde.

---

## 8 nov 2026 · Elizabeth · `reservationTtlMinutes` en el detalle público

- **Qué es:** `GET /v1/restaurants/:id/public` incluye ahora `reservationTtlMinutes`: un entero entre 2 y 15 con la vigencia, en minutos, que tiene una microreserva en este momento. Es el mismo valor de `RESERVATION_TTL_MINUTES` con el que el backend crea las reservas (15 por defecto).
- **Es aditivo:** ningún campo existente cambia ni se quita, y no hay rutas, variables ni tablas nuevas. El campo viene siempre, también si el restaurante está cerrado o sin mesas: la app decide cuándo mostrarlo.
- **App:** puede mostrar la vigencia **antes** de reservar (el texto lo define la app). No la guardes fija en 15: en la demo de expiración el backend corre con `RESERVATION_TTL_MINUTES=3` y el valor cambia a 3.
- **El temporizador no cambia:** la cuenta regresiva de la reserva sigue calculándose con `expiresAt` y `serverTime` de la respuesta de la reserva; `reservationTtlMinutes` es solo informativo.
- **Web:** el detalle público es de comensal, así que la web no lo usa. No hay acción para el frontend.
- **Despliegue:** el backend del Sprint 3 **sí** está desplegado en Render (commit `15be6cf`, PR #49); eso reemplaza el «NO está desplegado aún» de las entradas de cierre del 6 nov. El campo nuevo llega a Render cuando se fusione su PR (`feat/public-reservation-ttl`).

---

## 8 nov 2026 · Sebastián · Front del Sprint 3 completo: ya se puede hacer QA

- **Web y app terminadas:** web #70 a #72 (en `main`) y app #30, #32, #33 y #34 (en `develop`). Así se cumplen los pasos 2 y 3 del orden de merge de Elizabeth, y **el QA del Sprint 3 puede empezar** (Jacobo: M1, M2, M3, M8, M9 y T1; Sergio: M5 y M6; Santiago: M4, M7, M10, M11, M12 y T2).
- **Probado de punta a punta contra Render**: reservar en la app → aparece en la web sin recargar → «Validar código» en la web → la app pasa sola a «Cumplida». También cancelar, el vencimiento y la mesa protegida.
- **Pendiente 2.2, opción A (equipo):**
  - El login web muestra «¿Quieres tu restaurante en DiNNo? **Escríbenos**», debajo de «Continuar con Google».
  - También aparece en la pestaña «Crear cuenta», junto con la dirección.
  - El enlace abre un correo a `dinnoteam2026@gmail.com` con el asunto «Quiero mi restaurante en DiNNo» y los datos que necesitamos para habilitar la cuenta.
  - Sigue sin haber registro público.
- **Para Jacobo** (tu área de auth):
  - `AuthLink.tsx` suma `AuthAnchor`, el mismo estilo de enlace para un `<a>`.
  - El texto y el `mailto:` viven en `src/features/auth/restaurant-request.ts`.
  - No cambió nada del inicio de sesión.
- **Para la demo:** el recorrido y la preparación están en la sección 10 del reparto. Después de `demo:reset`, recarguen la web y reabran la app, porque el reset no emite eventos.
- **Sin dependencias, variables ni cambios del kit.**

---

## 8 nov 2026 · Sebastián · Dashboard en tiempo real (Socket.IO) y «En vivo»

- **Dependencia nueva: `socket.io-client` ^4.8.4** (la misma que usa la app). **Corre `npm ci` después de hacer pull.**
- **El dashboard se actualiza solo:**
  - Una reserva nueva aparece en el panel con el aviso «Nueva reserva · Mesa 04 · 2 personas».
  - Al cancelarse, vencerse o hacerse check-in, la reserva sale del panel con su aviso.
  - Los cambios de mesa hechos desde otro dispositivo llegan con su anillo.
  - Probado contra Render: la reserva apareció en 44 ms y salió al instante al cancelarla.
- **Topbar:** a la izquierda del switch aparece «En vivo», que cambia a «Reconectando…» (con la hora de la última actualización) y, si el corte sigue 30 s, a «Sin conexión» con «Intentar de nuevo». Es el `LiveIndicator` del manual, que ya no es propuesta futura (manual 12.2, 13.7 y 19 actualizados).
- **Para quien toque el layout o escuche eventos:** hay un solo socket por sesión, en `src/features/realtime/use-restaurant-realtime.ts`. No abras otro: agrega ahí el evento que necesites (CLAUDE.md §11, «Tiempo real del dashboard»).
- **Pruebas:** `socket.io-client` está simulado en todas las pruebas (`src/test/fake-socket.ts`): ninguna se conecta de verdad.
- **Sin variables de entorno nuevas:** el socket usa `VITE_API_URL`.
- **Dato de Casa 72:** su dirección volvió a la del seed, «Av. Calle 72 con Cra. 9, Chapinero, Bogotá» (4.655671, -74.057006). Se había movido a la Calle 92 en una prueba del pin, y así no aparecía buscando la zona Calle 72 a 2 km.

---

## 8 nov 2026 · Sebastián · Check-in, panel «Reservas DiNNo» y mesas protegidas en `/mesas`

- **`/mesas`:**
  - «Validar código» pasa a ser el botón principal (en servicio es la acción más usada) y «Agregar mesa» pasa a botón de borde.
  - Debajo del resumen aparece el panel «Reservas DiNNo»: nombre o «Comensal», mesa, personas y tiempo restante. **Nunca el código.**
  - Una mesa con reserva de DiNNo en curso se ve como «Reserva DiNNo» (cuadrado + candado), en la cuadrícula y en el plano. No ofrece cambiar el estado, los atajos D/R/O ni «Desactivar», y al pasar el puntero (o con el foco) explica por qué. Editar sigue igual.
- **Kit (`components/ui`, cambios aditivos):**
  - `STATUS_META` tiene `dinno` (Reserva DiNNo) y los cuatro estados de reserva (`reservation-active` · `-completed` · `-expired` · `-cancelled`: Activa · Cumplida · Vencida · Cancelada), los mismos de la app. Forma nueva `square-lock`. `RESERVATION_STATUS` pasa del estado de la API al del kit.
  - `TableCard` y `TableNode` aceptan `status="dinno"`. `TableCard` tiene `lockedReason` (tooltip accesible).
  - `StatusPicker` tiene `locked` (solo mensaje). `StatusLine` tiene `wrap`.
  - Ejemplos en `/kit`.
- **Código nuevo:** `src/features/reservations/` (detalle en CLAUDE.md §11). El tiempo real (socket) llega en el siguiente PR; mientras tanto, el panel consulta cada 30 s y al volver a la pestaña.
- **Para quien pruebe con mock:** `/mesas?mockDinno=01,07`. Códigos `K7M4QX` y `P3R8TW` válidos; `VENC9D`, `USAD4S` y `CANC3X` fuerzan vencida, ya usado y cancelada.
- **Sin dependencias nuevas ni variables de entorno nuevas.**

---

## 8 nov 2026 · Sebastián · Web compatible con el backend del Sprint 3 (mesas, bitácora y cierre)

**Contexto:** el backend del Sprint 3 ya está en `develop` y en Render (`/v1/health` → `15be6cf`), así que la entrada del 6 nov de abajo («NO está desplegado») quedó vieja. La web de producción todavía trataba los 409 nuevos como si fueran los del Sprint 1. Este PR lo corrige (rama `fix/sprint3-mesas-409-bitacora`).

- **Mesas (`features/tables/`):** los 409 con `errorCode` se revisan primero, con los textos de §12.2:
  - `TABLE_HAS_ACTIVE_RESERVATION` al cambiar el estado, al desactivar y al bajar la capacidad.
  - `TABLE_NOT_AVAILABLE_TO_DEACTIVATE` al desactivar.
  
  El 409 **sin** `errorCode` sigue significando lo de antes (inactiva, ya inactiva o identificador repetido). Los textos viven en `src/features/reservations/messages.ts` (el mapa único `errorCode → texto` del sprint).
- **Mock de mesas:** sigue las reglas nuevas. Solo se desactiva una mesa Disponible, y `?mockDinno=03,08` (o `mockTablesControl.setDinnoReservations`) simula mesas con reserva de DiNNo.
- **Para Sergio:** toqué tus dos carpetas, sin cambiar nada de lo que ya funcionaba.
  - **Bitácora (`features/activity-log/`):** `TableLog` ahora trae `source`, y `userEmail` puede ser `null`. El autor sale de `logAuthor` (`messages.ts`): `manual` → correo · `reservation` sin correo → «Comensal» · `reservation` con correo (check-in) → correo · `system` → «Automático».
  - **Abierto/Cerrado (`features/restaurant-status/`):** antes de cerrar se cuenta `activeReservationsCount` de `GET /v1/restaurants/me` (`use-active-reservations.ts`, que reemplaza a `use-reserved-tables.ts`), y no las mesas Reservadas. El texto nuevo es «Tienes N reservas en curso; se mantendrán hasta que lleguen o se venzan.», en singular con 1. Sin reservas de DiNNo, cierra de una vez aunque haya mesas Reservadas a mano.
- **Para Santiago y Jacobo:** `RestaurantProfile` tiene `activeReservationsCount: number`. Agregué `activeReservationsCount: 0` a los datos de prueba de `features/restaurant/` (6 archivos `*.test.ts(x)`), sin cambiar ninguna prueba. El mock del restaurante acepta `?mockActiveReservations=2`.
- **Sin dependencias nuevas, sin variables de entorno nuevas y sin cambios en el kit.**

---

## 6 nov 2026 · Elizabeth · Sprint 3 backend: cierre y plan de merge

**Esta entrada reemplaza la lista de «Pendiente» de la entrada de abajo («Backend del Sprint 3: estado real…», también del 6 nov), que queda tachada ahí:** el WebSocket (tarea 8), la exportación anónima de datos y `demo:reset` (tarea 9) ya están hechos en la rama.

- **Estado:** tareas 1 a 10 del backend hechas en `feat/sprint3-backend`; el PR a `develop` está en proceso. ~~**NO está desplegado aún:** ni `develop` ni Render lo tienen.~~ **Ya está desplegado en Render** (commit `15be6cf`, PR #49); ver la entrada del 8 nov («`reservationTtlMinutes` en el detalle público»).
- **Orden de merge (decidido; reemplaza cualquier orden anterior):**
  1. PR del backend a `develop` (Render despliega solo). Hasta que Sebastián termine la web, nadie usa ni prueba la web.
  2. PR de la web de Sebastián a `develop`: 409 de mesas por `errorCode`, bitácora por `source`, panel de reservas, check-in y cliente Socket.IO.
  3. PR de la app a `develop`.
  4. En la web, PR `develop` → `main` (Vercel despliega `main`; hasta entonces el trabajo no llega a la web real).
  No hay pruebas ni demo hasta que (2) y (3) estén fusionados. Elizabeth avisa en el grupo cuando fusione el backend.
- **Render:** variables `RESERVATION_TTL_MINUTES` (15; 3 solo durante la demo de expiración, y volver a 15 después) y `RESERVATION_EXPIRY_ENABLED` (`true`, que es el valor por defecto). `GET /v1/health` devuelve el `commit` desplegado. Una sola instancia: Socket.IO vive en la memoria del proceso; el adaptador de Redis pasa al Sprint 4.
- **Pendientes:** (solo después de fusionar (2) y (3)) QA según §9 del plan del sprint: Jacobo (M1, M2, M3, M8, M9, T1; concurrencia M2 y M3 por HTTP en Render con 2 o más comensales), Sergio (M5, M6) y Santiago (M4, M7, M10, M11, M12, T2, y su matriz); prueba con Firebase real en web y app; prueba completa de la demo (sección 10 del plan del sprint), con `demo:reset` antes del ensayo (lo corre Elizabeth).
- **Para Sebastián, lo que debe estar antes de la demo:**
  - **Web:** panel de reservas (§12.8; además del socket, consulta cada 30 s), check-in (§12.6), mesas protegidas con los 409 por `errorCode` (§12.2 y §12.9), bitácora por `source` (§12.3) y cliente Socket.IO con el token del restaurante (§12.7; las salas se fijan al conectar, así que se reconecta después de registrar el restaurante).
  - **App:** reservar (§12.1 y §12.9), reserva activa con temporizador calculado con `serverTime` y consulta cada 30 s (§12.1 y §12.7), cancelar, estados finales con `GET /v1/reservations/:id` (§12.8) y tiempo real por `diner:{userId}` (§12.7).
- **Deuda para el Sprint 4:** paginar y ordenar el historial de reservas por más reciente; adaptador de Redis para Socket.IO; límite de peticiones y de conexiones WebSocket; mover `reservation.created` a un listener asíncrono si se nota la latencia; y el resto de la «Deuda conocida» de este archivo.

---
## 6 nov 2026 · Elizabeth · Backend del Sprint 3: estado real y qué necesita cada cliente

**Esta entrada prevalece sobre la del 3 nov** en lo que dice del estado y las fechas del backend.

- **Hecho en la rama `feat/sprint3-backend`, AÚN NO en `develop` ni en Render:** crear reserva, reserva activa y por id, cancelar, expiración automática (cada 15 s y al arrancar), mesas con reserva activa protegidas, `activeReservationsCount`, check-in, lista de reservas del restaurante y bitácora con `source`.
- **Pendiente (reemplazado por la entrada de cierre de arriba):**
  - ~~Tarea 8: WebSocket con salas y eventos de reserva. Hasta entonces, consultar cada 30 s.~~ **Hecha** en la rama; la consulta cada 30 s queda como respaldo.
  - ~~Tarea 9: exportación anónima de datos para IA (CSV) y script `demo:reset` (planeadas, aún sin escribir).~~ **Hecha** en la rama.
  - ~~Tarea 10: cierre técnico y despliegue en Render + Neon.~~ El cierre documental está hecho; el despliegue ocurre cuando se fusione el backend a `develop`.
- **Mientras no esté en `develop`:** trabajar con datos de ejemplo con la forma exacta de §12, o probar contra el backend local de Elizabeth si lo coordinan con ella.
- **§12 volvió a quedar idéntica en los tres repos** (cambió el párrafo de `GET /v1/table-logs` en §12.3). Ante cualquier duda manda §12, y se le pregunta a Elizabeth antes de inventar.

### Por persona

**Sebastián (web):**
- **Prioridad ALTA (paso 2 del orden de merge de la entrada de cierre del 6 nov):** el manejo de los 409 de mesas por `errorCode`, ya anotado el 3 nov. Render despliega `develop` solo y, hoy, la web trata cualquier 409 al desactivar como «ya estaba inactiva». **El backend se fusiona primero; tu PR de la web va después, y hasta que esté fusionado no se usa ni se prueba la web contra el backend nuevo.** La web llega a `main` (Vercel) con un PR `develop` → `main` al final.
- **Cambio que no estaba en el contrato inicial:** pedir para una mesa el estado que ya tiene (el «Deshacer» sin cambio) con reserva DiNNo activa **también** responde `409 TABLE_HAS_ACTIVE_RESERVATION`.
- **Desactivar:** solo mesas `available`. Si la mesa tiene reserva activa, gana `TABLE_HAS_ACTIVE_RESERVATION` sobre `TABLE_NOT_AVAILABLE_TO_DEACTIVATE`.
- **Check-in** (`POST /v1/restaurants/me/check-ins`):
  - El campo normaliza en el cliente (mayúsculas, sin espacios) y el backend vuelve a normalizar.
  - Un formato inválido o un código vacío responde `404 RESERVATION_CODE_NOT_FOUND` (no 400). Un body sin `code`, o con `code` que no es texto, responde `400`.
  - `RESERVATION_EXPIRED` y `RESERVATION_ALREADY_USED` se muestran con el `message` tal cual.
  - El restaurante cerrado **no** bloquea el check-in.
- **Lista** (`GET /v1/restaurants/me/reservations`):
  - Nunca trae el código.
  - `dinerName` puede ser `null`: se muestra «Comensal» (también cuando el comensal no tiene nombre propio).
  - Orden: la más próxima a vencer primero. `status` por defecto: `active`.
  - El historial (`completed`, `expired`, `cancelled`) viene sin paginar y con lo más antiguo primero; está anotado en la «Deuda conocida» del `AVISOS.md` del backend como mejora del Sprint 4.
- **Bitácora:** el texto se decide por `source`: `manual` → el correo del admin; `reservation` con `userEmail` en `null` → «Comensal»; `reservation` con correo (el check-in) → el correo del admin; `system` → «Automático». El correo del comensal nunca llega al restaurante.
- **Refresco:** una mesa reservada por DiNNo se libera sola en máximo ~15 s al vencer la reserva. El WebSocket ya está hecho en el backend (entrada de cierre del 6 nov); refresca además la lista de reservas y el tablero de mesas cada 30 s como respaldo.
- **`activeReservationsCount`** sale igual en `POST`, `GET` y `PATCH` de `/v1/restaurants/me` (en el `POST`, `/v1/restaurants`, vale 0).
- **Para la app:** Sebastián también tiene su lista en el `AVISOS.md` de mobile.

---

## 3 nov 2026 · Elizabeth · Contratos del Sprint 3 publicados

> Reemplazada por la entrada del 6 nov (el backend aún no está en `develop` ni en Render; la bitácora se muestra según `source`).

- **Contratos del Sprint 3 publicados en CLAUDE.md §12. Leer antes de empezar cualquier tarea del sprint.** Es la fuente de verdad para backend, web y app (microreserva, mesas con reserva activa, check-in, tiempo real y `errorCode` nuevos), y la sección es idéntica en los tres repos. Si algo no está ahí, se pregunta antes de inventarlo.
- **Fechas del backend** (en `develop` y desplegado en Render, tabla §12.11): Día 2, reservas y reglas de mesas con reserva activa; Día 3, cancelación, expiración, `GET /v1/restaurants/me/reservations` y check-in; Día 4, WebSocket con salas y eventos de reserva. Mientras tanto, datos de ejemplo con exactamente las formas de §12.8, y consulta cada 30 s hasta el Día 4.
- **Decisiones:** «Desactivar una mesa Ocupada o Reservada» queda **decidido** (§12.2): solo se desactiva una mesa `available`. El adaptador de Redis para Socket.IO pasa al **Sprint 4**, con la migración a Azure (§12.7 y §12.10).
- **Otros cambios en `CLAUDE.md`** (iguales en los tres repos): §1 marca el Sprint 3 como actual; §8 suma `source` y las entradas automáticas de la bitácora; §10 marca `GET /geocode` para comensales como fusionado (PR #46).

### Por persona (Sprint 3)

**Sebastián (web):**
- **Primer cliente Socket.IO de la web**, con la sala del restaurante. Mismo host del backend **sin** `/v1`, ruta `/socket.io` y `auth` como función con el token de Firebase (igual que la app, §10 «Tiempo real»). El restaurante entra solo a `restaurant:{restaurantId}` y recibe `reservation.created`, `reservation.cancelled`, `reservation.expired`, `reservation.checked_in` y `table.status_changed` (formas en §12.8). Un admin sin restaurante se rechaza con `RESTAURANT_REQUIRED`. Respaldo: volver a consultar al reconectar o volver a la pantalla, y el panel de reservas consulta además cada 30 s.
- **Mensajes de los dos 409 nuevos de mesas** (§12.2), por `errorCode`:
  - `TABLE_HAS_ACTIVE_RESERVATION` → «Esta mesa tiene una reserva de DiNNo en curso. Se libera sola cuando el comensal llegue, cancele o se venza la reserva.»
  - `TABLE_NOT_AVAILABLE_TO_DEACTIVATE` → «Para desactivar esta mesa, primero márcala como Disponible.»
  - Los 404 y 409 que ya existían en mesas siguen sin `errorCode`.
- **Cambio de comportamiento:** ya no se puede desactivar una mesa Ocupada o Reservada. Desde el Día 2 solo se desactiva una mesa `available`; reactivar no cambia (vuelve como `available`).
- **Bitácora:** `GET /v1/table-logs` trae `source` (`manual`, `reservation` o `system`) y puede traer el usuario en `null`; se muestra como "Automático".
- **Check-in:** `RESERVATION_EXPIRED` y `RESERVATION_ALREADY_USED` se muestran con el `message` del backend tal cual (ya trae la hora de Bogotá). Los demás errores de check-in usan el texto de §12.6 según el `errorCode`. Un `dinerName` en `null` se muestra como «Comensal», también en «Check-in confirmado».
- **Cerrar el restaurante:** `GET /v1/restaurants/me` trae `activeReservationsCount` (también `PATCH` y `POST`, que siguen respondiendo igual). Con reservas activas, el aviso es «Tienes N reservas en curso; se mantendrán hasta que lleguen o se venzan.»; el cierre se hace igual.
- **La lista de reservas nunca muestra el código.** Muestra nombre del comensal, personas, mesa y tiempo restante (`RestaurantReservation` no trae el código).

**Sebastián (web): impacto de §12 en el código actual** (revisión de Elizabeth, 3 nov). En orden de prioridad:

1. **Prioridad alta, antes del Día 2.** Ese día el backend sube §12.2 y Render lo despliega solo.
   - Los 409 de mesas se deciden por `errorCode`, no solo por el código HTTP.
   - `src/features/tables/use-table-activation.ts:69-73`: hoy toma cualquier 409 al desactivar como «ya estaba desactivada» y marca la mesa inactiva sin mostrar error. Con `TABLE_NOT_AVAILABLE_TO_DEACTIVATE` o `TABLE_HAS_ACTIVE_RESERVATION` debe mostrar el mensaje de §12.2 y dejar la mesa como estaba.
   - `src/features/tables/use-table-status-change.ts:59-63`: con `TABLE_HAS_ACTIVE_RESERVATION` debe mostrar el mensaje de §12.2, no «Reactívala…». Sin `errorCode`, sigue como hoy (mesa inactiva).
   - `src/features/tables/table-form.ts:56-58`: con `TABLE_HAS_ACTIVE_RESERVATION` al bajar la capacidad, debe mostrar el mensaje de §12.2 como error general, no en el campo Identificador. Sin `errorCode`, sigue como hoy (identificador repetido).
   - Actualizar la regla de `src/features/tables/types.ts:38-41` («un solo motivo por código HTTP»): ahora manda el `errorCode` cuando viene.
   - ~~**Coordinar con Elizabeth el momento del merge:** el PR de la web con este manejo se fusiona a `main` el mismo día que el backend sube §12.2, o antes.~~ **Reemplazado por el orden de merge de la entrada de cierre del 6 nov:** primero el backend, luego la web a `develop`, luego la app y al final `develop` → `main` en la web.
2. **Menú de mesa** (`src/features/tables/table-menu.ts:14-15` y `src/features/tables/plan/FloorPlan.tsx:301-303`): «Desactivar» solo se ofrece para mesas `available`. En las demás aparece deshabilitado, con el motivo al pasar el cursor (§12.2).
3. **Bitácora** (`src/features/activity-log/types.ts:17` y `src/features/activity-log/ActivityLogPage.tsx:29`):
   - `userEmail` pasa a `string | null` y se agrega `source`.
   - Con `null` se muestra «Automático».
   - Agregar al mock (`src/features/activity-log/api.mock.ts:35`) y a la prueba (`src/features/activity-log/ActivityLogPage.test.tsx:23`) un registro con usuario `null`.
4. **Aviso al cerrar el restaurante** (`src/features/restaurant-status/use-reserved-tables.ts:6` y `src/features/restaurant-status/messages.ts:25-27`):
   - Usar `activeReservationsCount` de `GET /v1/restaurants/me` y el texto de §12.2.
   - Ojo: `closeWithReservationsText` y `confirmUnknownReservations` hablan de mesas en `reserved`, no de reservas DiNNo. Renombrarlos o aclararlos al hacer el cambio.
5. **Pruebas:** `src/features/tables/table-form.test.ts:51` y `src/lib/api-client.test.ts:42` usan `TABLE_IDENTIFIER_TAKEN`, que el backend no envía. Corregir a la forma real (409 sin `errorCode`).
6. **Dependencia aprobada: `socket.io-client`**, para el primer cliente WebSocket de la web (§12.7). Elizabeth la aprueba con este aviso. Usa la misma versión mayor que mobile (4.x; mobile tiene `^4.8.4`).

---

## 29 oct 2026 · Sebastián · El login usa la luz del salón

**Qué cambió**
- `/login` ya no dibuja las dos formas de marca con borde: usa `AmbientGround`, la misma luz difusa del dashboard y del registro. Va siempre encendida (antes de iniciar sesión no hay estado del restaurante).
- La tarjeta de vidrio, las pestañas, la animación, el panel de marca y el formulario no cambian.
- Se borró `AuthBackdrop` y se quitaron las utilidades `login-blob-start` y `login-blob-end` de `globals.css`. Nadie más las usaba.
- Manual v2.0 al día (7.1, 8 y 13.9). Como ya no pasa ninguna forma detrás del formulario, los enlaces del login van en `--accent-text` al 100% en toda la tarjeta.

**Para quién**
- **Jacobo:** la lógica del login no cambió.

**Rama / PR**
- `refactor/sprint2-login-luz-salon` → `develop`.

---

## 27 oct 2026 (tarde) · Sebastián · Dashboard v2.1: navegación en un dock abajo (sin PR todavía)

- **La navegación ahora es un dock abajo, como el de macOS** (`NavDock`), en todos los tamaños. Ya no existen `Sidebar`, `NavRail` ni `FloatingDock`.
- **Los toasts llegan arriba al centro**, bajo la barra. Se quitó `ToastLayoutContext`.
- **`StatStrip` ya no tiene `highlight` ni `caption`.** Las palabras van con mayúscula inicial ("Disponibles").
- **Con `VITE_USE_MOCKS=true`, `/restaurants/me` también usa datos de ejemplo** (Casa 72), así la barra muestra el nombre.
- **Si pruebas el resumen:** busca la palabra dentro del grupo "Resumen de mesas", porque "Disponible" e "Inactiva" también aparecen en las tarjetas de mesa.

---

## 27 oct 2026 · Sebastián · Dashboard v2.1 "Salón de vidrio" (sin PR todavía)

**Qué cambió**
- **El marco del dashboard:**
  - Luz de fondo, que se apaga cuando el restaurante cierra.
  - Riel de navegación flotante.
  - Barra superior en píldora, con la cuenta a la derecha.
  - Hoja de vidrio para el contenido.
- **No tienes que cambiar tu pantalla:** sigue empezando con `PageHeader` y va dentro de la hoja.
- **Kit:**
  - Nuevo `FloatingDock`.
  - `StatStrip` pasa a tarjetas (`highlight`, `caption`).
  - `PageHeader` suma `variant="hero"` y su línea va en tinta.
  - `Card` es de vidrio.
  - `DropdownMenu` suma `header`.
- **Texto secundario:** sobre la hoja se oscurece solo; dentro de una `Card` queda como siempre.

**Qué tienes que hacer**
- Nada, si tu pantalla ya usa el kit.
- Si pruebas el resumen de `/mesas`: la cifra ya no es el hermano anterior de la palabra. Usa `getByText('disponibles').parentElement?.nextElementSibling`.

---

## 27 oct 2026 · Sebastián · Plano de mesas en `/mesas` (en curso, sin PR todavía)

**Qué cambió**
- **`/mesas`:** el selector **Plano · Cuadrícula**.
  - El plano muestra cada mesa en su lugar del salón, con número, capacidad y estado.
  - El modo Editar existe solo desde 768 px.
  - La vista elegida se recuerda en cada dispositivo.
- **Tipo `Table`** (`features/tables/types.ts`): agrega `planX`, `planY` y `planShape`, en `null` mientras la mesa no está en el plano. Si armas una mesa a mano en una prueba, agrega los tres en `null`.
- **Kit:**
  - Nuevo `TableNode`.
  - `StatusPicker` suma tres props opcionales: `details`, `actions` y `anchorStyle`. Las pantallas que ya lo usan no cambian.
  - La descripción de `FloatingBar` va en tinta.
- **`CLAUDE.md` (secciones 2 y 8, iguales en los tres repos):** el manual que manda ahora es el **v2.0** (`frontend/docs/DiNNo_Manual_Identidad_v2_0.md`); el v1.1 queda como histórico. Lo que el v2.0 todavía no implementa está en su sección 19. La sección 8 suma la decisión del plano de mesas.
- **`CLAUDE.md`, sección 11 (este repo):** las reglas de diseño siguen al v2.0: vidrio solo en la capa flotante, gradientes solo en el login, mayúsculas solo en `text-kicker` y ningún texto con opacidad.
- **Backend:** `PUT /v1/tables/plan`, en la rama `feat/sprint2-plano-mesas` del backend. Mientras no llegue a Render, la web lee los campos del plano como `null` y todo sigue funcionando.

**Qué tienes que hacer**
- Nada, salvo si escribes pruebas con mesas: agrega los tres campos nuevos.
- En `/mesas`, `getByRole('radiogroup')` ya no es único (el selector de vista también lo es): nómbralo, por ejemplo `{ name: 'Estado de Mesa 04' }`.
- Para ver el plano con datos de ejemplo: `/mesas?mockPlan` (8 mesas) o `/mesas?mockPlan&mockMany` (40).

---

## 26 oct 2026 · Sebastián · Manual de identidad v2.0 y dashboard renovado (en curso, sin PR todavía)

**Qué cambió**
- **Nuevo manual:** `docs/DiNNo_Manual_Identidad_v2_0.md` es la fuente de diseño; el v1.1 queda como histórico.
  - La paleta y el logo no cambian.
  - Cambian la escala tipográfica (títulos de página de 28, etiquetas de 12 con mayúscula inicial), la elevación (las tarjetas ya no llevan sombra en reposo), el vidrio en la capa flotante y el motion (presionar, salidas, reducir movimiento sin apagarlo todo).
- **Tokens:** `tokens.css` y `globals.css` en v2.0. No cambió el valor de ningún color; se agregaron tokens (tintes y bordes de estado, vidrio, curvas).
- **Kit nuevo:** `StatusLine`, `StatStrip`, `StatusPicker`, `DetailList` y `useMediaQuery` (`@/lib/use-media-query`). `TableCard` se reescribió (ya no tiene `onReactivate` ni `reactivating`). Detalle en `src/components/ui/README.md`.
- **`/mesas`:**
  - Tocar una mesa abre su selector de estado junto a ella (en el teléfono, una hoja). Con la mesa enfocada, D, R u O cambian su estado.
  - La franja de resumen filtra.
  - "Agregar mesa" pasa a borde y las inactivas van al final.
  - La barra fija de estado se eliminó.
- **Topbar:** muestra el nombre real del restaurante, no el de la cuenta de Google.
- **El login no cambió.**

**Para quién**
- **Todos:**
  - Las pantallas nuevas se arman con el manual v2.0.
  - "libres" ahora es "disponibles" (glosario).
  - Si una prueba busca la métrica por "libres", cámbiala.
- **Jacobo:** en `/restaurante`, "Editar" pasa a botón de borde y el modo lectura usa `DetailList`. Tu lógica de edición no cambió. Además, `useRestaurantQuery` acepta `{ enabled }`; sin parámetros funciona igual que antes.
- **Sergio:** la bitácora en el teléfono muestra dos líneas por cambio (mesa y cambio; fecha y usuario). La pantalla de escritorio y los datos son los mismos. En `layouts.tsx`, tu switch y tu banner siguen en sus slots.
- **Santiago:** el horario del registro muestra cada día cerrado en una fila, y el botón ahora dice "Copiar el lunes a todos" y está debajo del lunes. Las reglas y los datos no cambiaron.

**Rama / PR**
- `docs/sprint2-manual-v2` (manual) y `refactor/sprint2-dashboard-v2` (código). Todavía sin commit ni PR.

---

## 26 oct 2026 · Sebastián · `/login` vuelve a tener pestañas, sin registro público

**Qué cambió**
- Vuelve el diseño del 14 oct: la columna izquierda con el símbolo de DiNNo y las pestañas **Iniciar sesión / Crear cuenta**, la barra naranja que se desliza, el panel de marca que cambia de texto y los formularios que se deslizan (300 ms).
- **"Crear cuenta" no crea cuentas.** El contrato (sección 10) sigue igual: no hay registro público. La pestaña explica cómo pedir una cuenta de restaurante (el equipo la habilita) y remite a los comensales a la app. No tiene campos ni llama a Firebase. `signUp` sigue fuera del contexto.
- **"Continuar con Google"** baja a debajo de "Iniciar sesión", con el separador "O inicia sesión con". Es el mismo botón y la misma lógica.
- Piezas: `AuthNav` y `auth-view.ts` vuelven; `AccountRequestPanel` es nuevo; `SignInForm` recibe `onSwitch`.

**Para quién**
- **Jacobo:** tu lógica de `SignInForm` (correo, Google, recuperar contraseña) no cambió, solo el orden. En `LoginPage.test.tsx` cambié la prueba que exigía que no hubiera pestañas: ahora revisa que "Crear cuenta" no tenga ningún campo ni formulario.
- **Equipo:** el texto de la pestaña dice "Escríbele al equipo de DiNNo" sin un canal. Si definimos un correo o un enlace de contacto, se agrega ahí.

**Rama / PR**
- `fix/sprint2-login-pestanas` → `develop`.

---

## 26 oct 2026 · Sebastián · Cierre del Sprint 2 en la web: mensajes de ubicación, logo de Google y dominio único

**Después del pull:** `npm install`. No hay dependencias nuevas.

**Qué quedó listo**
- **Mensajes de «Ubicar en el mapa» por `errorCode`** (`GET /geocode` ahora responde mensajes neutros):
  - Con mapa: `404` → «No encontramos esa dirección en Bogotá. Mueve el pin al lugar correcto.» y `503` → «No pudimos ubicar la dirección en este momento. Mueve el pin al lugar correcto.». En los dos casos el mapa muestra **toda Bogotá** con el pin en el medio para moverlo (antes hacía zoom a una cuadra).
  - Sin mapa: los dos casos tienen su propio texto y dicen que la ubicación se puede completar después.
  - Sin llave o sin Map ID ya no dice «No pudimos cargar el mapa»: dice «Con «Ubicar en el mapa» guardamos la ubicación de tu dirección.», que es informativo.
- **«Continuar con Google» con la «G» oficial de Google**, sacada del paquete de las guías de marca sin redibujarla (`src/assets/google/`, con su README). Mismo botón de borde del kit, en claro y oscuro.
- **Las pruebas ya no dependen de tu `.env.local`:** con la llave de Maps y el Map ID puestos, 11 pruebas de `OnboardingPage` fallaban porque el formulario intentaba cargar Google Maps, y jsdom no puede. `vite.config.ts` → `test.env` deja esas dos variables vacías en las pruebas. Las que necesitan el mapa siguen usando `LocationMap.fake`.
- **`.gitattributes`** con `* text=auto eol=lf`, sin `--renormalize`. `git status` no cambia: ningún archivo del repo tenía finales de línea de Windows.
- **README, sección 7:** el dominio único de producción, quién configura Vercel y que el mapa necesita las dos variables de Google.

**Para quién**
- **Todos:** para QA y la demo usen solo **https://frontend-di-nn-o.vercel.app**. Las URLs de cada despliegue fallan con Google Sign-In.
- **Santiago:** cambié tu `LocationPicker` (textos por `errorCode`) y `LocationMap` (prop `framing`, para ver toda la ciudad después de una búsqueda fallida). Sus pruebas están al día.
- **Jacobo:** el botón de Google de `SignInForm` ahora lleva el logo; la lógica no cambió.
- **Producción:** sigue publicando `main`, que está en la versión del 14 oct. Falta el PR `develop` → `main` para que la demo vea el Sprint 2.

**Rama / PR**
- `fix/sprint2-cierre-web` → `develop`.

---

## 26 oct 2026 · Elizabeth · `GET /v1/geocode` con mensajes neutros (también lo usa el comensal)

**Para Santiago y Sebastián.** Cambio del backend en la rama `docs/sprint2-cierre-contrato`, todavía sin fusionar.

- **Mensajes neutros:** el `message` del backend ya no dice «Mueve el pin»: ahora es «No encontramos esa dirección en Bogotá.» (`404 ADDRESS_NOT_FOUND`) y «No pudimos ubicar la dirección en este momento.» (`503 GEOCODING_UNAVAILABLE`). El cambio es porque el comensal también usa la ruta para buscar por dirección. Los `errorCode`, los códigos HTTP y la forma de la respuesta no cambian.
- **La web debe mostrar su propio texto por `errorCode`, nunca el `message`.** Hoy ya lo hace (`LocationPicker.tsx` con `LOCATION_TEXT` en `features/restaurant/messages.ts`), así que no se rompe nada. El texto sugerido para el 404 es «No encontramos esa dirección en Bogotá. Mueve el pin al lugar correcto.»; hoy la web dice «No encontramos esa dirección. Mueve el pin al lugar correcto.». Alinearlo es opcional (Santiago).
- **Cuenta sin perfil:** en `/geocode` ahora recibe `403 PROFILE_REQUIRED` en lugar de `ACCOUNT_NOT_ENABLED`, igual que en `GET /v1/me`. La web ya ve ese código en `/me` antes de llegar al formulario. Un comensal ahora recibe `200` en esta ruta, ya no `403 DINER_ACCOUNT`.
- **El restaurante no cambia:** `/geocode` sigue sin exigir restaurante registrado.
- **Contrato:** `CLAUDE.md` §10 (fila de `/geocode`, «Ambos roles» y «Búsqueda por dirección (app)»), idéntica en los tres repos.

---

## 26 oct 2026 · Elizabeth · Backend del Sprint 2 cerrado

- **El backend del Sprint 2 está cerrado:** todo está en `develop` y desplegado en Render. Se probó el 26 oct con tokens reales de Firebase. No cambió ninguna ruta ni respuesta.
- **Seed en Render:** además de Casa 72 y Casa16 están los 15 restaurantes reales de Santiago, con sus horarios y mesas. Sus dueños (`restaurante-XX@dinno.test`) son solo datos: nadie entra a la web como ellos.
- **Casa 72** tiene como dueño `dinnoteam2026+casa72@gmail.com` (Casa16 es de `dinnoteam2026@gmail.com`). Su cuenta de Firebase ya existe y está verificada: con ella se entra a la web como Casa 72 (probado el 26 oct en Render, junto con el tiempo real hacia la app).
- **La geocodificación ya funciona** (llave real en Render): `GET /v1/geocode` devuelve coordenadas reales, y `503 GEOCODING_UNAVAILABLE` solo sale si Google no responde. Una dirección fuera de Bogotá da `404 ADDRESS_NOT_FOUND`. **Caso conocido:** un texto sin sentido puede devolver `200` con una dirección cualquiera de Bogotá, así que el dueño siempre debe confirmar el pin en el mapa.
- **Credenciales:** en Discord (#usuarios-restaurante y #usuarios-comensal), nunca en el repo. Una cuenta nueva usa un alias `dinnoteam2026+algo@gmail.com`.
- **Contrato:** `CLAUDE.md`, sección 10, idéntica en los tres repos. Hoy cambió el apartado «Cuentas de prueba» y la tabla «Cuándo está listo cada contrato en `develop`».

---

## 22 oct 2026 · Santiago · Aviso «Completa tu ubicación»

**Qué quedó listo**
- Mientras `GET /v1/restaurants/me` traiga `latitude === null`, arriba del contenido del dashboard aparece «Completa la ubicación de tu restaurante para que los comensales te encuentren en DiNNo.» con «Completar ubicación», que lleva a `/restaurante` (en `/restaurante` va sin botón). Mismo estilo que el aviso de restaurante cerrado. Desaparece al guardar la ubicación, sin recargar.
- **Decisión (Santiago):** el texto lleva punto final, como el aviso de cerrado.

**Para quién**
- **Sergio:** el `banner` de `src/app/layouts.tsx` ahora muestra tu `RestaurantStatusBanner` y debajo `LocationBanner`, en un contenedor (`gap-3`, `empty:hidden`). Tu componente no cambió. En `RestaurantStatus.layout.test.tsx` agregué el mock de `LocationBanner`.
- **Sebastián:** en `router.test.tsx` agregué el mock de `LocationBanner`, igual a los de los componentes de Sergio.
- **Todos:** el dashboard pide `GET /v1/restaurants/me` en todas las pantallas (la misma consulta de `/restaurante`, `restaurantQueryKey`). Si una prueba renderiza `DashboardLayout`, simula `LocationBanner` o `restaurantApi`.

**Rama / PR**
- `feat/sprint2-aviso-ubicacion` → `develop`, después del PR de `feat/sprint2-ubicacion-restaurante`, del que depende.

---

## 22 oct 2026 · Santiago · Ubicación del restaurante en el formulario

**Qué quedó listo**
- En `/onboarding` y `/restaurante`, la tarjeta «Ubicación» tiene «Ubicar en el mapa»: busca la dirección con `GET /v1/geocode` y pone el pin del logo en un mapa de Google, que se arrastra o se mueve tocando el mapa. `latitude` y `longitude` van en `POST /v1/restaurants` y en `PATCH /v1/restaurants/me` (solo si el pin se movió).
- `404 ADDRESS_NOT_FOUND` y `503 GEOCODING_UNAVAILABLE`: mensaje y mapa con toda Bogotá, con el pin en el medio para moverlo; no bloquea el guardado.
- **Decisión (Santiago):** la ubicación es obligatoria para registrar solo mientras el mapa carga. Sin mapa se guarda el punto de `/geocode`; si tampoco hay punto, el registro sigue y el aviso «Completa tu ubicación» la pedirá después.
- `HoursEditor`: en pantallas angostas (menos de 448 px de ancho del editor) apertura y cierre van uno debajo del otro. Se cierra el corte a 390 px del aviso del 9 oct.
- Variables nuevas, opcionales: `VITE_GOOGLE_MAPS_API_KEY` y `VITE_GOOGLE_MAPS_MAP_ID`. Dependencia nueva: `@vis.gl/react-google-maps`.

**Para quién**
- **Responsable de Google Cloud:**
  - activar Maps JavaScript API (el checklist de la sección 7 la prohibía antes de la decisión de usar Google en la web);
  - crear una llave restringida a `http://localhost:5173` y a los dominios de Vercel, y solo a esa API;
  - crear un Map ID de JavaScript;
  - entregar la llave y el Map ID por privado.

  Sin ellos, el formulario funciona sin mapa.
- **Sebastián:** revisa el cambio de layout en tu `HoursEditor` y el mapa (`features/restaurant/components/LocationMap.tsx`: `aspect-4/3`, `rounded-input`, `border-line` y `Logo symbolOnly` como pin). Cuando lleguen la llave y el Map ID, agrégalos en Vercel y vuelve a desplegar.
- **Jacobo:** en `RestaurantPage.tsx`, `createUpdateInput` envía las coordenadas. `RestaurantProfile` ahora tiene `latitude` y `longitude` (`number | null`): todo mock de `RestaurantProfile` debe incluirlas.
- **Todos:** después del pull, corre `npm install`.

**Rama / PR**
- `feat/sprint2-ubicacion-restaurante` → `develop`.

**Pendiente**
- Ver el mapa real (falta la llave) y probar R2.1 a R2.4 en el ambiente desplegado.

---

## 20 oct 2026 (noche) · Sergio · Pendiente del Sprint 1 · README, AGENTS.md y matriz de pruebas

**Qué quedó listo**
- **`README.md`:** las 5 variables de entorno (`VITE_API_URL`, `VITE_USE_MOCKS` y las tres `VITE_FIREBASE_*`) con si son obligatorias y un ejemplo, los parámetros de los datos de ejemplo, tres formas de correr la web (mocks, Render y backend local), cómo verificar que funciona y problemas comunes.
- **Firebase hace falta incluso con `VITE_USE_MOCKS=true`:** los mocks cubren mesas, estado y bitácora, pero la sesión siempre usa Firebase. Sin las `VITE_FIREBASE_*`, la web queda en blanco.
- **`AGENTS.md`:** en español y al día con el repo (estructura, rutas y convenciones). Enlaza al `CLAUDE.md` en vez de repetirlo.
- **`docs/qa/matriz-sprint2.md`:** 13 variantes pasan de «Bloqueado» a «Pendiente», porque ya están en `develop`: **C2** (crear cuenta, verificación y recuperar contraseña, PR #16 de mobile), **C12** (Perfil, PR #15 de mobile), **R1.2** y **T1.1** (cuenta equivocada en la web, PR #44). Siguen bloqueados Google en la app, el mapa y el pin de ubicación web.

**Para quién**
- **Jacobo:** **C2** (crear cuenta), **C12**, **R1.2** y **T1.1** son tuyos y ya se pueden probar. Registra tus resultados en la matriz.
- **Todos:** si alguien nuevo levanta la web, que siga solo el README. Las credenciales de Firebase y las cuentas de prueba se piden por privado a Elizabeth, nunca en el repo.

**Rama / PR**
- `docs/sprint2-readme-agents` → `develop`.
## 21 oct 2026 · Jacobo · Matriz del Sprint 2

- Jacobo: actualicé mis casos de la matriz del Sprint 2 con evidencia de QA.

---

## 20 oct 2026 · Sergio · Pendiente del Sprint 1 · Prueba de `RestaurantStatus` que fallaba

**Qué quedó listo**
- «cannot be pressed again while saving» (`RestaurantStatus.test.tsx`) ya no depende de la velocidad de la máquina. El componente no cambió: la falla estaba en la prueba, que usaba un `setTimeout` real de 50 ms.
- **La suite de pruebas de la web queda 100 % en verde (264/264).** Si una prueba falla después de tu cambio, revisa primero tu cambio.

**Para quién**
- **Todos:** para probar estados "mientras guarda", no uses `setLatency` ni timeouts reales. Deja el guardado pendiente con una promesa que controle la prueba y suéltalo en un `finally` (ejemplo: «cannot be pressed again while saving» en `RestaurantStatus.test.tsx`).

**Rama / PR**
- `fix/sprint2-restaurant-status-test` → `develop`.
## 20 oct 2026 · Jacobo · Cuenta equivocada en la web

- Los 403 `ACCOUNT_NOT_ENABLED` y `DINER_ACCOUNT` muestran una pantalla de cuenta equivocada con el texto del contrato (`CLAUDE.md`, sección 10) y un solo botón **Cerrar sesión**, en el dashboard y en `/onboarding`. Se decide por `errorCode`, nunca por el texto.
- Precedencia: `EMAIL_NOT_VERIFIED` manda; con una cuenta equivocada activa, `RESTAURANT_REQUIRED` ya no lleva a `/onboarding`.
- **`AuthContextValue` tiene dos campos nuevos: `accountEvent` y `clearAccountEvent`.** Cualquier mock de `AuthContext` en pruebas debe incluirlos o `tsc -b` falla.
- Toqué archivos de otros: `OnboardingPage.tsx` (Santiago: un 403 de cuenta equivocada ya no lanza error) y los mocks de `RestaurantStatus.layout.test.tsx` (Sergio) y `router.test.tsx`.

---

## 15 oct 2026 (noche) · Elizabeth · Backend del Sprint 2 disponible en `develop`

- **Todo el backend del Sprint 2 está en `develop` desde el 15 oct** (PR #35 a #40 del backend): cuentas y roles, geocodificación y coordenadas del restaurante, búsqueda, detalle público y tiempo real. Ya se puede integrar contra la API real; no hace falta esperar a ninguna fecha.
- **El contrato sigue en `CLAUDE.md`, sección 10**, ahora idéntica en los tres repos. Hoy cambió solo la parte de **Tiempo real** (es de la app) y la tabla "Cuándo está listo cada contrato en `develop`". El detalle de cada endpoint, con ejemplos, está en Swagger: `https://dinno-backend.onrender.com/docs`.
- Las fechas de la entrada "Contratos del Sprint 2 publicados" (más abajo) quedan superadas.

### Por persona

**Jacobo (acceso a la web):**
- **Ya está activo en `develop`:** el backend no crea usuarios al iniciar sesión. Precedencia de los errores: `401` de sesión → `401 EMAIL_NOT_VERIFIED` → `403 ACCOUNT_NOT_ENABLED` (cuenta sin perfil) o `403 DINER_ACCOUNT` (cuenta de comensal) → `403 RESTAURANT_REQUIRED` (restaurante habilitado sin restaurante registrado). Textos exactos en la tabla de códigos de `CLAUDE.md`, sección 10.
- **Sigue pendiente en la web:** hoy `src/lib/api-client.ts` solo distingue `EMAIL_NOT_VERIFIED` y `RESTAURANT_REQUIRED`; `ACCOUNT_NOT_ENABLED` y `DINER_ACCOUNT` terminan en «No tienes acceso a esta sección.». El plan sigue siendo el de la entrada "Contratos del Sprint 2 publicados" (más abajo): manejarlos por `errorCode` y quitar «Crear cuenta».
- **Para probar** (superado el 26 oct: ahora también está Casa 72, ver «Cuentas de prueba» en `CLAUDE.md`, sección 10): `dinnoteam2026@gmail.com` es el único correo real habilitado como restaurante. Cualquier otro correo verificado da `ACCOUNT_NOT_ENABLED`. Para `DINER_ACCOUNT` hace falta una cuenta de comensal: crea una desde la app (o con `POST /v1/diners/me`) y entra con ella en la web.

**Santiago (ubicación del restaurante):**
- **`GET /v1/geocode?address=<texto>`** ya está en `develop` → `200 { latitude, longitude, formattedAddress }` (6 decimales, siempre dentro de Bogotá). No exige restaurante registrado: úsalo en `/onboarding` antes del `POST`. `address` recortada, de 3 a 255 caracteres; si no, `400`.
  - `404 ADDRESS_NOT_FOUND` y `503 GEOCODING_UNAVAILABLE`: en los dos casos muestra el mensaje y el mapa centrado en Bogotá para mover el pin, sin bloquear el guardado. Ramifica por `errorCode`. ~~Mientras la llave de Google no esté configurada en Render, la respuesta es siempre `503`.~~ **Resuelto el 26 oct:** la llave ya está configurada (ver la entrada del 26 oct).
- **Coordenadas en `POST /v1/restaurants` y `PATCH /v1/restaurants/me`:** `latitude` y `longitude` como números, **las dos o ninguna** (si llega solo una, `400`), dentro de Bogotá (lat 4.45 a 4.85, lng −74.25 a −73.95; fuera, `400`). Se aceptan con más decimales y **se guardan redondeadas a 6**. **No se pueden borrar:** `null` da `400`. En el `PATCH`, enviar solo las coordenadas es una edición válida.
- **Respuestas:** `POST /v1/restaurants`, `GET` y `PATCH /v1/restaurants/me` traen `latitude` y `longitude` (`number | null`). El aviso **«Completa tu ubicación»** se muestra cuando `GET /v1/restaurants/me` trae `latitude === null`.
- **Datos de los 15 restaurantes reales:** el formato de `src/seed-data/restaurants.json` está en el `AVISOS.md` del backend (sección de Santiago). Se entrega el **viernes 16** en una rama `feature/s2-seed-restaurantes` del backend, con PR para Elizabeth, sin correr el seed en Neon. **No incluyas Casa 72:** ya está en el seed y es el restaurante de prueba del equipo.

**Sergio (QA):**
- **Nombres exactos para la matriz:**
  - `errorCode` de HTTP: `EMAIL_NOT_VERIFIED`, `ACCOUNT_NOT_ENABLED`, `PROFILE_REQUIRED`, `DINER_ACCOUNT`, `RESTAURANT_ACCOUNT`, `RESTAURANT_REQUIRED`, `RESTAURANT_NOT_FOUND`, `ADDRESS_NOT_FOUND` y `GEOCODING_UNAVAILABLE`.
  - Códigos del `connect_error` del WebSocket (app): `UNAUTHORIZED`, `EMAIL_NOT_VERIFIED`, `PROFILE_REQUIRED`, `RESTAURANT_REQUIRED` y `SERVER_ERROR` (el socket ya no envía `RESTAURANT_ACCOUNT`; sigue existiendo en HTTP).
  - `availability`: `available`, `few`, `none` y `closed`.
- **`GET /v1/me`** responde con los dos roles: `{ id, email, displayName, role, restaurantId }`. En una cuenta de restaurante `displayName` es `null`.
- **QA de tiempo real:** el script `scripts/listen-availability.mjs` vive en el repo del backend. Crear una mesa, cambiar su estado, desactivarla o reactivarla, abrir o cerrar el restaurante, o editar su horario o ubicación desde la web debe imprimir un `availability.changed`; editar el identificador o la capacidad de una mesa, o repetir el mismo estado, no imprime nada. Uso en el `AVISOS.md` del backend (sección de Sergio) y en su README, sección 6.

---

## 15 oct 2026 · Elizabeth · Contratos del Sprint 2 publicados

- Los contratos del Sprint 2 están en `CLAUDE.md`, sección "Sprint 2 · Contratos". Es la fuente de verdad para backend, web y app; si algo no está ahí, se pregunta antes de inventarlo. Las fechas de cada contrato están en la tabla "Cuándo está listo cada contrato en `develop`".
- **Cambio importante (ya en `develop` desde el 15 oct):** el backend deja de crear usuarios automáticamente. Por ahora el único correo real habilitado como restaurante es `dinnoteam2026@gmail.com`. Para probar la web como restaurante, usen esa cuenta o el usuario de desarrollo en local. Cualquier otra cuenta recibe 403 `ACCOUNT_NOT_ENABLED` en la web. Si necesitan habilitar otro correo, pídanselo a Elizabeth.

### Por persona (Sprint 2)

**Jacobo:**
- El backend ya no crea usuarios. Una cuenta que no esté habilitada recibe 403 `ACCOUNT_NOT_ENABLED`, y una cuenta de comensal recibe 403 `DINER_ACCOUNT` (textos en la tabla de códigos del contrato).
- Hoy `api-client.ts` solo dispara un evento para `RESTAURANT_REQUIRED`; los demás 403 terminan en «No tienes acceso a esta sección.». Agrega el manejo de `ACCOUNT_NOT_ENABLED` y `DINER_ACCOUNT` siguiendo el mismo patrón (evento en `window` → pantalla con el texto del contrato y *Cerrar sesión*, como `EmailVerificationScreen`). Se reconocen por `errorCode`, no por el status.
- Se quita la pestaña «Crear cuenta» y el comentario de `signUp` que dice que el backend crea el usuario.
- Para probar: `dinnoteam2026@gmail.com` es el único correo habilitado. Cualquier otro correo sirve para probar `ACCOUNT_NOT_ENABLED`.

**Santiago:**
- `POST /v1/restaurants` y `PATCH /v1/restaurants/me` aceptan `latitude` y `longitude` opcionales: se envían **las dos o ninguna**, con hasta 6 decimales y dentro de Bogotá (lat 4.45–4.85, lng −74.25 a −73.95). Fuera de ese rango → 400. Las respuestas, incluido `GET /restaurants/me`, traen `latitude` y `longitude` (pueden venir en `null`).
- La obligatoriedad de la ubicación al registrar la pone el formulario. El backend la deja opcional.
- `GET /v1/geocode?address=...` → `{ latitude, longitude, formattedAddress }`. `404 ADDRESS_NOT_FOUND` y `503 GEOCODING_UNAVAILABLE` muestran el mapa centrado en Bogotá para mover el pin a mano, sin bloquear el guardado. Recuerda que `forbidNonWhitelisted` rechaza cualquier campo que no esté en el contrato.
- ~~Disponible en `develop` el viernes 16; mientras tanto, usa datos de ejemplo con esa forma.~~ **Superado:** ya está en `develop` desde el 15 oct (ver la entrada "Backend del Sprint 2 disponible en `develop`").
- Aviso «Completa tu ubicación»: se muestra cuando `GET /restaurants/me` trae `latitude === null`.

**Sergio:**
- La matriz de pruebas toma los nombres de los `errorCode` y los valores de `availability` del contrato, exactamente como están escritos.

---

## 14 oct 2026 · Sebastián · Rediseño de `/login` (en curso)

**Qué cambió**
- `/login` es ahora una tarjeta de vidrio sobre dos formas de marca (naranja arriba a la izquierda, petróleo abajo a la derecha), con navegación lateral **Iniciar sesión / Crear cuenta** y panel de marca. Al cambiar de pestaña, los formularios y el panel se deslizan (300 ms, `--dur-slow`); con "reducir movimiento" solo cambian. El vidrio cae a sólido sin `backdrop-filter` o con "reducir transparencia".
- La pantalla quedó partida en `features/auth/components/` (`AuthNav`, `AuthHero`, `AuthBackdrop`, `AuthLink`, `SignInForm`, `SignUpForm`) y `features/auth/auth-view.ts`. `LoginPage.tsx` solo los arma.
- Nuevas utilidades en `globals.css`: `glass-login`, `login-blob-start` y `login-blob-end`. Son solo para el login.
- **Kit:** `TextField` tiene la prop nueva `iconPosition="end"`, que pone el ícono a la derecha (lo usa el correo del login). Por defecto sigue a la izquierda, así que no cambia ninguna pantalla. Con `type="password"` se ignora, porque ese lado es del botón del ojo.

**Para quién**
- **Jacobo:** `useAuth()` trae dos funciones nuevas: `signUp(email, password)` (crea la cuenta en Firebase y envía el correo de verificación) y `sendPasswordReset(email)` (no dice si la cuenta existe). Los textos de error del registro están en `getFirebaseSignUpErrorMessage`. La lógica de iniciar sesión es la misma que tenías, solo se movió a `SignInForm`.
- **Todos los que mockean `AuthContextValue` en pruebas:** agreguen `signUp` y `sendPasswordReset` (ya lo hice en `router.test.tsx` y `RestaurantStatus.layout.test.tsx`).
- **Equipo:** "Crear cuenta" abre el registro público, y el reparto del Sprint 1 decía "No hay registro público". Hay que confirmarlo antes de subirlo a `main`. Si no se aprueba, se quita la pestaña sin tocar el resto.

**Rama / PR**
- `feat/sprint1-pantalla-login` → `develop` (PR #35, mergeado).
- Ajustes: `feat/sprint1-ajustes-login` → `develop` (símbolo del logo más grande, ícono del correo a la derecha y enlaces en naranja suave sin subrayado).

**Pendiente**
- Imagen del panel de marca (por ahora `--grad-petrol`) y el documento de "Términos y condiciones" (por ahora es solo texto).

---

## 9 oct 2026 · Santiago · PBI 3 · Registro del restaurante (`/onboarding`)

**Qué quedó listo**
- `/onboarding` ya no es un placeholder: "Configura tu restaurante" con tres tarjetas, **Tu restaurante** (Nombre, Categoría), **Ubicación** (Dirección) y **Horarios** (`HoursEditor`), y el primario "Guardar y continuar".
- Integrado con `POST /v1/restaurants`: "Guardando…", toast "Cambios guardados" y paso a `/mesas`. Si el usuario ya tiene restaurante (`409`), toast "Ya registraste tu restaurante. Para cambiar sus datos, entra a Restaurante." y también a `/mesas`. Los errores (`400`, `401`, `403`, red, `500`) se muestran con textos de la web en un `Alert`, sin perder lo escrito; el texto del backend nunca se muestra.
- Validaciones iguales a las del backend, en un solo archivo: `src/features/restaurant/restaurant-form.ts`. Detalle en el `CLAUDE.md` ("Registro del restaurante").
- **Decisión (Santiago):** los 7 días empiezan en Cerrado; al abrir un día trae **12:00 p. m. – 9:00 p. m.**, que la persona cambia (`SUGGESTED_HOURS`).

**Para quién**
- **Jacobo (`/restaurante`):** usa el mismo formulario, sin duplicarlo: `RestaurantForm` + `toRestaurantFormValues(restaurante)` + `useRestaurantQuery()` (`GET /v1/restaurants/me`, query key `restaurantQueryKey`), con `submitLabel="Guardar cambios"`, `onCancel` y `onDirtyChange` para "¿Salir sin guardar?". Ejemplo en el comentario de `RestaurantForm.tsx` y en `RestaurantForm.test.tsx`. Para errores del `PATCH`, `describeRestaurantSaveError` ya traduce `400`, `401`, `403` y red. **Los horarios todavía no se editan en el backend** (`PATCH` sin `schedules`): decide si en la edición van deshabilitados u ocultos; si necesitas una prop para eso, la agregamos.
- **Jacobo y Sebastián:** en `/onboarding` no hay forma de cerrar sesión (el topbar es "solo con logo", manual 12.4), así que quien entra con la cuenta equivocada y no tiene restaurante queda atrapado. ¿Agregamos un "Cerrar sesión" en el topbar del onboarding?
- **Sebastián (kit), dos cosas que no toqué:**
  - a 390 px el `HoursEditor` corta las horas ("12:0…") y, con "(día siguiente)", solo deja ver el reloj y la flecha;
  - el manual (10) pide en móvil las acciones del formulario "a lo ancho y fijas abajo"; hoy van a lo ancho al final, porque el kit no tiene una pieza para eso.
- **Sergio y Sebastián:** leo `tablesQueryKey` y `restaurantStatusQueryKey` sin modificarlos, para refrescar mesas y estado después del registro. Si los renombran, avísenme.

**Rama / PR**
- `feat/sprint1-formulario-registro` → `develop`.

**Pendiente**
- Probar el recorrido en el ambiente desplegado (Vercel + Render) con el usuario de onboarding y el login real, después de reiniciarlo en Neon.

---

## 9 oct 2026 · Sergio · PBI 9 · Pantalla de bitácora (`/bitacora`)

**Qué quedó listo**
- `/bitacora` ya no es un placeholder: `PageHeader`, filtro **Mesa** ("Todas las mesas" + cada mesa, inactivas incluidas) y `DataTable` con **Fecha y hora · Mesa · Cambio · Usuario**, más reciente primero. En menos de 768 px se ve como la lista compacta del kit.
- Cambio con los mismos chips de mesas, incluido **Inactiva** (desactivar y reactivar). El lector de pantalla oye "Disponible a Ocupada".
- Estados: skeleton (después de 300 ms), vacío ("Aún no hay cambios"; con una mesa filtrada, "Mesa 04 todavía no tiene cambios de estado.") y error ("No pudimos cargar la bitácora" + "Intentar de nuevo"; sesión o permiso con el texto de `getApiErrorMessage`, sin botón). Con 200 filas, aviso de que se ven los 200 más recientes.
- Consume `GET /v1/table-logs` (`?tableId=` al filtrar) y la vuelve a pedir cada vez que se abre la pantalla (`refetchOnMount: 'always'`). Detalle en el `CLAUDE.md` ("Bitácora de mesas").
- Mock con datos fijos: `/bitacora?mockError=table-logs-load`, `?mockTableLogsFull`, `?mockEmpty`, `?mockLatency=`.

**Para quién**
- **Sebastián:** uso sin modificarlos `useTablesQuery`, `sortTables` y `toTableDisplayStatus` de `features/tables`, y el mock de mesas en las pruebas. Si los renombras, avísame. No toqué el kit.
- **Sebastián, en tu `src/lib/api-client.ts`:** agregué `isAccessError(error)` junto a `getApiErrorMessage`. Responde `true` para un `401` o un `403`: en esos casos va el texto de `getApiErrorMessage`, sin "Intentar de nuevo". La usan la bitácora y el estado del restaurante. En mesas (`use-table-status-change.ts`, `use-table-activation.ts`) sigue el mismo chequeo escrito a mano; si quieres, puedes cambiarlo por esta función.
- **Jacobo:** `403 RESTAURANT_REQUIRED` en la bitácora emite el mismo evento que el resto; tu `AuthEventHandler` lleva a `/onboarding`. No hice nada propio.
- **Elizabeth (demo):** la bitácora se prueba con el backend real; el mock no refleja los cambios hechos en `/mesas`.

**Rama / PR**
- `feat/sprint1-pantalla-bitacora` → `develop`.

**Pendiente**
- Verificar en el ambiente desplegado (Render + Vercel, con login real) que cada cambio de estado, desactivación y reactivación aparece en la bitácora (PBI 9.4).

---

## 8 oct 2026 · Sergio · PBI 8 · Variante de estado del `Switch` (kit)

**Qué quedó listo**
- **`Switch` tiene dos props opcionales nuevas: `onStatus` y `offStatus`** (tipo `Status` de `STATUS_META`). Dibujan la forma del estado antes de la palabra, en el color de su tono: `'open'` = punto que pulsa en `ok`, `'closed'` = raya en `inactive` (manual 3.3: color + forma + palabra).
  ```tsx
  <Switch label="Estado del restaurante" checked={isOpen} onCheckedChange={setOpen}
          onLabel="Abierto" offLabel="Cerrado" onStatus="open" offStatus="closed" />
  ```
- La forma es decorativa: el nombre accesible sigue siendo "Estado del restaurante Abierto". El pulso se detiene con "reducir movimiento" y con `disabled` la forma se atenúa con el resto del control.
- **Sin esas props el `Switch` queda idéntico** (mismo DOM): `HoursEditor` y los ejemplos de `/kit` no cambian. En `/kit` hay un ejemplo nuevo, "Topbar · con forma de estado". Props en `src/components/ui/README.md`.
- El switch del topbar ya la usa: se cerró el `TODO(Sergio)` de `RestaurantStatusControl.tsx`.

**Para quién**
- **Sebastián:** la variante está en tu kit (`Switch.tsx`, `Switch.test.tsx`, README y `/kit`), con tu aprobación; revisas el PR. **Mi dependencia del PR #21 (la forma del estado en el switch) queda cerrada.**
- **Jacobo:** revisé el topbar con tu login. `statusSlot` y `banner` siguen funcionando dentro de `DashboardLayout` con la sesión (prueba nueva `RestaurantStatus.layout.test.tsx`). De los tres riesgos que te anoté el 7 oct, los tres quedaron resueltos con tu PR #23:
  - el token espera a `authStateReady()`;
  - `signOut()` limpia la caché;
  - un `RESTAURANT_REQUIRED_EVENT` repetido no causa problemas: `AuthEventHandler` limpia el evento y solo navega si no está ya en `/onboarding`. Falta una prueba con el evento repetido, si quieres agregarla.
- **Todos:** después de este pull, agrega `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN` y `VITE_FIREBASE_PROJECT_ID` a tu `.env.local` (están en `.env.example`). Sin ellas la app, incluida `/kit`, queda en blanco con `auth/invalid-api-key`.

**Rama / PR**
- `feat/sprint1-switch-estado` → `develop`.

**Pendiente**
- PBI 8.4: probar en el ambiente desplegado que el estado persiste al volver a entrar, ahora que existe el login.

---

## 8 oct 2026 · Jacobo · PBI 2 · Sesión Firebase (paso 1/3)

- Se añadió `firebase@13.0.0` y el `AuthProvider` modular con `useAuth`: usuario, carga inicial, correo verificado, inicio/cierre de sesión, eventos de auth y token ID para `api-client`.
- `signOut()` limpia la caché de TanStack Query. `authStateReady()` evita que el token provider responda antes de que Firebase resuelva la sesión inicial.
- Configuración web pública requerida: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN` y `VITE_FIREBASE_PROJECT_ID`; están documentadas como ejemplos en `.env.example` y tipadas en `src/vite-env.d.ts`. No son secretos.
- Este paso no incluye pantalla de login, guarda de rutas, redirecciones ni navegación al expirar la sesión; quedan para los pasos siguientes del PBI.
- Avisar en el PR: nueva dependencia `firebase` y tres variables `VITE_FIREBASE_*` requeridas en local/Vercel.

---

## 7 oct 2026 · Sergio · PBI 8 · Switch Abierto/Cerrado e integración del cambio de estado

**Qué quedó listo**
- En el topbar está el switch **"Estado del restaurante"**, con la palabra Abierto / Cerrado siempre visible. Debajo de 640 px el nombre "Estado del restaurante" queda solo para lectores de pantalla.
- Cuando el restaurante está cerrado, arriba del contenido aparece el aviso *"Tu restaurante está cerrado. Los comensales no lo ven en DiNNo."* con **"Abrir ahora"**.
- **Cerrar sin mesas reservadas:** cierra de una vez y muestra el toast con "Deshacer".
- **Cerrar con mesas reservadas:** pide confirmación ("¿Cerrar el restaurante?"). Si no se pudieron contar las mesas, también la pide.
- **Abrir:** abre de una vez, con el toast *"Restaurante abierto. Los comensales ya lo ven"*.
- **Si falla:** el estado vuelve atrás y arriba aparece un `Alert` de error con "Intentar de nuevo".
- Mientras guarda, no se puede volver a pulsar.
- Mientras el backend no esté desplegado, funciona con `VITE_USE_MOCKS=true`. Parámetros: `?mockClosed`, `?mockError=restaurant-status-load` o `restaurant-status-save`, y `?mockEmpty` para no tener reservadas.
- Lo que se reutiliza está en `CLAUDE.md` (sección 11, "Estado del restaurante").

**Para quién**
- **Sebastián:**
  - Falta la **variante de estado del `Switch`** (punto con pulso para Abierto y raya para Cerrado, manual 3.3). Hoy uso el `Switch` tal cual, con un `TODO(Sergio)` en `RestaurantStatusControl.tsx`. El PR depende de ese ajuste.
  - Revisa también el label con `sr-only sm:not-sr-only`, que es para que quepa a 390 px.
  - Leo `useTablesQuery` y `countTables` de `features/tables` sin modificarlos. Si los renombras, avísame.
- **Jacobo, tres riesgos con la sesión real:**
  1. **Layout antes del token:** el `DashboardLayout` debe mostrarse solo cuando el token de Firebase esté listo. Si no, `GET /restaurants/me/status` (y `/tables`) responden 401, se emite `SESSION_EXPIRED_EVENT` y el usuario puede terminar mandado al login en bucle.
  2. **Limpiar la caché al cerrar sesión:** llama a `queryClient.clear()` al cerrar sesión. Si no, el siguiente usuario ve por un momento el estado y las mesas del anterior.
  3. **`RESTAURANT_REQUIRED` repetido:** sin restaurante, el estado y las mesas emiten `RESTAURANT_REQUIRED_EVENT` casi al mismo tiempo. Tu redirección a `/onboarding` debe soportar recibirlo varias veces.
  - En `layouts.tsx` solo cambié `statusSlot`, `banner` y dos imports. Tus `TODO(Jacobo)` siguen igual.
- **Todos:** para leer el estado en otra pantalla, usa `useRestaurantStatusQuery()`. No llames al endpoint por tu cuenta.

**Rama / PR**
- `feat/sprint1-estado-restaurante-web` → `develop`.
- Depende del backend `feat/sprint1-estado-restaurante-backend`, que no se ha mergeado, y del ajuste del `Switch` en el kit.

**Pendiente**
- **8.4 · Probar persistencia:** se prueba cuando el backend esté desplegado.
- **Sprint 2, posible extracción:** el cambio optimista + "Deshacer" + vuelta atrás existe en mesas (`use-table-status-change.ts`) y en el estado del restaurante. Por ahora no se comparte código, solo el patrón (`useToast` con `action` y `getApiErrorMessage`). Si aparece un tercer caso, se puede extraer un hook común en `src/lib/`, con Sebastián.
- **Documentación desactualizada** (la reporto, no la corrijo):
  - `CLAUDE.md` dice que toda llamada pasa por `src/lib/api.ts`, pero en la práctica es `apiRequest` de `src/lib/api-client.ts`;
  - la sección 8 de `CLAUDE.md` sigue diciendo que Firebase está "pendiente de confirmar";
  - `AGENTS.md` dice que no hay router ni convención de carpetas.

---

## 7 oct 2026 · Sesión con Firebase y nombre "Mesa" (Sebastián)

- **Jacobo, sobre tu PR de login con Firebase (backend #18):** acepto tu propuesta del `errorCode` **`EMAIL_NOT_VERIFIED`**.
  - **Backend:** el `401` del correo sin verificar va con `new UnauthorizedException('Verifica tu correo para continuar.', { errorCode: 'EMAIL_NOT_VERIFIED' })`; agrégalo al `enum` de `errorCode` en `ErrorResponseDto`. Los demás `401` (sin token, token inválido o vencido) siguen sin `errorCode`, con "Tu sesión terminó. Inicia sesión de nuevo.".
  - **Web, ya listo en `@/lib/api-client`:**
    - ese `401` emite `EMAIL_NOT_VERIFIED_EVENT` (`'dinno:email-not-verified'`) en vez de `SESSION_EXPIRED_EVENT`, y `getApiErrorMessage()` devuelve "Verifica tu correo para continuar.";
    - los demás `401` siguen emitiendo `SESSION_EXPIRED_EVENT`;
    - el token se conecta con `setAuthTokenProvider(() => auth.currentUser?.getIdToken() ?? null)`.
- **"Mesa" sola:** si el identificador es solo "Mesa", ahora se muestra "Mesa" (no "Mesa Mesa"), igual que en el backend.

---

## 6 oct 2026 · Horario "Abierto 24 horas" en el HoursEditor (Sebastián)

- **Santiago y Jacobo:** el `HoursEditor` ya soporta el `is_open_24h` del esquema de Santiago.
  - **Uso:** "Abierto 24 horas" es la **primera opción del selector de apertura** de cada día. Al elegirla desaparece el selector de cierre y no se muestra "(día siguiente)". Al elegir una hora, el día vuelve a tener apertura y cierre, con las horas anteriores. "Copiar a todos los días" también copia el 24 horas.
  - **Tipo:** `DayHours` tiene un campo nuevo y **obligatorio**:
    ```ts
    type DayHours = { day: DayOfWeek; isOpen: boolean; isOpen24h: boolean; opensAt: string; closesAt: string } // 'HH:mm'
    ```
  - **Correspondencia con `restaurant_schedules`** (una fila por día abierto):
    - `isOpen: false` → sin fila;
    - `isOpen24h: true` → `is_open_24h = true`, sin horas;
    - si no → `opens_at` y `closes_at`;
    - `day`: `mon`…`sun` = `day_of_week` 1…7.
  - **Validación:** no aceptes apertura igual a cierre en un día que no es de 24 horas. El backend la rechaza (`CHK_restaurant_schedules_hours`); muéstrala con `errors={{ mon: '…' }}`.

---

## 5 oct 2026 · Mesas conectadas al backend real (Sebastián)

- **La pantalla `/mesas` ya funciona contra el backend de Elizabeth:** listar, crear y cambiar estado. Editar, desactivar y reactivar llegan con el backend del PBI 7 (Sebastián).
- **Para usarlo en local:**
  1. Corre el backend con `DEV_USER_ENABLED=true` en su `.env`.
  2. En tu `.env.local` del front pon `VITE_USE_MOCKS=false` y `VITE_API_URL=http://localhost:3000`.
  3. Abre el front en el puerto **5173**: es el único que el backend acepta por CORS por defecto.
- **Errores del backend:**
  - formato: `{ statusCode, message, error, errorCode? }`;
  - el front lee `errorCode` en `ApiError.code`;
  - en mesas, cada ruta tiene una sola causa por código HTTP, así que el front distingue por el código HTTP (409 al crear = repetido; al cambiar estado = mesa inactiva). **El `message` del backend nunca se muestra**: la interfaz usa los textos del manual.
- **Jacobo:** cuando el backend responde 403 con `errorCode: RESTAURANT_REQUIRED` (usuario sin restaurante), `@/lib/api-client` emite el evento `RESTAURANT_REQUIRED_EVENT` (`'dinno:restaurant-required'`) en `window`. Escúchalo junto con `SESSION_EXPIRED_EVENT` para mandar al usuario a `/onboarding`.
- **Identificador de la mesa (decisión de Sebastián, aplicada en backend y web):**
  - El campo se llama **"Identificador"**, como dice el manual en 12.4. Es corto ("04", "T1") y se muestra como **Mesa 04** (14.1).
  - "4", "04" y "Mesa 4" son la misma mesa, con máximo 10 caracteres, en los dos lados.
  - Las mesas del seed ("Mesa 1"…) se muestran como Mesa 01….
  - El backend usa los mismos textos de error que la web.
- `Table` en el front ya no tiene `updatedAt` (el backend no lo envía).

---

## 5 oct 2026 · Editar, desactivar y reactivar mesas (Sebastián)

- **Menú ⋯ de cada mesa** (tarjeta y barra de estado):
  - mesa activa: **Editar · Desactivar**;
  - mesa inactiva: **Editar · Reactivar**.
- **Desactivar** pide confirmación y ofrece "Deshacer". **Reactivar** no pide confirmación. Una mesa inactiva deja de contar en libres, reservadas y ocupadas.
- **Kit:**
  - `DropdownMenu` y `Select` ahora tienen borde (en oscuro la sombra casi no se ve; manual 3.6);
  - un diálogo abierto desde un ítem del menú ⋯ devuelve el foco al ⋯ al cerrarse.
- **Elizabeth y Sergio (backend de PBI 7):** el front llama `PATCH /tables/:id` con `{ identifier?, capacity? }` (solo los campos que cambiaron), `POST /tables/:id/deactivate` y `POST /tables/:id/reactivate`. Las tres responden la mesa.
  - Errores esperados: `TABLE_IDENTIFIER_TAKEN`, `TABLE_ALREADY_INACTIVE` y `TABLE_ALREADY_ACTIVE` (409).
  - **Pendiente de confirmar:** una mesa reactivada vuelve como **Disponible** (así está en el mock).
  - Desactivar y reactivar deben quedar en la bitácora como `inactive` (PBI 9).

---

## 5 oct 2026 · Crear mesa y cambiar estado (Sebastián)

- **Estados de mesa en minúscula**, igual que la columna `tables.status` del backend: `'available' | 'reserved' | 'occupied'`. Una mesa desactivada se muestra como `inactive`.
  - **Sergio:** `toTableDisplayStatus()` acepta mayúsculas o minúsculas (`'occupied'`, `'OCCUPIED'`, `'inactive'`). Úsala para los chips de la bitácora.
- **Nuevos en el kit:**
  - `FloatingBar`: barra fija abajo del contenido; los toasts suben para no taparla.
  - `DialogFooter`: acciones de un diálogo cuando van dentro de tu propio `<form>`, para que Enter envíe. Santiago y Jacobo pueden usarlo en sus formularios en diálogo.
- **`SegmentedControl`** es un poco más compacto en pantallas de menos de 640 px, para que quepa a 360 px.
- **Elizabeth, para alinear el contrato de mesas:**
  - **Largo del identificador:** el front limita a **10 caracteres** ("Usa máximo 10 caracteres"); la columna admite 50. ¿Validas 10 en el DTO?
  - **Repetidos:** el front considera iguales "4" y "04" (los dos se ven como "Mesa 04"). El índice único del backend compara `lower(trim(identifier))`, así que los aceptaría como distintos. ¿Normalizas los numéricos o lo dejamos solo en el front?
  - **Lo que espera el front:**
    - `POST /tables` responde `201` con la mesa;
    - `PATCH /tables/:id/status` con `{ status }` responde la mesa;
    - los errores llevan `code` (`TABLE_IDENTIFIER_TAKEN` = 409, `TABLE_INACTIVE` = 409).

---

## 4 oct 2026 · Kit visual completo, AppShell, router y pantalla de mesas (Sebastián)

### 1. Después de hacer `git pull`

- Corre **`npm install`**. Entraron dependencias nuevas: `lucide-react`, `@fontsource/plus-jakarta-sans`, `radix-ui`, `clsx`, `tailwind-merge`, `@tanstack/react-query`, `react-router`, y Vitest + Testing Library para las pruebas.
- Hay alias **`@/` → `src/`**: `import { Button } from '@/components/ui'`.
- Hay scripts nuevos:
  - `npm test`: pruebas.
  - `npm run typecheck`: revisa los tipos.
  - `npm run check:ui`: revisa las reglas del manual. Antes de pedir revisión de un PR, tiene que decir "sin problemas".

### 2. Cómo armar tu pantalla

1. Abre **http://localhost:5173/kit** con `npm run dev`. Ahí está cada componente con sus estados, en claro y oscuro.
2. Lee **`src/components/ui/README.md`**: props y ejemplos de cada componente.
3. Usa solo `@/components/ui`. **No crees botones, campos, tarjetas, colores, sombras ni estilos propios.** Nada de `bg-white`, `text-gray-…`, `rounded-lg`, `bg-[#…]` ni `text-[13px]`: `check:ui` los detecta.
4. Tu pantalla ya está dentro del `AppShell` (sidebar + topbar). **Solo renderiza su contenido**, empezando por `<PageHeader title="…" description="…" />`. Mira `src/features/tables/TablesPage.tsx` como referencia de estructura y de los estados de carga, vacío y error.

Componentes disponibles:
- **Acciones y campos:** `Button`, `IconButton`, `TextField`, `Select`, `TimeSelect`, `NumberStepper`, `Switch`, `HoursEditor`, `SegmentedControl`.
- **Estados y datos:** `StatusChip`, `Card`, `StatTile`, `TableCard`, `DataTable`, `PageHeader`.
- **Avisos y carga:** `Alert`, `useToast`, `Dialog`, `ConfirmDialog`, `DropdownMenu`, `EmptyState`, `Skeleton`, `Spinner`, `Logo`.

Utilidades compartidas:
- **Formatos:** `@/lib/format` → `formatTime12h` ("7:30 p. m."), `formatDate` ("30 sept 2026"), `formatDateTime` ("30 sept · 7:30 p. m."), `formatCapacity` ("4 personas"), `formatTableName` ("Mesa 04").
- **Skeletons:** `useDelayedFlag(isLoading)` (`@/lib/use-delayed-flag`) evita mostrarlos en cargas de menos de 300 ms.
- **Estados:** sus nombres, colores y formas salen **solo** de `STATUS_META` (`@/components/ui`).

### 3. Rutas: cada uno reemplaza su placeholder

Las rutas están en `src/app/router.tsx`. Cada placeholder vive en la carpeta de su dueño, así que nadie choca con nadie:

| Ruta | Archivo | Dueño |
|---|---|---|
| `/login` | `src/features/auth/LoginPage.tsx` (sin AppShell) | Jacobo |
| `/onboarding` | `src/features/restaurant/OnboardingPage.tsx` (ya va dentro de `OnboardingShell`) | Santiago |
| `/restaurante` | `src/features/restaurant/RestaurantPage.tsx` | Jacobo |
| `/bitacora` | `src/features/activity-log/ActivityLogPage.tsx` | Sergio |
| `/mesas` | `src/features/tables/TablesPage.tsx` | Sebastián |

`/` y cualquier ruta desconocida van a `/mesas`. `/kit` solo existe con `npm run dev`.

### 4. Para cada uno

**Jacobo**
- **Datos de sesión:** los datos de ejemplo ("Casa 72" · "admin@casa72.co") y `onSignOut` están en un solo lugar, `src/app/layouts.tsx`, con `TODO(Jacobo)`.
- **Guarda de rutas:** va donde está el `TODO(Jacobo)` de `src/app/router.tsx`.
- **Token de Firebase:** pásalo con `setAuthTokenProvider(() => token)` de `@/lib/api-client`. Todas las llamadas lo envían como `Authorization: Bearer`.
- **Sesión vencida:** cuando el backend responde 401, se emite el evento `SESSION_EXPIRED_EVENT` (`'dinno:session-expired'`) en `window`. Escúchalo para mandar al login.

**Santiago**
- Para el formulario tienes `TextField`, `Select`, `TimeSelect` (valor `"HH:mm"`, se muestra "7:30 p. m."), `Switch` y `HoursEditor`.
- **Formato propuesto del horario. Confírmalo con Sebastián, porque el modelo del restaurante es tuyo:**
  ```ts
  type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
  type DayHours = { day: DayOfWeek; isOpen: boolean; opensAt: string; closesAt: string } // 'HH:mm'
  type WeeklyHours = DayHours[]
  ```
- Tus validaciones por día se muestran con `errors={{ sat: 'Mensaje' }}`.

**Sergio**
- **Topbar:** el switch Abierto/Cerrado va en `statusSlot`, en `src/app/layouts.tsx` (`TODO(Sergio)`). Usa `<Switch label="Estado del restaurante" onLabel="Abierto" offLabel="Cerrado" />`.
- **Aviso de cerrado:** va en `banner`, en el mismo archivo. Usa `<Alert type="info" action={<Button size="sm" variant="secondary">Abrir ahora</Button>}>…</Alert>`.
- **Confirmar al cerrar con reservas:** `ConfirmDialog`.
- **Bitácora:**
  - Tabla: `DataTable` (en el README hay un ejemplo con columnas).
  - Filtro "Todas las mesas": `Select`.
  - Fechas: `formatDateTime`.
  - Chips: `<StatusChip status={…} />`. Convierte los códigos del backend con `toTableDisplayStatus('occupied' | 'inactive' | …)` de `@/features/tables/table-status`, para que los estados se vean igual que en mesas.
- Tu carpeta para el estado del restaurante es `src/features/restaurant-status/`.

**Elizabeth**
- El contrato que asume el front para mesas está en `src/features/tables/types.ts` y `src/features/tables/api.ts`:
  - rutas `GET/POST /tables`, `PATCH /tables/:id/status`, `PATCH /tables/:id`, `POST /tables/:id/deactivate` y `POST /tables/:id/reactivate`;
  - errores `{ statusCode, code, message, fields? }` con los códigos `TABLE_IDENTIFIER_TAKEN`, `TABLE_INACTIVE`, `TABLE_ALREADY_INACTIVE` y `TABLE_ALREADY_ACTIVE`.
- **Por confirmar con Sebastián:**
  - largo máximo del identificador (propuesta: 10);
  - si una mesa reactivada vuelve como Disponible.
- El front nunca envía `restaurantId`.

### 5. Variable nueva: `VITE_USE_MOCKS`

- `VITE_USE_MOCKS=true` en tu `.env.local` usa datos de ejemplo de mesas, sin backend. Con cualquier otro valor, o sin la variable, usa el backend real.
- **No se configura en Vercel.**
- Para probar estados de la pantalla de mesas:
  - `/mesas?mockEmpty`: sin mesas;
  - `/mesas?mockError=list`: error de carga;
  - `/mesas?mockLatency=3000`: carga lenta.
