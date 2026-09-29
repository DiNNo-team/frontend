# DiNNo — Dashboard web

Plataforma web de DiNNo: dashboard para la gestión del restaurante. Es una SPA construida con **React + Vite + TypeScript + Tailwind CSS v4** y desplegada en **Vercel**. Consume la API del backend (NestJS, repositorio aparte, desplegado en Render).

## Requisitos

- **Node.js 24 (LTS)**. La versión está fijada en `.nvmrc`; con nvm basta con ejecutar `nvm use`.
- npm (incluido con Node).

## Instalación

```bash
npm install
```

## Variables de entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.example .env.local
```

| Variable       | Descripción                  | Valor en local          |
| -------------- | ---------------------------- | ----------------------- |
| `VITE_API_URL` | URL base de la API (backend) | `http://localhost:3000` |

`.env.local` no se versiona (está cubierto por `*.local` en `.gitignore`). Si agregas una variable nueva, añádela también a `.env.example` y a su tipado en `src/vite-env.d.ts`.

> Solo las variables con prefijo `VITE_` quedan expuestas al cliente. No pongas secretos en ellas.

## Comandos

| Comando           | Descripción                                            |
| ----------------- | ------------------------------------------------------ |
| `npm run dev`     | Servidor de desarrollo en `http://localhost:5173`      |
| `npm run build`   | Chequeo de tipos (`tsc`) y build de producción a `dist/` |
| `npm run preview` | Sirve localmente el build de `dist/`                   |
| `npm run lint`    | Ejecuta el linter (oxlint)                             |

## Despliegue en Vercel

1. Importa el repositorio en Vercel. El framework se detecta como **Vite** (build: `npm run build`, salida: `dist`).
2. En **Settings → Environment Variables** define `VITE_API_URL` con la URL pública del backend en Render.
3. Cada push a la rama principal despliega a producción; los push a otras ramas y los PR generan despliegues de previsualización.

`vercel.json` reescribe todas las rutas hacia `/`, para que al recargar una ruta interna de la SPA no se obtenga un 404.

> Las variables `VITE_*` se incrustan en tiempo de build: si cambias `VITE_API_URL` en Vercel, vuelve a desplegar.
