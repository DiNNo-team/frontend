# Renovación v2.0 de DiNNo

Memoria de trabajo del Manual de Identidad v2.0, de su aplicación a la web y al móvil, y de la vista de plano de mesas. **Antes de empezar cualquier fase, lee esta carpeta completa.**

## Estado

| Fase | Estado |
|---|---|
| F0 · Auditoría (sin código) | Hecha y aprobada (D1–D12, ver `decisiones.md`) |
| F1 · Manual v2.0 | Aprobado con correcciones (vidrio al 50%, tintes al 18/22% con borde de estado). Rama `docs/sprint2-manual-v2`, sin commit |
| F2–F3 · Tokens, kit y pantallas web | Hechas el 26 oct 2026 en `refactor/sprint2-dashboard-v2`, sin commit. Registro en `02-registro.md`. **Esperando la revisión de Sebastián** |
| F6 · App móvil y login móvil | Hecha el 26 oct 2026 en `refactor/sprint2-app-v2` (`dinno-mobile`), sin commit. Verificada en el emulador. **Esperando la revisión de Sebastián** |
| F4 · Plano de mesas | Hecho el 27 oct 2026: backend en `feat/sprint2-plano-mesas` y web sobre F2–F3, sin commit. **La migración no se corrió en Neon:** falta la revisión de Elizabeth y tu confirmación. Registro y limitaciones en `02-registro.md` |
| F7 · Validación y cierre del manual | Hecha el 27 oct 2026: validaciones, manual ajustado a lo implementado (sección 19: propuestas futuras), `CLAUDE.md` de los tres repos apuntando al v2.0. Informe en [`03-informe-final.md`](03-informe-final.md) |
| F8 · v2.1 "Salón de vidrio" | Hecha el 27 oct 2026 en `feat/sprint2-dashboard-creativo`, sin commit. Registro en `02-registro.md`; resumen en el manual, sección 20. **Esperando la revisión de Sebastián** |
| F5 · Tiempo real del restaurante (D5) | Pendiente |

Ya apuntan al v2.0: el `CLAUDE.md` de los tres repos (secciones 2, 8 y 11), el README del frontend, el README del kit y `scripts/check-ui.mjs` (regla `text-opacity`). Los `AGENTS.md` no citaban el manual.

## Archivos

| Archivo | Qué es |
|---|---|
| [`01-diagnostico.md`](01-diagnostico.md) | Problemas priorizados, desviaciones del v1.1, componentes, mapa de skills, dirección v2.0, animación, plano de mesas, riesgos, fases y decisiones pendientes |
| [`decisiones.md`](decisiones.md) | Registro de decisiones y de los choques entre skills |
| [`02-registro.md`](02-registro.md) | Archivos modificados por fase, decisiones de implementación y pendientes |
| [`03-informe-final.md`](03-informe-final.md) | Informe de cierre: resumen, skills, cambios, plano, validaciones, dependencias y pendientes |
| [`capturas-comparativa.md`](capturas-comparativa.md) | Antes y después, lado a lado (web, móvil y plano) |
| [`../DiNNo_Manual_Identidad_v2_0.md`](../DiNNo_Manual_Identidad_v2_0.md) | El manual v2.0 (fuente única cuando se apruebe) |
| `src/dev/sistema/` | Página de muestra `/sistema` (solo en desarrollo; fuera de la navegación y del build de producción). Se borra cuando el v2.0 llegue a las pantallas |
| [`capturas-v1/`](capturas-v1/) | El "antes": web (arnés con datos de ejemplo) y móvil (emulador con `EXPO_PUBLIC_USE_MOCKS=true`) |
| [`capturas-v2/`](capturas-v2/) | El "después" del móvil, en claro y en oscuro (mismo método) |
| [`capturas-v2-1/`](capturas-v2-1/) | El dashboard v2.1 "Salón de vidrio" |

## Reglas de esta renovación (del prompt de Sebastián)

- Se conservan: la paleta completa (sin colores nuevos; las opacidades nuevas se aprueban), el logo, "estado = color + forma + palabra", el login web (solo se toca ante una falla técnica, explicada antes) y Plus Jakarta Sans (cambiar la familia necesita aprobación).
- No se cambian la autenticación, los roles, los contratos de la API, la lógica de reservas, pedidos ni notificaciones, ni la navegación. No se reemplazan datos reales por datos de ejemplo.
- La única funcionalidad nueva es el plano de mesas. El backend no se toca sin aprobación.
- Dependencias nuevas: se proponen con su motivo, su peso y sus alternativas, y se espera aprobación.
- Ningún commit, push ni despliegue sin autorización expresa.
- Solo servicios gratuitos.

## Cómo se tomaron las capturas (para repetirlas en el "después")

- **Web:** un arnés de Vite fuera del repo reusa `routes`, `Providers` y los `api.mock.ts` con una sesión simulada, y `/restaurants/me` responde con un restaurante de ejemplo. Las capturas se toman con el CDP que trae Taste skill (`scripts/lib/cdp.mjs`) en 1440, 768 y 390 px. Se puede rehacer en cualquier sesión. Una alternativa equivalente es `npm run dev` con `VITE_USE_MOCKS=true` y una sesión real.
- **Móvil:** emulador `Pixel_9a` con `-dns-server 8.8.8.8,1.1.1.1`, `CI=1 EXPO_PUBLIC_USE_MOCKS=true npx expo start --dev-client` y `adb reverse tcp:8081 tcp:8081`; se entra con cualquier correo y se captura con `adb exec-out screencap -p`.
