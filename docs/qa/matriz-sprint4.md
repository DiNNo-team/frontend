# Matriz de pruebas · Sprint 4

| | |
|---|---|
| **Sprint** | Sprint 4 · Despliegue final, seguridad y estabilización |
| **Objetivo** | DiNNo completo, desplegado en Azure y listo para presentarse: la IA funciona de punta a punta (con respaldo si falla), las notificaciones llegan, el estado de cuenta cobra bien, la API es segura y todo responde desde cualquier red (la presentación es desde la universidad) (`DiNNo_Sprint4_Reparto.md`, sección 1). |
| **Ambiente** | **Azure**: backend en Container Apps, PostgreSQL Flexible Server y Redis · web en Azure Static Web Apps (mientras no esté activa, Vercel) · app como development build o APK apuntando al backend de Azure. Algunos casos se marcan **solo local** porque en Azure no se pueden forzar sin tocar la configuración. ⚠️ [#1](#10-por-confirmar) |
| **Fecha** | Matriz creada el 17 nov 2026 con el formato de [`matriz-sprint3.md`](matriz-sprint3.md). Código terminado: martes o miércoles · pruebas en Azure: jueves o viernes · ensayo: viernes · presentación: sábado (Reparto, «Fechas clave») |
| **Responsables** | Santiago: la matriz, N, IA y F · Sergio: IW y E · Jacobo: H, C, R, L y S · Elizabeth y Sebastián: D, la revisión final (Reparto, sección 4) |
| **Fuente de los resultados esperados** | `DiNNo_Sprint4_Reparto.md` (secciones 1, 2, 4 y 5) y el `CLAUDE.md` del backend: §12.12 (cobro y resumen), §12.13 (notificaciones), §12.14 (límite de peticiones) y §12.16 (informe de IA). El diseño de la IA está en `backend/docs/ia-diseno.md`. Lo que no está definido está marcado ⚠️ y listado en la [sección 10](#10-por-confirmar). |

> [!WARNING]
> **Capturas sin secretos.** Ninguna captura ni video puede mostrar tokens (el campo *Authorize* de Swagger, una cabecera `Authorization`), llaves (Maps, Firebase, **la del modelo de IA**), contraseñas, cadenas de conexión ni datos del portal de Azure con secretos (Key Vault, variables del Container App). Si aparece uno, recorta la imagen o vuelve a tomarla antes de subirla.
>
> **El código de una reserva activa tampoco se publica.** Si una captura de la app lo muestra, que sea de una reserva que ya terminó.

> [!IMPORTANT]
> **Créditos de Azure (Reparto, 2.1).** Prueba con todo encendido solo el tiempo necesario, con **una réplica** (salvo los casos que piden 2, y se vuelve a 1 apenas terminan). Al terminar tu día, revisa que nada quedó encendido o avisa a Jacobo.

**Cómo llenar la matriz**
- Cada quien llena **solo las filas de sus casos**.
- **Estado:** `Pendiente` · `Pasa en local` · `Pasa` (en Azure) · `Falla` · `Bloqueado (motivo)` · `⚠️ Por confirmar (#n)` · `Automática` (la cubre una prueba automática del repo; en **Evidencia** va el nombre de la prueba).
- **Resultado obtenido:** lo que viste, en una línea. Si falla, crea el Bug en Azure con el [formato de hallazgos](#9-formato-para-reportar-hallazgos) y pega el enlace en **Bug**.
- **Evidencia:** nombre del archivo en [`evidencias/img/`](evidencias/README.md), **con el prefijo `s4-`**, por ejemplo `s4-IA1.1-pasa.png`.
- **Cuándo probar:** apenas algo llega a `develop` y a Azure, no solo al final. Después de cada corrección se repiten los casos afectados.

## Índice

1. [Preparación del ambiente](#1-preparación-del-ambiente)
2. [Tabla resumen](#2-tabla-resumen)
3. [Casos de Santiago](#3-casos-de-santiago): N · IA · F
4. [Casos de Sergio](#4-casos-de-sergio): IW · E
5. [Casos de Jacobo](#5-casos-de-jacobo): H · C · R · L · S
6. [Revisión final (Elizabeth y Sebastián)](#6-revisión-final-elizabeth-y-sebastián): D
7. [Datos para la IA](#7-datos-para-la-ia)
8. [Matriz final](#8-matriz-final)
9. [Formato para reportar hallazgos](#9-formato-para-reportar-hallazgos)
10. [Por confirmar ⚠️](#10-por-confirmar)

---

## 1. Preparación del ambiente

### 1.1 Encender y comprobar el backend
1. Pide a Jacobo que encienda el backend (una réplica) y la base de datos, o síguelo con su procedimiento de encendido y apagado.
2. Abre `https://<URL del backend en Azure>/v1/health` ⚠️ [#1](#10-por-confirmar). Debe responder `{ "status": "ok", "commit": "…" }`. Anota el `commit` en tus hallazgos.
3. Al terminar, avisa en el grupo para que se apague.

### 1.2 Cuentas de prueba
Las credenciales van en Discord (#usuarios-comensal y #usuarios-restaurante), nunca en esta matriz, en el repo ni en una captura.

| Cuenta | Para qué |
|---|---|
| Comensal A: `dinnoteam2026+comensal@gmail.com` | Casos de la app |
| Comensales B a E | Concurrencia (C1) y casos con dos comensales ⚠️ [#5](#10-por-confirmar) |
| Dueño de Casa 72 (web): `dinnoteam2026+casa72@gmail.com` | Check-in, reservas, mesas, estado de cuenta, IA |
| Dueño de Casa16 (web): `dinnoteam2026@gmail.com` | «Otro restaurante» en IA y E |
| Restaurante pendiente o rechazado | Casos de aprobación (IA7.3, E7.2) |
| Administrador de DiNNo (`platform_admin`) | H11 y roles |

### 1.3 App contra Azure
- Development build o APK con `EXPO_PUBLIC_USE_MOCKS=false` y `EXPO_PUBLIC_API_URL=<URL del backend en Azure>`.
- Notificaciones push: **solo Android** (en iOS solo hay recordatorio local, §12.13). Acepta el permiso de notificaciones al abrir la app.
- Comandos útiles del Sprint 3 (`adb`, modo avión, red lenta, ubicación) en [`matriz-sprint3.md`](matriz-sprint3.md), sección 1.9.

### 1.4 Vigencia corta para los vencimientos
Los casos de vencimiento (N1.3, N2.4, H7, F3, E3) necesitan `RESERVATION_TTL_MINUTES=3`. En Azure lo cambia **solo Jacobo** (crea una revisión nueva del Container App) y lo devuelve a 15 al terminar ⚠️ [#4](#10-por-confirmar). En local, pon 2 o 3 en tu `.env`.

### 1.5 Swagger
`https://<URL del backend en Azure>/docs`, con *Authorize* y el token de la cuenta. **Nunca captures el token.**

---

## 2. Tabla resumen

Actualiza los conteos al terminar cada caso.

| Caso | Nombre | Responsable | Variantes | Pasa | Pasa en local | Automática | Falla | Pendiente | Bloqueado | ⚠️ |
|---|---|---|---|---|---|---|---|---|---|---|
| [N](#n--notificaciones-task-114) | Notificaciones | Santiago | 9 | 0 | 0 | 0 | 0 | 9 | 0 | 0 |
| [IA](#ia--informe-de-ia-api-tasks-211-213-214) | Informe de IA (API) | Santiago | 17 | 0 | 0 | 2 | 0 | 15 | 0 | 0 |
| [F](#f--flujos-completos-con-web-y-app-abiertas) | Flujos completos | Santiago | 6 | 0 | 0 | 0 | 0 | 6 | 0 | 0 |
| [IW](#iw--informe-de-ia-pantalla-task-212) | Informe de IA (pantalla) | Sergio | 10 | 0 | 0 | 0 | 0 | 9 | 0 | 1 |
| [E](#e--estado-de-cuenta-task-124) | Estado de cuenta | Sergio | 9 | 0 | 0 | 0 | 0 | 9 | 0 | 0 |
| [H](#h--humo-y-regresión-en-azure-task-711) | Humo y regresión | Jacobo | 12 | 0 | 0 | 0 | 0 | 12 | 0 | 0 |
| [C](#c--concurrencia-y-fallos-tasks-712-713) | Concurrencia y fallos | Jacobo | 6 | 0 | 0 | 0 | 0 | 5 | 0 | 1 |
| [R](#r--red-desde-distintos-lugares) | Red | Jacobo | 4 | 0 | 0 | 0 | 0 | 4 | 0 | 0 |
| [L](#l--carga-y-capacidad) | Carga | Jacobo | 2 | 0 | 0 | 0 | 0 | 2 | 0 | 0 |
| [S](#s--seguridad-task-616) | Seguridad | Jacobo | 9 | 0 | 0 | 0 | 0 | 9 | 0 | 0 |
| [D](#6-revisión-final-elizabeth-y-sebastián) | Revisión final | Elizabeth y Sebastián | 9 | 0 | 0 | 0 | 0 | 9 | 0 | 0 |
| **Total** | | | **93** | **0** | **0** | **2** | **0** | **89** | **0** | **2** |

---

## 3. Casos de Santiago

### N · Notificaciones (Task 1.1.4)
**Responsable:** Santiago · **Precondiciones comunes:** app en un teléfono o emulador **Android** con el permiso de notificaciones aceptado · comensal A con sesión iniciada · backend con la cuenta de servicio de Firebase configurada (`FIREBASE_SERVICE_ACCOUNT_JSON`) · web abierta como Casa 72 para el check-in. Contrato: §12.13.
**Regla de todos los casos:** **ningún texto de notificación lleva el código de la reserva.**

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| N1.1 | Crear | Sin reserva activa | 1. Reserva 2 personas en Casa 72.<br>2. Pon la app en segundo plano y mira la barra de notificaciones. | **Una** notificación «Mesa reservada en …», sin el código. Al tocarla, la app abre la reserva | | Pendiente | | |
| N1.2 | Cancelar | Reserva activa | 1. Cancela desde la app y sal de ella. | **Una** notificación «Cancelaste tu reserva» | | Pendiente | | |
| N1.3 | Vencer | Reserva activa, vigencia de 3 min (1.4) | 1. Deja la app en segundo plano hasta que venza. | **Una** notificación «Tu reserva se venció» | | Pendiente | | |
| N1.4 | Check-in | Reserva activa | 1. En la web, valida el código.<br>2. Mira el teléfono. | **Una** notificación «Check-in confirmado» | | Pendiente | | |
| N2.1 | Una sola vez por evento | Después de N1.1 a N1.4 | 1. Cuenta las notificaciones recibidas de cada evento. | Exactamente 1 por evento: 4 en total, ninguna repetida | | Pendiente | | |
| N2.2 | Una falla de notificación no interrumpe la reserva (**solo local**) | Backend local **sin** `FIREBASE_SERVICE_ACCOUNT_JSON` ni `_FILE` | 1. Arranca el backend.<br>2. Crea, cancela y haz check-in de una reserva. | El backend arranca con un aviso en el log («Notificaciones push desactivadas…»). Reservar, cancelar y hacer check-in funcionan igual, sin errores | | Pendiente | | |
| N2.3 | Cerrar sesión | Reserva terminada | 1. Cierra sesión en la app.<br>2. Con Swagger, crea y cancela una reserva del comensal A (otro dispositivo o token). | El teléfono ya **no** recibe notificaciones de esa cuenta (la app borra su token al cerrar sesión) | | Pendiente | | |
| N2.4 | Recordatorio local | Reserva activa, vigencia de 3 min | 1. Espera con la app en segundo plano. | «Tu reserva vence pronto» suena **1 minuto antes** del vencimiento (con vigencias de 5 minutos o menos). Si cancelas antes, no suena | | Pendiente | | |
| N2.5 | Permiso denegado | Permiso de notificaciones negado en Ajustes | 1. Reserva y cancela. | La reserva funciona normal; simplemente no llegan notificaciones | | Pendiente | | |

### IA · Informe de IA: API (Tasks 2.1.1, 2.1.3, 2.1.4)
**Responsable:** Santiago · **Ruta:** `GET /v1/restaurants/me/insights` (§12.16), en Swagger con el token del dueño de Casa 72. **Precondiciones comunes:** backend con `INSIGHTS_LLM_API_KEY` configurada ⚠️ [#3](#10-por-confirmar), salvo donde se diga otra cosa · datos de la [sección 7](#7-datos-para-la-ia).
**Reglas de todos los casos:** siempre `200` por la IA (nunca un `500` porque el modelo falle) y **ninguna consulta del informe cambia una reserva ni una mesa.**

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| IA1.1 | Datos suficientes | Casa 72 con 10 o más reservas resueltas en los últimos 7 días (sección 7) | 1. `GET /insights?refresh=true`. | `dataSufficiency: "enough"` · tasas con valor · `reliability.level` `high`, `medium` o `low` con motivos · `narrative.source: "llm"` y `fallback: null` · `metrics.daily` con 7 días | | Pendiente | | |
| IA1.2 | Los números cuadran | Después de IA1.1 | 1. Crea 2 reservas: una con check-in y otra cancelada.<br>2. `GET /insights?refresh=true`. | `reservationsCreated` +2, `completed` +1, `cancelled` +1, `resolved` +2 y el día de hoy de `daily` +2 frente a IA1.1 | | Pendiente | | |
| IA1.3 | El texto usa datos reales | Después de IA1.1 | 1. Compara cada número del `narrative.text` con `metrics`. | Cada cifra del texto existe en `metrics` y con su unidad correcta (un porcentaje es una tasa, una hora es una franja). El texto tiene máximo 600 caracteres | | Pendiente | | |
| IA2.1 | Pocos datos | Restaurante con menos de 10 resueltas en los últimos 7 días (por ejemplo Casa16) | 1. `GET /insights?refresh=true` con su token. | `dataSufficiency: "insufficient"` · `checkInRate`, `noShowRate`, `cancellationRate` y `reliability.level` en `null` · `narrative.source: "template"`, `fallback: "insufficient_data"` · el texto dice cuántas resueltas faltan | | Pendiente | | |
| IA2.2 | Ningún dato | Restaurante sin reservas en 14 días | 1. `GET /insights`. | Conteos en 0, `daily` con 7 días en 0, `medianMinutesToCheckIn` y `averagePartySize` en `null`, `topSlots` vacío · `200` | | Pendiente | | |
| IA3.1 | Sin llave del modelo | Backend **sin** `INSIGHTS_LLM_API_KEY` (local, o Azure con la llave quitada por Jacobo) | 1. `GET /insights?refresh=true` con datos suficientes. | `200` · `narrative.source: "template"`, `fallback: "llm_disabled"` · métricas e indicador igual que con llave | | Pendiente | | |
| IA3.2 | Error del modelo (**solo local**) | Backend local con una llave inválida (por ejemplo `INSIGHTS_LLM_API_KEY=invalida`) | 1. `GET /insights?refresh=true`. | `200` · `fallback: "llm_unavailable"` · en el log: «Informe de IA con plantillas: el modelo respondió 401 (revisa INSIGHTS_LLM_API_KEY).» (sin la llave) | | Pendiente | | |
| IA3.3 | Modelo inexistente (**solo local**) | `INSIGHTS_LLM_MODEL=modelo-que-no-existe` | 1. `GET /insights?refresh=true`. | `200` · `fallback: "llm_unavailable"` · log con «404 (revisa INSIGHTS_LLM_MODEL)» | | Pendiente | | |
| IA3.4 | Demora o caída del modelo | — | — | Si el modelo no responde en 20 s o no hay conexión: `fallback: "llm_unavailable"`. Lo cubren las pruebas automáticas (no se puede forzar a mano) | | Automática | `llm-client.spec.ts` | |
| IA3.5 | Respuesta vacía o inválida | — | — | Texto vacío, con números o `%` escritos por el modelo, con claves que no existen o de más de 600 caracteres: `fallback: "llm_invalid"` y plantillas | | Automática | `llm-prompt.spec.ts`, `narrative.service.spec.ts`, `insights.e2e-spec.ts` | |
| IA4.1 | Caché | Sin llamadas en la última hora | 1. `GET /insights` dos veces seguidas. | Las dos respuestas traen el mismo `generatedAt` (la segunda sale de la caché) | | Pendiente | | |
| IA4.2 | Actualizar | Después de IA4.1 | 1. `GET /insights?refresh=true`. | `generatedAt` nuevo | | Pendiente | | |
| IA4.3 | Límite de uso | — | 1. Llama `GET /insights` 11 veces en menos de un minuto. | Las 10 primeras `200`, la 11.ª `429` con «Hiciste muchas solicitudes seguidas…» (§12.14) | | Pendiente | | |
| IA5.1 | Usuario sin permiso | — | 1. Con el token del comensal A.<br>2. Sin token. | 1: `403 DINER_ACCOUNT`.<br>2: `401` | | Pendiente | | |
| IA5.2 | Restaurante que no es el dueño | Dueños de Casa 72 y Casa16 | 1. `GET /insights?refresh=true` con cada token.<br>2. Crea una reserva en Casa 72 y repite con el token de Casa16. | Cada uno ve solo sus números (la ruta no recibe id: sale de la sesión). La reserva de Casa 72 no cambia nada en el informe de Casa16 | | Pendiente | | |
| IA5.3 | Restaurante pendiente o rechazado | Cuenta pendiente o rechazada | 1. `GET /insights`. | `403 ACCOUNT_PENDING_APPROVAL` o `ACCOUNT_REJECTED` | | Pendiente | | |
| IA6.1 | La IA nunca cambia estados | Reserva activa en Casa 72 | 1. Mira el tablero de mesas y la reserva.<br>2. `GET /insights?refresh=true`.<br>3. Mira otra vez. | Nada cambió: misma reserva activa, mismas mesas, sin filas nuevas en la bitácora | | Pendiente | | |

### F · Flujos completos con web y app abiertas
**Responsable:** Santiago · **Precondiciones comunes:** todo en Azure · web como dueño de Casa 72 y app como comensal A, **a la vez y sin recargar** (cómo ponerlas lado a lado: [`matriz-sprint3.md`](matriz-sprint3.md), 1.4).

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| F1 | Recorrido principal | Casa 72 en su estado base | 1. Busca y reserva en la app.<br>2. Mira la web.<br>3. Haz check-in con el QR o el código.<br>4. Mira la app, el estado de cuenta y el informe de IA (`refresh`). | Paso 2: la reserva aparece sin recargar.<br>Paso 3: la reserva queda Cumplida, la mesa Ocupada y llega la notificación.<br>Paso 4: el check-in aparece en el estado de cuenta (COP 2.000) y en el informe | | Pendiente | | |
| F2 | Código ya usado | Después de F1 | 1. Valida otra vez el mismo código. | `409 RESERVATION_ALREADY_USED` con la hora: «Este código ya se usó a las HH:MM.» | | Pendiente | | |
| F3 | Reserva vencida | Vigencia de 3 min | 1. Reserva y deja vencer.<br>2. Valida su código en la web. | La app pasa a Vencida y la fila sale de la web sin recargar · el código da `409 RESERVATION_EXPIRED` | | Pendiente | | |
| F4 | Cancelar | Reserva activa | 1. Cancela en la app. | La fila sale de la web y la mesa vuelve a Disponible sin recargar · notificación «Cancelaste tu reserva» | | Pendiente | | |
| F5 | Reconexión de la app | Reserva activa | 1. Modo avión.<br>2. Check-in en la web.<br>3. Quita el modo avión. | La app muestra Cumplida al reconectar | | Pendiente | | |
| F6 | Con la IA apagada | Backend sin llave del modelo (IA3.1) | 1. Repite F1. | Todo el flujo funciona igual; solo el informe usa plantillas | | Pendiente | | |

---

## 4. Casos de Sergio

### IW · Informe de IA: pantalla (Task 2.1.2)
**Responsable:** Sergio (revisa Santiago) · **Precondiciones comunes:** web como dueño de Casa 72, en la pantalla del informe ⚠️ [#2](#10-por-confirmar) · criterios del Reparto (4.4) y del manual de identidad.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| IW1 | Datos suficientes | Como IA1.1 | 1. Abre la pantalla. | Muestra métricas, comparación con la semana anterior, la serie de 7 días, el nivel de confiabilidad con sus motivos y las recomendaciones. **Se nota que el texto es generado automáticamente** | | Pendiente | | |
| IW2 | Carga | Red lenta (DevTools → *Slow 3G*) | 1. Abre la pantalla. | Estado de carga del kit mientras responde; nada salta ni se rompe | | Pendiente | | |
| IW3 | Aún no hay datos suficientes | Como IA2.1 | 1. Abre la pantalla. | Estado propio de «aún no hay datos suficientes» (no un error ni tasas en 0 %); dice cuántas reservas faltan | | Pendiente | | |
| IW4 | Error | Backend apagado o sin red | 1. Abre la pantalla. | Mensaje de error claro con «Intentar de nuevo»; sin errores en la consola | | Pendiente | | |
| IW5 | Respaldo | Como IA3.1 (sin llave) | 1. Abre la pantalla. | Muestra el texto de plantillas sin romperse; se entiende que es un respaldo si la pantalla lo indica | | Pendiente | | |
| IW6 | Límite de uso | — | 1. Pulsa «Actualizar» más de 10 veces en un minuto. | Texto del 429 del kit; no reintenta solo | | Pendiente | | |
| IW7 | Modo oscuro | Tema oscuro | 1. Recorre la pantalla. | Todo legible y con buen contraste; gráficos visibles | | Pendiente | | |
| IW8 | Móvil y pantalla grande | DevTools: 375 px y 1440 px | 1. Recorre la pantalla en los dos anchos. | Nada se corta ni se sale; la jerarquía se mantiene | | Pendiente | | |
| IW9 | Texto largo | Texto de 600 caracteres (por ejemplo, con la respuesta simulada en DevTools) | 1. Abre la pantalla. | El texto se ajusta sin romper el diseño | | Pendiente | | |
| IW10 | Se entiende en segundos | Una persona que no conoce DiNNo | 1. Muéstrale la pantalla 10 segundos. | Puede decir qué le muestra y qué le recomienda | | ⚠️ Por confirmar (#2) | | |

### E · Estado de cuenta (Task 1.2.4)
**Responsable:** Sergio · **Ruta:** `GET /v1/restaurants/me/billing/check-ins` y la pantalla «Resumen» de la web. Regla: tarifa fija por check-in válido, COP 2.000 (`CHECKIN_FEE_COP`); cancelaciones y vencimientos no se cobran (§12.12).

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| E1.1 | Check-in cobrado | Anota `totalCheckIns` y `amountCop` de hoy | 1. Haz un check-in.<br>2. Consulta otra vez. | `totalCheckIns` +1, `amountCop` +2000 y un ítem nuevo con `feeCop: 2000`, la mesa y las personas, **sin datos del comensal** | | Pendiente | | |
| E1.2 | Total = check-ins × tarifa | Varios check-ins en el periodo | 1. Suma `feeCop` de todos los ítems. | Igual a `amountCop` | | Pendiente | | |
| E2 | Cancelación no se cobra | — | 1. Reserva y cancela.<br>2. Consulta. | `totalCheckIns` y `amountCop` no cambian | | Pendiente | | |
| E3 | Vencimiento no se cobra | Vigencia de 3 min | 1. Reserva y deja vencer.<br>2. Consulta. | No cambian | | Pendiente | | |
| E4 | El resumen coincide | Mismo periodo | 1. Compara `billing.checkIns` y `billing.amountCop` de `/summary` con el estado de cuenta. | Iguales | | Pendiente | | |
| E5 | Periodo inválido | — | 1. `?from=2026-11-10&to=2026-11-09`.<br>2. `?to=` un día futuro. | `400` con el mensaje de cada caso | | Pendiente | | |
| E6 | Cambiar la tarifa no cambia lo cobrado (**solo local**) | Backend local | 1. Haz un check-in con 2000.<br>2. Reinicia con `CHECKIN_FEE_COP=1500` y haz otro.<br>3. Consulta. | El primero sigue en 2000 y el segundo en 1500; `currentFeeCop` del resumen es 1500 | | Pendiente | | |
| E7.1 | Comensal | Token del comensal A | 1. Consulta el estado de cuenta. | `403 DINER_ACCOUNT` | | Pendiente | | |
| E7.2 | Restaurante pendiente | Cuenta pendiente | 1. Consulta. | `403 ACCOUNT_PENDING_APPROVAL` | | Pendiente | | |

---

## 5. Casos de Jacobo

Los procedimientos y los resultados detallados viven en el backend: `docs/qa/pruebas-de-red.md`, `docs/qa/pruebas-de-carga.md`, `docs/azure/seguridad-red.md` y `docs/seguridad/auditoria-sprint4.md`. Aquí va un caso por cosa a comprobar, con el enlace a su resultado.

### H · Humo y regresión en Azure (Task 7.1.1)

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| H1 | Salud | Backend encendido | 1. `GET /v1/health`. | `200` con el `commit` desplegado | | Pendiente | | |
| H2 | Inicio de sesión del restaurante | — | 1. Inicia sesión en la web como Casa 72. | Entra al dashboard | | Pendiente | | |
| H3 | Inicio de sesión del comensal | — | 1. Inicia sesión en la app. | Entra a Explorar | | Pendiente | | |
| H4 | Búsqueda | Comensal A | 1. Abre el mapa y filtra por nombre y personas. | Aparecen los restaurantes aprobados y abiertos, con su disponibilidad | | Pendiente | | |
| H5 | Reserva | Casa 72 en su estado base | 1. Reserva 2 personas. | `201`, código, temporizador y Mesa 1 Reservada en la web | | Pendiente | | |
| H6 | Cancelación | Reserva activa | 1. Cancela. | Cancelada; la mesa vuelve a Disponible | | Pendiente | | |
| H7 | Vencimiento | Vigencia de 3 min | 1. Deja vencer. | Vencida; la mesa vuelve a Disponible | | Pendiente | | |
| H8 | Check-in | Reserva activa | 1. Valida con el QR (lector o cámara) y con el código escrito. | Cumplida; la mesa pasa a Ocupada | | Pendiente | | |
| H9 | Tiempo real | Web y app abiertas | 1. Crea y cancela una reserva. | La web se actualiza sin recargar | | Pendiente | | |
| H10 | Bitácora | Después de H5 a H8 | 1. Abre la bitácora. | Una fila por cambio, con `source` correcto | | Pendiente | | |
| H11 | Registro y aprobación | Correo nuevo de restaurante | 1. Regístrate en `/registro`.<br>2. Aprueba desde `/admin`. | Primero queda en revisión; después de aprobar, opera y aparece para los comensales | | Pendiente | | |
| H12 | Regresión del Sprint 3 | — | 1. Repite los casos M1 a M12 de [`matriz-sprint3.md`](matriz-sprint3.md) que cambiaron de ambiente. | Todo igual que en Render | | Pendiente | | |

### C · Concurrencia y fallos (Tasks 7.1.2, 7.1.3)

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| C1 | Misma mesa a la vez | Una sola mesa libre · 5 comensales ⚠️ [#5](#10-por-confirmar) | 1. 5 solicitudes simultáneas para la misma mesa. | Exactamente **1** `201` y 4 `409 NO_TABLE_AVAILABLE`; ninguna reserva ni mesa a medias | | Pendiente | | |
| C2 | Doble check-in a la vez | Reserva activa | 1. Dos validaciones simultáneas del mismo código. | Una `200` y la otra `409 RESERVATION_ALREADY_USED`; un solo registro en el estado de cuenta | | Pendiente | | |
| C3 | Reinicio del servicio | Reserva activa con vigencia corta | 1. Reinicia el backend.<br>2. Espera que pase la vigencia. | Al volver, la reserva queda Vencida y la mesa Disponible; sin estados a medias | | Pendiente | | |
| C4 | Redis caído | Redis detenido o inaccesible | 1. Reserva, cancela y haz check-in.<br>2. Abre el informe de IA. | Todo funciona (el límite de peticiones cuenta en memoria con un aviso en el log; el informe se calcula sin caché) | | Pendiente | | |
| C5 | Dos réplicas: tiempo real | 2 réplicas, Redis encendido (Tasks 5.1.x) | 1. Web conectada a una réplica, app a otra.<br>2. Crea una reserva. | La web recibe la reserva sin recargar. **Al terminar, se vuelve a 1 réplica** | | ⚠️ Por confirmar (#6) | | |
| C6 | Dos réplicas: límite compartido | 2 réplicas | 1. 11 reservas en un minuto con la misma cuenta. | La 11.ª da `429`, aunque las peticiones caigan en réplicas distintas | | Pendiente | | |

### R · Red desde distintos lugares
Procedimiento y resultados: `backend/docs/qa/pruebas-de-red.md`. **Se repite después de cualquier cambio de red o firewall.**

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| R1 | Casa | Red de la casa | 1. Inicio de sesión, búsqueda, reserva y check-in (web y app). | Funciona, con tiempo real | | Pendiente | | |
| R2 | Universidad | Red de la universidad | 1. Lo mismo. | Funciona, con tiempo real | | Pendiente | | |
| R3 | Datos móviles | App con datos móviles, sin wifi | 1. Lo mismo desde la app. | Funciona, con tiempo real | | Pendiente | | |
| R4 | Sin depender de una IP | Desde una red que nunca se agregó a ninguna regla | 1. Lo mismo. | Funciona: la API no depende de la IP de quien configuró | | Pendiente | | |

### L · Carga y capacidad
Procedimiento, cifras y conclusiones: `backend/docs/qa/pruebas-de-carga.md`.

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| L1 | 1 réplica | `RATE_LIMIT_FACTOR` subido solo durante la prueba | 1. Corre la prueba de k6. | Quedan medidos usuarios simultáneos, reservas por segundo, tiempo de respuesta y dónde se degrada primero | | Pendiente | | |
| L2 | 2 réplicas | Igual, con 2 réplicas | 1. Repite. | Igual que L1. Al terminar: 1 réplica y los límites como estaban | | Pendiente | | |

### S · Seguridad (Task 6.1.6)

| ID | Variante | Precondiciones | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|---|---|
| S1 | Ruta privada sin sesión | — | 1. `GET /v1/restaurants/me` sin token. | `401` «Tu sesión terminó…» | | Pendiente | | |
| S2 | Rol incorrecto | Tokens de comensal, restaurante y administrador | 1. Comensal → ruta de restaurante; restaurante → ruta de comensal; administrador → ruta de restaurante. | `403 DINER_ACCOUNT`, `RESTAURANT_ACCOUNT` y `ADMIN_ACCOUNT` | | Pendiente | | |
| S3 | Exceso de peticiones | — | 1. 11 reservas en un minuto. | La 11.ª da `429` (§12.14) | | Pendiente | | |
| S4 | PostgreSQL no accesible desde afuera | Desde un computador sin regla temporal | 1. Intenta conectarte a la base. | No conecta (tiempo agotado o rechazo) | | Pendiente | | |
| S5 | Redis no accesible desde afuera | Igual | 1. Intenta conectarte a Redis. | No conecta | | Pendiente | | |
| S6 | CORS | — | 1. Llama a la API desde un origen que no está en `CORS_ORIGINS`. | El navegador bloquea la respuesta; la web autorizada sigue funcionando | | Pendiente | | |
| S7 | Cabeceras y HTTPS | — | 1. Revisa las cabeceras de una respuesta.<br>2. Llama por `http://`. | CSP, HSTS, `nosniff`, `Referrer-Policy` y sin `X-Powered-By` · HTTP redirige o no responde | | Pendiente | | |
| S8 | Errores sin información interna | — | 1. Provoca un error (por ejemplo un id inválido). | Mensaje en español, sin SQL, rutas internas ni stack | | Pendiente | | |
| S9 | Secretos | — | 1. Revisa `docs/seguridad/auditoria-sprint4.md` y los registros del Container App. | Ningún secreto en el repo, la imagen ni los registros (tampoco la llave del modelo de IA) | | Pendiente | | |

---

## 6. Revisión final (Elizabeth y Sebastián)

**Cuándo:** solo después de que Jacobo avise que terminó sus pruebas (Reparto, 4.3). Es el recorrido de la demo (Reparto, sección 5), desde la red de la universidad o con datos móviles.

| ID | Paso de la demo | Resultado esperado | Resultado obtenido | Estado | Evidencia | Bug |
|---|---|---|---|---|---|---|
| D1 | Arquitectura | La diapositiva coincide con lo desplegado | | Pendiente | | |
| D2 | Acceso y búsqueda (app) | Inicio de sesión, búsqueda, disponibilidad y filtros funcionan | | Pendiente | | |
| D3 | Microreserva | Personas, reserva, código y temporizador | | Pendiente | | |
| D4 | Tiempo real | La reserva aparece en la web sin recargar | | Pendiente | | |
| D5 | Check-in | Cumplida, mesa Ocupada, registro facturable y notificación | | Pendiente | | |
| D6 | Estado de cuenta | Check-ins del periodo y valor con la tarifa fija | | Pendiente | | |
| D7 | IA | Resultado, datos que usa y respaldo cuando falla | | Pendiente | | |
| D8 | Seguridad | Exceso de peticiones rechazado y ruta privada sin sesión rechazada | | Pendiente | | |
| D9 | Escenario alternativo | Código ya usado, reserva vencida o usuario sin permiso | | Pendiente | | |

---

## 7. Datos para la IA

El informe necesita **10 o más reservas resueltas** (con check-in, canceladas o vencidas) **creadas en los últimos 7 días** para calcular tasas e indicador. Hoy casi no hay reservas reales.

**Cómo prepararlas en Casa 72 (Azure, el mismo día de la prueba):**
1. Con el comensal A: reserva y haz check-in desde la web, o cancela. Repite hasta tener al menos 10 resueltas, mezclando check-ins, cancelaciones y algún vencimiento.
2. **Respeta el límite:** crear y cancelar comparten un contador de 10 por minuto por cuenta (§12.14). Con dos o más comensales va más rápido.
3. Para que el indicador tenga sentido, cambia a mano el estado de alguna mesa en varios días (la confiabilidad mira los cambios manuales de mesas por día).
4. Antes del ensayo y de la presentación, Elizabeth limpia los datos de la demo (`demo:reset`): **después de eso el informe vuelve a «aún no hay datos suficientes»** hasta que se creen reservas de nuevo. Acordarlo con ella para que la demo de la IA tenga datos ⚠️ [#7](#10-por-confirmar).

---

## 8. Matriz final

Se llena el viernes, antes del ensayo: todo caso en **Pasa**, **Automática** o **Falla** (con su Bug y su dueño). Ningún caso queda en Pendiente sin explicación.

| Área | Pasa | Automática | Falla | Bloqueado | Bugs abiertos (enlace) | Dueño de cada Bug |
|---|---|---|---|---|---|---|
| Notificaciones (N) | | | | | | |
| Informe de IA: API (IA) | | | | | | |
| Informe de IA: pantalla (IW) | | | | | | |
| Estado de cuenta (E) | | | | | | |
| Flujos completos (F) | | | | | | |
| Humo y regresión (H) | | | | | | |
| Concurrencia y fallos (C) | | | | | | |
| Red (R) | | | | | | |
| Carga (L) | | | | | | |
| Seguridad (S) | | | | | | |
| Revisión final (D) | | | | | | |

---

## 9. Formato para reportar hallazgos

Cada hallazgo va **al grupo y a Azure (Bug)** el mismo día. Copia esta plantilla:

```markdown
**[ID de la variante] Título corto**
- Ambiente: Azure (commit de /v1/health: …) o local · web (URL) · app (development build o APK)
- Red: casa, universidad o datos móviles
- Pasos para reproducirlo:
  1. …
  2. …
- Resultado esperado: … (copia el de la matriz)
- Resultado obtenido: …
- Captura: evidencias/img/s4-<ID>-falla.png (sin tokens, llaves, contraseñas, cadenas de conexión ni códigos de reservas activas)
- Responsable: Elizabeth (backend) · Sebastián (web y app) · Santiago y Sergio (IA) · Jacobo (Azure)
```

Después pega el enlace del Bug en la columna **Bug**, cambia el estado a «Falla» y avisa al dueño. Santiago anota el día de la corrección y el caso se repite después de cada corrección (Reparto, 4.6).

---

## 10. Por confirmar

| # | Punto | Por qué | Preguntar a | Afecta |
|---|---|---|---|---|
| 1 | URLs de Azure del backend y de la web | La matriz no las escribe hasta que existan. La web sigue en Vercel mientras Static Web Apps no esté activa (`AVISOS.md` del frontend, 16 nov) | Jacobo y Sebastián | Todos |
| 2 | Ruta y nombre de la pantalla del informe de IA en la web | El diseño proponía `/informe`; la pantalla la decide Sergio. IW10 necesita a alguien que no conozca DiNNo | Sergio | IW |
| 3 | `INSIGHTS_LLM_API_KEY` en Azure | La llave de Claude la crea el equipo y se guarda en Key Vault. Sin ella, todos los informes salen con plantillas | Santiago y Jacobo | IA1, IA4, IW1, F1, D7 |
| 4 | Vigencia corta en Azure | Cambiar `RESERVATION_TTL_MINUTES` crea una revisión nueva del Container App. ¿Se hace en una ventana de QA y se devuelve a 15? | Jacobo | N1.3, N2.4, H7, F3, E3 |
| 5 | Cuentas de comensal B a E | C1 necesita 5 comensales distintos (una reserva activa por comensal) | Jacobo | C1, F |
| 6 | Adaptador de Redis para Socket.IO | C5 solo aplica si las Tasks 5.1.x quedaron hechas | Jacobo | C5 |
| 7 | Datos de la IA y `demo:reset` | `demo:reset` deja el informe sin datos suficientes; hay que crear las reservas después del reset y antes de mostrar la IA | Elizabeth y Santiago | IA1, IW1, D7 |
