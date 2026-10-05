# DiNNo · Sprint 1: reparto y plan de trabajo

> **Sprint 1: Restaurante operativo** · Epic *Operación inicial del restaurante* (Effort 46)
> **Azure DevOps es la base para asignar y mover estados.** Este documento es el detalle que no está en Azure: qué hace cada persona, qué debe quedar listo en cada tarea, qué revisar, en qué día, de quién depende y con quién debe hablar.
> Referencias: `dinno-sprints-completo.pdf` (backlog) · `DiNNo_Manual_Identidad_v1.1` (.md / .pdf).
> **Equipo:** A = Elizabeth · B = Sebastián · C = Santiago · D = Jacobo · E = Sergio.
> **Días:** Día 1 es el primer día de trabajo después de esta planeación. Día 5 es la integración, Día 6 la prueba completa y Día 7 la demo.

---

## 1. Objetivo del sprint
Al terminar el sprint, un restaurante puede **iniciar sesión, registrar sus datos, verlos y editarlos, crear y administrar mesas, cambiar su estado manualmente, marcarse como abierto o cerrado y ver la bitácora de cambios**, todo desde la web integrada con backend y base de datos en el ambiente desplegado (no solo en local).

**Punto de partida:** la infraestructura quedó conectada en el Sprint 0 (Neon, Render, Vercel y Redis, con despliegue automático desde `develop`). El manual de identidad v1.1 ya define todo lo visual.

---

## 2. Resumen del reparto

| Persona | Rol | Qué hace | Puntos |
|---|---|---|---|
| **Elizabeth** | A | Base del backend y datos de prueba, backend de mesas, backend de la edición del restaurante, integración y demo | 10.2 |
| **Sebastián** | B | Kit visual del manual y todas las pantallas de mesas (crear, cambiar estado, editar, desactivar) | 8.7 |
| **Santiago** | C | Registro del restaurante (onboarding): formulario, validaciones y backend | 6.9 |
| **Jacobo** | D | Autenticación completa: login con Firebase y control de acceso; pantalla del restaurante (ver y editar) | 9.7 |
| **Sergio** | E | Estado abierto/cerrado del restaurante y bitácora de cambios de las mesas | 7.0 |
| Manual de identidad | — | Ya hecho | 3.5 |
| **Total** | | | **46** |

\*El Effort del backlog está en Epic y Feature; los puntos por persona son la parte proporcional de cada Feature según el trabajo que toma cada quien. Las tareas nuevas (base del backend, componentes base, pantalla de bitácora) no suman puntos porque no están en el backlog original.

### 2.1 Cómo queda en Azure

| # | PBI | Assigned To | Tareas asignadas a otra persona |
|---|---|---|---|
| 1 | Definir lineamientos visuales comunes | **Sebastián** | Tres tareas ya **Done** con el manual. Se agrega *Construir componentes base y AppShell* (Sebastián) |
| 2 | Iniciar sesión como restaurante | **Jacobo** | — (todas son de Jacobo, incluida *Implementar control de acceso por rol*) |
| 3 | Registrar información del restaurante | **Santiago** | — |
| 4 | Consultar y actualizar información del restaurante | **Elizabeth** | *Crear vista web de consulta y edición* e *Integrar actualización con backend* → **Jacobo** |
| 5 | Configurar mesas del restaurante | **Sebastián** | *Crear entidad y persistencia de mesas* e *Implementar endpoints de creación y consulta* → **Elizabeth** |
| 6 | Cambiar estado de una mesa | **Sebastián** | *Implementar actualización de estado en backend* → **Elizabeth** |
| 7 | Editar o desactivar una mesa | **Sebastián** | — |
| 8 | Cambiar estado general del restaurante | **Sergio** | — |
| 9 | Registrar cambios de estado de mesas | **Sergio** | Se agrega la tarea *Crear pantalla de bitácora* (Sergio) |
| 10 | Publicar incremento funcional del Sprint 1 | **Elizabeth** | Las tareas de Render, Neon y Vercel quedan casi hechas por el Sprint 0 |

**Tarea nueva para Elizabeth** (en el PBI 10): *Base del backend, datos de prueba y usuario de desarrollo*.

---

## 3. Principios del plan

