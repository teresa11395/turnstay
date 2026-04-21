# Rutas y navegación — Turnstay

## Configuración

Turnstay usa **React Router v6** para gestionar la navegación entre páginas sin recargar el navegador. React Router está configurado en `src/App.tsx` con `BrowserRouter` y `Routes`.

---

## Estructura de rutas

| Ruta | Componente | Protegida | Descripción |
|---|---|---|---|
| `/login` | `LoginPage` | ❌ | Página de acceso a la app |
| `/` | `DashboardPage` | ✅ | Panel general con resumen |
| `/calendario` | `CalendarioPage` | ✅ | Calendario de turnos anual |
| `/ocupaciones` | `OcupacionesPage` | ✅ | Registro de ocupaciones |
| `/gastos` | `GastosPage` | ✅ | Gestión de gastos comunes |
| `/incidencias` | `IncidenciasPage` | ✅ | Estado de la vivienda |
| `/cesiones` | `CesionesPage` | ✅ | Cesiones entre familias |
| `/configuracion` | `ConfiguracionPage` | ✅ | Configuración de la copropiedad |
| `/historico` | `HistoricoPage` | ✅ | Histórico anual |
| `*` | `NotFoundPage` | ❌ | Página 404 |

---

## Rutas protegidas

Todas las rutas excepto `/login` y `*` están protegidas por el componente `ProtectedRoute`. Este componente comprueba si hay una sesión activa con Firebase Authentication:

- Si hay sesión → muestra la página solicitada
- Si no hay sesión → redirige automáticamente a `/login`
- Mientras verifica la sesión → muestra el `LoadingSpinner`

```tsx
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" />
  return <>{children}</>
}
```

---

## Página 404

Cualquier ruta que no coincida con las definidas muestra la página `NotFoundPage`. Incluye un mensaje claro y un botón para volver al inicio.

La ruta `*` captura todas las URLs no reconocidas:

```tsx
<Route path="*" element={<NotFoundPage />} />
```

---

## Archivos relacionados

| Archivo | Descripción |
|---|---|
| `src/App.tsx` | Configuración principal de rutas |
| `src/pages/LoginPage.tsx` | Página de login |
| `src/pages/DashboardPage.tsx` | Panel general |
| `src/pages/CalendarioPage.tsx` | Calendario de turnos |
| `src/pages/OcupacionesPage.tsx` | Ocupaciones |
| `src/pages/GastosPage.tsx` | Gastos comunes |
| `src/pages/IncidenciasPage.tsx` | Incidencias |
| `src/pages/CesionesPage.tsx` | Cesiones |
| `src/pages/ConfiguracionPage.tsx` | Configuración |
| `src/pages/HistoricoPage.tsx` | Histórico anual |
| `src/pages/NotFoundPage.tsx` | Página 404 |
