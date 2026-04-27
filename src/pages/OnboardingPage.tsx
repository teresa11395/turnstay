import { useState } from 'react'
import { useCopropiedad } from '../context/CopropiedadContext'

type Vista = 'inicio' | 'crear' | 'unirse'

const FAMILIAS_EJEMPLO = ['Familia 1', 'Familia 2']

export default function OnboardingPage() {
  const { crearCopropiedad, unirseACopropiedad, error } = useCopropiedad()
  const [vista, setVista] = useState<Vista>('inicio')

  // Crear copropiedad
  const [nombre, setNombre] = useState('')
  const [familias, setFamilias] = useState<string[]>([''])
  const [sistemaTurnos, setSistemaTurnos] = useState<'rotacion' | 'calendario' | 'mixto'>('calendario')
  const [creando, setCreando] = useState(false)
  const [errorLocal, setErrorLocal] = useState<string | null>(null)

  // Unirse
  const [codigo, setCodigo] = useState('')
  const [familia, setFamilia] = useState('')
  const [uniendose, setUniendose] = useState(false)

  const handleAñadirFamilia = () => setFamilias([...familias, ''])
  const handleCambiarFamilia = (i: number, valor: string) => {
    const nuevas = [...familias]
    nuevas[i] = valor
    setFamilias(nuevas)
  }
  const handleEliminarFamilia = (i: number) => {
    setFamilias(familias.filter((_, idx) => idx !== i))
  }

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return setErrorLocal('El nombre es obligatorio')
    const familiasValidas = familias.filter(f => f.trim())
    if (familiasValidas.length === 0) return setErrorLocal('Añade al menos una familia')

    setCreando(true)
    setErrorLocal(null)
    try {
      await crearCopropiedad(nombre.trim(), familiasValidas, sistemaTurnos)
    } catch (err) {
      setErrorLocal('Error al crear la copropiedad')
    } finally {
      setCreando(false)
    }
  }

  const handleUnirse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codigo.trim()) return setErrorLocal('El código es obligatorio')
    if (!familia.trim()) return setErrorLocal('Indica el nombre de tu familia')

    setUniendose(true)
    setErrorLocal(null)
    try {
      await unirseACopropiedad(codigo.trim(), familia.trim())
    } catch (err) {
      setErrorLocal('Código no válido o error al unirse')
    } finally {
      setUniendose(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">TurnStay</h1>
          <p className="text-gray-500 mt-1">Gestión de copropiedades vacacionales</p>
        </div>

        {/* Inicio */}
        {vista === 'inicio' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Bienvenido</h2>
            <p className="text-sm text-gray-500 mb-6">
              Para continuar, crea una nueva copropiedad o únete a una existente con el código que te hayan compartido.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setVista('crear')}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Crear nueva copropiedad
              </button>
              <button
                onClick={() => setVista('unirse')}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Unirme con código de invitación
              </button>
            </div>
          </div>
        )}

        {/* Crear copropiedad */}
        {vista === 'crear' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <button
              onClick={() => setVista('inicio')}
              className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1"
            >
              ← Volver
            </button>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Nueva copropiedad</h2>

            <form onSubmit={handleCrear} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la propiedad
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Casa de la playa, Chalet Sierra..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sistema de turnos
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'calendario', label: '📅 Calendario libre', desc: 'Cada familia reserva los días que quiere' },
                    { value: 'rotacion', label: '🔄 Rotación fija', desc: 'Turnos por meses y quincenas automáticos' },
                    { value: 'mixto', label: '⚖️ Mixto', desc: 'Rotación base + reservas libres' },
                  ].map(op => (
                    <div
                      key={op.value}
                      onClick={() => setSistemaTurnos(op.value as any)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        sistemaTurnos === op.value
                          ? 'bg-blue-50 border-blue-300'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-800">{op.label}</p>
                      <p className="text-xs text-gray-500">{op.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Familias copropietarias
                </label>
                <div className="space-y-2">
                  {familias.map((f, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={f}
                        onChange={e => handleCambiarFamilia(i, e.target.value)}
                        placeholder={`Ej: ${FAMILIAS_EJEMPLO[i] ?? 'Familia ' + (i + 1)}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      {familias.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleEliminarFamilia(i)}
                          className="text-gray-400 hover:text-red-500 px-2"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAñadirFamilia}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Añadir familia
                  </button>
                </div>
              </div>

              {(errorLocal || error) && (
                <p className="text-red-600 text-sm">{errorLocal || error}</p>
              )}

              <button
                type="submit"
                disabled={creando}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {creando ? 'Creando...' : 'Crear copropiedad'}
              </button>
            </form>
          </div>
        )}

        {/* Unirse */}
        {vista === 'unirse' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <button
              onClick={() => setVista('inicio')}
              className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1"
            >
              ← Volver
            </button>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Unirse a una copropiedad</h2>
            <p className="text-sm text-gray-500 mb-4">
              Introduce el código que te ha compartido el administrador de la copropiedad.
            </p>

            <form onSubmit={handleUnirse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de invitación
                </label>
                <input
                  type="text"
                  value={codigo}
                  onChange={e => setCodigo(e.target.value.toUpperCase())}
                  placeholder="Ej: ABC123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono tracking-widest"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tu familia
                </label>
                <input
                  type="text"
                  value={familia}
                  onChange={e => setFamilia(e.target.value)}
                  placeholder="Ej: Charo, JManuel..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {(errorLocal || error) && (
                <p className="text-red-600 text-sm">{errorLocal || error}</p>
              )}

              <button
                type="submit"
                disabled={uniendose}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {uniendose ? 'Uniéndome...' : 'Unirme'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}
