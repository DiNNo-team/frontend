# AGENTS.md · DiNNo · frontend (dashboard web del restaurante)

Guía corta para asistentes de código. **Las reglas completas están en [`CLAUDE.md`](CLAUDE.md)**: léelo primero. Este archivo no las repite; resume cómo está el repo hoy y enlaza al resto. Para levantar el proyecto, ver el [`README.md`](README.md). Los cambios recientes del equipo están en [`AVISOS.md`](AVISOS.md).

## Versiones: revisa antes de usar una API

React 19, Vite 8, Tailwind CSS v4, TypeScript 6 y Node 24 son más nuevos que lo que suele conocer un asistente. Lee `package.json` y la documentación oficial de la versión instalada. **Tailwind v4 no usa `tailwind.config.js` ni `@tailwind`:** se configura con `@tailwindcss/vite` y CSS (`src/styles/globals.css` + `src/styles/tokens.css`). Detalle en `CLAUDE.md`, sección 11, «Versiones».

## Comandos

```bash
npm ci              # instalar (también después de cada pull)
npm run dev         # http://localhost:5173
npm run build       # tsc -b + vite build -> dist/
npm run lint        # oxlint
npm run typecheck   # tsc -b
npm test            # vitest run (npm run test:watch para observar)
npm run check:ui    # reglas del manual de identidad
npm run preview     # sirve dist/
```

Antes de dar una tarea por terminada: `npm run lint`, `npm run build`, `npm test` y `npm run check:ui` sin errores.

## Estructura actual

```
src/
├── app/                 router.tsx (React Router), providers, layouts, guardas de sesión y pantallas de cuenta
├── components/
│   ├── ui/              kit de componentes (Sebastián) + README.md
│   └── layout/          AppShell: sidebar y topbar (Sebastián)
├── features/
│   ├── auth/            login con correo y con Google, sesión de Firebase (Jacobo)
│   ├── restaurant/      registro (Santiago) y edición del restaurante (Jacobo)
│   ├── restaurant-status/  switch Abierto/Cerrado (Sergio)
│   ├── tables/          mesas (Sebastián)
│   └── activity-log/    bitácora (Sergio)
├── lib/                 api.ts, api-client.ts, format.ts, icon.tsx, theme… (Sebastián)
├── styles/              tokens del manual + globals.css
├── dev/kit/             página /kit, solo en desarrollo
└── test/                setup.ts y render.tsx (renderWithProviders)
docs/                    manual, mockups, reparto del Sprint 1 y qa/ (matriz de pruebas)
```

Rutas: `/login`, `/onboarding`, `/mesas`, `/restaurante`, `/bitacora` y `/kit` (solo en desarrollo); `/` lleva a `/mesas`.

## Convenciones del código

- **Cada funcionalidad sigue el mismo patrón** que `features/tables`: `types.ts`, `api.ts` + `api.mock.ts`, `hooks.ts` (TanStack Query) y `components/`. Los textos de la interfaz van en `messages.ts` cuando son varios.
- **Toda llamada al backend pasa por `src/lib/api.ts` y `src/lib/api-client.ts`**: agregan el origen, `/v1` y el token de Firebase, y traducen los errores con `getApiErrorMessage` e `isAccessError`. Nunca escribas la URL del backend ni `/v1` a mano.
- **Datos de ejemplo:** `VITE_USE_MOCKS=true` cambia el `api.ts` de mesas, estado del restaurante y bitácora por su `api.mock.ts` (carga diferida, para que no llegue a producción). `restaurant` no tiene mock y la sesión siempre usa Firebase.
- **Pantallas solo con el kit** (`@/components/ui`) y con tokens. Nada de colores, radios, sombras ni valores arbitrarios de Tailwind; `npm run check:ui` lo revisa. Detalle en `CLAUDE.md`, sección 11, «Diseño» y «Kit de componentes».
- **Pruebas:** Vitest + Testing Library. Renderiza con `renderWithProviders` (`src/test/render.tsx`) y mockea la API con `vi.mock('./api', () => ({ … }))` usando el `api.mock.ts` de la funcionalidad. Para estados «mientras guarda», deja la promesa pendiente y suéltala en un `finally`, sin timeouts reales (ver `AVISOS.md`, 20 oct).
- **Nombres en inglés** en el código; **textos de la interfaz en español**, con el glosario del manual.
- **Variables de entorno:** solo `VITE_*`, tipadas en `src/vite-env.d.ts` y documentadas en `.env.example` y en el README. Nunca secretos.

## Lo que no se hace

Las reglas completas están en el `CLAUDE.md` (secciones 3 a 7). En corto:
- No hagas commit, push, merge ni rebase sin que la persona lo pida; nunca directo a `develop` ni a `main`.
- No leas ni edites `.env` / `.env.local`; usa `.env.example`.
- No instales dependencias sin preguntar.
- No modifiques `components/ui` ni `components/layout` (son de Sebastián) ni el código de otra persona sin avisar.
- Sin `console.log`, código comentado ni `TODO` sin dueño.
