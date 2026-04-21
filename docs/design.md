# Arquitectura de la aplicación — Turnstay

## 1. Estructura de componentes principales

| Componente | Descripción |
|---|---|
| **App** | Componente raíz, gestiona las rutas |
| **Layout** | Estructura general con navbar y contenido |
| **Dashboard** | Panel principal con resumen general |
| **CalendarView** | Calendario de turnos anual |
| **OccupancyForm** | Registro de ocupación real |
| **CessionForm** | Solicitud y registro de cesión de días |
| **GastosPanel** | Gestión de gastos comunes |
| **EstadoVivienda** | Estado e incidencias de la vivienda |
| **HistoricoAnual** | Histórico de turnos y aportaciones por año |
| **ConfigPanel** | Configuración de la copropiedad |
| **NotificacionesPanel** | Centro de notificaciones |

---

## 2. Componentes reutilizables

| Componente | Descripción |
|---|---|
| **Button** | Botón con variantes: primary, secondary, danger |
| **Card** | Tarjeta contenedora de información |
| **Badge** | Etiqueta de estado: pendiente, activo, completado |
| **Modal** | Ventana emergente para formularios o confirmaciones |
| **LoadingSpinner** | Indicador de carga |
| **ErrorMessage** | Mensaje de error |
| **EmptyState** | Pantalla cuando no hay datos que mostrar |
| **FamilyAvatar** | Avatar o icono identificador de cada familia |

---

## 3. Gestión del estado

### Estado local (useState)
Para datos que solo afectan a un componente:
- Estado de formularios (lo que el usuario está escribiendo)
- Abrir y cerrar modales
- Estados de carga y error por componente

### Estado global (Context API)
Para datos que necesitan varios componentes a la vez:
- Familia activa o logueada (sesión de Firebase Auth)
- Configuración de la copropiedad (número de familias, tarifas, temporadas)
- Notificaciones pendientes

### Firebase como fuente de verdad
Los datos principales viven en Firestore y se sincronizan en tiempo real:
- Turnos y rotaciones
- Ocupaciones registradas
- Cesiones entre familias
- Gastos comunes
- Incidencias y estado de la vivienda

---

## 4. Arquitectura Firebase — Colecciones en Firestore

En lugar de una API REST tradicional con Node.js + Express, Turnstay utiliza **Firebase** como backend. Las colecciones en Firestore sustituyen a los endpoints REST:

| Colección | Descripción |
|---|---|
| `config` | Configuración de la copropiedad |
| `turnos` | Calendario de turnos por año |
| `ocupaciones` | Registro de ocupaciones reales |
| `cesiones` | Cesiones de días entre familias |
| `gastos` | Gastos comunes del fondo |
| `incidencias` | Incidencias y estado de la vivienda |
| `notificaciones` | Notificaciones por familia |

### Firebase Authentication
La autenticación de usuarios se gestiona con **Firebase Authentication**. Cada familia tiene sus propias credenciales de acceso y la sesión se mantiene automáticamente.

### Firestore — Operaciones principales

| Operación | Equivalente REST anterior |
|---|---|
| `getDocs(collection)` | GET /api/v1/recurso |
| `addDoc(collection, data)` | POST /api/v1/recurso |
| `updateDoc(doc, data)` | PATCH /api/v1/recurso/:id |
| `deleteDoc(doc)` | DELETE /api/v1/recurso/:id |
| `onSnapshot(query)` | Tiempo real — sin equivalente en REST |

---

## 5. Datos en Firebase vs datos en el cliente

### Datos en Firebase (Firestore)
- Turnos y rotaciones anuales
- Ocupaciones registradas
- Cesiones entre familias
- Gastos comunes
- Incidencias y estado de la vivienda
- Configuración de la copropiedad
- Notificaciones

### Datos solo en el cliente
- Estado de formularios (lo que el usuario está escribiendo)
- Modales abiertos o cerrados
- Año seleccionado en el histórico
- Sesión activa gestionada por Firebase Auth