1. **Primero la arquitectura.** El backend es un monolito modular que ya existe desde el Sprint 0, con módulos por dominio en `src/modules/`. En el Sprint 1 se usan dos: `identity-access` y `restaurant-operations`. Dentro de cada módulo, cada funcionalidad va en su subcarpeta. Si dos personas trabajan en el mismo módulo, cada una toca su subcarpeta y se coordinan cuando compartan algo.

   | Funcionalidad del sprint | Módulo | Subcarpeta | Quién |
   |---|---|---|---|
   | Usuarios, login con Firebase, control de acceso | `identity-access` | `users/`, `auth/` | Jacobo |
   | Datos del restaurante: registro | `restaurant-operations` | `restaurants/` | Santiago |
   | Datos del restaurante: edición | `restaurant-operations` | `restaurants/` | Elizabeth |
   | Estado abierto/cerrado | `restaurant-operations` | `restaurants/` (archivo propio) | Sergio |
   | Mesas: crear, consultar, cambiar estado | `restaurant-operations` | `tables/` | Elizabeth |
   | Mesas: editar y desactivar | `restaurant-operations` | `tables/` | Sebastián |
   | Bitácora | `restaurant-operations` | `table-logs/` | Sergio |

   Los módulos `reservations-checkin`, `search-availability` y `notifications` no se tocan en este sprint. La misma tabla está en el `CLAUDE.md` del backend.
2. **Lo que sostiene a los demás lo sacan Elizabeth y Sebastián primero:** la base del backend, el backend de mesas y el kit visual. Los demás construyen sobre eso.
3. **Nadie se queda esperando.** Mientras el login real no esté, todos trabajan con un **usuario de desarrollo**: un usuario de prueba que el backend acepta solo en local, como si ya hubiera iniciado sesión. Mientras el backend de algo no esté, el front trabaja con datos de ejemplo.
4. **Un solo diseño.** Todas las pantallas se construyen con el kit de Sebastián y siguen el manual v1.1. Nadie crea sus propios botones, colores, tarjetas ni estilos.
5. **Primero el backend, después el front.** Santiago, Jacobo y Sergio empiezan por su backend los días 1 y 2, mientras Sebastián termina el kit, y hacen el front desde el día 3.

---

## 4. Propuesta: autenticación con Firebase
Se propone usar **Firebase Authentication**:
- Maneja contraseñas, recuperación y seguridad de sesiones sin construirlo desde cero.
- Permite agregar **inicio de sesión con Google** casi sin trabajo extra.
- Sirve también para la app móvil del comensal en los siguientes sprints.

En este sprint basta con correo y contraseña (Google si alcanza). Jacobo es dueño de todo lo de autenticación: el login y el control de acceso. **No hay registro público:** las cuentas se crean en Firebase.

---

## 5. Calendario por días

| Día | Elizabeth (A) | Sebastián (B) | Santiago (C) | Jacobo (D) | Sergio (E) |
|---|---|---|---|---|---|
| **1** | Subcarpetas base en `identity-access` y `restaurant-operations` · migraciones · datos de prueba · usuario de desarrollo · forma común de saber quién es el usuario actual | Componentes base: botón, campo de texto, tarjeta, chip de estado | Acordar con Sergio la parte de `restaurants/` · backend del registro | Configurar Firebase · usuarios de prueba (pasarlos a Elizabeth) · usuarios en la base de datos | Acordar con Elizabeth y Santiago · estructura de la bitácora · backend del estado del restaurante |
| **2** | Backend de mesas: crear y consultar (**listo para Sebastián**) | Resto del kit + AppShell (sidebar y topbar) · pantalla de mesas con datos de ejemplo | Formulario de registro con el kit · acordar con Jacobo el formulario reutilizable | Validación de Firebase en el backend · control de acceso | Servicio de bitácora |
| **3** | Backend de mesas: cambio de estado (**listo para Sebastián**) · conectar la bitácora · backend de la edición del restaurante (**listo para Jacobo**) | Crear mesa · cambiar estado | Validaciones · integración del registro | Control de acceso funcionando para todos · pantalla de login | Switch abierto/cerrado en el topbar · confirmación al cerrar |
| **4** | Pruebas del PBI 4 · revisar PR · preparar la integración | Editar y desactivar mesas | Pruebas del registro · ajustes | Login en el ambiente desplegado · pantalla del restaurante (ver y editar) | Pantalla de bitácora · pruebas |
| **5** | **Integración** de todo en el ambiente desplegado | Corregir lo que salga | Corregir lo que salga | Corregir lo que salga | Corregir lo que salga |
| **6** | **Prueba completa de la demo con Sebastián** (sección 9) | **Prueba completa de la demo con Elizabeth** · revisión visual de todas las pantallas (sección 10) | Correcciones | Correcciones | Correcciones |
| **7** | **Demo** | | | | |

