# DiNNo — Dashboard web

Dashboard web del restaurante en DiNNo: iniciar sesión, registrar y editar el restaurante, administrar mesas, abrir y cerrar el restaurante y ver la bitácora. Es una SPA con **React 19 + Vite 8 + TypeScript + Tailwind CSS v4**, desplegada en **Vercel**. Consume la API del backend (NestJS, repositorio aparte, desplegado en Render).

> Las reglas del equipo (git, diseño, kit, textos) están en [`CLAUDE.md`](CLAUDE.md) y los cambios del día en [`AVISOS.md`](AVISOS.md). Léelos antes de empezar.

## 1. Requisitos

- **Node.js 24**, fijado en `.nvmrc` y en `engines`. Con nvm: `nvm use`.
- **npm** (viene con Node). No uses yarn, pnpm ni bun.

## 2. Instalación

```bash
git clone https://github.com/DiNNo-team/frontend.git
cd frontend
nvm use          # opcional, usa Node 24
npm ci
cp .env.example .env.local   # y completa los valores (sección 3)
```

Después de cada `git pull` o merge de `develop`, vuelve a correr `npm ci`.

## 3. Variables de entorno

Van en `.env.local`, que no se versiona. Se leen al iniciar `npm run dev`: **si cambias una, reinicia el servidor**.

| Variable | Obligatoria | Para qué | Ejemplo |
|---|---|---|---|
| `VITE_API_URL` | Sí | Origen del backend, **sin `/v1` y sin `/` final**. `src/lib/api.ts` le agrega `/v1` | `http://localhost:3000` (local) o `https://dinno-backend.onrender.com` (Render) |
| `VITE_USE_MOCKS` | No | `true` usa datos de ejemplo en memoria para mesas, estado Abierto/Cerrado y bitácora. Cualquier otro valor, o sin la variable, usa el backend | `false` |
| `VITE_FIREBASE_API_KEY` | Sí | Configuración pública de Firebase Authentication (no es secreta) | `your-firebase-api-key` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Sí | ídem | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Sí | ídem | `your-firebase-project-id` |

- **Los valores reales nunca van en el repo.** Pídeselos a Elizabeth por privado, igual que las cuentas de prueba para iniciar sesión.
- **Firebase hace falta incluso con `VITE_USE_MOCKS=true`:** los mocks cubren los datos, pero el inicio de sesión siempre usa Firebase. Sin las tres `VITE_FIREBASE_*` la web queda en blanco.
- Todas las `VITE_*` terminan en el navegador: **nunca pongas secretos en ellas**.
- Si agregas una variable, va también en `.env.example` (con un valor de ejemplo y un comentario) y tipada en `src/vite-env.d.ts`.

### Parámetros de los datos de ejemplo
Con `VITE_USE_MOCKS=true` se pueden forzar estados desde la URL. Se combinan: `/mesas?mockClosed&mockLatency=3000` o `?mockError=list,restaurant-status-save`.

| Parámetro | Dónde | Qué hace |
|---|---|---|
| `?mockError=list` | `/mesas` | Error al cargar las mesas |
| `?mockEmpty` | `/mesas`, `/bitacora` y el estado | Sin mesas (el restaurante cierra sin pedir confirmación) |
| `?mockLatency=3000` | Cualquier pantalla | Carga lenta (milisegundos) |
| `?mockClosed` | Cualquier pantalla del dashboard | El restaurante empieza cerrado |
| `?mockError=restaurant-status-load` · `restaurant-status-save` | Cualquier pantalla del dashboard | Error al cargar o al guardar el estado |
| `?mockError=table-logs-load` | `/bitacora` | Error al cargar la bitácora |
| `?mockTableLogsFull` | `/bitacora` | 200 filas (aviso del límite) |

## 4. Correr la web

```bash
npm run dev      # http://localhost:5173
```

Elige contra qué trabajas con `.env.local`:

