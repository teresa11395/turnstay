import { useState, useEffect } from 'react'
import { useConfigContext } from '../context/ConfigContext'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ConfiguracionPage() {
  const { config, loading, updateConfig } = useConfigContext()

  const [nombrePropiedad, setNombrePropiedad] = useState('')
  const [familias, setFamilias] = useState<string[]>([])
  const [tarifaDiaria, setTarifaDiaria] = useState(12)
  const [cuotaAnual, setCuotaAnual] = useState(0)
  const [nuevaFamilia, setNuevaFamilia] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar config actual en el formulario
  useEffect(() => {
    if (config) {
      setNombrePropiedad(config.nombrePropiedad)
      setFamilias([...config.familias])
      setTarifaDiaria(config.tarifaDiaria)
      setCuotaAnual(config.cuotaAnual)
    }
  }, [config])

  const handleAñadirFamilia = () => {
    const nombre = nuevaFamilia.trim()
    if (!nombre) return
    if (familias.includes(nombre)) {
      setError('Esa familia ya existe')
      return
    }
    setFamilias([...familias, nombre])
    setNuevaFamilia('')
    setError(null)
  }

  const handleEliminarFamilia = (nombre: string) => {
    if (familias.length <= 1) {
      setError('Debe haber al menos una familia')
      return
    }
    setFamilias(familias.filter(f => f !== nombre))
    setError(null)
  }

  const handleGuardar = async () => {
    if (!nombrePropiedad.trim()) {
      setError('El nombre de la propiedad es obligatorio')
      return
    }
    if (familias.length === 0) {
      setError('Debe haber al menos una familia')
      return
    }
    if (tarifaDiaria < 0) {
      setError('La tarifa no puede ser negativa')
      return
    }

    setError(null)
    setGuardando(true)

    await updateConfig({
      nombrePropiedad: nombrePropiedad.trim(),
      familias,
      tarifaDiaria,
      cuotaAnual,
    })

    setGuardando(false)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2500)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configuración</h1>

      <div className="space-y-6">

        {/* Nombre de la propiedad */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-3">Nombre de la propiedad</h2>
          <input
            type="text"
            value={nombrePropiedad}
            onChange={(e) => setNombrePropiedad(e.target.value)}
            placeholder="Ej: Casa de la playa"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Familias */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-3">Familias copropietarias</h2>

          <div className="flex flex-wrap gap-2 mb-4">
            {familias.map((f) => (
              <span
                key={f}
                className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium"
              >
                {f}
                <button
                  onClick={() => handleEliminarFamilia(f)}
                  className="text-gray-400 hover:text-red-500 transition-colors leading-none"
                  title={`Eliminar ${f}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={nuevaFamilia}
              onChange={(e) => setNuevaFamilia(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAñadirFamilia()}
              placeholder="Nombre de la familia"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={handleAñadirFamilia}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Añadir
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {familias.length} familia{familias.length !== 1 ? 's' : ''} · Los turnos se calculan en base a este orden
          </p>
        </div>

        {/* Tarifas */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-3">Tarifas</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Tarifa mínima por día (€)
              </label>
              <input
                type="number"
                min={0}
                value={tarifaDiaria}
                onChange={(e) => setTarifaDiaria(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Base: 6€/persona/día</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Cuota anual por familia (€)
              </label>
              <input
                type="number"
                min={0}
                value={cuotaAnual}
                onChange={(e) => setCuotaAnual(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        {/* Botón guardar */}
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {guardando ? 'Guardando...' : guardado ? '✓ Guardado' : 'Guardar configuración'}
        </button>

      </div>
    </div>
  )
}