---

## 6. Dependencias y comunicación

### 6.1 Quién entrega qué a quién

| Qué | Quién lo entrega | A quién | Día | Mientras tanto… |
|---|---|---|---|---|
| Base de módulos, datos de prueba y usuario de desarrollo | Elizabeth | Todos | **1** | Cada quien arranca su parte en local |
| Componentes base (botón, campo, tarjeta, chip) | Sebastián | Todos los que hacen pantallas | **1** | Los demás hacen backend |
| Usuarios de prueba de Firebase | Jacobo | Elizabeth (datos de prueba) | **1** | Elizabeth usa usuarios de ejemplo |
| Kit completo + AppShell | Sebastián | Todos los que hacen pantallas | **2** | Los demás siguen con su backend |
| Backend de mesas: crear y consultar | Elizabeth | Sebastián | **2** | Sebastián usa datos de ejemplo |
| Servicio de bitácora | Sergio | Elizabeth y Sebastián | **2** | Las mesas funcionan sin registrar |
| Formulario del restaurante reutilizable | Santiago | Jacobo (pantalla de edición) | **3** | Jacobo arma el modo lectura |
| Backend de mesas: cambio de estado | Elizabeth | Sebastián | **3** | Sebastián usa datos de ejemplo |
| Backend de la edición del restaurante | Elizabeth | Jacobo | **3** | Jacobo arma la pantalla con datos de ejemplo |
| Control de acceso funcionando | Jacobo | Todos | **3** | Todos siguen con el usuario de desarrollo |
| Login en el ambiente desplegado | Jacobo | Todos (integración) | **4** | — |

### 6.2 Quién habla con quién y qué deben dejar acordado

| Entre | Qué acuerdan | Día |
|---|---|---|
| **Elizabeth ↔ Sebastián** | Qué datos devuelve cada acción de mesas, en qué orden salen y cómo se muestran los errores | 1 y a diario |
| **Elizabeth ↔ Jacobo** | Cómo saben todos los módulos quién es el usuario actual y a qué restaurante pertenece (Elizabeth lo deja con el usuario de desarrollo; Jacobo lo completa con Firebase **sin que los demás cambien su código**) · qué datos recibe y devuelve la edición del restaurante | 1 y 2 |
| **Elizabeth ↔ Sergio** | Qué información recibe la bitácora cuando cambia una mesa (mesa, estado anterior, estado nuevo, usuario, fecha y hora) | 1 |
| **Sebastián ↔ Sergio** | Que editar, desactivar y reactivar mesas también registre en la bitácora · dónde va el switch abierto/cerrado en el topbar | 2 |
| **Santiago ↔ Sergio** | Qué parte de `restaurant-operations/restaurants/` toca cada uno: Santiago los datos (nombre, categoría, dirección, horarios) y Sergio el estado abierto/cerrado | 1 |
| **Santiago ↔ Jacobo** | Cómo se usa el formulario del restaurante para que sirva igual en el registro y en la edición (mismos campos, mismas validaciones, mismos mensajes) | 2 |
| **Sebastián ↔ todos** | Cómo se usan los componentes del kit. Si a alguien le falta un componente, se lo pide a Sebastián; nadie lo crea por su cuenta | 1 y 2 |

Todo lo demás se trabaja por separado. Dudas del kit visual → Sebastián. Dudas de backend o arquitectura → Elizabeth.

---

## 7. Detalle por persona

### Regla para todos los que hacen pantallas (Santiago, Jacobo, Sergio y Elizabeth)
**Antes de hacer cualquier pantalla:**
1. Revisa lo que hizo Sebastián en el kit (`components/ui` y `components/layout`) y el manual v1.1 (secciones 9 a 15).
2. **Usa exactamente esos componentes**: botones, campos, tarjetas, chips, alertas, toasts, diálogos, estados vacíos y de carga. No crees botones, colores, sombras, tarjetas ni estilos propios, y no escribas colores sueltos.
3. Si te falta algo, **pídeselo a Sebastián** o propónselo en un PR para el kit. No lo resuelvas dentro de tu pantalla.
4. Mira una pantalla de mesas de Sebastián como referencia de espaciado, títulos y estructura (encabezado, contenido, acciones).
5. Antes de pedir revisión, pasa el **checklist del manual (sección 17)**.

