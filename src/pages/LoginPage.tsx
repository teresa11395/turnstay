import { useState, useRef, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { useCopropiedad } from '../context/CopropiedadContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../api/firebase'

type Vista = 'login' | 'crear' | 'registrarse' | 'unirse'

const FAMILIAS_EJEMPLO = ['Familia 1', 'Familia 2']

export default function LoginPage() {
  const { user, loading: loadingAuth, error: errorAuth, login, logout } = useAuthContext()
  const { tieneCopropiedad, loading: loadingCop, crearCopropiedad, unirseACopropiedad, buscarFamiliasPorCodigo } = useCopropiedad()

  const [vista, setVista] = useState<Vista>('login')
  const [errorLocal, setErrorLocal] = useState<string | null>(null)

  // Login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Registrarse (nuevo usuario sin cuenta)
  const [emailReg, setEmailReg] = useState('')
  const [passwordReg, setPasswordReg] = useState('')
  const [passwordRegConfirm, setPasswordRegConfirm] = useState('')
  const [registrando, setRegistrando] = useState(false)

  // Crear copropiedad
  const [nombre, setNombre] = useState('')
  const [familias, setFamilias] = useState<string[]>([''])
  const [sistemaTurnos, setSistemaTurnos] = useState<'rotacion' | 'calendario' | 'mixto'>('calendario')
  const [emailCrear, setEmailCrear] = useState('')
  const [passwordCrear, setPasswordCrear] = useState('')
  const [passwordCrearConfirm, setPasswordCrearConfirm] = useState('')
  const [creando, setCreando] = useState(false)
  const enviandoRef = useRef(false)

  // Unirse con código — flujo en dos pasos
  const [codigo, setCodigo] = useState('')
  const [familiasDisponibles, setFamiliasDisponibles] = useState<string[]>([])
  const [familia, setFamilia] = useState('')
  const [buscandoCodigo, setBuscandoCodigo] = useState(false)
  const [codigoVerificado, setCodigoVerificado] = useState(false)
  const [uniendose, setUniendose] = useState(false)

  // Solo resetear a 'login' si la vista actual es 'login'
  useEffect(() => {
    if (user && !tieneCopropiedad && vista === 'login') {
      setVista('login')
    }
  }, [user, tieneCopropiedad])

  if (loadingAuth || loadingCop) return <LoadingSpinner />
  if (user && tieneCopropiedad) return <Navigate to="/" />

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await login(email, password)
    setSubmitting(false)
  }

  const handleRegistrarse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailReg.trim()) return setErrorLocal('El email es obligatorio')
    if (passwordReg.length < 6) return setErrorLocal('La contraseña debe tener al menos 6 caracteres')
    if (passwordReg !== passwordRegConfirm) return setErrorLocal('Las contraseñas no coinciden')

    setRegistrando(true)
    setErrorLocal(null)
    try {
      await createUserWithEmailAndPassword(auth, emailReg.trim(), passwordReg)
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setErrorLocal('Ese email ya está registrado')
      } else if (err.code === 'auth/invalid-email') {
        setErrorLocal('El email no es válido')
      } else {
        setErrorLocal('Error al crear la cuenta. Inténtalo de nuevo.')
      }
    } finally {
      setRegistrando(false)
    }
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

    if (!user) {
      if (!emailCrear.trim()) return setErrorLocal('El email es obligatorio')
      if (passwordCrear.length < 6) return setErrorLocal('La contraseña debe tener al menos 6 caracteres')
      if (passwordCrear !== passwordCrearConfirm) return setErrorLocal('Las contraseñas no coinciden')
    }

    enviandoRef.current = true
    setCreando(true)
    setErrorLocal(null)
    try {
      if (!user) {
        await createUserWithEmailAndPassword(auth, emailCrear.trim(), passwordCrear)
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      await crearCopropiedad(nombre.trim(), familiasValidas, sistemaTurnos)
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setErrorLocal('Ese email ya está registrado')
      } else if (err.code === 'auth/invalid-email') {
        setErrorLocal('El email no es válido')
      } else {
        setErrorLocal('Error al crear la copropiedad')
      }
      enviandoRef.current = false
      setCreando(false)
    }
  }

  // Paso 1: verificar código y cargar familias disponibles
  const handleBuscarCodigo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codigo.trim()) return setErrorLocal('El código es obligatorio')

    setBuscandoCodigo(true)
    setErrorLocal(null)
    try {
      const familiasList = await buscarFamiliasPorCodigo(codigo.trim())
      if (familiasList.length === 0) {
        setErrorLocal('Esta copropiedad no tiene familias configuradas')
        return
      }
      setFamiliasDisponibles(familiasList)
      setFamilia(familiasList[0])
      setCodigoVerificado(true)
    } catch (err: any) {
      setErrorLocal('Código de invitación no válido')
    } finally {
      setBuscandoCodigo(false)
    }
  }

  // Paso 2: unirse con la familia seleccionada
  const handleUnirse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!familia.trim()) return setErrorLocal('Selecciona tu familia')

    setUniendose(true)
    setErrorLocal(null)
    try {
      await unirseACopropiedad(codigo.trim(), familia.trim())
    } catch (err: any) {
      setErrorLocal(err.message === 'Código no válido' ? 'Código de invitación no válido' : 'Error al unirse. Inténtalo de nuevo.')
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

        {/* ── VISTA LOGIN ── */}
        {!user && vista === 'login' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Acceder</h2>
            <p className="text-sm text-gray-500 mb-5">Entra con tu cuenta de TurnStay</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>

              {(errorAuth || errorLocal) && (
                <p className="text-red-600 text-sm">{errorAuth || errorLocal}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {submitting ? 'Accediendo...' : 'Acceder'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-3">¿Primera vez?</p>
              <div className="space-y-2">
                <button
                  onClick={() => { setVista('crear'); setErrorLocal(null) }}
                  className="w-full py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Crear nueva copropiedad
                </button>
                <button
                  onClick={() => { setVista('registrarse'); setErrorLocal(null) }}
                  className="w-full py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Tengo código de invitación
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── BIENVENIDO (autenticado sin copropiedad) ── */}
        {user && !tieneCopropiedad && vista === 'login' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Bienvenido</h2>
              <button
                onClick={logout}
                className="text-sm text-red-500 hover:text-red-600 border border-red-200 px-3 py-1 rounded-lg"
              >
                Cerrar sesión
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-1">{user.email}</p>
            <p className="text-sm text-gray-500 mb-6">
              Tu cuenta está lista. Crea una nueva copropiedad o únete con tu código de invitación.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { setVista('crear'); setErrorLocal(null) }}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Crear nueva copropiedad
              </button>
              <button
                onClick={() => { setVista('unirse'); setErrorLocal(null) }}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Tengo código de invitación
              </button>
            </div>
          </div>
        )}

        {/* ── REGISTRARSE (nuevo usuario con código) ── */}
        {!user && vista === 'registrarse' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <button
              onClick={() => { setVista('login'); setErrorLocal(null) }}
              className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1"
            >
              ← Volver
            </button>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Crear cuenta</h2>
            <form onSubmit={handleRegistrarse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={emailReg}
                  onChange={e => setEmailReg(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  disabled={registrando}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={passwordReg}
                  onChange={e => setPasswordReg(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  disabled={registrando}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                <input
                  type="password"
                  value={passwordRegConfirm}
                  onChange={e => setPasswordRegConfirm(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  disabled={registrando}
                />
              </div>
              {errorLocal && <p className="text-red-600 text-sm">{errorLocal}</p>}
              <button
                type="submit"
                disabled={registrando}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {registrando ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la propiedad</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Sistema de turnos</label>
                <div className="space-y-2">
                  {[
                    { value: 'calendario', label: '📅 Calendario libre', desc: 'Cada familia reserva los días que quiere' },
                    { value: 'rotacion', label: '🔄 Rotación fija', desc: 'Turnos por periodos automáticos' },
                    { value: 'mixto', label: '⚖️ Mixto', desc: 'Rotación base + reservas libres' },
                  ].map(op => (
                    <div
                      key={op.value}
                      onClick={() => !creando && setSistemaTurnos(op.value as any)}
                      className={`p-3 rounded-lg border transition-colors ${
                        creando ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      } ${
                        sistemaTurnos === op.value ? 'bg-blue-50 border-blue-300' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-800">{op.label}</p>
                      <p className="text-xs text-gray-500">{op.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Familias copropietarias</label>
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

              {!user && (
                <>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400">Tu cuenta de administrador</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={emailCrear}
                      onChange={e => setEmailCrear(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      disabled={creando}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input
                      type="password"
                      value={passwordCrear}
                      onChange={e => setPasswordCrear(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      disabled={creando}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                    <input
                      type="password"
                      value={passwordCrearConfirm}
                      onChange={e => setPasswordCrearConfirm(e.target.value)}
                      placeholder="Repite la contraseña"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      disabled={creando}
                    />
                  </div>
                </>
              )}

              {errorLocal && <p className="text-red-600 text-sm">{errorLocal}</p>}

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

        {/* ── UNIRSE CON CÓDIGO ── */}
        {vista === 'unirse' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <button
              onClick={() => {
                setVista('login')
                setErrorLocal(null)
                setCodigo('')
                setFamilia('')
                setFamiliasDisponibles([])
                setCodigoVerificado(false)
              }}
              className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1"
            >
              ← Volver
            </button>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Unirse a una copropiedad</h2>
            <p className="text-sm text-gray-500 mb-4">
              Introduce el código que te ha compartido el administrador.
            </p>

            {/* Paso 1: introducir código */}
            {!codigoVerificado && (
              <form onSubmit={handleBuscarCodigo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código de invitación</label>
                  <input
                    type="text"
                    value={codigo}
                    onChange={e => { setCodigo(e.target.value.toUpperCase()); setErrorLocal(null) }}
                    placeholder="Ej: ABC123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono tracking-widest"
                    maxLength={6}
                    disabled={buscandoCodigo}
                  />
                </div>

                {errorLocal && <p className="text-red-600 text-sm">{errorLocal}</p>}

                <button
                  type="submit"
                  disabled={buscandoCodigo}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {buscandoCodigo ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Buscando...
                    </span>
                  ) : 'Buscar copropiedad'}
                </button>
              </form>
            )}

            {/* Paso 2: seleccionar familia y unirse */}
            {codigoVerificado && (
              <form onSubmit={handleUnirse} className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <svg className="h-4 w-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-green-700 font-medium">Código válido — selecciona tu familia</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tu familia</label>
                  <select
                    value={familia}
                    onChange={e => setFamilia(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                    disabled={uniendose}
                  >
                    {familiasDisponibles.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                {errorLocal && <p className="text-red-600 text-sm">{errorLocal}</p>}

                <button
                  type="submit"
                  disabled={uniendose}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {uniendose ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Uniéndome...
                    </span>
                  ) : 'Unirme a la copropiedad'}
                </button>

                <button
                  type="button"
                  onClick={() => { setCodigoVerificado(false); setCodigo(''); setFamiliasDisponibles([]); setErrorLocal(null) }}
                  className="w-full py-2 text-sm text-gray-400 hover:text-gray-600"
                >
                  Cambiar código
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
