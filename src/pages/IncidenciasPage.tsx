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

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />

  return (
    <div className="p-6">
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
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400">{i.fecha} · {i.familia} · Urgencia: {i.urgencia}</p>
                {i.estado !== 'resuelta' && (
                  <button
                    onClick={() => i.id && updateIncidencia(i.id, { estado: 'resuelta' })}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    Marcar resuelta
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}