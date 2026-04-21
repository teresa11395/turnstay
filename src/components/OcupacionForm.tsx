import { useState } from 'react'
import { useOcupaciones } from '../hooks/useOcupaciones'
import { useConfigContext } from '../context/ConfigContext'

export default function OcupacionForm({ onClose }: { onClose: () => void }) {
  const { addOcupacion, ocupaciones } = useOcupaciones()
  const { config } = useConfigContext()

  const [familia, setFamilia] = useState('')
  const [fechaEntrada, setFechaEntrada] = useState('')
  const [fechaSalida, setFechaSalida] = useState('')
  const [personas, setPersonas] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calcularDias = () => {
    if (!fechaEntrada || !fechaSalida) return 0
    const entrada = new Date(fechaEntrada)
    const salida = new Date(fechaSalida)
    const diff = (salida.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24)
    return diff > 0 ? diff : 0
  }

  const dias = calcularDias()
  const tarifaDiaria = config?.tarifaDiaria ?? 12
  const coste = dias * tarifaDiaria

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!familia) return setError('Selecciona una familia')
    if (dias === 0) return setError('Las fechas no son válidas')

    const entrada = new Date(fechaEntrada)
    const salida = new Date(fechaSalida)

    const solapamiento = ocupaciones.some((o) => {
      const oEntrada = new Date(o.fechaEntrada)
      const oSalida = new Date(o.fechaSalida)
      return entrada < oSalida && salida > oEntrada
    })

    if (solapamiento) return setError('Esas fechas se solapan con una ocupación existente')

    setSubmitting(true)
    setError(null)

    await addOcupacion({
      familia,
      fechaEntrada,
      fechaSalida,
      personas,
      dias,
      coste,
    })

    setSuccess(true)
    setSubmitting(false)
    setTimeout(() => onClose(), 1500)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Registrar ocupación</h2>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4">
          ✓ Ocupación registrada correctamente
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Familia</label>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha entrada</label>
            <input
              type="date"
              value={fechaEntrada}
              onChange={(e) => setFechaEntrada(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha salida</label>
            <input
              type="date"
              value={fechaSalida}
              onChange={(e) => setFechaSalida(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número de personas</label>
          <input
            type="number"
            min={1}
            max={20}
            value={personas}
            onChange={(e) => setPersonas(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {dias > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            <p><span className="font-medium">Días:</span> {dias}</p>
            <p><span className="font-medium">Tarifa:</span> {tarifaDiaria}€/día</p>
            <p><span className="font-medium">Coste total:</span> {coste}€</p>
          </div>
        )}

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