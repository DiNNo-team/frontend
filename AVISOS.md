# Avisos del frontend

> Lo que el equipo necesita saber de los cambios en `frontend`. **Lo más nuevo va arriba.**
> Si algo no te queda claro o te falta un componente, escríbele a Sebastián o propónlo en un PR al kit.

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
