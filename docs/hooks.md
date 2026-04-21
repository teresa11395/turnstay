# Hooks — Turnstay

Documentación de todos los hooks de la aplicación, tanto los de React como los custom hooks creados específicamente para Turnstay.

---

## Hooks de React utilizados

### useState
Gestiona el estado local de cada componente. En Turnstay se usa para:
- Estado de formularios (valores de los inputs)
- Abrir y cerrar modales
- Año seleccionado en el histórico
- Estados de carga y error por componente

```typescript
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
```

### useEffect
Gestiona efectos secundarios — operaciones que ocurren fuera del renderizado. En Turnstay se usa para:
- Cargar datos de Firestore al montar un componente
- Suscribirse a cambios de autenticación con Firebase Auth
- Limpiar suscripciones al desmontar componentes

```typescript
useEffect(() => {
  fetchOcupaciones()
}, [])
```

### useMemo
Optimiza cálculos costosos memorizando el resultado. En Turnstay se usa para:
- Calcular el total de gastos sin recalcular en cada render
- Filtrar listas grandes de ocupaciones o turnos

```typescript
const totalGastos = gastos.reduce((sum, g) => sum + g.importe, 0)
```

### useCallback
Evita que funciones se recreen en cada render, mejorando el rendimiento. En Turnstay se usa para:
- Funciones que se pasan como props a componentes hijos
- Handlers de formularios

```typescript
const handleSubmit = useCallback(() => {
  addOcupacion(formData)
}, [formData])
```

---

## Custom Hooks

### useAuth

**Archivo:** `src/hooks/useAuth.ts`

Gestiona la autenticación de usuarios con Firebase Authentication. Encapsula toda la lógica de sesión para que los componentes no necesiten interactuar directamente con Firebase.

**Estados que devuelve:**

| Estado | Tipo | Descripción |
|---|---|---|
| `user` | `User \| null` | Usuario autenticado o null si no hay sesión |
| `loading` | `boolean` | true mientras verifica la sesión al cargar |
| `error` | `string \| null` | Mensaje de error si falla el login |

**Funciones que devuelve:**

| Función | Parámetros | Descripción |
|---|---|---|
| `login` | `email, password` | Inicia sesión con email y contraseña |
| `logout` | — | Cierra la sesión actual |

**Uso:**
```typescript
const { user, loading, error, login, logout } = useAuth()

if (loading) return <LoadingSpinner />
if (!user) return <LoginPage />
```

---

### useOcupaciones

**Archivo:** `src/hooks/useOcupaciones.ts`

Gestiona el CRUD de ocupaciones en Firestore. Carga, añade y elimina ocupaciones, gestionando automáticamente los estados de carga y error.

**La interfaz Ocupacion:**
```typescript
interface Ocupacion {
  id?: string
  familia: string
  fechaEntrada: string
  fechaSalida: string
  personas: number
  dias: number
  coste: number
}
```

**Estados que devuelve:**

| Estado | Tipo | Descripción |
|---|---|---|
| `ocupaciones` | `Ocupacion[]` | Lista de ocupaciones ordenadas por fecha |
| `loading` | `boolean` | true mientras carga datos de Firestore |
| `error` | `string \| null` | Mensaje de error si falla alguna operación |

**Funciones que devuelve:**

| Función | Parámetros | Descripción |
|---|---|---|
| `addOcupacion` | `ocupacion` | Añade una nueva ocupación a Firestore |
| `deleteOcupacion` | `id` | Elimina una ocupación por su ID |
| `refetch` | — | Recarga las ocupaciones desde Firestore |

---

### useGastos

**Archivo:** `src/hooks/useGastos.ts`

Gestiona el CRUD de gastos comunes en Firestore. Incluye el cálculo automático del total de gastos.

**La interfaz Gasto:**
```typescript
interface Gasto {
  id?: string
  concepto: string
  importe: number
  fecha: string
  familia: string
}
```

**Estados que devuelve:**

| Estado | Tipo | Descripción |
|---|---|---|
| `gastos` | `Gasto[]` | Lista de gastos ordenados por fecha |
| `loading` | `boolean` | true mientras carga datos |
| `error` | `string \| null` | Mensaje de error |
| `totalGastos` | `number` | Suma total de todos los gastos |

**Funciones que devuelve:**

| Función | Parámetros | Descripción |
|---|---|---|
| `addGasto` | `gasto` | Añade un nuevo gasto a Firestore |
| `deleteGasto` | `id` | Elimina un gasto por su ID |
| `refetch` | — | Recarga los gastos desde Firestore |

---

### useIncidencias

**Archivo:** `src/hooks/useIncidencias.ts`

Gestiona el CRUD de incidencias del estado de la vivienda en Firestore. Permite crear, listar y actualizar el estado de cada incidencia.

**La interfaz Incidencia:**
```typescript
interface Incidencia {
  id?: string
  titulo: string
  descripcion: string
  urgencia: 'baja' | 'media' | 'alta'
  estado: 'pendiente' | 'en progreso' | 'resuelta'
  familia: string
  fecha: string
}
```

**Estados que devuelve:**

| Estado | Tipo | Descripción |
|---|---|---|
| `incidencias` | `Incidencia[]` | Lista de incidencias ordenadas por fecha |
| `loading` | `boolean` | true mientras carga datos |
| `error` | `string \| null` | Mensaje de error |

**Funciones que devuelve:**

| Función | Parámetros | Descripción |
|---|---|---|
| `addIncidencia` | `incidencia` | Crea una nueva incidencia |
| `updateIncidencia` | `id, data` | Actualiza el estado u otros campos |
| `refetch` | — | Recarga las incidencias |

---

### useTurnos

**Archivo:** `src/hooks/useTurnos.ts`

El hook más importante de Turnstay. Contiene el algoritmo de rotación automática que genera el calendario de turnos para cualquier año a partir de la configuración base de 2020.

**Cómo funciona el algoritmo:**
Partiendo del año base 2020 y el orden inicial de las 8 familias, cada año se aplica una rotación de una posición. Así cada familia va pasando por todos los turnos en un ciclo de 8 años.

```
Rotación = (año - 2020) % 8
Familia del turno = familias[(indiceBase + rotación) % 8]
```

**Estados que devuelve:**

| Estado | Tipo | Descripción |
|---|---|---|
| `turnosBaja` | `Turno[]` | Turnos de temporada baja (8 meses) |
| `turnosAlta` | `Turno[]` | Turnos de temporada alta (8 quincenas) |
| `año` | `number` | Año seleccionado actualmente |
| `familias` | `string[]` | Lista de familias de la copropiedad |

**Funciones que devuelve:**

| Función | Parámetros | Descripción |
|---|---|---|
| `setAño` | `número` | Cambia el año del calendario |
| `getTurnoFamilia` | `familia` | Devuelve los turnos de una familia concreta |

---

## Resumen de patrones usados

Todos los custom hooks de Turnstay siguen el mismo patrón:

1. **Estado inicial** — `loading: true`, `error: null`, datos vacíos
2. **Carga de datos** — función `fetch` que consulta Firestore
3. **Gestión de errores** — try/catch con mensajes en español
4. **Estado final** — `loading: false`, datos cargados o error
5. **Retorno** — datos, estados y funciones para que el componente los use

Este patrón garantiza que todos los componentes gestionen correctamente los tres estados de red: carga, éxito y error.
