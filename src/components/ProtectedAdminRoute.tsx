import { Navigate } from 'react-router-dom'
import { useCopropiedad } from '../context/CopropiedadContext'
import LoadingSpinner from './LoadingSpinner'

interface ProtectedAdminRouteProps {
  children: React.ReactNode
}

// Componente que solo deja pasar a usuarios con rol 'admin'
// Si el usuario es copropietario, lo redirige al dashboard
export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { perfil, loading } = useCopropiedad()

  if (loading) return <LoadingSpinner />
  if (perfil?.rol !== 'admin') return <Navigate to="/" />

  return <>{children}</>
}
