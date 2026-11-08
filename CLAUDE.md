# CLAUDE.md · DiNNo · frontend (web)

> Instrucciones para Claude Code y para el equipo. Las secciones 1 a 10 y 12 son **iguales en los tres repositorios** (backend, frontend, mobile); la sección 11 es propia de este repositorio.
> Si una regla cambia, se cambia en los tres repos en el mismo PR o en PRs del mismo día, y se avisa al equipo.

## 1. Contexto del proyecto

**DiNNo**: plataforma de microreservas de mesas en restaurantes con disponibilidad inmediata. Promesa: *“Dile no a la espera.”*

| Repositorio (org `DiNNo-team`) | Qué es | Stack | Despliegue |
|---|---|---|---|
| `backend` | API (monolito modular) | NestJS 12 + TypeORM + PostgreSQL (Neon) + Redis (Upstash) | Render (desde `develop`) |
| `frontend` | Dashboard web del restaurante | React 19 + Vite 8 + Tailwind CSS v4 | Vercel (desde `main`) |
| `mobile` | App del comensal | Expo SDK 57 + Expo Router + NativeWind v4 (Tailwind v3) | Expo / EAS |

**Equipo y responsables:**

| Persona | Rol en el Sprint 1 |
|---|---|
| Elizabeth | Backend base, backend de mesas y de la edición del restaurante, integración y demo. Revisa los PR de backend |
| Sebastián | Kit visual (`components/ui`), pantallas de mesas. Revisa los PR de web y mobile |
| Santiago | Registro del restaurante (onboarding) |
| Jacobo | Autenticación (login y control de acceso); pantalla del restaurante |
| Sergio | Estado abierto/cerrado del restaurante y bitácora de cambios de mesas |

**Sprint 3 (actual): Microreservas y check-in (contratos en la sección 12). Sprint 2 cerrado: Búsqueda y disponibilidad para el comensal (contratos en la sección 10). Sprint 1 cerrado: Restaurante operativo.** Un restaurante puede iniciar sesión, registrar y editar sus datos, crear y administrar mesas, cambiar su estado, marcarse como abierto o cerrado y ver la bitácora, todo en el ambiente desplegado.

---

## 2. Antes de empezar cualquier tarea

1. **Pregunta qué PBI o tarea de Azure DevOps se está trabajando**, si la persona no lo dijo. No trabajes sin saber el alcance.
2. **Si no tienes en el contexto el manual de identidad v2.0 (`frontend/docs/DiNNo_Manual_Identidad_v2_0.md`) ni el plan del sprint, pídelos** antes de tocar algo visual o algo que dependa de otra persona. No inventes colores, componentes, textos ni flujos.
3. **Confirma qué está dentro y qué está fuera de la tarea.** Si algo parece necesario pero es de otra persona (ver la tabla de responsables), dilo en vez de hacerlo.
4. **Busca si ya existe algo parecido** en el repo (componente, servicio, validación, utilidad) antes de crear algo nuevo.
5. **Verifica que la rama esté actualizada con `develop`** antes de empezar (ver sección 3).

---

## 3. Git y flujo de trabajo

### Reglas que nunca se rompen
- **Nunca hagas commit, push, merge, rebase ni borres ramas sin que la persona lo pida explícitamente.** Propón el comando y espera confirmación.
- **Nunca trabajes ni hagas push directo a `develop` ni a `main`.** `develop` se despliega automáticamente: todo entra por Pull Request revisado.
- **Nunca uses `git push --force`** sobre ramas compartidas, `develop` ni `main`.
- **No hagas commit** de `.env`, `node_modules/`, `dist/`, `.expo/`, archivos del sistema operativo ni archivos generados.

### Ramas
- Siempre desde `develop` actualizado: `git checkout develop && git pull` y luego crear la rama.
- Formato: **`<tipo>/sprint<N>-<descripcion-corta>`**, en minúsculas, con guiones y sin tildes.
- Tipos: `feat` (funcionalidad), `fix` (corrección), `chore` (configuración o mantenimiento), `docs` (documentación), `refactor` (sin cambiar comportamiento), `test` (pruebas).
- Ejemplos: `feat/sprint1-crear-mesas`, `feat/sprint1-login-firebase`, `fix/sprint1-validacion-horarios`, `chore/sprint1-migraciones`.
- **Una rama por tarea.** No mezcles tareas distintas en la misma rama.

### Commits (Conventional Commits, en inglés)
- Formato: `<tipo>(<ámbito>): <descripción en imperativo>`. El ámbito es el módulo o la zona tocada.
- Ejemplos: `feat(restaurant-operations): add table status change`, `fix(auth): show generic error on invalid credentials`, `chore(ui): add button and text field components`, `docs: update database schema`.
- Opcional: agrega `AB#<id>` al final para enlazar el commit con el work item de Azure.
- Commits pequeños y con sentido. No uses mensajes como “cambios”, “fix” o “wip”.

### Mantenerse al día con `develop`
- Antes de abrir el PR y cada día de trabajo: trae los cambios de `develop` a tu rama (`git fetch` + `git merge origin/develop`) y vuelve a correr las verificaciones.
- **Conflictos:** nunca descartes cambios de otra persona para resolverlos. Si no es claro qué conservar, pregunta a la persona y al dueño de ese código.
- **Conflictos en `package-lock.json`:** conserva el `package.json` correcto y regenera el lock con `npm install`. No lo edites a mano.

### Pull Requests
- Siempre hacia `develop`. Pequeños: una tarea por PR.
- La descripción incluye: qué hace, el PBI o la tarea de Azure, cómo probarlo, capturas si hay pantallas y si cambia algo que afecta a otros (API, base de datos, componentes del kit, variables de entorno).
- **Revisión obligatoria:** Elizabeth revisa backend; Sebastián revisa web y mobile. Nadie aprueba su propio PR.
- Antes de pedir revisión, corre las verificaciones del repo (sección de comandos) y deja todo en verde.
- Después del merge se borra la rama.

---

## 4. Seguridad
- **Nunca leas, muestres, copies, edites ni subas archivos `.env`** ni su contenido. Si necesitas saber qué variables existen, usa `.env.example`.
- No escribas secretos, contraseñas, tokens, llaves de servicios ni cadenas de conexión en el código, los logs, los comentarios ni los mensajes de commit.
- **Toda variable nueva va en `.env.example`** con un valor de ejemplo y un comentario, y se avisa en el PR para que la agreguen en Render, Vercel o Expo.
- Las variables públicas (`VITE_*`, `EXPO_PUBLIC_*`) terminan dentro de la web o la app: **nunca pongas secretos en ellas**.
- **No corras migraciones, seeds ni comandos que escriban en bases remotas** (Neon, Upstash) sin confirmación explícita de la persona.

---

## 5. Dependencias y entorno
- **Node 24** (fijado en `.nvmrc` y `engines`). Usa `nvm use`.
- **Solo npm**: no uses yarn, pnpm ni bun, y no borres ni reemplaces `package-lock.json`.
- **No instales, actualices ni elimines dependencias sin preguntar.** Primero revisa si algo ya instalado lo resuelve. Si se agrega una, se explica por qué en el PR.
- Después de cada `git pull` o merge de `develop`, corre `npm install` (o `npm ci`) antes de cualquier otro comando: si alguien agregó una dependencia, los comandos fallan sin eso.
- No cambies versiones mayores de frameworks ni configuraciones globales (tsconfig, linter, formateador, build) sin acordarlo con el equipo.
- **Las versiones instaladas son más nuevas que lo que suele conocer un asistente:** revisa `package.json` y la documentación oficial de la versión instalada antes de usar una API de memoria.

---

