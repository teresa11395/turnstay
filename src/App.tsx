import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthContext } from './context/AuthContext'
import { useCopropiedad } from './context/CopropiedadContext'
import Layout from './components/Layout'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CalendarioPage from './pages/CalendarioPage'
import OcupacionesPage from './pages/OcupacionesPage'
import GastosPage from './pages/GastosPage'
import IncidenciasPage from './pages/IncidenciasPage'
import CesionesPage from './pages/CesionesPage'
import ConfiguracionPage from './pages/ConfiguracionPage'
import HistoricoPage from './pages/HistoricoPage'
import NotFoundPage from './pages/NotFoundPage'
import LoadingSpinner from './components/LoadingSpinner'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: loadingAuth } = useAuthContext()
  const { tieneCopropiedad, loading: loadingCop } = useCopropiedad()

  if (loadingAuth || loadingCop) return <LoadingSpinner />
  if (!user || !tieneCopropiedad) return <Navigate to="/login" />

  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* Redirigir /onboarding a /login por si alguien tiene la URL guardada */}
        <Route path="/onboarding" element={<Navigate to="/login" />} />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/calendario" element={<ProtectedRoute><CalendarioPage /></ProtectedRoute>} />
        <Route path="/ocupaciones" element={<ProtectedRoute><OcupacionesPage /></ProtectedRoute>} />
        <Route path="/gastos" element={<ProtectedRoute><GastosPage /></ProtectedRoute>} />
        <Route path="/incidencias" element={<ProtectedRoute><IncidenciasPage /></ProtectedRoute>} />
        <Route path="/cesiones" element={<ProtectedRoute><CesionesPage /></ProtectedRoute>} />
        <Route path="/historico" element={<ProtectedRoute><HistoricoPage /></ProtectedRoute>} />

        {/* /configuracion solo accesible para admins */}
        <Route path="/configuracion" element={
          <ProtectedRoute>
            <ProtectedAdminRoute>
              <ConfiguracionPage />
            </ProtectedAdminRoute>
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
