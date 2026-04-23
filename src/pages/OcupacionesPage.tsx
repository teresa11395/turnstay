import { useState } from 'react'
import { useOcupaciones } from '../hooks/useOcupaciones'
import type { EntregaTurno } from '../hooks/useOcupaciones'
import OcupacionForm from '../components/OcupacionForm'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'

const ITEMS_ENTREGA = [
  { key: 'casaLimpia',     label: 'Casa limpia',     icon: '🏠' },
  { key: 'jardinCuidado',  label: 'Jardín cuidado',  icon: '🌿' },
  { key: 'bañosLimpios',   label: 'Baños limpios',   icon: '🛁' },
  { key: 'cocinaLimpia',   label: 'Cocina limpia',   icon: '🍳' },
] as const

export default function OcupacionesPage() {
  const { ocupaciones, loading, error, deleteOcupacion, updateOcupacion, refetch } = useOcupaciones()
  const [showForm, setShowForm] = useState(false)
  const [entregandoId, setEntregandoId] = useState<string | null>(null)
  const [entrega, setEntrega] = useState<Omit<EntregaTurno, 'fecha'>>({
    casaLimpia: true,
    jardinCuidado: true,
    bañosLimpios: true,
    cocinaLimpia: true,
    observaciones: '',
  })
  const [guardando, setGuardando] = useState(false)

  const handleAbrirEntrega = (id: string) => {
    setEntregandoId(id)
    setEntrega({
      casaLimpia: true,
      jardinCuidado: true,
      bañosLimpios: true,
      cocinaLimpia: true,
      observaciones: '',
    })
  }

  const handleToggle = (key: keyof Omit<EntregaTurno, 'fecha' | 'observaciones'>) => {
    setEntrega(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleConfirmarEntrega = async () => {
    if (!entregandoId) return
    setGuardando(true)
    await updateOcupacion(entregandoId, {
      entrega: {
        ...entrega,
        fecha: new Date().toISOString().split('T')[0],
      }
    })
    setGuardando(false)
    setEntregandoId(null)
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Registro de ocupaciones</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Nueva ocupación
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <OcupacionForm onClose={() => { setShowForm(false); refetch() }} />
        </div>
      )}

      {/* Modal entrega de turno */}
      {entregandoId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md mx-4 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Entrega de turno</h2>
            <p className="text-sm text-gray-500 mb-5">
              Indica el estado en que dejas la casa para la siguiente familia.
            </p>

            <div className="space-y-3 mb-5">
              {ITEMS_ENTREGA.map(item => (
                <div
                  key={item.key}
                  onClick={() => handleToggle(item.key)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    entrega[item.key]
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                  <span className={`text-sm font-semibold ${entrega[item.key] ? 'text-green-600' : 'text-red-500'}`}>
                    {entrega[item.key] ? '✓ Sí' : '✗ No'}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones <span className="text-gray-400 font-normal">— opcional</span>
              </label>
              <textarea
                value={entrega.observaciones}
                onChange={e => setEntrega(prev => ({ ...prev, observaciones: e.target.value }))}
                rows={2}
                placeholder="Ej: Se ha gastado el gas, queda poca leña..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirmarEntrega}
                disabled={guardando}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
              >
                {guardando ? 'Guardando...' : 'Registrar entrega'}
              </button>
              <button
                onClick={() => setEntregandoId(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {ocupaciones.length === 0 ? (
        <EmptyState
          title="Sin ocupaciones registradas"
          description="Registra la primera ocupación de la temporada"
          icon="📅"
        />
      ) : (
        <div className="space-y-3">
          {ocupaciones.map((o) => (
            <div key={o.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-800">{o.familia}</p>
                  <p className="text-sm text-gray-500">{o.fechaEntrada} → {o.fechaSalida}</p>
                  <p className="text-sm text-gray-500">{o.personas} personas · {o.dias} días · {o.coste}€</p>
                </div>
                <button
                  onClick={() => o.id && deleteOcupacion(o.id)}
                  className="text-red-400 hover:text-red-600 text-xs"
                >
                  Eliminar
                </button>
              </div>

              {/* Entrega registrada */}
              {o.entrega ? (
                <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Estado al salir · {o.entrega.fecha}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-1">
                    {ITEMS_ENTREGA.map(item => (
                      <span
                        key={item.key}
                        className={`text-xs px-2 py-1 rounded-full ${
                          o.entrega![item.key]
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {item.icon} {item.label}
                      </span>
                    ))}
                  </div>
                  {o.entrega.observaciones && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      "{o.entrega.observaciones}"
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => o.id && handleAbrirEntrega(o.id)}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Registrar entrega de turno
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
