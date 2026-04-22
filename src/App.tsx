import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthContext } from './context/AuthContext'
import Layout from './components/Layout'
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
  const { user, loading } = useAuthContext()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" />
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/calendario" element={<ProtectedRoute><CalendarioPage /></ProtectedRoute>} />
        <Route path="/ocupaciones" element={<ProtectedRoute><OcupacionesPage /></ProtectedRoute>} />
        <Route path="/gastos" element={<ProtectedRoute><GastosPage /></ProtectedRoute>} />
        <Route path="/incidencias" element={<ProtectedRoute><IncidenciasPage /></ProtectedRoute>} />
        <Route path="/cesiones" element={<ProtectedRoute><CesionesPage /></ProtectedRoute>} />
        <Route path="/configuracion" element={<ProtectedRoute><ConfiguracionPage /></ProtectedRoute>} />
        <Route path="/historico" element={<ProtectedRoute><HistoricoPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}