---

### Elizabeth (A) · Base del backend, backend de mesas, backend de la edición del restaurante, integración y demo · 10.2 puntos
**En Azure:** PBI 4 (backend y pruebas) · PBI 10 · tareas de backend de mesas del PBI 5 y del PBI 6 · tarea nueva de base del backend.

| Día | Tarea (Azure) | Qué debe quedar listo | Qué revisar |
|---|---|---|---|
| 1 | *(Nueva)* Base del backend, datos de prueba y usuario de desarrollo *(PBI 10)* | Subcarpetas base dentro de `identity-access` (`users/`, `auth/`) y `restaurant-operations` (`restaurants/`, `tables/`, `table-logs/`), según la tabla de la sección 3, para que cada quien construya su parte · configuración de migraciones (aún no existe) · tabla del restaurante con lo mínimo y tabla de mesas · datos de prueba: un usuario **sin** restaurante (para probar el registro) y otro con *Casa 72* y 8 mesas · usuario de desarrollo · **una forma común de saber quién es el usuario actual y su restaurante**, que todos los módulos usan y que Jacobo luego conecta con Firebase | Todos pueden correr el backend en local con los datos de prueba · el usuario de desarrollo **no funciona en el ambiente desplegado** · README con cómo correrlo |
| 2 | Crear entidad y persistencia de mesas *(PBI 5)* | Mesas con identificador, capacidad, estado (Disponible, Reservada, Ocupada), activa o inactiva y restaurante al que pertenecen | El identificador no se repite dentro del mismo restaurante · capacidad entre 1 y 20 |
| 2 | Implementar endpoints de creación y consulta *(PBI 5)* | Crear una mesa y listar las del restaurante (activas e inactivas) | La mesa siempre queda en el restaurante del usuario actual, nunca en otro · errores con mensajes claros · **avisar a Sebastián cuando esté listo** |
| 3 | Implementar actualización de estado en backend *(PBI 6)* | Cambiar el estado entre Disponible, Reservada y Ocupada; cada cambio queda en la bitácora con el servicio de Sergio | Una mesa inactiva no cambia de estado · solo el restaurante dueño la cambia · si falla la bitácora, no queda el cambio a medias · **avisar a Sebastián** |
| 3 | Implementar actualización de datos en backend *(PBI 4)* | Actualizar nombre, categoría, dirección y horarios con **las mismas validaciones** que Santiago usa en el registro (reutilizarlas, no copiarlas) | Datos inválidos se rechazan con mensaje claro · **avisar a Jacobo cuando esté listo** |
| 4 | Probar consulta y modificación *(PBI 4)* | Pruebas de consultar y editar: datos válidos, inválidos y persistencia | Criterios del PBI 4: se ven los datos actuales, se editan los permitidos, persisten y se confirma el éxito |
| 4 | Desplegar backend en Render · Preparar PostgreSQL en Neon · Desplegar web en Vercel *(PBI 10)* | Ya conectados desde el Sprint 0: verificar que el código del sprint se despliega bien desde `develop` | Variables de entorno completas (incluidas las de Firebase) · `.env.example` actualizado · ningún secreto en el repositorio |
| 5 | Integrar web desplegada con backend desplegado *(PBI 10)* | La web en Vercel usa el backend en Render y la base en Neon, con el login real de Jacobo | Todo el flujo funciona sin depender del computador de nadie |
| 6 | Ejecutar prueba end-to-end del Sprint 1 *(PBI 10)* | Recorrido completo de la demo (sección 9), **junto con Sebastián** | Los errores se anotan y se reparten ese mismo día |

**Revisa los PR de backend** de todos: organización por módulos, validaciones en el backend, que nadie lea el restaurante de lo que manda el cliente (siempre del usuario actual), manejo de errores y que no haya secretos.

**Al final verifica que coincida:** los estados de mesa del backend son los mismos que muestra Sebastián y que registra Sergio · las validaciones de la edición son las mismas del registro · cada cambio de mesa aparece en la bitácora.

---

### Sebastián (B) · Kit visual y pantallas de mesas · 8.7 puntos
**En Azure:** PBI 1 · PBI 5 · PBI 6 · PBI 7 (menos las tareas de backend de mesas del 5 y del 6, que son de Elizabeth).

