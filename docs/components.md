# Componentes — Turnstay

Documentación de todos los componentes reutilizables de la aplicación.

---

## Button

**Archivo:** `src/components/Button.tsx`

Botón reutilizable con tres variantes de estilo y soporte para estado deshabilitado.

### Props

| Prop | Tipo | Requerido | Por defecto | Descripción |
|---|---|---|---|---|
| `label` | `string` | ✅ | — | Texto del botón |
| `onClick` | `() => void` | ✅ | — | Función que se ejecuta al hacer clic |
| `variant` | `'primary' \| 'secondary' \| 'danger'` | ❌ | `'primary'` | Estilo visual del botón |
| `disabled` | `boolean` | ❌ | `false` | Desactiva el botón |

### Uso

```tsx
<Button label="Registrar ocupación" onClick={handleSubmit} />
<Button label="Cancelar" onClick={handleCancel} variant="secondary" />
<Button label="Eliminar" onClick={handleDelete} variant="danger" />
<Button label="Enviando..." onClick={() => {}} disabled={true} />
```

### Variantes
- **primary** — fondo azul, para acciones principales
- **secondary** — fondo gris, para acciones secundarias o cancelar
- **danger** — fondo rojo, para acciones destructivas como eliminar

---

## Card

**Archivo:** `src/components/Card.tsx`

Tarjeta contenedora de información con título y contenido flexible.

### Props

| Prop | Tipo | Requerido | Por defecto | Descripción |
|---|---|---|---|---|
| `title` | `string` | ✅ | — | Título de la tarjeta |
| `children` | `React.ReactNode` | ✅ | — | Contenido interior de la tarjeta |
| `className` | `string` | ❌ | `''` | Clases adicionales de Tailwind |

### Uso

```tsx
<Card title="Ocupaciones del mes">
  <p>Contenido de la tarjeta</p>
</Card>

<Card title="Gastos comunes" className="col-span-2">
  <GastosPanel />
</Card>
```

---

## Badge

**Archivo:** `src/components/Badge.tsx`

Etiqueta visual para mostrar el estado de una entidad.

### Props

| Prop | Tipo | Requerido | Descripción |
|---|---|---|---|
| `label` | `string` | ✅ | Texto de la etiqueta |
| `status` | `'pendiente' \| 'activo' \| 'completado' \| 'rechazado'` | ✅ | Estado que determina el color |

### Uso

```tsx
<Badge label="Pendiente" status="pendiente" />
<Badge label="Activo" status="activo" />
<Badge label="Completado" status="completado" />
<Badge label="Rechazado" status="rechazado" />
```

### Estados y colores
- **pendiente** — fondo amarillo, para solicitudes o cesiones en espera
- **activo** — fondo verde, para ocupaciones en curso
- **completado** — fondo azul, para turnos o gestiones finalizadas
- **rechazado** — fondo rojo, para cesiones o solicitudes denegadas

---

## LoadingSpinner

**Archivo:** `src/components/LoadingSpinner.tsx`

Indicador de carga animado que se muestra mientras se esperan datos de la API.

### Props

No tiene props — es un componente autónomo.

### Uso

```tsx
{isLoading && <LoadingSpinner />}
```

### Cuándo usarlo
Se muestra siempre que el cliente de API está esperando respuesta del backend — al cargar el calendario de turnos, las ocupaciones, los gastos, etc.

---

## ErrorMessage

**Archivo:** `src/components/ErrorMessage.tsx`

Mensaje de error con opción de reintentar la operación fallida.

### Props

| Prop | Tipo | Requerido | Descripción |
|---|---|---|---|
| `message` | `string` | ✅ | Mensaje de error a mostrar |
| `onRetry` | `() => void` | ❌ | Función para reintentar — muestra botón si se proporciona |

### Uso

```tsx
{error && (
  <ErrorMessage
    message="No se pudieron cargar los turnos"
    onRetry={fetchTurnos}
  />
)}

{error && <ErrorMessage message="Error al guardar la ocupación" />}
```

---

## EmptyState

**Archivo:** `src/components/EmptyState.tsx`

Pantalla vacía que se muestra cuando no hay datos que mostrar en una sección.

### Props

| Prop | Tipo | Requerido | Por defecto | Descripción |
|---|---|---|---|---|
| `title` | `string` | ✅ | — | Título del estado vacío |
| `description` | `string` | ✅ | — | Descripción o mensaje de ayuda |
| `icon` | `string` | ❌ | `'🏠'` | Emoji o icono decorativo |

### Uso

```tsx
<EmptyState
  title="Sin ocupaciones registradas"
  description="Registra tu primera ocupación para ver el historial"
  icon="📅"
/>

<EmptyState
  title="Sin incidencias"
  description="La vivienda está en perfecto estado"
  icon="✅"
/>
```

---

## FamilyAvatar

**Archivo:** `src/components/FamilyAvatar.tsx`

Avatar circular con las iniciales del nombre de la familia. El color se asigna automáticamente según el nombre.

### Props

| Prop | Tipo | Requerido | Por defecto | Descripción |
|---|---|---|---|---|
| `name` | `string` | ✅ | — | Nombre de la familia |
| `size` | `'sm' \| 'md' \| 'lg'` | ❌ | `'md'` | Tamaño del avatar |

### Uso

```tsx
<FamilyAvatar name="MTere" />
<FamilyAvatar name="Javier" size="sm" />
<FamilyAvatar name="Carlos" size="lg" />
```

### Tamaños
- **sm** — 32×32px, para listas compactas
- **md** — 40×40px, tamaño estándar
- **lg** — 56×56px, para perfiles o cabeceras

### Colores
El color del avatar se asigna automáticamente a partir del primer carácter del nombre, garantizando que cada familia tenga siempre el mismo color en toda la aplicación.

---

## Composición de componentes

Los componentes reutilizables se combinan para construir los componentes de página. Por ejemplo, una tarjeta de ocupación combina Card, Badge y FamilyAvatar:

```tsx
<Card title="Ocupación actual">
  <div className="flex items-center gap-3">
    <FamilyAvatar name="MTere" />
    <div>
      <p className="font-medium">Familia MTere</p>
      <p className="text-sm text-gray-500">15 abril — 30 abril</p>
    </div>
    <Badge label="Activo" status="activo" />
  </div>
</Card>
```
