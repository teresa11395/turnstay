import { useState } from 'react'
import { useIncidencias } from '../hooks/useIncidencias'
import { useConfigContext } from '../context/ConfigContext'

export default function IncidenciaForm({ onClose }: { onClose: () => void }) {
  const { addIncidencia } = useIncidencias()
  const { config } = useConfigContext()

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [urgencia, setUrgencia] = useState<'baja' | 'media' | 'alta'>('baja')
  const [familia, setFamilia] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim()) return setError('El título es obligatorio')
    if (!descripcion.trim()) return setError('La descripción es obligatoria')
    if (!familia) return setError('Selecciona una familia')

    setSubmitting(true)
    setError(null)

    await addIncidencia({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      urgencia,
      estado: 'pendiente',
      familia,
      fecha: new Date().toISOString().split('T')[0],
    })

    setSuccess(true)
    setSubmitting(false)
    setTimeout(() => onClose(), 1500)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Reportar incidencia</h2>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4">
          ✓ Incidencia registrada correctamente
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Bombona de butano vacía"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe el problema con detalle..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Urgencia</label>
          <select
            value={urgencia}
            onChange={(e) => setUrgencia(e.target.value as 'baja' | 'media' | 'alta')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="baja">🟢 Baja — puede esperar</option>
            <option value="media">🟡 Media — atender pronto</option>
            <option value="alta">🔴 Alta — urgente</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Familia que reporta</label>
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
            {submitting ? 'Guardando...' : 'Reportar'}
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