| Día | Tarea (Azure) | Qué debe quedar listo | Qué revisar |
|---|---|---|---|
| 1 | Preparar estilos globales en la plataforma web *(PBI 1)* | Tokens y estilos globales del manual (sección 16) copiados **tal cual**, fuente Plus Jakarta Sans e íconos Lucide | Ningún color, radio ni sombra suelto · modo claro y oscuro funcionando |
| 1 – 2 | *(Nueva)* Construir componentes base y AppShell *(PBI 1)* | **Día 1:** botón, campo de texto, tarjeta y chip de estado. **Día 2:** lista desplegable, switch, control segmentado, alerta, toast, diálogo, estado vacío, carga y encabezado de página · AppShell: sidebar (Mesas, Restaurante, Bitácora) y topbar con espacio para el switch de Sergio | Cada componente con sus estados (normal, foco, deshabilitado, cargando, error) y versión oscura · un ejemplo de uso de cada uno · **avisar al grupo cuando esté listo y cómo se usa** |
| 2 | Crear pantalla web de gestión de mesas *(PBI 5)* | Encabezado con *Agregar mesa*, resumen (libres, reservadas, ocupadas, inactivas) y grilla de tarjetas de mesa; con datos de ejemplo hasta que llegue el backend | Carga, vacío (*“Aún no tienes mesas”*) y error · un solo botón principal naranja |
| 3 | Crear formulario de registro de mesa *(PBI 5)* | Diálogo con identificador y capacidad | Mensajes de error útiles · identificador repetido con error claro |
| 3 | Integrar gestión de mesas con backend *(PBI 5)* | La pantalla crea y lista mesas reales | La mesa nueva aparece sin recargar · toast *“Mesa 04 agregada”* |
| 3 | Probar creación y consulta *(PBI 5)* | Crear y ver mesas, con casos de error | Criterios del PBI 5 |
| 3 | Crear interacción web para cambiar estado *(PBI 6)* | Al seleccionar una mesa aparece la barra con el control segmentado (Disponible, Reservada, Ocupada) | Se cambia sin confirmación y con un toast con **Deshacer** · funciona con teclado |
| 3 | Representar visualmente estados de mesa *(PBI 6)* | Cada estado con color + forma + palabra (manual 3.2); la mesa seleccionada con borde naranja | “Pocas mesas” **no** es un estado de mesa · claro, oscuro, tablet y móvil |
| 3 | Integrar actualización con backend *(PBI 6)* | El cambio de estado se guarda de verdad | Si falla, se muestra el error y la mesa vuelve a su estado anterior |
| 3 | Validar persistencia del cambio *(PBI 6)* | El estado se mantiene al recargar y al volver a entrar | Criterios del PBI 6 |
| 4 | Implementar edición y desactivación en backend *(PBI 7)* | Editar identificador y capacidad; desactivar y reactivar, registrando en la bitácora de Sergio | Una mesa inactiva deja de contar como operativa · mismas reglas que el backend de Elizabeth |
| 4 | Incorporar acciones de editar y desactivar en web *(PBI 7)* | Menú ⋯ con Editar y Desactivar · diálogo de confirmación al desactivar · tarjeta inactiva con borde punteado y *Reactivar* | Textos del manual (sección 11.3) |
| 4 | Probar edición y desactivación *(PBI 7)* | Editar, desactivar y reactivar | Criterios del PBI 7 |

**Revisa los PR de front** de todos contra el checklist del manual (sección 17). Si alguien creó un estilo propio, se cambia por el componente del kit antes del merge.

**Día 6:** prueba completa de la demo junto con Elizabeth (sección 9).

**Al final (Día 6) verifica que coincida:** todas las pantallas (login, registro, restaurante, mesas, bitácora) se ven como un solo producto: mismos componentes, espaciado, títulos, estados y textos; modo oscuro en todas.

---

### Santiago (C) · Registro del restaurante (onboarding) · 6.9 puntos
**En Azure:** PBI 3.

**Antes de empezar:** el Día 1, acuerda con Sergio qué parte de `restaurant-operations/restaurants/` toca cada uno. El Día 2, acuerda con Jacobo cómo se reutiliza tu formulario en la edición. Para el front, sigue la **regla para pantallas** de esta sección.