## 6. Forma de trabajar
- **Cambios mínimos y dentro del alcance de la tarea.** No reformatees, renombres ni muevas archivos que no son parte de la tarea.
- **No modifiques código de otro módulo ni de otra persona** sin avisar. Si lo necesitas, propónlo y que lo revise su dueño.
- **Reutiliza antes de crear:** componentes del kit, validaciones, servicios, utilidades.
- **Nombres en inglés en el código** (variables, funciones, archivos, rutas de la API, tablas). **Textos de la interfaz en español**, tuteando y con el glosario del manual: mesa, comensal, restaurante, Disponible, Reservada, Ocupada, Inactiva, Abierto, Cerrado, bitácora, capacidad (“4 personas”), iniciar sesión / cerrar sesión.
- **Errores:** al usuario siempre se le muestra un mensaje claro que diga qué hacer, nunca un error técnico. En el código, no se ignoran errores (nada de `catch` vacíos).
- **Sin `console.log`, código comentado ni `TODO` sin dueño** en el PR.
- Funciones y componentes pequeños, con una sola responsabilidad. Tipado estricto: evita `any`.
- **Si algo de estas instrucciones contradice el código o una decisión nueva, avisa** en vez de suponer.

---

## 7. Lo que afecta a otros: avisar siempre
Estos cambios rompen el trabajo de otras personas si no se comunican. Cuando los hagas, **dilo en la descripción del PR y en el grupo del equipo**:
- Cambios en **rutas, DTOs o respuestas de la API** (afecta a web y mobile). No rompas endpoints existentes; si cambian, se actualiza Swagger.
- Cambios en **la base de datos** (nuevas tablas, columnas o migraciones). Se documentan en `docs/database.md` del backend.
- Cambios en **componentes del kit visual** o en los tokens de diseño (afecta todas las pantallas).
- **Variables de entorno nuevas** o cambios en `CORS_ORIGINS`.
- **Dependencias nuevas.**

---

## 8. Decisiones del equipo (no se cambian sin acordarlo)
Las decisiones y contratos del Sprint 2 están en la sección 10.
- **Autenticación:** Firebase Authentication (confirmado). Se usa en la web (restaurantes) y en la app móvil (comensales), con Google y con correo y clave. El backend valida el token de Firebase y decide el rol; ver sección 10.
- **Estados de mesa:** Disponible, Reservada y Ocupada. *Inactiva* es una mesa desactivada, no un estado del control. “Pocas mesas” es disponibilidad del restaurante para el comensal, no un estado de mesa.
- **Estado del restaurante:** Abierto o Cerrado.
- **Diseño:** el manual de identidad v2.0 manda sobre cualquier otra preferencia (el v1.1 queda como histórico; lo que el v2.0 todavía no implementa está en su sección 19). Un solo kit de componentes; nadie crea estilos propios.
- **API:** prefijo `/v1`, contrato documentado en Swagger (`/docs`).
- **Base de datos:** cambios de esquema solo con migraciones; nunca `synchronize`.
- **Identificador de mesa:** corto ("04", "T1") y se muestra "Mesa 04"; "4", "04" y "Mesa 4" son la misma mesa; máximo 10 caracteres; en la interfaz se llama "Identificador" (manual 12.4).
- **Bitácora de mesas:** cambiar el estado, desactivar (`available` → `inactive`; desde §12.2 solo se desactiva una mesa `available`) y reactivar (`inactive` → `available`) se registran; editar el identificador o la capacidad no. Desde el Sprint 3, cada registro lleva `source` (`manual`, `reservation` o `system`) y las entradas automáticas (`system`, el vencimiento de una reserva) tienen `user_id` en `null` (§12.3).
- **Plano de mesas:** la posición de cada mesa vive en `tables` (`plan_x`, `plan_y`, `plan_shape`, en NULL mientras no está ubicada) y se guarda con `PUT /v1/tables/plan`, que reemplaza el plano completo (gana el último que guarda). No se registra en la bitácora ni cambia la disponibilidad.
- Nuevas decisiones: se agregan aquí, en una línea, en el mismo PR que las aplica.

---

## 9. Definición de terminado
Una tarea está lista solo si:
- [ ] Cumple los criterios de aceptación del PBI.
- [ ] Pasan el lint, el chequeo de tipos o build y las pruebas del repo.
- [ ] (Pantallas) Usa solo el kit, sigue el manual y tiene estados de carga, vacío y error, en modo claro y oscuro.
- [ ] Lo que afecta a otros está avisado (sección 7).
- [ ] Funciona en el ambiente desplegado, no solo en local.
- [ ] El PR está revisado y aprobado.

---

## 10. Sprint 2 · Contratos (fuente de verdad)

> Responsable: Elizabeth. Si algo no está aquí, se pregunta antes de inventarlo. Los cambios a esta sección se anuncian en `AVISOS.md`.

