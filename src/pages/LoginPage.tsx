import { useState, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { useCopropiedad } from '../context/CopropiedadContext'
import LoadingSpinner from '../components/LoadingSpinner'

type Vista = 'login' | 'crear' | 'unirse'

const FAMILIAS_EJEMPLO = ['Familia 1', 'Familia 2']

export default function LoginPage() {
  const { user, loading: loadingAuth, error: errorAuth, login } = useAuthContext()
  const { tieneCopropiedad, loading: loadingCop, crearCopropiedad, unirseACopropiedad, error: errorCop } = useCopropiedad()

  const [vista, setVista] = useState<Vista>('login')

  // Login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Crear copropiedad
  const [nombre, setNombre] = useState('')
  const [familias, setFamilias] = useState<string[]>([''])
  const [sistemaTurnos, setSistemaTurnos] = useState<'rotacion' | 'calendario' | 'mixto'>('calendario')
  const [creando, setCreando] = useState(false)
  const [errorLocal, setErrorLocal] = useState<string | null>(null)
  const enviandoRef = useRef(false)

  // Unirse
  const [codigo, setCodigo] = useState('')
  const [familia, setFamilia] = useState('')
  const [uniendose, setUniendose] = useState(false)

  // Mientras Firebase verifica la sesión → spinner, no onboarding
  if (loadingAuth || loadingCop) return <LoadingSpinner />

  // Si ya hay sesión y tiene copropiedad → dashboard
  if (user && tieneCopropiedad) return <Navigate to="/" />

  // Si hay sesión pero no tiene copropiedad → mostrar opciones de crear/unirse
  // (no redirigir a onboarding, lo mostramos aquí mismo)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await login(email, password)
    setSubmitting(false)
  }

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
    if (enviandoRef.current) return
    if (!nombre.trim()) return setErrorLocal('El nombre es obligatorio')
    const familiasValidas = familias.filter(f => f.trim())
    if (familiasValidas.length === 0) return setErrorLocal('Añade al menos una familia')

    enviandoRef.current = true
    setCreando(true)
    setErrorLocal(null)
    try {
      await crearCopropiedad(nombre.trim(), familiasValidas, sistemaTurnos)
    } catch (err) {
      setErrorLocal('Error al crear la copropiedad')
      enviandoRef.current = false
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

        {/* ── VISTA LOGIN (usuario no autenticado) ── */}
        {!user && vista === 'login' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Acceder</h2>
            <p className="text-sm text-gray-500 mb-5">Entra con tu cuenta de TurnStay</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>

              {errorAuth && <p className="text-red-600 text-sm">{errorAuth}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {submitting ? 'Accediendo...' : 'Acceder'}
              </button>
            </form>

            {/* Separador */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">¿Primera vez?</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setVista('crear')}
                className="w-full py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                Crear nueva copropiedad
              </button>
              <button
                onClick={() => setVista('unirse')}
                className="w-full py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                Unirme con código de invitación
              </button>
            </div>
          </div>
        )}

        {/* ── VISTA ONBOARDING (usuario autenticado sin copropiedad) ── */}
        {user && !tieneCopropiedad && vista === 'login' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Bienvenido</h2>
            <p className="text-sm text-gray-500 mb-6">
              Tu cuenta está lista. Crea una nueva copropiedad o únete a una existente.
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

        {/* ── CREAR COPROPIEDAD ── */}
        {vista === 'crear' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <button
              onClick={() => { setVista('login'); setErrorLocal(null) }}
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
                  disabled={creando}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sistema de turnos
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'calendario', label: '📅 Calendario libre', desc: 'Cada familia reserva los días que quiere' },
                    { value: 'rotacion', label: '🔄 Rotación fija', desc: 'Turnos por períodos automáticos' },
                  ].map(op => (
                    <div
                      key={op.value}
                      onClick={() => !creando && setSistemaTurnos(op.value as any)}
                      className={`p-3 rounded-lg border transition-colors ${
                        creando ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      } ${
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
                        disabled={creando}
                      />
                      {familias.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleEliminarFamilia(i)}
                          disabled={creando}
                          className="text-gray-400 hover:text-red-500 px-2 disabled:opacity-50"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAñadirFamilia}
                    disabled={creando}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                  >
                    + Añadir familia
                  </button>
                </div>
              </div>

              {(errorLocal || errorCop) && (
                <p className="text-red-600 text-sm">{errorLocal || errorCop}</p>
              )}

              <button
                type="submit"
                disabled={creando}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {creando ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Creando copropiedad...
                  </span>
                ) : 'Crear copropiedad'}
              </button>
            </form>
          </div>
        )}

        {/* ── UNIRSE ── */}
        {vista === 'unirse' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <button
              onClick={() => { setVista('login'); setErrorLocal(null) }}
              className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1"
            >
              ← Volver
            </button>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Unirse a una copropiedad</h2>
            <p className="text-sm text-gray-500 mb-4">
              Introduce el código que te ha compartido el administrador.
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

              {(errorLocal || errorCop) && (
                <p className="text-red-600 text-sm">{errorLocal || errorCop}</p>
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