| Día | Tarea (Azure) | Qué debe quedar listo | Qué revisar |
|---|---|---|---|
| 1 | Crear modelo de datos del restaurante | Información completa: nombre, categoría, dirección y horarios de cada día de la semana | Solo tu parte del módulo; el estado abierto/cerrado es de Sergio |
| 1 | Crear estructura correspondiente en PostgreSQL | Las columnas nuevas sobre la tabla del restaurante que dejó Elizabeth | Probado en la base de Neon, no solo en local |
| 2 | Implementar endpoints de registro y consulta | Registrar el restaurante del usuario actual y consultarlo | Un usuario que ya tiene restaurante no puede registrar otro · el restaurante queda asociado al usuario actual |
| 2 – 3 | Crear formulario web de configuración | Pantalla de registro con tres grupos: *Tu restaurante* (nombre, categoría), *Ubicación* (dirección) y *Horarios* (día por día, con apertura y cierre). El formulario queda como **componente reutilizable**, porque Jacobo lo usa en la edición | **Usa el kit de Sebastián** · label arriba · “(opcional)” en vez de asteriscos · un solo botón principal (*Guardar y continuar*) · si el cierre es antes de la apertura, muestra “(día siguiente)” |
| 3 | Implementar validaciones del formulario | Las mismas reglas en la web y en el backend: nombre y dirección obligatorios, categoría de una lista cerrada, al menos un día abierto, horas válidas | Los mensajes dicen cómo corregir (*“Escribe el nombre del restaurante”*), no *“Campo requerido”* · las reglas quedan escritas en un solo lugar para que Elizabeth las reutilice en la edición |
| 3 | Integrar formulario con backend | Al guardar: toast de éxito y paso a la pantalla de mesas | Botón con “Guardando…” mientras guarda · si falla, alerta de error sin perder lo escrito |
| 4 | Probar registro y persistencia | Registro válido, campos vacíos o inválidos, usuario que ya tiene restaurante | Criterios del PBI 3 |

**Al final verifica que coincida:** tu formulario se ve y valida igual en el registro y en la edición de Jacobo · tus pantallas se ven igual que las de Sebastián.

---

### Jacobo (D) · Autenticación completa y pantalla del restaurante · 9.7 puntos
**En Azure:** PBI 2 (todas sus tareas) · tareas *Crear vista web de consulta y edición* e *Integrar actualización con backend* del PBI 4.

**Antes de empezar:** el Día 1, acuerda con Elizabeth cómo saben los módulos quién es el usuario actual (tú lo completas con Firebase sin que los demás cambien su código). El Día 2, acuerda con Santiago el formulario reutilizable. Para el front, sigue la **regla para pantallas** de esta sección.

| Día | Tarea (Azure) | Qué debe quedar listo | Qué revisar |
|---|---|---|---|
| 1 | Crear modelo y persistencia de usuarios *(PBI 2)* | Proyecto de Firebase con acceso por correo y contraseña · usuarios de prueba (uno sin restaurante y uno con *Casa 72*) · usuarios enlazados en la base de datos con su rol y su restaurante | **Pasarle los usuarios de prueba a Elizabeth el Día 1** para los datos de prueba |
| 2 | Implementar autenticación en backend *(PBI 2)* | El backend reconoce al usuario que inició sesión con Firebase y sabe quién es | Las credenciales de Firebase quedan en variables de entorno, nunca en el repositorio |
| 2 – 3 | Implementar control de acceso por rol *(PBI 2)* | Todas las rutas exigen sesión, salvo las públicas · se identifica el rol y el restaurante del usuario · cada restaurante solo ve y modifica lo suyo · en local sigue funcionando el usuario de desarrollo | Sin sesión → rechazo · usuario de otro restaurante → rechazo · el usuario de desarrollo **no** funciona en el ambiente desplegado · **avisar a todos cuando esté listo (Día 3)** |
| 3 | Crear pantalla web de inicio de sesión *(PBI 2)* | Pantalla de login según el manual (12.4): panel de marca en escritorio y formulario con correo y contraseña (con opción de verla) | **Usa el kit de Sebastián** · se ve bien en escritorio, tablet y móvil · botón con “Iniciando sesión…” |
| 3 – 4 | Integrar pantalla de login con backend *(PBI 2)* | Iniciar sesión, mantener la sesión, cerrar sesión, aviso cuando vence · redirigir: sin restaurante → registro; con restaurante → mesas · las pantallas privadas mandan al login si no hay sesión · **funcionando en el ambiente desplegado el Día 4** | El error no dice si falló el correo o la contraseña · los errores de Firebase se muestran con los textos del manual (sección 14) |
| 4 | Probar autenticación y control de acceso *(PBI 2)* | Login correcto, credenciales inválidas, sesión vencida, cerrar sesión, pantalla privada sin sesión, acceso a datos de otro restaurante | Criterios del PBI 2 |
| 3 – 4 | Crear vista web de consulta y edición *(PBI 4)* | Pantalla del restaurante: modo lectura (datos agrupados en tarjetas y botón *Editar*) y modo edición **con el formulario de Santiago** | **No dupliques el formulario: usa el de Santiago** · se ve igual que las pantallas de Sebastián |
| 4 | Integrar actualización con backend *(PBI 4)* | Guardar cambios con el backend de Elizabeth | Toast *“Cambios guardados”* · aviso *“¿Salir sin guardar?”* si hay cambios pendientes |

