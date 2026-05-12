# TurnStay

Gestión de copropiedades vacacionales entre familias.

**Aplicación fullstack para organizar turnos, ocupaciones, gastos e incidencias de viviendas vacacionales compartidas entre copropietarios, sin necesidad de WhatsApp ni Excel.**

| Despliegue | URL |
|---|---|
| Frontend | https://turnstay.vercel.app |

## Características

1. Sistema multi-copropiedad — cada grupo gestiona su propia vivienda de forma independiente
2. Dos sistemas de turnos — rotación automática por períodos o calendario libre de reservas
3. Gestión completa — ocupaciones, gastos, incidencias, cesiones e histórico anual

## Tecnologías

| Frontend | Uso |
|---|---|
| React 18 + TypeScript | Interfaz de usuario con tipado estático |
| Vite | Bundler y servidor de desarrollo |
| Tailwind CSS | Estilos y diseño responsive |
| React Router v6 | Navegación entre páginas |

| Backend | Uso |
|---|---|
| Firebase Authentication | Autenticación de usuarios con email y contraseña |
| Cloud Firestore | Base de datos NoSQL en tiempo real |

| Auxiliares | Uso |
|---|---|
| Vercel | Despliegue continuo desde GitHub |
| Git + GitHub | Control de versiones |

## Estructura del proyecto

```
turnstay/
├── src/
│   ├── api/
│   │   └── firebase.ts          # Configuración de Firebase
│   ├── context/
│   │   ├── AuthContext.tsx       # Contexto de autenticación
│   │   ├── CopropiedadContext.tsx # Contexto de copropiedad y perfil
│   │   └── ConfigContext.tsx     # Contexto de configuración
│   ├── hooks/
│   │   ├── useOcupaciones.ts     # CRUD de ocupaciones
│   │   ├── useGastos.ts          # CRUD de gastos
│   │   ├── useIncidencias.ts     # CRUD de incidencias
│   │   ├── useCesiones.ts        # CRUD de cesiones
│   │   └── useTurnos.ts          # Algoritmo de rotación de turnos
│   ├── pages/
│   │   ├── LoginPage.tsx         # Login, registro y onboarding
│   │   ├── DashboardPage.tsx     # Panel general
│   │   ├── CalendarioPage.tsx    # Calendario de turnos y reservas
│   │   ├── OcupacionesPage.tsx   # Registro de ocupaciones
│   │   ├── GastosPage.tsx        # Gestión de gastos comunes
│   │   ├── IncidenciasPage.tsx   # Estado de la vivienda
│   │   ├── CesionesPage.tsx      # Cesiones entre familias
│   │   ├── HistoricoPage.tsx     # Histórico anual
│   │   └── ConfiguracionPage.tsx # Configuración de la copropiedad
│   ├── components/               # Componentes reutilizables
│   ├── App.tsx                   # Rutas y providers
│   └── main.tsx                  # Punto de entrada
├── docs/
│   ├── testing.md                # Plan de pruebas
│   └── retrospective.md          # Retrospectiva del proyecto
├── .env                          # Variables de entorno (no subir)
└── README.md
```

## Descargar y ejecutar

```bash
git clone https://github.com/teresa11395/turnstay.git
cd turnstay
npm install
```

Crea un archivo `.env` en la raíz con las claves de Firebase:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

```bash
npm run dev
```

## Desplegar en Vercel

**Frontend**

1. Conecta el repositorio de GitHub en Vercel
2. Framework preset: **Vite**
3. Añade las variables de entorno de Firebase en el panel de Vercel
4. Cada push a `main` despliega automáticamente

**Firebase**

1. Crea un proyecto en https://console.firebase.google.com
2. Activa **Authentication** → Método de acceso → Correo electrónico/contraseña
3. Activa **Firestore** y configura las reglas de seguridad
4. Añade `turnstay.vercel.app` a los dominios autorizados en Authentication → Configuración

---

Desarrollado durante las prácticas en Corner Estudios — Teresa Borrajo — 2026
