import { useState } from 'react'
import { useOcupaciones } from '../hooks/useOcupaciones'
import OcupacionForm from '../components/OcupacionForm'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'

export default function OcupacionesPage() {
  const { ocupaciones, loading, error, deleteOcupacion, refetch } = useOcupaciones()
  const [showForm, setShowForm] = useState(false)

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />

  return (
    <div className="p-6">
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

      {ocupaciones.length === 0 ? (
        <EmptyState
          title="Sin ocupaciones registradas"
          description="Registra la primera ocupación de la temporada"
          icon="📅"
        />
      ) : (
        <div className="space-y-3">
          {ocupaciones.map((o) => (
            <div key={o.id} className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">{o.familia}</p>
                <p className="text-sm text-gray-500">{o.fechaEntrada} → {o.fechaSalida}</p>
                <p className="text-sm text-gray-500">{o.personas} personas · {o.dias} días · {o.coste}€</p>
              </div>
              <button
                onClick={() => o.id && deleteOcupacion(o.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}