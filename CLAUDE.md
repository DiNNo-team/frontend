# CLAUDE.md · DiNNo · frontend (web)

> Instrucciones para Claude Code y para el equipo. Las secciones 1 a 9 son **iguales en los tres repositorios** (backend, frontend, mobile); la sección 10 es propia de este repositorio.
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

**Sprint 1 (actual): “Restaurante operativo”.** Un restaurante puede iniciar sesión, registrar y editar sus datos, crear y administrar mesas, cambiar su estado, marcarse como abierto o cerrado y ver la bitácora, todo en el ambiente desplegado.

---

## 2. Antes de empezar cualquier tarea

1. **Pregunta qué PBI o tarea de Azure DevOps se está trabajando**, si la persona no lo dijo. No trabajes sin saber el alcance.
2. **Si no tienes en el contexto el manual de identidad v1.1 ni el plan del Sprint 1, pídelos** antes de tocar algo visual o algo que dependa de otra persona. No inventes colores, componentes, textos ni flujos.
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
- **Autenticación:** se propone Firebase Authentication, **pendiente de confirmar** (lo define Jacobo). No instales ni configures un proveedor de autenticación hasta que el equipo lo confirme. El restaurante y el usuario actual se obtienen siempre de la sesión, nunca de lo que envía el cliente.
- **Estados de mesa:** Disponible, Reservada y Ocupada. *Inactiva* es una mesa desactivada, no un estado del control. “Pocas mesas” es disponibilidad del restaurante para el comensal, no un estado de mesa.
- **Estado del restaurante:** Abierto o Cerrado.
- **Diseño:** el manual de identidad v1.1 manda sobre cualquier otra preferencia. Un solo kit de componentes; nadie crea estilos propios.
- **API:** prefijo `/v1`, contrato documentado en Swagger (`/docs`).
- **Base de datos:** cambios de esquema solo con migraciones; nunca `synchronize`.
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

## 10. Este repositorio: frontend (dashboard web del restaurante)

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

### Diseño: el manual de identidad v1.1 manda
- Si no tienes el manual en el contexto, **pídelo antes de hacer cualquier pantalla o componente.**
- El manual y los mockups están en `docs/DiNNo_Manual_Identidad_v1_1.md` y `docs/mockups/`; el reparto del sprint, en `docs/DiNNo_Sprint1_Reparto.md`. Si una imagen y el texto del manual difieren, manda el texto.
- Los tokens del manual van en `src/styles/tokens.css` (copiados tal cual, **no se editan**) y se mapean a Tailwind con `@theme inline` en `src/styles/globals.css` (manual, sección 16). Lo que el manual define sin token va como `@utility` en el bloque de extensiones de `globals.css`, con la sección del manual en un comentario. **No uses colores, radios, sombras ni tamaños sueltos, ni valores arbitrarios de Tailwind** (`bg-[#...]`, `rounded-[...]`, `text-[13px]`). Las clases genéricas de Tailwind (`bg-blue-600`, `text-slate-...`, `bg-white`, `rounded-lg`, `shadow-md`) no se usan: solo los tokens (`bg-surface`, `text-fg-2`, `rounded-card`, `shadow-card`, `text-h1`…). La escala estándar de Tailwind solo vale cuando coincide exacta con el manual (`h-12` = 48, espaciados 1·2·3·4·6·8·12). Si un token no tiene clase: `bg-(--overlay)`, `z-(--z-modal)`. `npm run check:ui` lo revisa.
- **Modo oscuro:** claro por defecto; oscuro con `data-theme="dark"` en `<html>` (`useTheme()` de `@/lib/theme-context`). Los tokens cambian solos: casi nunca hace falta `dark:`.
- Tipografía Plus Jakarta Sans 500 / 700 / 800 (sin cursivas; mayúsculas completas solo en `text-label`; `tabular-nums` en números que cambian).
- Íconos solo de `lucide-react` a través de `Icon` (`@/lib/icon`): trazo 1.75, tamaños 16 / 20 / 24, siempre con texto en navegación y botones. **Prohibidos:** `Utensils`, `ChefHat`, `Pizza`, `Coffee`, `Hamburger`, `MapPin` y cualquier pin genérico. Sin emojis.
- Naranja = acción o "ahora": texto naranja sobre claro es `text-accent-text`; nunca texto blanco sobre naranja; **los estados nunca son naranja**. Una tarjeta nunca va dentro de otra.
- Un solo botón principal naranja por pantalla, con texto oscuro.
- Estados con **color + forma + palabra**. Sin vidrio ni gradientes en el dashboard (salvo el panel de marca del login).
- Toda pantalla con estados de **carga, vacío y error**, y funcionando en **modo claro y oscuro**.
- Antes del PR, pasa el **checklist del manual (sección 17)**.

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
│   └── layout/       AppShell: sidebar y topbar (Sebastián)
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
- Si aparece un error de CORS, la solución está en `CORS_ORIGINS` del backend (Render), no en este repo.
- Mientras un endpoint no exista, trabaja con datos de ejemplo con la misma forma que el contrato acordado, y reemplázalos al integrar (no dejes datos de ejemplo en el PR final).

### Despliegue
- **Vercel** despliega a producción cuando se sube a **`main`**. El trabajo diario entra a `develop` por PR; cuando `develop` está listo y probado, se pasa a `main` por PR. Framework Vite (build `npm run build`, salida `dist`). `vercel.json` reescribe las rutas a `/` para que recargar una ruta no dé 404.
- `VITE_API_URL` se configura en Vercel (Production y Preview) y se incrusta al compilar: si cambia, hay que volver a desplegar.
- Los PR generan despliegues de vista previa: úsalos para probar antes del merge.
