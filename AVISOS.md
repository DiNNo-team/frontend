# Avisos del frontend

> Lo que el equipo necesita saber de los cambios en `frontend`. **Lo más nuevo va arriba.**
> Si algo no te queda claro o te falta un componente, escríbele a Sebastián o propónlo en un PR al kit.

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
- Lo que se reutiliza está en `CLAUDE.md` (sección 10, "Estado del restaurante").

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
