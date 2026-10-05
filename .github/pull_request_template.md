## Qué hace

<!-- Una o dos líneas. -->

**PBI / tarea de Azure:** <!-- p. ej. PBI 5 · Crear pantalla web de gestión de mesas (AB#123) -->

## Cómo probarlo

1.

## Capturas (pantallas)

| Claro | Oscuro |
|---|---|
| | |

<!-- Escritorio 1280 y, si aplica, tablet 768 y móvil 390. -->

## Afecta a otros

- [ ] No
- [ ] Sí: API · base de datos · componentes del kit o tokens · variables de entorno · dependencias nuevas (explica cuál y avisa en el grupo)

## Checklist del manual (sección 17)

- [ ] No hay hex, radios, sombras ni tamaños sueltos (ni valores arbitrarios de Tailwind): todo sale de tokens. `npm run check:ui` limpio.
- [ ] La pantalla se armó con componentes de `components/ui`; lo nuevo quedó ahí y el equipo lo sabe.
- [ ] Un solo botón primario naranja por pantalla, con texto tinta.
- [ ] Texto naranja sobre claro usa `--accent-text` (`text-accent-text`).
- [ ] Cada estado tiene color + forma + palabra, con los nombres del glosario.
- [ ] Sin gradiente ni vidrio en el dashboard.
- [ ] Formularios: label arriba, "(opcional)", error con ícono y mensaje útil, botón con estado de carga.
- [ ] Hay estado de carga (skeleton), vacío y error.
- [ ] Funciona en claro y oscuro, en 1280 / 768 / 390 y con movimiento reducido.
- [ ] Se puede usar con teclado y el foco se ve. Objetivos táctiles ≥ 44 px.
- [ ] Íconos solo de Lucide; sin íconos de comida ni pins genéricos.
- [ ] Textos tuteando, mayúscula inicial, botones con verbo + objeto.

## Definition of Done (reparto, sección 10)

- [ ] Cumple los criterios de aceptación del PBI.
- [ ] Usa el kit y pasa el checklist del manual.
- [ ] Tiene estados de carga, vacío y error, y usa los textos del glosario.
- [ ] Su tarea de pruebas está hecha (`npm test`).
- [ ] `npm run lint`, `npm run build` y `npm run check:ui` en verde.
- [ ] Funciona en el ambiente desplegado.
- [ ] PR revisado y aprobado (front: Sebastián · back: Elizabeth).
