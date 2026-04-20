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
- Familia activa o logueada
- Configuración de la copropiedad (número de familias, tarifas, temporadas)
- Notificaciones pendientes

### API como fuente de verdad
Los datos principales viven en el backend y se consultan a través de la API:
- Turnos y rotaciones
- Ocupaciones registradas
- Gastos comunes
- Incidencias y estado de la vivienda

---

## 4. Diseño del backend y endpoints REST

### Configuración
| Método | Endpoint | Descripción |
|---|---|---|
| GET | /api/v1/config | Obtener configuración de la copropiedad |
| POST | /api/v1/config | Crear o actualizar configuración |

### Turnos
| Método | Endpoint | Descripción |
|---|---|---|
| GET | /api/v1/turnos/:año | Obtener calendario de turnos por año |

### Ocupaciones
| Método | Endpoint | Descripción |
|---|---|---|
| GET | /api/v1/ocupaciones | Listar ocupaciones |
| POST | /api/v1/ocupaciones | Registrar nueva ocupación |
| DELETE | /api/v1/ocupaciones/:id | Eliminar ocupación |

### Cesiones
| Método | Endpoint | Descripción |
|---|---|---|
| GET | /api/v1/cesiones | Listar cesiones |
| POST | /api/v1/cesiones | Crear nueva cesión |
| PATCH | /api/v1/cesiones/:id | Actualizar estado: aceptar o rechazar |

### Gastos
| Método | Endpoint | Descripción |
|---|---|---|
| GET | /api/v1/gastos | Listar gastos |
| POST | /api/v1/gastos | Registrar gasto |
| DELETE | /api/v1/gastos/:id | Eliminar gasto |

### Incidencias
| Método | Endpoint | Descripción |
|---|---|---|
| GET | /api/v1/incidencias | Listar incidencias |
| POST | /api/v1/incidencias | Crear incidencia |
| PATCH | /api/v1/incidencias/:id | Actualizar estado de la incidencia |

### Notificaciones
| Método | Endpoint | Descripción |
|---|---|---|
| GET | /api/v1/notificaciones | Listar notificaciones |
| PATCH | /api/v1/notificaciones/:id | Marcar notificación como leída |

---

## 5. Datos en el servidor vs datos en el cliente

### Datos en el servidor (backend)
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
- Familia activa en sesión (LocalStorage)

---

## 6. Diagrama del flujo de datos

El flujo siempre sigue esta dirección:

```
Usuario
   |
   | acción (click, formulario)
   ↓
Frontend — React + TypeScript + Tailwind
   |  src/api/client.ts — cliente tipado
   |
   | fetch / axios → HTTP Request
   ↓
API REST — /api/v1/
   | turnos · ocupaciones · cesiones
   | gastos · incidencias · notificaciones
   |
   | llama a servicios
   ↓
Backend — Node.js + Express
   | routes → controllers → services
   | Lógica de rotación y negocio
   |
   ↓
Datos en memoria / LocalStorage
   |
   ↑ respuesta JSON tipada
   |
API REST
   |
   ↑ datos tipados
   |
Frontend — gestiona 3 estados de red:
   ⏳ Loading  — cargando datos
   ✓ Success  — datos recibidos y renderizados
   ✗ Error    — mensaje de error al usuario
   |
   ↑ renderiza
   |
Usuario
```

---

## Decisiones de arquitectura

- Se usa **arquitectura por capas** en el backend: routes → controllers → services
- El cliente de API en el frontend es **tipado con TypeScript** para garantizar consistencia entre frontend y backend
- La **Context API** gestiona el estado global sin necesidad de librerías externas como Redux
- Los datos que viven en el backend son la **única fuente de verdad** — no se duplican en LocalStorage salvo la sesión de la familia activa
- La app es **configurable**: número de familias, tarifas y temporadas son parámetros, no valores fijos
