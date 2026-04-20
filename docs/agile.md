# Metodologías de Desarrollo — Agile, Scrum y Kanban

## ¿Qué es Agile?

El desarrollo de software tradicional funcionaba así: el cliente explicaba lo que quería, el equipo lo construía durante meses o años, y al final lo entregaba. El problema es que cuando el cliente lo veía, muchas veces no era lo que esperaba. Todo ese tiempo y esfuerzo perdido.

Agile nace para resolver exactamente ese problema. En lugar de planificar todo al principio y entregar al final, el trabajo se divide en partes pequeñas. Cada parte se desarrolla, se enseña al cliente, se recibe feedback y se ajusta. Así el producto evoluciona de forma continua y siempre en la dirección correcta.

El objetivo de Agile es entregar valor de forma continua, adaptarse al cambio sin que eso sea un problema, y reducir el riesgo de construir algo que al final no sirve para nadie.

Agile no es una herramienta ni un proceso concreto — es una filosofía de trabajo. Scrum y Kanban son dos formas concretas de aplicarla.

---

## ¿Qué es Scrum?

Scrum es una de las formas más populares de aplicar Agile. Tiene una estructura definida con roles, ciclos de trabajo y reuniones concretas.

### Roles

- **Product Owner** — representa al cliente o al negocio. Decide qué se construye y en qué orden según el valor que aporta cada cosa.
- **Scrum Master** — facilita el proceso y ayuda al equipo a eliminar obstáculos. No es el jefe, es quien protege al equipo para que pueda trabajar bien.
- **Equipo de desarrollo** — las personas que construyen el producto. Son autónomos y se organizan ellos mismos.

### Conceptos principales

- **Backlog** — lista de todo lo que hay que construir, ordenado por prioridad. Es un documento vivo que cambia según evoluciona el proyecto.
- **Sprint** — periodo fijo de trabajo, normalmente dos semanas. Al final de cada sprint siempre hay algo funcional y entregable.
- **Sprint Planning** — reunión al inicio de cada sprint para decidir qué tareas del backlog se van a abordar.
- **Daily Standup** — reunión diaria de 15 minutos donde cada miembro responde tres preguntas: qué hice ayer, qué haré hoy, qué me está bloqueando.
- **Sprint Review** — al final del sprint se muestra lo construido al cliente o stakeholders para recibir feedback.
- **Retrospectiva** — reunión interna del equipo para reflexionar sobre el proceso: qué fue bien, qué fue mal y cómo mejorar en el siguiente sprint.

---

## ¿Qué es Kanban?

Kanban es más simple y visual que Scrum. Su origen está en el sistema de producción de Toyota, donde usaban tarjetas físicas para gestionar el flujo de trabajo en las fábricas.

En desarrollo de software, Kanban se representa como un tablero con columnas que indican el estado de cada tarea. Las columnas más habituales son:

**Backlog → To Do → In Progress → Review → Done**

Cada tarea es una tarjeta que va avanzando de columna en columna según progresa. La regla más importante de Kanban es el límite de trabajo en curso — no se pueden acumular infinitas tarjetas en "In Progress". Limitar cuántas cosas se trabajan a la vez obliga a terminar antes de empezar algo nuevo, lo que mejora el flujo y evita la sensación de tener todo a medias.

A diferencia de Scrum, Kanban no tiene sprints, ni roles fijos, ni ceremonias obligatorias. El trabajo fluye de forma continua.

---

## Diferencias entre Scrum y Kanban

| | Scrum | Kanban |
|---|---|---|
| Ciclos de trabajo | Sprints fijos de 1 a 4 semanas | Flujo continuo sin ciclos definidos |
| Roles | Product Owner, Scrum Master, Equipo | No hay roles definidos |
| Cambios durante el trabajo | Solo entre sprints | En cualquier momento |
| Reuniones | Varias ceremonias obligatorias | Ninguna obligatoria |
| Métricas principales | Velocidad por sprint | Tiempo de ciclo por tarea |
| Estructura | Alta | Mínima |

---

## ¿Cuándo usar cada uno?

**Scrum es más adecuado cuando:**
- Hay un equipo dedicado y estable trabajando en el mismo proyecto
- El proyecto tiene un objetivo claro pero los requisitos pueden cambiar con el tiempo
- Se necesita planificación regular y un ritmo de entregas predecible
- El cliente quiere estar involucrado y dar feedback frecuente

**Kanban es más adecuado cuando:**
- El trabajo es continuo y las tareas llegan de forma imprevisible
- El equipo es pequeño o se trabaja en solitario
- Se quiere visualizar el estado del trabajo sin imponer una estructura rígida
- Las prioridades cambian con frecuencia y se necesita flexibilidad total

---

## ¿Qué metodología uso en Turnstay?

Para este proyecto utilizaré **Kanban con Trello**. Al trabajar en solitario y con tareas que van surgiendo según avanzo en el desarrollo, Kanban encaja mejor que Scrum. No necesito sprints ni ceremonias — necesito visualizar en qué estado está cada tarea y mantener el flujo de trabajo ordenado.

El tablero de Trello tiene las siguientes columnas: **Backlog, To Do, In Progress, Review y Done**.
