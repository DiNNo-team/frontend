This is a React + Vite web application (the DiNNo restaurant-management dashboard). Prioritize type safety, small composable components, and Tailwind utility classes over custom CSS.

## Check current versions before assuming APIs

React 19, Vite 8, and Tailwind CSS v4 all changed significantly from what most training data reflects — don't assume old patterns still apply:

1. Read the versions of `react`, `vite`, and `tailwindcss` in `package.json`.
2. **Tailwind v4 has no `tailwind.config.js` and no `@tailwind base/components/utilities` directives.** Styling is wired via the `@tailwindcss/vite` plugin (`vite.config.ts`) and a single `@import "tailwindcss";` in `src/index.css`. Check https://tailwindcss.com/docs for v4-specific syntax (`@theme`, CSS-first config) before reaching for a config file that doesn't exist here.
3. For React 19 APIs (hooks, `use`, Actions, etc.), check https://react.dev against the installed version.
4. For Vite config/plugins, check https://vite.dev/config/ against the installed major version.

## Commands

```bash
npm run dev       # dev server at http://localhost:5173
npm run build      # tsc -b (typecheck) + vite build -> dist/
npm run preview    # serve the dist/ build locally
npm run lint        # oxlint
```

Run `npm run lint` and `npm run build` before declaring any task done — `build` also typechecks.

## Architecture

This is an early-stage skeleton: `src/App.tsx`, `src/main.tsx`, `src/index.css`, `src/vite-env.d.ts` — no routing, state management, or component/page folder convention exists yet. When adding real features, establish a clear split (e.g. `src/components/`, `src/pages/`) rather than growing `App.tsx` monolithically, and check with the team before introducing a router or state library so all three DiNNo repos stay consistent in approach.

## Connecting to the backend

- The backend URL comes from `VITE_API_URL` (see `.env.example` / `src/vite-env.d.ts`), **without** `/v1` and without a trailing `/`.
- All backend routes are prefixed with `/v1`, so calls are built as `` `${import.meta.env.VITE_API_URL}/v1/...` `` (e.g. `/v1/health`).
- Only env vars prefixed `VITE_` are exposed to client code — never put secrets in them, and never hardcode the backend URL in source.
- If a request fails with a CORS error, the backend's `CORS_ORIGINS` needs the calling origin added (`http://localhost:5173` in dev, the Vercel URL in production) — that's a backend-repo fix, not a frontend one.

## Deployment

- Hosted on **Vercel**, framework auto-detected as Vite (build: `npm run build`, output: `dist`).
- `VITE_API_URL` is set in Vercel's **Settings → Environment Variables** for *Production* and *Preview* — it's embedded at build time, so changing it requires a redeploy.
- Push to the main branch deploys to production; other branches and PRs get preview deployments.
- `vercel.json` rewrites all routes to `/` so refreshing a client-side route doesn't 404.

## Rules

- Any new env var must be added to `.env.example` (placeholder value, comment) and typed in `src/vite-env.d.ts` — never commit a real `.env`/`.env.local`.
- Don't put secrets in `VITE_`-prefixed variables; they ship to the browser.
- Don't hardcode the backend origin — always go through `import.meta.env.VITE_API_URL`.