### Cuentas y roles
- Roles posibles: `restaurant_admin` (solo web) y `diner` (solo app). Cada cuenta tiene **un solo rol**.
- **Lista de restaurantes habilitados** = filas de `users` con rol `restaurant_admin`. Para habilitar un correo se inserta una fila (ver `docs/database.md` del backend). No hay registro público de restaurantes.
- **Cuentas de prueba (Firebase, correo verificable):** `dinnoteam2026@gmail.com` (restaurante Casa16), `dinnoteam2026+casa72@gmail.com` (restaurante Casa 72) y `dinnoteam2026+comensal@gmail.com` (comensal). Las credenciales están en Discord (#usuarios-restaurante y #usuarios-comensal), **nunca** en el repo. Una cuenta nueva usa un alias `dinnoteam2026+algo@gmail.com` (llega a la misma bandeja). Los dueños de los 15 restaurantes reales del seed (`restaurante-XX@dinno.test`) son solo datos: no tienen cuenta de Firebase ni inician sesión.
- **El backend ya no crea usuarios automáticamente.** El único endpoint que crea un usuario es `POST /v1/diners/me`, y siempre lo crea con el rol `diner`.
- Resolución del usuario en cada petición: token válido → se busca por `firebase_uid` → si no aparece y el correo está verificado, se busca por correo y se vincula el UID (igual que en el Sprint 1) → si no existe, la cuenta queda **sin perfil**.

**Códigos de cuenta.** Precedencia: 401 de sesión → `EMAIL_NOT_VERIFIED` → códigos de rol → `RESTAURANT_REQUIRED`.

| Situación | HTTP | `errorCode` | Mensaje (`message`) |
|---|---|---|---|
| Token ausente, inválido o vencido | 401 | — | Tu sesión terminó. Inicia sesión de nuevo. |
| Correo sin verificar (cuenta todavía sin vincular) | 401 | `EMAIL_NOT_VERIFIED` | Verifica tu correo para continuar. |
| Sin perfil + endpoint de restaurante | 403 | `ACCOUNT_NOT_ENABLED` | Esta cuenta no está habilitada como restaurante. Si eres comensal, encuentra mesa desde la app DiNNo. |
| Sin perfil + endpoint de comensal | 403 | `PROFILE_REQUIRED` | Completa tu perfil para continuar. *(la app no lo muestra: llama a `POST /v1/diners/me` y reintenta)* |
| Comensal en endpoint de restaurante | 403 | `DINER_ACCOUNT` | Esta es una cuenta de comensal. Para buscar mesa, usa la app DiNNo. |
| Restaurante en endpoint de comensal | 403 | `RESTAURANT_ACCOUNT` | Esta es una cuenta de restaurante. Administra tu restaurante desde la web. |
| Restaurante habilitado sin restaurante registrado | 403 | `RESTAURANT_REQUIRED` | Primero registra tu restaurante. *(sin cambios)* |

- **Endpoints de restaurante:** todos los del Sprint 1 (`/v1/restaurants`, `/v1/restaurants/me*`, `/v1/tables*`, `/v1/table-logs`) y los de restaurante de §12.8.
- **Endpoints de comensal:** `/v1/search/*` y `/v1/restaurants/:id/public`, y los de comensal de §12.8 (`/v1/reservations*`).
- **Ambos roles:** `GET /v1/me` y `GET /v1/geocode` (una cuenta sin perfil recibe `PROFILE_REQUIRED` en los dos).
- La forma del error no cambia: `{ statusCode, message, error, errorCode? }`. Los clientes deciden por `errorCode`, nunca por el texto.

### Endpoints nuevos o modificados
Todos bajo `/v1`, con `Authorization: Bearer <token de Firebase>`.

| Método | Ruta | Rol | Entrada | Respuesta |
|---|---|---|---|---|
| GET | `/me` | ambos | — | 200 `{ id, email, displayName: string \| null, role, restaurantId: string \| null }` · sin perfil → 403 `PROFILE_REQUIRED` |
| POST | `/diners/me` | token válido con correo verificado | `{ displayName?: string }` (1–60 caracteres, con trim) | 201 si lo crea · 200 si ya existía como comensal. Misma forma que `GET /me`. Si no llega `displayName`: el nombre de la cuenta de Google y, si no hay, la parte del correo antes de `@`. Correo o UID de restaurante → 403 `RESTAURANT_ACCOUNT` |
| GET | `/search/zones` | diner | — | 200 `[{ id, name, latitude, longitude }]` |
| GET | `/search/restaurants` | diner | `lat` + `lng` **o** `zone` · `radiusKm` ∈ {1, 2, 5, 10} (por defecto 2) · `category?` · `partySize?` (1–20) | 200 `[{ id, name, category, address, latitude, longitude, distanceKm, availability }]`, ordenado por distancia, máximo 50 |
| GET | `/restaurants/:id/public` | diner | `lat?` + `lng?` (juntos o ninguno) | 200 `{ id, name, category, address, latitude, longitude, schedules[], isOpenNow, availability, distanceKm? }` · 404 `RESTAURANT_NOT_FOUND` |
| GET | `/geocode` | ambos (el restaurante no necesita tener restaurante registrado) | `address` (3–255 caracteres) | 200 `{ latitude, longitude, formattedAddress }` · 404 `ADDRESS_NOT_FOUND` «No encontramos esa dirección en Bogotá.» · 503 `GEOCODING_UNAVAILABLE` «No pudimos ubicar la dirección en este momento.» · sin perfil → 403 `PROFILE_REQUIRED`. Los mensajes son neutros: cada cliente muestra su propio texto según el `errorCode` |
| POST | `/restaurants` | restaurant_admin | agrega `latitude?`, `longitude?` | la respuesta agrega `latitude`, `longitude` (number \| null) |
| PATCH | `/restaurants/me` | restaurant_admin | agrega `latitude?`, `longitude?` | igual que arriba |
| GET | `/restaurants/me` | restaurant_admin | — | agrega `latitude`, `longitude` (number \| null) |

**Reglas de los campos:**
- `latitude` y `longitude` son `number` en JSON, con hasta 6 decimales. Se aceptan con más de 6: el backend las **redondea** a 6 antes de guardar (no es un error), y las respuestas traen el valor redondeado. Se envían **los dos o ninguno** (si llega solo uno → 400). Deben estar dentro de Bogotá: latitud entre 4.45 y 4.85, longitud entre -74.25 y -73.95 (fuera → 400). En el backend las coordenadas son opcionales para no romper la web actual; la obligatoriedad al registrar la impone el formulario web.
- Búsqueda: `lat`/`lng` y `zone` son excluyentes (los dos o ninguno → 400). `lat`/`lng` pueden estar fuera de Bogotá (simplemente no habrá resultados). Una `zone` desconocida, una `category` inválida, un `radiusKm` fuera de la lista o un `partySize` fuera de rango → 400 con un mensaje en español.
- **Búsqueda por dirección (app):** la búsqueda no recibe `address`. La app llama a `GET /geocode?address=…`, muestra «Resultados cerca de: `formattedAddress`» y busca con `GET /search/restaurants?lat=…&lng=…` usando `latitude` y `longitude`. Con `404` o `503` la app muestra su propio texto y ofrece buscar por zona o por ubicación. Una dirección que existe en Bogotá se acepta aunque el comensal pensara en otra ciudad (las direcciones colombianas se repiten entre ciudades): por eso se muestra `formattedAddress`.
- `distanceKm`: número en km con 2 decimales. El formato para mostrar («a 650 m», «a 1,4 km») lo hace la app.
- `category`: `colombian`, `italian`, `mexican`, `asian`, `grill`, `fast_food`, `healthy`, `seafood`, `cafe`, `other` (los mismos del Sprint 1).
- `schedules[]` del detalle: el mismo formato que `GET /restaurants/me`: `{ dayOfWeek (1 = lunes … 7 = domingo), isOpen24h, opensAt: "HH:MM" | null, closesAt: "HH:MM" | null }`. Si `closesAt < opensAt`, el horario cierra al día siguiente. Los días cerrados no aparecen.
- `/restaurants/:id/public` → 404 `RESTAURANT_NOT_FOUND` si el id no es un UUID válido, si no existe o si no tiene coordenadas.
- Zonas (`id` → nombre): `chapinero` Chapinero · `calle-72` Calle 72 · `zona-g` Zona G · `zona-t` Zona T · `usaquen` Usaquén · `teusaquillo` Teusaquillo · `parque-93` Parque 93 · `cedritos` Cedritos · `salitre` Salitre · `centro` Centro · `la-candelaria` La Candelaria · `galerias` Galerías · `modelia` Modelia · `suba` Suba · `kennedy` Kennedy · `colina` Colina · `niza` Niza · `chico` Chicó · `quinta-camacho` Quinta Camacho · `normandia` Normandía.

### Disponibilidad
- **Abierto ahora** = `is_open = true` **y** la hora actual en **America/Bogota** está dentro del horario: el rango de hoy, o la parte después de medianoche de un horario de ayer que cierra al día siguiente, o un día de 24 horas. El cierre es exclusivo (a las 22:00 en punto, un horario que cierra a las 22:00 ya está cerrado).
- **Mesas libres** = `is_active = true` y `status = 'available'`.
- **Aparece en la búsqueda** solo si tiene coordenadas, está abierto ahora y tiene al menos 1 mesa activa (más el filtro de `partySize`: al menos 1 mesa libre y activa con `capacity ≥ partySize`).

| `availability` | Regla | Texto en pantalla |
|---|---|---|
| `available` | libres / activas > 30 % | Disponible |
| `few` | al menos 1 libre y ≤ 30 % | Pocas mesas |
| `none` | 0 libres | Sin mesas |
| `closed` | no está abierto ahora (solo en el detalle y en tiempo real; nunca en la búsqueda) | Cerrado |

- **Nunca** se expone el número de mesas libres ni de mesas totales.

### Tiempo real
- Socket.IO en el mismo host del backend (ruta por defecto `/socket.io`). Conexión: `io(BASE_URL, { auth: async (cb) => cb({ token: await user.getIdToken() }) })`. El `auth` va **como función** para que cada reconexión envíe un token vigente (con un objeto fijo, la reconexión usaría el token viejo). Se aceptan comensales (salas `diners` y `diner:{userId}`) y `restaurant_admin` con restaurante registrado (sala `restaurant:{restaurantId}`); las salas y los eventos de reservas están en §12.7. Si no, la conexión se rechaza con `connect_error`, cuyo `message` es un código: `UNAUTHORIZED` (token ausente, inválido o vencido; solo existe en el WebSocket, en HTTP es el 401 sin `errorCode`), `EMAIL_NOT_VERIFIED` (correo sin verificar), `PROFILE_REQUIRED`, `RESTAURANT_REQUIRED` (admin sin restaurante registrado; mismo código que el 403 de HTTP) o `SERVER_ERROR` (el handshake falló por algo distinto a la sesión, por ejemplo la base caída). El socket ya no envía `RESTAURANT_ACCOUNT` (sigue existiendo en HTTP). En el backend, el autenticador del handshake es `SocketAuthenticator`.
- Socket.IO **no reintenta solo** cuando el servidor rechaza la conexión. Con `SERVER_ERROR` la app reintenta ella misma con espera creciente (por ejemplo 5 s, 15 s, 30 s) y, mientras tanto, sigue la consulta cada 60 s. Con los demás códigos no reintenta.
- Un token que vence **no desconecta** un socket ya abierto: el token solo se revisa al conectar, y la siguiente reconexión pide uno nuevo con la función de `auth`.
- Evento del servidor `availability.changed`: `{ restaurantId, availability, isOpenNow, isSearchable }`. Se envía a todos los comensales conectados.
  - `isSearchable` = cumple las reglas para aparecer en la búsqueda (sin filtros). Si es `false` → la app lo quita de la lista y del mapa (el detalle muestra `closed` si `isOpenNow` es `false`). Si es `true` y el restaurante no estaba en la lista → la app vuelve a consultar la búsqueda.
- Se emite cuando: cambia el estado de una mesa (salvo el check-in, `reserved` → `occupied`), se crea, desactiva o reactiva una mesa, se abre o cierra el restaurante, o se edita su horario o ubicación. Solo después de que la operación queda guardada.
- Respaldo en la app: vuelve a consultar al regresar al primer plano, al reconectarse y cada 60 s en resultados y detalle.

### Cuándo está listo cada contrato en `develop`
**Todo el backend del Sprint 2 ya está en `develop`** (fusionado el 15 oct). Ya no hace falta usar datos de ejemplo: se consume la API real.

| Qué | En `develop` desde |
|---|---|
| Roles, `GET /me`, `POST /diners/me`, coordenadas en la base | 15 oct (PR #35) |
| Regla de disponibilidad (`AvailabilityService`, sin endpoints) | 15 oct (PR #36) |
| Búsqueda, zonas, disponibilidad, filtros y detalle público | 15 oct (PR #37) |
| `GET /geocode` y coordenadas en POST/PATCH | 15 oct (PR #38) |
| WebSocket `availability.changed` | 15 oct (PR #40) |
| Seed con los 15 restaurantes reales en Neon y Casa 72 con dueño `dinnoteam2026+casa72@gmail.com` | 24 oct (PR #44) |
| Llave real de Google Geocoding en local y en Render: `GET /geocode` ya no responde siempre `503` | 26 oct |
| `GET /geocode` para comensales (búsqueda por dirección) y mensajes neutros en 404 y 503 | 26 oct (PR #46) |

---

## 11. Este repositorio: frontend (dashboard web del restaurante)

### Versiones (revisa antes de usar una API)
React **19**, Vite **8**, Tailwind CSS **v4**, TypeScript **6**, Node **24**. Además: `lucide-react` (íconos), `@fontsource/plus-jakarta-sans`, `radix-ui` **sin estilos** (comportamiento accesible de diálogos, menús, select, switch, tooltip), `clsx` + `tailwind-merge` (vía `cn`), TanStack Query v5, React Router y Vitest + Testing Library. Alias `@/` → `src/`. Consulta https://react.dev, https://vite.dev y https://tailwindcss.com/docs para la versión instalada.
**Tailwind v4 no usa `tailwind.config.js` ni las directivas `@tailwind`:** se configura con el plugin `@tailwindcss/vite` y CSS (`@import "tailwindcss";`, `@theme`). No crees un archivo de configuración de Tailwind.

### Comandos
```bash
npm ci            # instalar (o npm install después de cada pull)
npm run dev       # http://localhost:5173
npm run build     # chequeo de tipos + build a dist/
npm run lint      # oxlint
npm run typecheck # tsc -b
npm test          # pruebas (Vitest + Testing Library); npm run test:watch para modo observación
npm run check:ui  # reglas del manual: sin hex, sin valores arbitrarios, sin paleta/radios/sombras por defecto, sin íconos prohibidos, sin console.log
npm run preview   # sirve el build
```
**Antes de dar una tarea por terminada:** `npm run lint`, `npm run build`, `npm test` y `npm run check:ui` sin errores (`build` también revisa los tipos).

### Diseño: el manual de identidad v2.0 manda
- Si no tienes el manual en el contexto, **pídelo antes de hacer cualquier pantalla o componente.**
- El manual está en `docs/DiNNo_Manual_Identidad_v2_0.md` (el v1.1 queda como histórico) y su memoria de trabajo, en `docs/renovacion-v2/`. Los mockups de `docs/mockups/` son del v1.1: si una imagen y el texto del manual difieren, manda el texto.
- Los tokens del manual van en `src/styles/tokens.css` (copiados tal cual de la sección 16.3, **no se editan**) y se mapean a Tailwind con `@theme inline` en `src/styles/globals.css` (manual, sección 16). Lo que el manual define sin token va como `@utility` en el bloque de extensiones de `globals.css`, con la sección del manual en un comentario. **No uses colores, radios, sombras ni tamaños sueltos, ni valores arbitrarios de Tailwind** (`bg-[#...]`, `rounded-[...]`, `text-[13px]`). Las clases genéricas de Tailwind (`bg-blue-600`, `text-slate-...`, `bg-white`, `rounded-lg`, `shadow-md`) no se usan: solo los tokens (`bg-surface`, `text-fg-2`, `rounded-card`, `shadow-card`, `text-h1`…). La escala estándar de Tailwind solo vale cuando coincide exacta con el manual (`h-12` = 48, espaciados 1·2·3·4·6·8·12). Si un token no tiene clase: `bg-(--overlay)`, `z-(--z-modal)`. `npm run check:ui` lo revisa.
- **Modo oscuro:** claro por defecto; oscuro con `data-theme="dark"` en `<html>` (`useTheme()` de `@/lib/theme-context`). Los tokens cambian solos: casi nunca hace falta `dark:`.
- Tipografía Plus Jakarta Sans 500 / 700 / 800 (sin cursivas; mayúsculas completas solo en `text-kicker`; `tabular-nums` en números que cambian). El login conserva su escala del v1.1 con una regla acotada a `.glass-login` (manual 13.9).
- Íconos solo de `lucide-react` a través de `Icon` (`@/lib/icon`): trazo 1.75, tamaños 16 / 20 / 24, siempre con texto en navegación y botones. **Prohibidos:** `Utensils`, `ChefHat`, `Pizza`, `Coffee`, `Hamburger`, `MapPin` y cualquier pin genérico. Sin emojis.
- Naranja = acción o "ahora": texto naranja sobre claro es `text-accent-text`; nunca texto blanco sobre naranja; **los estados nunca son naranja**. Una tarjeta nunca va dentro de otra.
- Un solo botón principal naranja por pantalla, con texto oscuro.
- Estados con **color + forma + palabra**. Desde v2.1 (manual, sección 20) el dashboard va sobre la luz del salón y una hoja de vidrio: las tarjetas de contenido son `glass-card` y las de mesa siguen sólidas con su tinte. Gradientes solo donde los nombra el manual 8 (login, luz del salón, tarjeta destacada, riel). Sobre la hoja el texto secundario se oscurece solo (`--text-2-sheet`). **Ningún texto con opacidad** (`check:ui`, regla `text-opacity`).
- Toda pantalla con estados de **carga, vacío y error**, y funcionando en **modo claro y oscuro**.
- Antes del PR, pasa el **checklist del manual (sección 17.4)**.

### Kit de componentes: usar siempre el de Sebastián
- **Antes de hacer una pantalla, lee `src/components/ui/README.md`, abre http://localhost:5173/kit (solo en `npm run dev`)** y revisa `src/components/layout/` y una pantalla existente como referencia de espaciado y estructura.
- **Las pantallas se arman solo con `@/components/ui`** (`import { Button, TextField } from '@/components/ui'`). Prohibido crear botones, campos, tarjetas, chips, diálogos, colores, sombras o estilos propios dentro de una funcionalidad.
- Los nombres, colores y formas de los estados salen solo de `STATUS_META` (`@/components/ui`). Los textos y fechas se formatean con `@/lib/format` (`formatTime12h`, `formatDateTime`, `formatCapacity`, `formatTableName`).
- Si falta un componente o una variante, **pídeselo a Sebastián o propónlo en un PR al kit**; no lo resuelvas dentro de tu pantalla.
- Solo Sebastián modifica `components/ui` y `components/layout` (o con su revisión).

### Estructura
```
src/
├── styles/           tokens.css (del manual) + estilos globales
├── assets/brand/     logo, símbolo y favicon (nunca se recrean)
├── app/              providers y router
├── components/
│   ├── ui/           kit de componentes base + README (Sebastián)
│   └── layout/       AppShell: luz de fondo, barra superior, hoja y dock de navegación (Sebastián)
├── dev/kit/          página /kit, solo en desarrollo (Sebastián)
├── features/
│   ├── auth/             login y sesión (Jacobo)
│   ├── restaurant/       registro (Santiago) y ver/editar (Jacobo)
│   ├── restaurant-status/ switch abierto/cerrado (Sergio)
│   ├── tables/           mesas (Sebastián)
│   └── activity-log/     bitácora (Sergio)
└── lib/              utilidades compartidas (Sebastián): api.ts, cn.ts, icon.tsx, format.ts, theme.tsx, use-delayed-flag.ts
```
- Cada funcionalidad en su carpeta de `features/`; nada de lógica de negocio en `App.tsx`.
- Código en inglés (nombres, archivos, props, tipos); interfaz en español con el glosario del manual (14.1): Mesa ("Mesa 04"), Comensal, Restaurante, Disponible, Reservada, Ocupada, Inactiva, Abierto, Cerrado, Capacidad ("4 personas"), Bitácora, Iniciar sesión / Cerrar sesión. **Nunca:** "Libre" como estado, cliente, local, negocio, log, historial, pax, OK, Enviar, Aceptar. Mayúscula inicial, botones = verbo + objeto, sin signos de exclamación.
- **Router y datos:** React Router y TanStack Query están acordados e instalados; las rutas viven en `src/app/router.tsx` (Sebastián). Las rutas del Sprint 1 son `/login`, `/onboarding`, `/mesas`, `/restaurante` y `/bitacora`. No agregues otra librería de estado sin acordarlo con el equipo.

### Conexión con el backend
- **Toda llamada pasa por `src/lib/api.ts`** (`apiFetch('/ruta')` o `apiUrl('/ruta')`), que agrega el origen y el prefijo `/v1`. Nunca escribas la URL del backend ni `/v1` a mano.
- `VITE_API_URL` es el origen del backend **sin `/v1` y sin `/` final**. Toda variable nueva va en `.env.example` y se tipa en `src/vite-env.d.ts`.
- Las variables `VITE_*` terminan en el navegador: **nunca pongas secretos en ellas.**
- **Errores de la API → textos del manual:** `getApiErrorMessage(error, fallback)` y `isAccessError(error)`, los dos en `src/lib/api-client.ts`. `isAccessError` dice si es un `401` (sesión vencida o correo sin verificar) o un `403` (sin permiso o sin restaurante): en esos casos se muestra el texto de `getApiErrorMessage` y no se ofrece "Intentar de nuevo". Úsala en vez de comparar `status` a mano.
- Si aparece un error de CORS, la solución está en `CORS_ORIGINS` del backend (Render), no en este repo.
- Mientras un endpoint no exista, trabaja con datos de ejemplo con la misma forma que el contrato acordado, y reemplázalos al integrar (no dejes datos de ejemplo en el PR final).

### Estado del restaurante: Abierto / Cerrado (Sergio, PBI 8)
- Vive en `src/features/restaurant-status/`, con el mismo patrón que `features/tables` (`types.ts`, `api.ts` + `api.mock.ts`, `hooks.ts`, `components/`). Contrato: `GET /restaurants/me/status` → `{ isOpen }` y `PATCH /restaurants/me/status` con `{ isOpen }`.
- Se conecta en `src/app/layouts.tsx`: `statusSlot={<RestaurantStatusControl />}` (switch del topbar + diálogo de confirmación) y `banner={<RestaurantStatusBanner />}` (aviso de cerrado con "Abrir ahora" y errores de carga o guardado). Los dos se coordinan por la caché de React Query, sin contexto.
- El switch del topbar usa la variante de estado del kit: `<Switch … onStatus="open" offStatus="closed" />` (punto que pulsa en `ok` / raya en `inactive`, de `STATUS_META`). Para un switch de estado en otra pantalla, usa esas dos props; no dibujes la forma a mano.
- Para leer el estado en otra pantalla, usa `useRestaurantStatusQuery()` (query key `restaurantStatusQueryKey`). No llames al endpoint por tu cuenta.
- Para avisar al cerrar con reservas en curso, usa `activeReservationsCount` de `GET /v1/restaurants/me` (§12.2 y §12.8), no el conteo de mesas `reserved`: una mesa Reservada a mano no es una reserva de DiNNo. Lo hace `useCountActiveReservations` (`use-active-reservations.ts`), que vuelve a pedir el restaurante justo antes de cerrar, y el texto sale de `closeWithReservationsText` (`@/features/reservations/messages`). Mock: `?mockActiveReservations=2`.
- Mock (con `VITE_USE_MOCKS=true`, en cualquier pantalla del dashboard): `?mockClosed` (empieza cerrado), `?mockError=restaurant-status-load` o `restaurant-status-save`, y `?mockLatency=`, que es compartido con mesas. Con `?mockEmpty` no hay mesas, así que el restaurante cierra sin pedir confirmación.


### Bitácora de mesas (Sergio, PBI 9)
- Vive en `src/features/activity-log/`, con el mismo patrón que `features/tables` (`types.ts`, `api.ts` + `api.mock.ts`, `hooks.ts`, `components/`). La pantalla es `/bitacora` (`ActivityLogPage.tsx`).
- **Consume `GET /v1/table-logs`** (contrato en el `CLAUDE.md` del backend, "Bitácora de mesas"): `[{ id, tableId, tableIdentifier, previousStatus, newStatus, changedAt, userEmail, source }]` (desde el Sprint 3 `userEmail` puede ser `null` y `source` es `manual`, `reservation` o `system`; el texto del autor se decide por `source` con `logAuthor` de `messages.ts`, ver §12.3), más reciente primero, máximo 200 filas, sin paginación. El filtro por mesa manda `?tableId=<id>`; sin filtro no manda nada. El restaurante sale de la sesión.
- `useTableLogsQuery(tableId?)` (query key `['table-logs', tableId ?? 'all']`) lleva **`refetchOnMount: 'always'`**: cada vez que se abre la pantalla vuelve a pedir la bitácora, así un cambio hecho en `/mesas` aparece aunque el `staleTime` global (30 s) no haya vencido. No toca `features/tables`.
- Reutiliza de mesas, sin modificarlos: `useTablesQuery` + `sortTables` para el filtro (todas las mesas, inactivas incluidas; si fallan, el filtro queda deshabilitado con "Todas las mesas") y `toTableDisplayStatus` para los chips (incluido `inactive`).
- El cambio se muestra con `StatusChip` → `arrow-right` → `StatusChip`; el lector de pantalla lee "Disponible a Ocupada". Fechas con `formatDateTime`, mesas con `formatTableName`.
- Mock (con `VITE_USE_MOCKS=true`, datos fijos con las mesas del mock de mesas): `?mockError=table-logs-load`, `?mockTableLogsFull` (200 filas) y `?mockEmpty` / `?mockLatency=` (compartidos con mesas). No refleja los cambios hechos en `/mesas`: para eso, el backend real.

### Reservas DiNNo y check-in (Sebastián, Sprint 3)
- Viven en `src/features/reservations/`, con el mismo patrón que `features/tables` (`types.ts`, `api.ts` + `api.mock.ts`, `hooks.ts`, `components/`). Contrato en §12.8: `GET /v1/restaurants/me/reservations` y `POST /v1/restaurants/me/check-ins`. **La web nunca recibe ni muestra el código de una reserva**: los tipos no lo tienen y no se agrega.
- `messages.ts` es el único mapa `errorCode → texto` del sprint (mesas protegidas, check-in, cierre con reservas). `code.ts` normaliza el código (mayúsculas, sin espacios, 6 del alfabeto). `countdown.ts` calcula el tiempo restante con `expiresAt − serverTime` y un reloj monotónico, nunca solo con el reloj del equipo.
- En `/mesas`: el panel «Reservas DiNNo» (`ReservationsPanel`, consulta cada 30 s) y «Validar código» (`CheckInDialog`), el botón principal de la pantalla. Una mesa con reserva activa se ve como «Reserva DiNNo» (`useDinnoTableIds` cruza la lista con las mesas por `tableId`): sin selector de estado, sin atajos D/R/O y sin «Desactivar».
- Mock (con `VITE_USE_MOCKS=true`): `?mockDinno=01,07` crea reservas en esas mesas (los dos mocks lo leen). Códigos: `K7M4QX` y `P3R8TW` son válidos; `VENC9D` (vencida), `USAD4S` (ya usado) y `CANC3X` (cancelada) fuerzan cada resultado. `?mockError=reservations-list` o `check-in`.

### Tiempo real del dashboard (Sebastián, Sprint 3)
- **Un solo socket por sesión:** `useRestaurantRealtime` (`src/features/realtime/`), montado en `DashboardLayout`. Usa `socket.io-client`, se conecta a `API_ORIGIN` (`src/lib/api.ts`, sin `/v1`) por WebSocket, con `auth` como función que pide un token nuevo con `getAuthToken()` en cada conexión. **No abras otro socket**; para escuchar algo nuevo, agrégalo en ese hook.
- Solo conecta con el restaurante ya registrado (`useRestaurantQuery` con datos) y nunca con `VITE_USE_MOCKS=true`. Se desconecta al cerrar sesión, y reconecta si cambia el restaurante (las salas se fijan al conectar).
- **Eventos (§12.8):**
  - `reservation.created` agrega la fila del panel (sin duplicar).
  - `reservation.cancelled`, `.expired` y `.checked_in` la quitan, con un toast corto (no para el check-in hecho en este mismo dispositivo).
  - `table.status_changed` vuelve a pedir las mesas, lo que también hace sonar el anillo de cambio remoto.
- **Fallas:** al reconectar se vuelve a pedir todo. `connect_error` `SERVER_ERROR` se reintenta a los 5, 15 y 30 s; los demás códigos no se reintentan. El panel sigue consultando cada 30 s.
- El estado de la conexión vive en `connection.ts` (`useLiveConnection`) y lo muestra el `LiveIndicator` del kit en el topbar (`RestaurantLiveIndicator`).
- **Pruebas:** `socket.io-client` está simulado en todas (`src/test/fake-socket.ts`, desde `setup.ts`), así que ninguna abre una conexión real. Usa `lastSocket()` para emitir eventos del servidor.

### Registro del restaurante (Santiago, PBI 3)
- Vive en `src/features/restaurant/` (carpeta compartida con la pantalla `/restaurante` de Jacobo): `types.ts`, `api.ts`, `hooks.ts`, `restaurant-form.ts`, `components/RestaurantForm.tsx` y `OnboardingPage.tsx` (`/onboarding`). Sin mock: el endpoint ya existe.
- **Contrato:** `POST /v1/restaurants` con `{ name, category, address, schedules: [{ dayOfWeek 1–7 (1 = lunes), isOpen24h, opensAt "HH:MM", closesAt "HH:MM" }] }`: un elemento por día abierto, sin horas si abre 24 horas. Responde `201` con la misma forma que `GET /v1/restaurants/me`.
- **Reglas y textos en un solo lugar:** `restaurant-form.ts`, iguales a `RestaurantFieldsDto`, `RegisterRestaurantDto` y `RestaurantScheduleDto` del backend. Si el backend cambia una regla, se cambia ahí. Los errores de la API pasan por `describeRestaurantSaveError`: el texto del backend nunca se muestra (un `400` se vuelve a revisar con las reglas de la web).
- **Para la edición (`/restaurante`):** `<RestaurantForm initialValues={toRestaurantFormValues(restaurante)} submitLabel="Guardar cambios" onCancel={…} onDirtyChange={…} />` con los datos de `useRestaurantQuery()` (query key `restaurantQueryKey`). No dupliques el formulario ni sus validaciones.
- **Horario inicial (decisión de Santiago):** los 7 días empiezan en Cerrado; al abrir uno trae 12:00 p. m. – 9:00 p. m. (`SUGGESTED_HOURS`), que la persona cambia.
- Después del `201` (o de un `409`, que ya tiene restaurante) va a `/mesas` con `replace`; el registro refresca la caché de mesas y del estado del restaurante, que tenían el `403 RESTAURANT_REQUIRED` anterior.

### Despliegue
- **Vercel** despliega a producción cuando se sube a **`main`**. El trabajo diario entra a `develop` por PR; cuando `develop` está listo y probado, se pasa a `main` por PR. Framework Vite (build `npm run build`, salida `dist`). `vercel.json` reescribe las rutas a `/` para que recargar una ruta no dé 404.
- `VITE_API_URL` se configura en Vercel (Production y Preview) y se incrusta al compilar: si cambia, hay que volver a desplegar.
- Los PR generan despliegues de vista previa: úsalos para probar antes del merge.

---

## 12. Sprint 3 · Contratos (microreservas y check-in)

> Responsable: Elizabeth. Si algo no está aquí, se pregunta antes de inventarlo. Los cambios a esta sección se anuncian en `AVISOS.md`.

**Objetivo del sprint:**
- Un comensal elige en la app un restaurante disponible, reserva una mesa por unos minutos y recibe un código y un temporizador. Puede cancelar la reserva o dejarla vencer.
- El restaurante ve las reservas entrantes en la web sin recargar y valida el check-in con el código cuando el comensal llega.
- Reserva, mesa y disponibilidad quedan siempre sincronizadas entre app, web y backend.

### 12.1 La microreserva
- **Estados:** `active` (Activa) · `cancelled` (Cancelada) · `expired` (Vencida) · `completed` (Cumplida). Solo se pasa de `active` a uno de los otros tres; nunca al revés.
- **Vigencia:** 15 minutos, configurable con la variable `RESERVATION_TTL_MINUTES` (entero entre 2 y 15; por defecto 15). Para la demo de expiración se usa 3 en Render.
- **Una sola reserva activa por comensal.** Si ya tiene una → 409 `ACTIVE_RESERVATION_EXISTS`.
- **Personas:** de 1 a 20, igual que el filtro del Sprint 2. Si el comensal ya filtró por personas, la app lo trae precargado.
- **Cuándo se puede reservar:** solo si el restaurante está abierto ahora (`is_open` y horario de Bogotá, la misma regla `isOpenNow` de disponibilidad) y tiene una mesa activa (`is_active`), con estado `available` y capacidad ≥ personas. Se reutilizan las reglas de disponibilidad del Sprint 2; no se duplican.
- **Asignación de mesa:** la mesa libre más pequeña que alcance. Si hay empate, la de identificador menor. Así no se gasta una mesa de 8 en una pareja.
- Una mesa que el restaurante puso en Reservada a mano nunca se asigna a una microreserva, porque no está `available`.
- **Código:** 6 caracteres de mayúsculas y números, sin los que se confunden (0, O, 1, I, L). Alfabeto: `23456789ABCDEFGHJKMNPQRSTUVWXYZ`. Ejemplo: `K7M4QX`. Único entre las reservas activas. Al validarlo, el backend lo normaliza (quita espacios y pasa a mayúsculas).
- **Temporizador:** manda la hora del servidor. Cada respuesta de reserva trae `expiresAt` y `serverTime`. La app calcula la diferencia con su propio reloj y cuenta hacia atrás con eso.
- **Fechas:** todas las fechas de la API van en ISO 8601 UTC. `serverTime` es la hora del servidor al momento de responder.

### 12.2 Mesas con reserva activa
Una microreserva dura como máximo 15 minutos y siempre termina sola (check-in, cancelación o vencimiento), así que bloquear la mesa mientras tanto no deja nada trabado. Si el restaurante pudiera liberarla a mano, DiNNo podría asignársela a otro comensal mientras el primero va en camino. Si el comensal llega, el camino es el check-in, no cambiar el estado.

| Acción del restaurante | Mesa con reserva DiNNo activa | Mesa Ocupada o Reservada a mano |
|---|---|---|
| Cambiar el estado (`PATCH /v1/tables/:id/status`) | 409 `TABLE_HAS_ACTIVE_RESERVATION` | Permitido |
| Desactivar (`POST /v1/tables/:id/deactivate`) | 409 `TABLE_HAS_ACTIVE_RESERVATION` | 409 `TABLE_NOT_AVAILABLE_TO_DEACTIVATE` (primero se pasa a Disponible) |
| Bajar la capacidad (`PATCH /v1/tables/:id`) | 409 `TABLE_HAS_ACTIVE_RESERVATION` solo si queda por debajo de las personas de la reserva | Permitido |
| Editar el identificador | Permitido | Permitido |
| Cerrar el restaurante | Permitido, con aviso; la reserva se respeta | Permitido |

- Si aplican los dos 409, gana `TABLE_HAS_ACTIVE_RESERVATION`.
- **Cambio de comportamiento frente al Sprint 2:** antes se podía desactivar una mesa `reserved` u `occupied` conservando su estado. Desde ahora solo se desactiva una mesa `available`.
- Reactivar no cambia: la mesa vuelve como `available`.
- **Cerrar el restaurante con reservas activas:** el cierre se hace igual. Las reservas existentes siguen hasta el check-in, la cancelación o el vencimiento, y no se aceptan nuevas (`RESTAURANT_CLOSED`).
- **Mensajes en la web:**
  - `TABLE_HAS_ACTIVE_RESERVATION` → «Esta mesa tiene una reserva de DiNNo en curso. Se libera sola cuando el comensal llegue, cancele o se venza la reserva.»
  - `TABLE_NOT_AVAILABLE_TO_DEACTIVATE` → «Para desactivar esta mesa, primero márcala como Disponible.»
  - Cerrar con reservas activas → «Tienes N reservas en curso; se mantendrán hasta que lleguen o se venzan.» (N = `activeReservationsCount`).

### 12.3 Mesa y reserva siempre juntas

| Evento | Reserva | Mesa | Bitácora: `source` | Bitácora: `user_id` |
|---|---|---|---|---|
| Crear microreserva | `active` | `available` → `reserved` | `reservation` | el comensal |
| Cancelar (comensal) | `cancelled` | `reserved` → `available` | `reservation` | el comensal |
| Vencer sin llegar | `expired` (no-show) | `reserved` → `available` | `system` | `null` |
| Check-in válido | `completed` | `reserved` → `occupied` | `reservation` | el `restaurant_admin` |
| Cambio manual (como hoy) | — | según el cambio | `manual` | el `restaurant_admin` |

- Todo cambio de reserva y mesa va en una sola transacción: o se guardan los dos o ninguno.
- **Bitácora (`table_logs`):**
  - `user_id` pasa a ser nullable.
  - Se agrega la columna `source` (`'manual'` | `'reservation'` | `'system'`). Los registros existentes quedan con `source = 'manual'`.
  - `GET /v1/table-logs` empieza a devolver `source` y puede traer el usuario en `null` en dos casos: los cambios automáticos (`system`, sin usuario) y los de un comensal (`reservation`), cuyo correo nunca se le muestra al restaurante. La web muestra el texto según `source`: `manual` → el correo del admin · `reservation` con usuario en `null` → "Comensal" · `reservation` con correo (el check-in) → el correo del admin · `system` → "Automático".
- La mesa vuelve a `available` solo si sigue en `reserved` por esa reserva. Nunca se pisa un estado que el restaurante cambió después.

### 12.4 Concurrencia (dos personas, una mesa)
- La creación bloquea las mesas candidatas dentro de la transacción (`SELECT … FOR UPDATE SKIP LOCKED`) y revalida su estado antes de confirmar.
- **Defensa final en la base, con índices únicos parciales:**
  - una reserva `active` por mesa;
  - una reserva `active` por comensal;
  - código único entre las reservas `active`.
- Si dos solicitudes compiten por la última mesa, una gana y la otra recibe 409 `NO_TABLE_AVAILABLE`.

### 12.5 Expiración
- La fuente de verdad es `expires_at` en PostgreSQL. No se usa un temporizador en memoria ni en Redis.
- Un proceso del backend corre cada 15 s y vence de una sola vez todas las reservas `active` cuyo `expires_at` ya pasó (`UPDATE … RETURNING`). Es idempotente: al arrancar el servicio, vence lo que haya quedado pendiente.
- Además, cualquier lectura u operación sobre una reserva activa que ya pasó su `expires_at` la vence en ese momento y la devuelve como `expired`, aunque el proceso no haya pasado todavía.
- La reserva vencida queda marcada como no-show (`expired_at` y `no_show = true`) para el Sprint 4 y la IA.

### 12.6 Check-in
- Lo hace el restaurante desde la web, escribiendo el código que le muestra el comensal.
- Un código de otro restaurante responde igual que uno inexistente: no se revela que existe.
- **Evento facturable:** cada check-in válido crea un registro en `check_ins` (restaurante, reserva, fecha y hora). Es único por reserva, así que nunca se cobra dos veces. El estado de cuenta se construye en el Sprint 4.
- **La web nunca muestra el código de una reserva en la lista;** si lo mostrara, el check-in no comprobaría nada. Muestra nombre del comensal, personas, mesa y tiempo restante.

| Situación | Respuesta | Qué ve el restaurante |
|---|---|---|
| Código válido | 200 | «Check-in confirmado · Mesa {tableIdentifier} · {partySize} personas · {dinerName}» |
| No existe, formato inválido o es de otro restaurante | 404 `RESERVATION_CODE_NOT_FOUND` | «No encontramos una reserva con ese código en tu restaurante.» |
| Vencida | 409 `RESERVATION_EXPIRED` | El `message` del backend, p. ej. «Esta reserva se venció a las 12:41. La mesa ya se liberó.» |
| Ya usada | 409 `RESERVATION_ALREADY_USED` | El `message` del backend, p. ej. «Este código ya se usó a las 12:35.» |
| Cancelada | 409 `RESERVATION_CANCELLED` | «El comensal canceló esta reserva.» |

- En el mensaje de check-in confirmado, un `dinerName` en `null` se muestra como «Comensal», igual que en la lista de reservas.
- **Errores:** se mantiene el formato actual `{ statusCode, message, error, errorCode }`, sin campos nuevos (§10 y CLAUDE.md del backend, §11 «API»).
- **Regla general:** cada cliente elige su texto según el `errorCode`.
- **Única excepción:** en `RESERVATION_EXPIRED` y `RESERVATION_ALREADY_USED`, el backend arma en `message` el texto final, con la hora de Bogotá en formato HH:mm de 24 h, y la web lo muestra tal cual.

### 12.7 Tiempo real
- Se amplía el WebSocket del Sprint 2: mismo gateway, mismo host y mismo handshake (token de Firebase).
- Ahora también acepta cuentas `restaurant_admin` con restaurante registrado. Si el admin no tiene restaurante, el rechazo es `RESTAURANT_REQUIRED`.
- **Salas:**
  - El comensal entra a `diners` (como hoy) y a `diner:{userId}`.
  - El restaurante entra solo a `restaurant:{restaurantId}`.
  - Cada uno recibe solo lo suyo.
- **Eventos nuevos:** `reservation.created`, `reservation.cancelled`, `reservation.expired`, `reservation.checked_in` y `table.status_changed`. `availability.changed` no cambia y sigue yendo solo a `diners`.
- Los eventos salen solo después de guardar en la base.
- **Respaldo:**
  - Al reconectar o volver a la pantalla, el cliente vuelve a consultar.
  - El panel de reservas de la web consulta además cada 30 s.
  - La pantalla de reserva activa de la app consulta cada 30 s.
- Redis sigue sin usarse para Socket.IO, porque Render corre una sola instancia. El adaptador de Redis pasa al Sprint 4, con la migración a Azure.

### 12.8 Contratos de la API
Todo va bajo `/v1`, con `Authorization: Bearer <token de Firebase>` y el formato de error actual.

| Método | Ruta | Rol | Recibe | Devuelve |
|---|---|---|---|---|
| POST | `/v1/reservations` | diner | `{ restaurantId, partySize }` | 201 `Reservation` · 409 `NO_TABLE_AVAILABLE` / `ACTIVE_RESERVATION_EXISTS` / `RESTAURANT_CLOSED` · 404 si el restaurante no existe o no es visible (igual que el detalle público) · 400 validación |
| GET | `/v1/reservations/active` | diner | — | 200 `{ reservation: Reservation \| null, serverTime }` |
| GET | `/v1/reservations/:id` | diner (solo la suya) | — | 200 `Reservation` en cualquier estado (para mostrar el final) · 404 `RESERVATION_NOT_FOUND` si no existe o es de otro comensal |
| POST | `/v1/reservations/:id/cancel` | diner (solo la suya) | — | 200 `Reservation` · 409 `RESERVATION_NOT_ACTIVE` · 404 `RESERVATION_NOT_FOUND` |
| GET | `/v1/restaurants/me/reservations` | restaurant_admin | query `status?` = `active` \| `cancelled` \| `expired` \| `completed` (por defecto `active`) | 200 `RestaurantReservation[]`, la más próxima a vencer primero |
| POST | `/v1/restaurants/me/check-ins` | restaurant_admin | `{ code }` | 200 `{ reservationId, tableIdentifier, partySize, dinerName, checkedInAt }` · errores de 12.6 |
| PATCH | `/v1/tables/:id/status` · `PATCH /v1/tables/:id` · `POST /v1/tables/:id/deactivate` | restaurant_admin | igual que hoy | nuevos 409 `TABLE_HAS_ACTIVE_RESERVATION` / `TABLE_NOT_AVAILABLE_TO_DEACTIVATE` (12.2) |
| GET · PATCH · POST | `/v1/restaurants/me` (GET y PATCH) · `/v1/restaurants` (POST) | restaurant_admin | igual que hoy | ahora incluyen `activeReservationsCount` (número). Las tres respuestas siguen siendo iguales; en el POST vale 0 |
| GET | `/v1/table-logs` | restaurant_admin | igual que hoy | ahora incluye `source`; el usuario puede venir en `null` |

- Un `restaurant_admin` que llama a las rutas de diner, o un diner que llama a las de `restaurant_admin`, recibe los errores de rol que ya existen (`DINER_ACCOUNT` / `RESTAURANT_ACCOUNT`).

**`Reservation`** (la ve el comensal):
`{ id, code, status, partySize, createdAt, expiresAt, serverTime, cancelledAt, expiredAt, checkedInAt, restaurant: { id, name, address, latitude, longitude }, table: { identifier, capacity } }`
- `code` solo viene cuando `status = active`; en los demás estados es `null`.
- `cancelledAt`, `expiredAt` y `checkedInAt` vienen en `null` cuando no aplican.

**`RestaurantReservation`** (la ve el restaurante, nunca trae el código):
`{ id, status, partySize, dinerName, tableId, tableIdentifier, createdAt, expiresAt, serverTime }`
- `dinerName` sale del `displayName` del comensal y puede ser `null`. En ese caso la web muestra "Comensal", en la lista y en el mensaje de check-in confirmado (12.6).

**WebSocket** (Socket.IO, mismo host):

| Evento | Sala | Datos |
|---|---|---|
| `reservation.created` | `restaurant:{restaurantId}` | `RestaurantReservation` |
| `reservation.cancelled` · `reservation.expired` · `reservation.checked_in` | `restaurant:{restaurantId}` y `diner:{userId}` | `{ reservationId, status, tableId, at }` |
| `table.status_changed` | `restaurant:{restaurantId}` | `{ tableId, previousStatus, status, source }`. Se emite por cada fila nueva que entra a la bitácora, con los mismos valores: también en los cambios manuales, al desactivar y al reactivar. `status` y `previousStatus` pueden traer `inactive`, igual que en la bitácora |
| `availability.changed` | `diners` | sin cambios |

### 12.9 `errorCode` nuevos

| `errorCode` | HTTP | Dónde | Texto del cliente |
|---|---|---|---|
| `NO_TABLE_AVAILABLE` | 409 | `POST /reservations` | «Alguien acaba de tomar la última mesa. Prueba con otro restaurante.» |
| `ACTIVE_RESERVATION_EXISTS` | 409 | `POST /reservations` | «Ya tienes una reserva activa» + botón *Ver mi reserva* |
| `RESTAURANT_CLOSED` | 409 | `POST /reservations` | «Este restaurante acaba de cerrar.» |
| `RESERVATION_NOT_FOUND` | 404 | `GET /reservations/:id`, `POST /reservations/:id/cancel` | La app vuelve a la búsqueda |
| `RESERVATION_NOT_ACTIVE` | 409 | `POST /reservations/:id/cancel` | La app consulta `GET /reservations/:id` y muestra el estado real |
| `RESERVATION_CODE_NOT_FOUND` | 404 | `POST /restaurants/me/check-ins` | «No encontramos una reserva con ese código en tu restaurante.» |
| `RESERVATION_EXPIRED` | 409 | `POST /restaurants/me/check-ins` | `message` del backend |
| `RESERVATION_ALREADY_USED` | 409 | `POST /restaurants/me/check-ins` | `message` del backend |
| `RESERVATION_CANCELLED` | 409 | `POST /restaurants/me/check-ins` | «El comensal canceló esta reserva.» |
| `TABLE_HAS_ACTIVE_RESERVATION` | 409 | mesas (12.2) | ver 12.2 |
| `TABLE_NOT_AVAILABLE_TO_DEACTIVATE` | 409 | `POST /tables/:id/deactivate` | ver 12.2 |

Los 404 y 409 existentes de mesas siguen sin `errorCode`; no se cambian en este sprint.

### 12.10 Fuera de alcance del Sprint 3
- Que el restaurante cancele una reserva.
- Notificaciones push.
- Estado de cuenta y comisiones (Sprint 4).
- Límite de peticiones y de conexiones WebSocket (Sprint 4, seguridad).
- Adaptador de Redis para Socket.IO (Sprint 4, Azure).
- Extender el tiempo de una reserva.

### 12.11 Cuándo está listo cada cosa (plan original; el estado real está en `AVISOS.md`)

> Plan original por días, del 3 nov. **Estado real:** las tareas 1 a 10 del backend están hechas en `feat/sprint3-backend` y se despliegan en Render cuando se fusione a `develop`. El orden de merge está en la entrada de cierre del 6 nov de `AVISOS.md`.

| Día | Qué queda listo |
|---|---|
| 1 | Este contrato. Mientras tanto, el front trabaja con datos de ejemplo que tengan exactamente estas formas |
| 2 | `POST /reservations`, `GET /reservations/active`, `GET /reservations/:id` y las reglas de mesas con reserva activa (12.2) |
| 3 | Cancelación, expiración automática, `GET /restaurants/me/reservations` y check-in (se puede probar en Swagger) |
| 4 | WebSocket con salas y eventos de reserva. Hasta entonces, consultar cada 30 s |
| 5 | Todo integrado en Render + Neon |
