import { useState } from 'react'
import { useIncidencias } from '../hooks/useIncidencias'
import IncidenciaForm from '../components/IncidenciaForm'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'
import Badge from '../components/Badge'

export default function IncidenciasPage() {
  const { incidencias, loading, error, updateIncidencia, refetch } = useIncidencias()
  const [showForm, setShowForm] = useState(false)
  const [resolviendoId, setResolviendoId] = useState<string | null>(null)
  const [resolucion, setResolucion] = useState('')
  const [costeReparacion, setCosteReparacion] = useState<number>(0)
  const [guardando, setGuardando] = useState(false)

  const handleMarcarEnProgreso = async (id: string) => {
    await updateIncidencia(id, { estado: 'en progreso' })
  }

  const handleAbrirResolucion = (id: string) => {
    setResolviendoId(id)
    setResolucion('')
    setCosteReparacion(0)
  }

  const handleConfirmarResolucion = async () => {
    if (!resolviendoId) return
    if (!resolucion.trim()) return
    setGuardando(true)
    await updateIncidencia(resolviendoId, {
      estado: 'resuelta',
      resolucion: resolucion.trim(),
      costeReparacion: costeReparacion > 0 ? costeReparacion : 0,
    })
    setGuardando(false)
    setResolviendoId(null)
    setResolucion('')
    setCosteReparacion(0)
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Estado de la vivienda</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Reportar incidencia
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <IncidenciaForm onClose={() => { setShowForm(false); refetch() }} />
        </div>
      )}

      {/* Modal resolución */}
      {resolviendoId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-md mx-4 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">¿Cómo se resolvió?</h2>
            <p className="text-sm text-gray-500 mb-4">
              Describe la solución aplicada para que quede registrada.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción de la resolución
                </label>
                <textarea
                  value={resolucion}
                  onChange={(e) => setResolucion(e.target.value)}
                  rows={3}
                  placeholder="Ej: Fontanero reparó la gotera del baño sellando la junta..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coste de la reparación (€)
                  <span className="text-gray-400 font-normal ml-1">— opcional</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={costeReparacion}
                  onChange={(e) => setCosteReparacion(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Deja en 0 si no hubo coste</p>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleConfirmarResolucion}
                disabled={!resolucion.trim() || guardando}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium text-sm"
              >
                {guardando ? 'Guardando...' : 'Marcar como resuelta'}
              </button>
              <button
                onClick={() => setResolviendoId(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {incidencias.length === 0 ? (
        <EmptyState
          title="Sin incidencias"
          description="La vivienda está en perfecto estado"
          icon="✅"
        />
      ) : (
        <div className="space-y-3">
          {incidencias.map((i) => (
            <div key={i.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-gray-800">{i.titulo}</p>
                <Badge
                  label={i.estado}
                  status={i.estado === 'resuelta' ? 'completado' : i.estado === 'en progreso' ? 'activo' : 'pendiente'}
                />
              </div>
              <p className="text-sm text-gray-500 mb-2">{i.descripcion}</p>

              {/* Resolución */}
              {i.resolucion && (
                <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-2">
                  <p className="text-xs text-green-700">
                    <span className="font-medium">Resolución:</span> {i.resolucion}
                  </p>
                  {i.costeReparacion !== undefined && i.costeReparacion > 0 && (
                    <p className="text-xs text-green-700 mt-0.5">
                      <span className="font-medium">Coste:</span> {i.costeReparacion}€
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400">
                  {i.fecha} · {i.familia} · Urgencia: {i.urgencia}
                </p>
                <div className="flex gap-2">
                  {i.estado === 'pendiente' && (
                    <button
                      onClick={() => i.id && handleMarcarEnProgreso(i.id)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      En progreso
                    </button>
                  )}
                  {i.estado !== 'resuelta' && (
                    <button
                      onClick={() => i.id && handleAbrirResolucion(i.id)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Marcar resuelta
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
