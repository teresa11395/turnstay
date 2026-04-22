import { useOcupaciones } from '../hooks/useOcupaciones'
import { useGastos } from '../hooks/useGastos'
import { useIncidencias } from '../hooks/useIncidencias'
import { useTurnos } from '../hooks/useTurnos'
import { useAuthContext } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

export default function DashboardPage() {
  const { user } = useAuthContext()
  const { ocupaciones, loading: loadingOcupaciones } = useOcupaciones()
  const { totalGastos, loading: loadingGastos } = useGastos()
  const { incidencias, loading: loadingIncidencias } = useIncidencias()
  const { turnosBaja, turnosAlta, año, setAño } = useTurnos()

  if (loadingOcupaciones || loadingGastos || loadingIncidencias) return <LoadingSpinner />

  const turnosAño = [...turnosBaja, ...turnosAlta]
  const ultimasOcupaciones = ocupaciones.slice(0, 3)
  const incidenciasPendientes = incidencias.filter(i => i.estado !== 'resuelta')
  const ultimasIncidencias = incidenciasPendientes.slice(0, 3)

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Panel general</h1>
        <p className="text-gray-500 mt-1">Bienvenida, {user?.email?.split('@')[0]}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Ocupaciones registradas</p>
          <p className="text-3xl font-semibold text-gray-900">{ocupaciones.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Fondo común</p>
          <p className="text-3xl font-semibold text-gray-900">{totalGastos.toFixed(0)}€</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Incidencias pendientes</p>
          <p className="text-3xl font-semibold text-gray-900">{incidenciasPendientes.length}</p>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Últimas ocupaciones */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Últimas ocupaciones</h2>
          {ultimasOcupaciones.length === 0 ? (
            <p className="text-sm text-gray-400">Sin ocupaciones registradas</p>
          ) : (
            <div className="space-y-3">
              {ultimasOcupaciones.map((o) => (
                <div key={o.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{o.familia}</p>
                    <p className="text-xs text-gray-400">{o.fechaEntrada} → {o.fechaSalida}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{o.coste}€</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Incidencias pendientes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Incidencias pendientes</h2>
          {ultimasIncidencias.length === 0 ? (
            <p className="text-sm text-gray-400">No hay incidencias pendientes</p>
          ) : (
            <div className="space-y-3">
              {ultimasIncidencias.map((i) => (
                <div key={i.id} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{i.titulo}</p>
                    <p className="text-xs text-gray-400">{i.familia} · {i.fecha}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    i.urgencia === 'alta' ? 'bg-red-50 text-red-600' :
                    i.urgencia === 'media' ? 'bg-yellow-50 text-yellow-600' :
                    'bg-green-50 text-green-600'
                  }`}>
                    {i.urgencia}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Turnos del año */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Turnos {año}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAño(año - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 text-sm"
              >
                ←
              </button>
              <button
                onClick={() => setAño(año + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 text-sm"
              >
                →
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {turnosAño.map((t, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">{t.periodo}</p>
                <p className="text-sm font-medium text-gray-800">{t.familia}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}