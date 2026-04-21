import { useState } from 'react'
import { useGastos } from '../hooks/useGastos'
import GastoForm from '../components/GastoForm'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import EmptyState from '../components/EmptyState'

export default function GastosPage() {
  const { gastos, loading, error, deleteGasto, totalGastos, refetch } = useGastos()
  const [showForm, setShowForm] = useState(false)

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gastos comunes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Nuevo gasto
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <GastoForm onClose={() => { setShowForm(false); refetch() }} />
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-600 font-medium">Total gastos registrados</p>
        <p className="text-2xl font-bold text-blue-800">{totalGastos.toFixed(2)}€</p>
      </div>

      {gastos.length === 0 ? (
        <EmptyState
          title="Sin gastos registrados"
          description="Registra el primer gasto común de la copropiedad"
          icon="💰"
        />
      ) : (
        <div className="space-y-3">
          {gastos.map((g) => (
            <div key={g.id} className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">{g.concepto}</p>
                <p className="text-sm text-gray-500">{g.fecha} · {g.familia}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-semibold text-gray-800">{g.importe.toFixed(2)}€</p>
                <button
                  onClick={() => g.id && deleteGasto(g.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}