**Opcional si alcanza:** inicio de sesión con Google.
**Al final verifica que coincida:** el control de acceso funciona igual en todo el backend (restaurante, mesas y bitácora) · la edición valida igual que el registro de Santiago.

---

### Sergio (E) · Estado del restaurante y bitácora · 7.0 puntos
**En Azure:** PBI 8 · PBI 9.

**Antes de empezar:** el Día 1, acuerda con Elizabeth qué información recibe la bitácora y con Santiago qué parte de `restaurant-operations/restaurants/` toca cada uno. El Día 2, acuerda con Sebastián dónde va el switch en el topbar y que editar y desactivar mesas también registre. Para el front, sigue la **regla para pantallas** de esta sección.

| Día | Tarea (Azure) | Qué debe quedar listo | Qué revisar |
|---|---|---|---|
| 1 | Crear estructura de bitácora en base de datos *(PBI 9)* | Registro de cada cambio: mesa, estado anterior, estado nuevo, fecha y hora, y usuario | También se registran desactivar y reactivar (como *Inactiva*) |
| 2 | Registrar cambios desde la lógica de mesas *(PBI 9)* | Un servicio de bitácora listo para que Elizabeth (cambio de estado) y Sebastián (editar y desactivar) lo usen | Si el cambio de la mesa falla no queda registro, y al revés · **avisar a Elizabeth y Sebastián cuando esté listo (Día 2)** |
| 1 – 2 | Implementar estado operativo en backend *(PBI 8)* | El restaurante se puede marcar como abierto o cerrado, en `restaurant-operations/restaurants/` (en su propio archivo) | Solo tu parte del módulo · el estado persiste |
| 3 | Crear control web de estado del restaurante *(PBI 8)* | Switch en el topbar (en el espacio que deja Sebastián) con la palabra siempre visible (*Abierto* / *Cerrado*) y aviso arriba del contenido cuando está cerrado | **Usa el switch y la alerta del kit de Sebastián** · Abierto en verde con punto; Cerrado en gris con raya (manual 3.3) · **nunca naranja** |
| 3 | Integrar cambio de estado *(PBI 8)* | Sin mesas reservadas, cierra de una vez con toast y *Deshacer*; con mesas reservadas, pide confirmación con el diálogo del kit | Textos del manual (sección 14.2) |
| 4 | Probar persistencia del estado *(PBI 8)* | El estado se mantiene al volver a entrar | Criterios del PBI 8 |
| 4 | *(Nueva)* Crear pantalla de bitácora *(PBI 9)* | Tabla con fecha y hora, mesa, cambio (estado anterior → nuevo) y usuario · filtro por mesa · lo más reciente primero | **Usa el kit de Sebastián** · estado vacío (*“Aún no hay cambios”*) · formato *“30 sept · 7:30 p. m.”* · los chips de estado iguales a los de mesas |
| 4 | Verificar generación de registros *(PBI 9)* | Cada cambio de estado, desactivación y reactivación genera su registro | Criterios del PBI 9 |

**Al final verifica que coincida:** lo que muestra la bitácora es exactamente lo que pasó en la pantalla de mesas · los estados se ven igual en mesas y en la bitácora.

---

