import { Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

const navItems = [
  { path: '/', label: 'Panel general', icon: '🏠' },
  { path: '/calendario', label: 'Calendario', icon: '📅' },
  { path: '/ocupaciones', label: 'Ocupaciones', icon: '🛎️' },
  { path: '/gastos', label: 'Gastos', icon: '💰' },
  { path: '/incidencias', label: 'Incidencias', icon: '🔧' },
  { path: '/cesiones', label: 'Cesiones', icon: '🔄' },
  { path: '/historico', label: 'Histórico', icon: '📊' },
  { path: '/configuracion', label: 'Configuración', icon: '⚙️' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthContext()
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">TurnStay</h1>
          <p className="text-xs text-gray-400 mt-0.5">Copropiedad vacacional</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-700 truncate">{user?.email}</p>
              <p className="text-xs text-gray-400">Copropietario</p>
            </div>
            <button
              onClick={logout}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>

    </div>
  )
}