# Testing — TurnStay

## Estrategia de testing

TurnStay utiliza **testing manual exploratorio** sobre el entorno de producción en Vercel. Al tratarse de una aplicación fullstack con Firebase como backend, las pruebas se centran en verificar los flujos de usuario completos y la integridad de los datos en Firestore.

---

## Entorno de pruebas

| Elemento | Detalle |
|---|---|
| URL producción | https://turnstay.vercel.app |
| Base de datos | Firebase Firestore (modo producción) |
| Usuarios de prueba | `tborrajo@hotmail.com` (MTere, admin, cop_casaplaya) |
| | `tborrajogdv@gmail.com` (Charo, copropietario, cop_casaplaya) |
| | `niamdos@gmail.com` (admin, cop_1777444716808 — Casa Montaña) |

---

## Casos de prueba

### 1. Autenticación

| ID | Caso | Resultado esperado | Estado |
|---|---|---|---|
| AUTH-01 | Login con credenciales correctas | Redirige al dashboard | ✅ |
| AUTH-02 | Login con credenciales incorrectas | Muestra error "Email o contraseña incorrectos" | ✅ |
| AUTH-03 | Acceso a ruta protegida sin sesión | Redirige a /login | ✅ |
| AUTH-04 | Sesión persistida al recargar | Entra directamente al dashboard | ✅ |
| AUTH-05 | Cerrar sesión | Redirige a /login | ✅ |

---

### 2. Onboarding — nueva copropiedad

| ID | Caso | Resultado esperado | Estado |
|---|---|---|---|
| ONB-01 | Crear copropiedad con sistema de calendario libre | Redirige al dashboard con vista de calendario libre | ✅ |
| ONB-02 | Crear copropiedad con sistema de rotación | Redirige al dashboard con vista de turnos | ✅ |
| ONB-03 | Intentar crear sin nombre de propiedad | Muestra error de validación | ✅ |
| ONB-04 | Intentar crear sin familias | Muestra error de validación | ✅ |
| ONB-05 | Unirse con código de invitación válido | Perfil vinculado a la copropiedad | ✅ |

---

### 3. Dashboard

| ID | Caso | Resultado esperado | Estado |
|---|---|---|---|
| DASH-01 | Copropiedad con rotación — dashboard | Muestra bloque de turnos del año | ✅ |
| DASH-02 | Copropiedad con calendario libre — dashboard | Muestra bloque "Reservas de días" | ✅ |
| DASH-03 | Estadísticas — ocupaciones, fondo común, incidencias | Datos correctos de Firestore | ✅ |
| DASH-04 | Clic en turno del dashboard | Redirige a /cesiones con familia preseleccionada | ✅ |

---

### 4. Calendario

| ID | Caso | Resultado esperado | Estado |
|---|---|---|---|
| CAL-01 | Copropiedad con rotación | Muestra turnos por temporada baja y alta | ✅ |
| CAL-02 | Copropiedad con calendario libre | Muestra grid mensual con días ocupados/libres | ✅ |
| CAL-03 | Navegación entre años (rotación) | Turnos rotan correctamente | ✅ |
| CAL-04 | Navegación entre meses (calendario libre) | Grid actualiza correctamente | ✅ |
| CAL-05 | Días ocupados en calendario libre | Se pintan con el color de la familia | ✅ |

---

### 5. Ocupaciones

| ID | Caso | Resultado esperado | Estado |
|---|---|---|---|
| OC-01 | Registrar nueva ocupación | Aparece en el listado y en Firestore | ✅ |
| OC-02 | Eliminar ocupación | Desaparece del listado y de Firestore | ✅ |
| OC-03 | Registrar estado al llegar | Se guarda en el documento de la ocupación | ✅ |
| OC-04 | Estado con problemas → incidencia automática | Se crea incidencia en Firestore | ✅ |

---

### 6. Gastos

| ID | Caso | Resultado esperado | Estado |
|---|---|---|---|
| GAS-01 | Añadir nuevo gasto | Aparece en el listado y suma al total | ✅ |
| GAS-02 | Eliminar gasto | Desaparece y el total se actualiza | ✅ |
| GAS-03 | Total gastos en dashboard | Coincide con la suma real | ✅ |

---

### 7. Incidencias

| ID | Caso | Resultado esperado | Estado |
|---|---|---|---|
| INC-01 | Reportar nueva incidencia | Aparece en el listado con estado "pendiente" | ✅ |
| INC-02 | Marcar incidencia en progreso | Estado cambia a "en progreso" | ✅ |
| INC-03 | Resolver incidencia con descripción y coste | Estado cambia a "resuelta", se guarda la resolución | ✅ |
| INC-04 | Incidencias pendientes en dashboard | Número correcto | ✅ |

---

### 8. Cesiones

| ID | Caso | Resultado esperado | Estado |
|---|---|---|---|
| CES-01 | Solicitar cesión entre familias | Aparece como "pendiente" | ✅ |
| CES-02 | Autodetección de familia cedente por fecha | Campo se rellena automáticamente | ✅ |
| CES-03 | Aceptar cesión | Estado cambia a "aceptada" | ✅ |
| CES-04 | Rechazar cesión | Estado cambia a "rechazada" | ✅ |
| CES-05 | Validación: familia solicita = familia cede | Muestra error de validación | ✅ |

---

### 9. Configuración y roles

| ID | Caso | Resultado esperado | Estado |
|---|---|---|---|
| ROL-01 | Admin accede a /configuracion | Página carga correctamente | ✅ |
| ROL-02 | Copropietario intenta acceder a /configuracion | Redirige al dashboard | ✅ |
| ROL-03 | Copropietario no ve "Configuración" en el menú | Enlace no aparece | ✅ |
| ROL-04 | Guardar configuración | Datos actualizados en Firestore | ✅ |
| ROL-05 | Cambiar sistema de turnos en configuración | Dashboard y calendario se actualizan | ✅ |

---

### 10. Multi-copropiedad

| ID | Caso | Resultado esperado | Estado |
|---|---|---|---|
| MULTI-01 | Usuario A (cop_casaplaya) ve sus datos | Solo ve datos de cop_casaplaya | ✅ |
| MULTI-02 | Usuario B (Casa Montaña) ve sus datos | Solo ve datos de su copropiedad | ✅ |
| MULTI-03 | Config leída de la ruta correcta en Firestore | /copropiedades/{id}/config/general | ✅ |

---

## Bugs encontrados y resueltos durante el testing

| Bug | Descripción | Solución |
|---|---|---|
| Race condition ConfigContext | El config se cargaba con defaultConfig antes de que el perfil estuviera listo | Añadido `loadingPerfil` como dependencia del useEffect |
| /calendario daba 404 | La ruta no estaba definida en App.tsx | Añadida la ruta en el router |
| Familias hardcodeadas en useTurnos | useTurnos usaba siempre las 8 familias de Casa Playa | Ahora lee familias del ConfigContext |
| Perfiles de usuario intercambiados | Los roles admin/copropietario estaban asignados al revés en Firestore | Corregido directamente en Firestore |
| config/general en raíz de Firestore | Documento antiguo de la arquitectura anterior | Eliminado de Firestore |
