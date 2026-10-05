# DiNNo — Dashboard web

Plataforma web de DiNNo: dashboard para la gestión del restaurante. Es una SPA construida con **React + Vite + TypeScript + Tailwind CSS v4** y desplegada en **Vercel**. Consume la API del backend (NestJS, repositorio aparte, desplegado en Render).

## Requisitos

- **Node.js 24 (LTS)**. La versión está fijada en `.nvmrc`; con nvm basta con ejecutar `nvm use`.
- npm (incluido con Node).

## Instalación

```bash
git clone https://github.com/DiNNo-team/frontend.git
cd frontend
nvm use        # opcional, usa Node 24
npm ci
```

## Variables de entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.example .env.local
```

| Variable       | Descripción                  | Valor en local          |
| -------------- | ---------------------------- | ----------------------- |
| `VITE_API_URL` | Origen del backend, **sin `/v1` y sin `/` final** | `http://localhost:3000` |

Todas las rutas del backend llevan el prefijo `/v1`. Tanto `VITE_API_URL` como el prefijo `/v1` se manejan de forma centralizada en [`src/lib/api.ts`](src/lib/api.ts): usa `apiFetch('/health')` (o `apiUrl('/health')`) y se resuelve a `${VITE_API_URL}/v1/health`. No hardcodees el origen ni `/v1` en las llamadas individuales.

`.env.local` (y cualquier `.env*` salvo `.env.example`) no se versiona. Si agregas una variable nueva, añádela también a `.env.example` y a su tipado en `src/vite-env.d.ts`.

> Solo las variables con prefijo `VITE_` quedan expuestas al cliente. No pongas secretos en ellas.

## Comandos

| Comando           | Descripción                                            |
| ----------------- | ------------------------------------------------------ |
| `npm run dev`     | Servidor de desarrollo en `http://localhost:5173`      |
| `npm run build`   | Chequeo de tipos (`tsc`) y build de producción a `dist/` |
| `npm run preview` | Sirve localmente el build de `dist/`                   |
| `npm run lint`    | Ejecuta el linter (oxlint)                             |
| `npm run typecheck` | Chequeo de tipos (`tsc -b`) sin compilar             |
| `npm test`        | Pruebas con Vitest + Testing Library (`npm run test:watch` en modo observación) |
| `npm run check:ui` | Revisa `src/` contra las reglas del manual de identidad: sin hex, sin valores arbitrarios de Tailwind, sin paleta/radios/sombras por defecto, sin íconos prohibidos, sin `console.log` |

## Cómo verificar que funciona

1. `npm run dev` y abre http://localhost:5173: debe verse el logo de DiNNo centrado sobre fondo crema.
2. Con el backend corriendo en local, comprueba la conexión desde la consola del navegador:
   ```js
   const { apiFetch } = await import('/src/lib/api.ts') // solo en `npm run dev`
   await apiFetch('/health').then((r) => r.json()) // { status: 'ok' }
   ```
   Si aparece un error de CORS, revisa que `CORS_ORIGINS` del backend incluya `http://localhost:5173`.
3. `npm run lint`, `npm run build`, `npm test` y `npm run check:ui` deben terminar sin errores.

## Despliegue en Vercel

1. Importa el repositorio en Vercel. El framework se detecta como **Vite** (build: `npm run build`, salida: `dist`).
2. En **Settings → Environment Variables** define `VITE_API_URL` con la URL pública del backend en Render (por ejemplo `https://dinno-backend.onrender.com`, sin `/v1` ni `/` final) para *Production* y *Preview*.
3. Agrega la URL de producción de Vercel (por ejemplo `https://<proyecto>.vercel.app`) a `CORS_ORIGINS` en el backend de Render; si no, el navegador bloqueará las peticiones.
4. Cada push a la rama principal despliega a producción; los push a otras ramas y los PR generan despliegues de previsualización.

`vercel.json` reescribe todas las rutas hacia `/`, para que al recargar una ruta interna de la SPA no se obtenga un 404.

> Las variables `VITE_*` se incrustan en tiempo de build: si cambias `VITE_API_URL` en Vercel, vuelve a desplegar.