---

## 6. Diagrama del flujo de datos

```
Usuario
   |
   | acción (click, formulario)
   ↓
Frontend — React + TypeScript + Tailwind
   |  src/api/client.ts — cliente tipado con Firebase SDK
   |
   | Firebase SDK (lectura/escritura)
   ↓
Firebase
   ├── Firebase Authentication — gestión de sesión y acceso
   └── Firestore — base de datos NoSQL en tiempo real
         |
         ↑ onSnapshot — sincronización en tiempo real
         |
Frontend — gestiona 3 estados:
   ⏳ Loading  — cargando datos de Firestore
   ✓ Success  — datos recibidos y renderizados
   ✗ Error    — mensaje de error al usuario
   |
   ↑ renderiza
   |
Usuario
```

---

## 7. Calendario de turnos

Para mostrar el calendario de turnos se evaluaron tres opciones:

| Opción | Pros | Contras |
|---|---|---|
| **Google Calendar API** | Integración nativa con Google | Configuración compleja, requiere OAuth |
| **FullCalendar** | Muy completo, muchas vistas | Algo pesado para una microapp |
| **React Big Calendar** | Ligero, fácil de integrar en React | Menos funcionalidades avanzadas |

Se investigarán **FullCalendar** y **React Big Calendar** para decidir cuál encaja mejor con Turnstay antes de implementar el componente CalendarView.

---

## 8. Decisiones de arquitectura

### ¿Por qué Firebase en lugar de Node.js + Express?

El ejercicio pedía originalmente un backend con Node.js + Express. Sin embargo, tras la revisión con el tutor y el análisis del proyecto, se decidió usar Firebase por las siguientes razones:

- **Autenticación lista para usar** — Firebase Authentication resuelve el login de cada familia de forma segura en pocas líneas de código. Implementarlo desde cero con Express requeriría gestionar tokens JWT, sesiones y seguridad manualmente, lo que añade complejidad sin valor añadido para este proyecto.
- **Tiempo real incorporado** — Firestore permite que todas las familias vean los cambios al instante sin recargar la página. Si una familia registra una ocupación, las demás lo ven de inmediato. Esto es especialmente valioso para una app compartida entre varias familias.
- **Sin servidor que mantener** — Firebase es serverless, lo que elimina la necesidad de configurar, desplegar y mantener un servidor Express en Railway o Render. Reduce la complejidad operativa considerablemente.
- **Escalabilidad gratuita** — El plan Spark de Firebase es gratuito y más que suficiente para el volumen de datos de una copropiedad de hasta 12 familias.
- **Validado por el tutor** — El tutor del bootcamp recomendó Firebase específicamente para este proyecto, confirmando que es la tecnología más adecuada para las necesidades de Turnstay.

### ¿Por qué Firestore y no una base de datos relacional?

Los datos de Turnstay son documentos independientes — cada ocupación, cesión o incidencia es una entidad con sus propios campos. No hay relaciones complejas entre tablas que justifiquen una base de datos relacional como PostgreSQL. Firestore, al ser NoSQL, encaja perfectamente con esta estructura de datos.

### ¿Por qué no Supabase o MongoDB?

El tutor mencionó Supabase y MongoDB como alternativas. Se optó por Firebase porque integra en un solo producto la autenticación, la base de datos y el tiempo real, lo que simplifica la arquitectura. Supabase es una excelente alternativa (especialmente si se necesita SQL) y MongoDB es potente para datos no estructurados, pero Firebase ofrece la solución más completa para los requisitos concretos de Turnstay.

### ¿Por qué FullCalendar o React Big Calendar en lugar de Google Calendar API?

Google Calendar API requiere configuración OAuth compleja y está pensada para integrarse con el calendario personal de cada usuario. Para Turnstay no necesitamos sincronizar con Google Calendar — necesitamos mostrar un calendario propio dentro de la app. FullCalendar y React Big Calendar son librerías React que resuelven esto de forma más sencilla y directa.
