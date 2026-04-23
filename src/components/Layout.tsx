import { useState } from 'react'
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
  const [menuAbierto, setMenuAbierto] = useState(false)

  const cerrarMenu = () => setMenuAbierto(false)

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col fixed h-full z-30">
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">TurnStay</h1>
          <p className="text-xs text-gray-400 mt-0.5">Copropiedad vacacional</p>
        </div>
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
        <div className="px-4 py-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-700 truncate mb-0.5">{user?.email}</p>
          <p className="text-xs text-gray-400 mb-3">Copropietario</p>
          <button
            onClick={logout}
            className="w-full py-2 px-3 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-medium"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Header móvil */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">TurnStay</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={logout}
            className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 font-medium"
          >
            Salir
          </button>
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Abrir menú"
          >
            {menuAbierto ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Overlay móvil */}
      {menuAbierto && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40"
          onClick={cerrarMenu}
        />
      )}

      {/* Drawer móvil */}
      <div className={`md:hidden fixed top-0 left-0 h-full w-72 bg-white z-40 transform transition-transform duration-300 ${
        menuAbierto ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">TurnStay</h1>
          <p className="text-xs text-gray-400 mt-0.5">Copropiedad vacacional</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={cerrarMenu}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="px-4 py-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-700 truncate mb-0.5">{user?.email}</p>
          <p className="text-xs text-gray-400 mb-3">Copropietario</p>
          <button
            onClick={logout}
            className="w-full py-2 px-3 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-medium"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 min-h-screen pt-14 md:pt-0">
        {children}
      </main>

    </div>
  )
}