| Modo | `.env.local` | Notas |
|---|---|---|
| **Datos de ejemplo** | `VITE_USE_MOCKS=true` (y las `VITE_FIREBASE_*`) | No necesita backend para mesas, estado ni bitácora |
| **Backend en Render** | `VITE_API_URL=https://dinno-backend.onrender.com` · `VITE_USE_MOCKS=false` | Render tiene `http://localhost:5173` en `CORS_ORIGINS`. Si está dormido, abre primero `https://dinno-backend.onrender.com/v1/health` |
| **Backend local** | `VITE_API_URL=http://localhost:3000` · `VITE_USE_MOCKS=false` | En el repo `backend`, corre `npm run start:dev` (ver su README). Escucha solo en `127.0.0.1` |

## 5. Cómo verificar que funciona

1. `npm run dev` y abre http://localhost:5173: aparece el login («Administra tu restaurante en DiNNo»).
2. Inicia sesión con una cuenta de restaurante de prueba. Con restaurante, llega a `/mesas`; sin restaurante, a `/onboarding` («Configura tu restaurante»).
3. Pantallas del dashboard: `/mesas`, `/restaurante` y `/bitacora`. El catálogo del kit está en `/kit` (solo con `npm run dev`).
4. `npm run lint`, `npm run build`, `npm test` y `npm run check:ui` terminan sin errores.

## 6. Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en http://localhost:5173 |
| `npm run build` | Chequeo de tipos (`tsc -b`) y build de producción a `dist/` |
| `npm run preview` | Sirve el build de `dist/` |
| `npm run lint` | Lint con oxlint |
| `npm run typecheck` | Chequeo de tipos (`tsc -b`) sin compilar |
| `npm test` | Pruebas con Vitest + Testing Library |
| `npm run test:watch` | Pruebas en modo observación |
| `npm run check:ui` | Reglas del manual: sin hex, sin valores arbitrarios de Tailwind, sin paleta, radios ni sombras por defecto, sin íconos prohibidos, sin `console.log` |

**Antes de abrir un PR:** `npm run lint`, `npm run build`, `npm test` y `npm run check:ui` sin errores (`build` también revisa los tipos). El flujo de ramas y PR está en el [`CLAUDE.md`](CLAUDE.md), sección 3.

## 7. Despliegue en Vercel

- **Producción se despliega desde `main`.** El trabajo diario entra a `develop` por PR; cuando `develop` está probado, pasa a `main` por PR.
- Cada PR genera un despliegue de vista previa: úsalo para probar antes del merge.
- Framework Vite (build `npm run build`, salida `dist`). `vercel.json` reescribe las rutas a `/`, así que recargar una ruta no da 404.
- Las variables se configuran en Vercel → *Settings → Environment Variables* (Production y Preview). Se incrustan al compilar: **si cambias una, vuelve a desplegar**.
- La URL de Vercel tiene que estar en `CORS_ORIGINS` del backend en Render.

## 8. Problemas comunes

| Síntoma | Causa y solución |
|---|---|
| Página en blanco y `auth/invalid-api-key` en la consola | Faltan las `VITE_FIREBASE_*` en `.env.local` (también con mocks). Agrégalas y reinicia `npm run dev` |
| Cambié `.env.local` y no pasa nada | Vite lee las variables al arrancar: detén y vuelve a correr `npm run dev` |
| Error de CORS en la consola | El origen que llama no está en `CORS_ORIGINS` del backend. Se arregla en el backend (Render), no aquí |
| La primera petición tarda mucho o falla | Render estaba dormido. Abre `https://dinno-backend.onrender.com/v1/health` y espera `{ "status": "ok" }` |
| «Tu sesión terminó. Inicia sesión de nuevo.» | El token de Firebase venció o no es válido: vuelve a iniciar sesión |
| Cambié una variable en Vercel y no se nota | Las `VITE_*` van dentro del build: vuelve a desplegar |

## 9. Más documentación

- [`CLAUDE.md`](CLAUDE.md): reglas del equipo, contrato de la API (sección 10) y reglas de este repo (sección 11).
- [`AVISOS.md`](AVISOS.md): cambios que el equipo debe conocer, lo más nuevo arriba.
- [`AGENTS.md`](AGENTS.md): guía corta para asistentes de código.
- [`docs/qa/matriz-sprint2.md`](docs/qa/matriz-sprint2.md): matriz de pruebas del Sprint 2.
- [`docs/DiNNo_Manual_Identidad_v1_1.md`](docs/DiNNo_Manual_Identidad_v1_1.md): manual de identidad.
