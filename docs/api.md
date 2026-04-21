# Backend y API — Turnstay

## Arquitectura elegida

Turnstay utiliza **Firebase** como backend en lugar de Node.js + Express. Esta decisión fue tomada junto con el tutor del bootcamp por las razones documentadas en `docs/design.md`.

Firebase proporciona dos servicios que cubren completamente los requisitos de backend:

- **Firebase Authentication** — gestión de usuarios y sesiones
- **Cloud Firestore** — base de datos NoSQL en tiempo real que actúa como API

---

## Equivalencia con endpoints REST

En lugar de endpoints REST tradicionales, Firestore usa operaciones del SDK. La equivalencia es la siguiente:

| Operación REST | Método Firestore | Descripción |
|---|---|---|
| GET /api/v1/recurso | `getDocs(collection(db, 'recurso'))` | Obtener todos los documentos |
| GET /api/v1/recurso/:id | `getDoc(doc(db, 'recurso', id))` | Obtener un documento por ID |
| POST /api/v1/recurso | `addDoc(collection(db, 'recurso'), data)` | Crear nuevo documento |
| PATCH /api/v1/recurso/:id | `updateDoc(doc(db, 'recurso', id), data)` | Actualizar documento |
| DELETE /api/v1/recurso/:id | `deleteDoc(doc(db, 'recurso', id))` | Eliminar documento |

---

## Colecciones en Firestore

### config
Configuración general de la copropiedad.

**Documento:** `config/general`

```json
{
  "nombrePropiedad": "TurnStay",
  "familias": ["Charo", "JManuel", "Carlos", "Javier", "Tito", "MTere", "Sonso", "Marisa"],
  "tarifaDiaria": 12,
  "cuotaAnual": 0
}
```

---

### ocupaciones
Registro de ocupaciones reales de la vivienda.

**Ejemplo de documento:**
```json
{
  "id": "abc123",
  "familia": "MTere",
  "fechaEntrada": "2026-04-21",
  "fechaSalida": "2026-04-24",
  "personas": 2,
  "dias": 3,
  "coste": 36
}
```

**Operaciones:**

Obtener todas las ocupaciones ordenadas por fecha:
```typescript
const q = query(collection(db, 'ocupaciones'), orderBy('fechaEntrada', 'desc'))
const snapshot = await getDocs(q)
```

Crear nueva ocupación:
```typescript
await addDoc(collection(db, 'ocupaciones'), {
  familia: 'MTere',
  fechaEntrada: '2026-04-21',
  fechaSalida: '2026-04-24',
  personas: 2,
  dias: 3,
  coste: 36
})
```

Eliminar ocupación:
```typescript
await deleteDoc(doc(db, 'ocupaciones', id))
```

---

### gastos
Registro de gastos comunes del fondo de la copropiedad.

**Ejemplo de documento:**
```json
{
  "id": "def456",
  "concepto": "Cambio bombona butano",
  "importe": 18.50,
  "fecha": "2026-04-21",
  "familia": "Javier"
}
```

**Operaciones:**

Obtener todos los gastos:
```typescript
const q = query(collection(db, 'gastos'), orderBy('fecha', 'desc'))
const snapshot = await getDocs(q)
```

Crear nuevo gasto:
```typescript
await addDoc(collection(db, 'gastos'), {
  concepto: 'Cambio bombona butano',
  importe: 18.50,
  fecha: '2026-04-21',
  familia: 'Javier'
})
```

---

### incidencias
Registro de incidencias y estado de la vivienda.

**Ejemplo de documento:**
```json
{
  "id": "ghi789",
  "titulo": "Bombona de butano vacía",
  "descripcion": "La bombona del salón está vacía, hay que cambiarla",
  "urgencia": "alta",
  "estado": "pendiente",
  "familia": "MTere",
  "fecha": "2026-04-21"
}
```

**Operaciones:**

Obtener todas las incidencias:
```typescript
const q = query(collection(db, 'incidencias'), orderBy('fecha', 'desc'))
const snapshot = await getDocs(q)
```

Crear nueva incidencia:
```typescript
await addDoc(collection(db, 'incidencias'), {
  titulo: 'Bombona de butano vacía',
  descripcion: 'La bombona del salón está vacía',
  urgencia: 'alta',
  estado: 'pendiente',
  familia: 'MTere',
  fecha: '2026-04-21'
})
```

Actualizar estado de incidencia:
```typescript
await updateDoc(doc(db, 'incidencias', id), {
  estado: 'resuelta'
})
```

---

### cesiones
Registro de cesiones de turnos entre familias.

**Ejemplo de documento:**
```json
{
  "id": "jkl012",
  "familiaCedente": "MTere",
  "familiaReceptora": "Javier",
  "fechaInicio": "2026-04-25",
  "fechaFin": "2026-04-28",
  "motivo": "No podemos ir esos días",
  "estado": "pendiente",
  "fecha": "2026-04-21"
}
```

---

### notificaciones
Notificaciones para cada familia.

**Ejemplo de documento:**
```json
{
  "id": "mno345",
  "familia": "MTere",
  "mensaje": "Nueva solicitud de cesión de Javier",
  "leida": false,
  "fecha": "2026-04-21"
}
```

---

## Códigos de respuesta

Firestore no usa códigos HTTP como una API REST. En su lugar gestiona errores mediante excepciones. En Turnstay los errores se capturan con try/catch y se muestran al usuario con mensajes en español:

| Situación | Mensaje al usuario |
|---|---|
| Error al cargar datos | "Error al cargar las ocupaciones" |
| Error al guardar | "Error al registrar la ocupación" |
| Error al eliminar | "Error al eliminar la ocupación" |
| Fechas solapadas | "Esas fechas se solapan con una ocupación existente" |
| Campos vacíos | "Selecciona una familia" / "El concepto es obligatorio" |

---

## Seguridad

Actualmente Firestore está en **modo de prueba** (lectura y escritura libre durante 30 días). Antes del despliegue en producción se configurarán las reglas de seguridad para que solo usuarios autenticados puedan leer y escribir datos.

Reglas de producción previstas:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
