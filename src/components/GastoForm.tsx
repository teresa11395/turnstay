import { useState } from 'react'
import { useGastos } from '../hooks/useGastos'
import { useConfigContext } from '../context/ConfigContext'

export default function GastoForm({ onClose }: { onClose: () => void }) {
  const { addGasto } = useGastos()
  const { config } = useConfigContext()

  const [concepto, setConcepto] = useState('')
  const [importe, setImporte] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [familia, setFamilia] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!concepto.trim()) return setError('El concepto es obligatorio')
    if (!importe || Number(importe) <= 0) return setError('El importe debe ser mayor que 0')
    if (!familia) return setError('Selecciona una familia')

    setSubmitting(true)
    setError(null)

    await addGasto({
      concepto: concepto.trim(),
      importe: Number(importe),
      fecha,
      familia,
    })

    setSuccess(true)
    setSubmitting(false)
    setTimeout(() => onClose(), 1500)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Registrar gasto</h2>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4">
          ✓ Gasto registrado correctamente
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
          <input
            type="text"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Cambio bombona butano"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Importe (€)</label>
          <input
            type="number"
            min={0.01}
            step={0.01}
            value={importe}
            onChange={(e) => setImporte(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Familia que pagó</label>
          <select
            value={familia}
            onChange={(e) => setFamilia(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecciona una familia</option>
            {config?.familias.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {submitting ? 'Guardando...' : 'Registrar'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}