## 8. Buenas prácticas para todos
- **Ramas y PR:** una rama por tarea, creada desde `develop`. Nada se sube directo a `develop`, porque se despliega solo a Render y Vercel: siempre por PR.
- **PR pequeños:** con descripción, el PBI o la tarea de Azure y capturas si hay pantallas. Revisión obligatoria: Elizabeth revisa backend y Sebastián revisa front.
- **Arquitectura:** cada cosa en el módulo de su dominio. Reutilizar en vez de copiar: validaciones, componentes y servicios.
- **Seguridad:** el backend siempre valida, aunque la web también valide. El restaurante se toma del usuario actual, nunca de lo que manda el cliente. Ningún secreto en el repositorio: se usan variables de entorno y `.env.example`.
- **Código:** nombres en inglés en el código y textos de la interfaz en español con el glosario del manual (sección 14). Sin `console.log` ni código comentado en el PR.
- **Errores:** todo error se muestra al usuario con un mensaje claro y útil, nunca un error técnico.
- **Pruebas:** cada PBI tiene su tarea de pruebas, con casos felices y de error.
- **Azure:** mover las tareas de estado y actualizar el *Remaining Work* al final de cada día.
- **Coordinación diaria (10 min):** qué terminé, qué hago hoy, qué me bloquea. Si algo bloquea más de medio día, se avisa en el grupo ese mismo día.

---

## 9. Recorrido de la demo (Elizabeth y Sebastián lo prueban juntos el Día 6)
1. Iniciar sesión con el usuario sin restaurante → llega al registro.
2. Registrar el restaurante (probando antes un error de validación) → llega a mesas, vacío.
3. Crear 4 mesas (probando un identificador repetido).
4. Cambiar estados: Disponible → Ocupada → Reservada; usar **Deshacer** una vez.
5. Editar la capacidad de una mesa; desactivar otra y reactivarla.
6. Ver la bitácora con todos los cambios, el usuario y la hora.
7. Cerrar el restaurante → se ve el aviso → abrirlo de nuevo.
8. Editar la dirección en la pantalla del restaurante → cerrar sesión → volver a entrar → todo sigue igual.
9. Intentar entrar a una pantalla privada sin sesión → manda al login.
10. Repetir el recorrido en modo oscuro y en tablet.

---

## 10. Revisión final de coherencia (Día 6)

| Qué se revisa | Quién | Debe coincidir |
|---|---|---|
| Diseño | Sebastián | Todas las pantallas usan el kit, se ven como un solo producto y pasan el checklist del manual (sección 17) |
| Estados de mesa | Elizabeth + Sebastián + Sergio | Los mismos estados y nombres en el backend, la pantalla de mesas y la bitácora |
| Formulario del restaurante | Santiago + Jacobo | Mismos campos, validaciones y mensajes en el registro y en la edición |
| Control de acceso | Jacobo | Funciona igual en todos los módulos; ningún restaurante ve datos de otro |
| Textos | Todos | Palabras del glosario (manual, sección 14): mesa, comensal, Disponible, Reservada, Ocupada, Inactiva, Abierto, Cerrado, bitácora |
| Ambiente desplegado | Elizabeth | Todo funciona en Vercel + Render + Neon con el login real |
| Azure | Cada uno | Todas las tareas en el estado correcto y los PBIs que cumplen sus criterios en **Done** |

**Definition of Done.** Un PBI pasa a **Done** solo si:
- [ ] Cumple todos sus criterios de aceptación (documento de sprints).
- [ ] Usa el kit de Sebastián y pasa el checklist del manual.
- [ ] Tiene estados de carga, vacío y error, y usa los textos del glosario.
- [ ] Su tarea de pruebas está hecha.
- [ ] Funciona en el ambiente desplegado.
- [ ] El PR fue revisado y aprobado.

---

## 11. Riesgos
| Riesgo | Qué hacer |
|---|---|
| El login o el control de acceso se demoran | Todos siguen con el usuario de desarrollo; nadie se bloquea. Deben estar antes del Día 5 |
| El backend de mesas se atrasa y frena a Sebastián | Sebastián trabaja con datos de ejemplo; Elizabeth prioriza crear y consultar |
| Cada quien arma sus propios estilos | Solo se usa el kit; Sebastián revisa todos los PR de front y no se hace merge si hay estilos propios |
| Integración de último momento | La integración real es el Día 5, no el día de la demo; el despliegue desde `develop` ya funciona |
| Conflictos en `restaurant-operations` (lo usan Elizabeth, Sebastián, Santiago y Sergio) | Elizabeth deja las subcarpetas base el Día 1; cada quien trabaja en la suya; Santiago y Sergio acuerdan el Día 1 qué parte de `restaurants/` toca cada uno |
| Un PR rompe el despliegue de `develop` | Nada entra sin PR revisado; si algo se rompe, se revierte primero y se corrige después |
