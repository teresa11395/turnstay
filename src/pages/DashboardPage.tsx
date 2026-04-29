import { useNavigate } from 'react-router-dom'
import { useOcupaciones } from '../hooks/useOcupaciones'
import { useGastos } from '../hooks/useGastos'
import { useIncidencias } from '../hooks/useIncidencias'
import { useTurnos } from '../hooks/useTurnos'
import { useAuthContext } from '../context/AuthContext'
import { useConfigContext } from '../context/ConfigContext'
import LoadingSpinner from '../components/LoadingSpinner'

const COLORES_FAMILIA: Record<string, string> = {
  Charo:   'bg-orange-100 text-orange-800 hover:bg-orange-200',
  JManuel: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  Carlos:  'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
  Javier:  'bg-cyan-100 text-cyan-800 hover:bg-cyan-200',
  Tito:    'bg-amber-100 text-amber-800 hover:bg-amber-200',
  MTere:   'bg-rose-100 text-rose-800 hover:bg-rose-200',
  Sonso:   'bg-purple-100 text-purple-800 hover:bg-purple-200',
  Marisa:  'bg-teal-100 text-teal-800 hover:bg-teal-200',
}

const colorFamilia = (familia: string) =>
  COLORES_FAMILIA[familia] ?? 'bg-gray-100 text-gray-700 hover:bg-gray-200'

export default function DashboardPage() {
  const { user } = useAuthContext()
  // FIX: también leemos loading del config para no renderizar con datos por defecto
  const { config, loading: loadingConfig } = useConfigContext()
  const navigate = useNavigate()
  const { ocupaciones, loading: loadingOcupaciones } = useOcupaciones()
  const { totalGastos, loading: loadingGastos } = useGastos()
  const { incidencias, loading: loadingIncidencias } = useIncidencias()
  const { turnosBaja, turnosAlta, año, setAño } = useTurnos()

  // FIX: añadido loadingConfig — si el config aún no ha cargado de Firestore,
  // no renderizamos el dashboard para evitar mostrar el sistema de turnos por defecto
  if (loadingOcupaciones || loadingGastos || loadingIncidencias || loadingConfig) return <LoadingSpinner />

  const sistemaTurnos = config?.sistemaTurnos ?? 'rotacion'
  const mostrarTurnos = sistemaTurnos === 'rotacion' || sistemaTurnos === 'mixto'

  const turnosAño = [...turnosBaja, ...turnosAlta]
  const ultimasOcupaciones = ocupaciones.slice(0, 3)
  const incidenciasPendientes = incidencias.filter(i => i.estado !== 'resuelta')
  const ultimasIncidencias = incidenciasPendientes.slice(0, 3)

  const totalRecaudado = ocupaciones.reduce((sum, o) => sum + o.coste, 0)
  const fondoComun = totalRecaudado - totalGastos

  const handleTurnoClick = (familia: string) => {
    navigate(`/cesiones?familia=${encodeURIComponent(familia)}`)
  }

  return (
    <div className="p-6 md:p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Panel general</h1>
        <p className="text-gray-500 mt-1">Bienvenida, {user?.email?.split('@')[0]}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Ocupaciones registradas</p>
          <p className="text-3xl font-semibold text-gray-900">{ocupaciones.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Fondo común</p>
          <p className={`text-3xl font-semibold ${fondoComun >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {fondoComun >= 0 ? '+' : ''}{fondoComun.toFixed(0)}€
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Incidencias pendientes</p>
          <p className="text-3xl font-semibold text-gray-900">{incidenciasPendientes.length}</p>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Últimas ocupaciones */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
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
        <div className="bg-white rounded-xl border border-gray-200 p-5">
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

        {/* Turnos del año — solo para rotacion y mixto */}
        {mostrarTurnos && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 md:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-700">Turnos {año}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Pulsa un turno para solicitar una cesión</p>
              </div>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {turnosAño.map((t, index) => (
                <button
                  key={index}
                  onClick={() => handleTurnoClick(t.familia)}
                  className={`rounded-lg p-3 text-left transition-colors cursor-pointer ${colorFamilia(t.familia)}`}
                  title={`Solicitar cesión a ${t.familia}`}
                >
                  <p className="text-xs opacity-70 mb-0.5">{t.periodo}</p>
                  <p className="text-sm font-medium">{t.familia}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Calendario libre — solo para calendario y mixto */}
        {!mostrarTurnos && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 md:col-span-2">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Reservas de días</h2>
            <p className="text-sm text-gray-400">
              Tu copropiedad usa el sistema de <span className="font-medium text-gray-600">calendario libre</span>. Cada familia puede reservar los días que quiera desde la sección de Ocupaciones.
            </p>
            <button
              onClick={() => navigate('/ocupaciones')}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              → Ir a Ocupaciones
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
