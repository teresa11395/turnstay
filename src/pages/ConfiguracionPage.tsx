import { useState, useEffect } from 'react'
import { useConfigContext } from '../context/ConfigContext'
import { useCopropiedad } from '../context/CopropiedadContext'
import type { Periodo } from '../context/ConfigContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { useUsuarios } from '../hooks/useUsuarios'

export default function ConfiguracionPage() {
  const { config, loading, updateConfig } = useConfigContext()
  const { perfil, eliminarCopropiedad, esCreadoPor } = useCopropiedad()
  const esAdmin = perfil?.rol === 'admin'
  const { usuarios, cambiarRol } = useUsuarios()

  const [nombrePropiedad, setNombrePropiedad] = useState('')
  const [familias, setFamilias] = useState<string[]>([])
  const [tarifaDiaria, setTarifaDiaria] = useState(12)
  const [cuotaAnual, setCuotaAnual] = useState(0)
  const [sistemaTurnos, setSistemaTurnos] = useState<'rotacion' | 'calendario'>('rotacion')
  const [periodos, setPeriodos] = useState<Periodo[]>([])
  const [nuevaFamilia, setNuevaFamilia] = useState('')
  const [nuevoPeriodo, setNuevoPeriodo] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  // Borrado de copropiedad
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [textoConfirmacion, setTextoConfirmacion] = useState('')
  const [borrando, setBorrando] = useState(false)
  const [errorBorrado, setErrorBorrado] = useState<string | null>(null)

  const handleCopiarCodigo = () => {
    if (!config?.codigo) return
    navigator.clipboard.writeText(config.codigo)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  useEffect(() => {
    if (config) {
      setNombrePropiedad(config.nombrePropiedad)
      setFamilias([...config.familias])
      setTarifaDiaria(config.tarifaDiaria)
      setCuotaAnual(config.cuotaAnual)
      setSistemaTurnos(config.sistemaTurnos === 'calendario' ? 'calendario' : 'rotacion')
      setPeriodos(config.periodos ? [...config.periodos] : [])
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

  const handleAñadirPeriodo = () => {
    const nombre = nuevoPeriodo.trim()
    if (!nombre) return
    if (periodos.some(p => p.nombre === nombre)) {
      setError('Ese período ya existe')
      return
    }
    setPeriodos([...periodos, { nombre }])
    setNuevoPeriodo('')
    setError(null)
  }

  const handleEliminarPeriodo = (nombre: string) => {
    setPeriodos(periodos.filter(p => p.nombre !== nombre))
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
      sistemaTurnos,
      periodos: sistemaTurnos === 'rotacion' ? periodos : [],
    })

    setGuardando(false)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 2500)
  }

  const handleEliminarCopropiedad = async () => {
    if (textoConfirmacion !== nombrePropiedad) {
      setErrorBorrado('El nombre no coincide')
      return
    }

    setBorrando(true)
    setErrorBorrado(null)
    try {
      await eliminarCopropiedad()
    } catch (err: any) {
      setErrorBorrado(err.message || 'Error al eliminar la copropiedad')
      setBorrando(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configuración</h1>

      <div className="space-y-6">

        {/* Código de invitación — solo para admins */}
        {esAdmin && config?.codigo && (
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h2 className="text-base font-semibold text-blue-800 mb-1">Código de invitación</h2>
            <p className="text-xs text-blue-600 mb-3">
              Comparte este código con las familias que quieras invitar a la copropiedad.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold tracking-widest text-blue-900 bg-white px-4 py-2 rounded-lg border border-blue-200 font-mono">
                {config.codigo}
              </span>
              <button
                onClick={handleCopiarCodigo}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                {copiado ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        )}

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

        {/* Sistema de turnos */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-3">Sistema de turnos</h2>

          <div className="flex flex-col gap-3 mb-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="sistemaTurnos"
                value="rotacion"
                checked={sistemaTurnos === 'rotacion'}
                onChange={() => setSistemaTurnos('rotacion')}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">Rotación de turnos</p>
                <p className="text-xs text-gray-400">Los períodos se asignan automáticamente a cada familia y rotan cada año</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="sistemaTurnos"
                value="calendario"
                checked={sistemaTurnos === 'calendario'}
                onChange={() => setSistemaTurnos('calendario')}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">Calendario libre</p>
                <p className="text-xs text-gray-400">Cada familia reserva los días que quiere sin turnos asignados</p>
              </div>
            </label>
          </div>

          {sistemaTurnos === 'rotacion' && (
            <div className="border-t border-gray-100 pt-4 mt-2">
              <p className="text-sm font-medium text-gray-600 mb-3">Períodos de la copropiedad</p>

              {periodos.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {periodos.map((p, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                    >
                      {p.nombre}
                      <button
                        onClick={() => handleEliminarPeriodo(p.nombre)}
                        className="text-blue-400 hover:text-red-500 transition-colors leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={nuevoPeriodo}
                  onChange={(e) => setNuevoPeriodo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAñadirPeriodo()}
                  placeholder="Ej: Enero, Julio 1ª quincena, Semana Santa..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={handleAñadirPeriodo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Añadir
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {periodos.length} período{periodos.length !== 1 ? 's' : ''} · Se repartirán entre las {familias.length} familias en rotación anual
              </p>
            </div>
          )}
        </div>

        {/* Tarifas */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-3">Tarifas</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tarifa mínima por día (€)</label>
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
              <label className="block text-sm font-medium text-gray-600 mb-1">Cuota anual por familia (€)</label>
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

        {/* Gestión de usuarios — solo para admins */}
        {esAdmin && usuarios.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-700 mb-3">Usuarios registrados</h2>
            <div className="space-y-3">
              {usuarios.map(u => (
                <div key={u.uid} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{u.familia ?? u.email}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      u.rol === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.rol === 'admin' ? 'Administrador' : 'Copropietario'}
                    </span>
                    {u.uid !== perfil?.uid && (
                      <button
                        onClick={() => cambiarRol(u.uid, u.rol === 'admin' ? 'copropietario' : 'admin')}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {u.rol === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {/* Botón guardar */}
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {guardando ? 'Guardando...' : guardado ? '✓ Guardado' : 'Guardar configuración'}
        </button>

        {/* ── ZONA DE PELIGRO — solo el creador de la copropiedad ── */}
        {esCreadoPor && (
          <div className="bg-red-50 rounded-xl border border-red-200 p-5 mt-4">
            <h2 className="text-base font-semibold text-red-700 mb-1">Zona de peligro</h2>
            <p className="text-xs text-red-500 mb-4">
              Estas acciones son irreversibles. Procede con precaución.
            </p>

            {!mostrarConfirmacion ? (
              <button
                onClick={() => setMostrarConfirmacion(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Eliminar copropiedad
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-red-700">
                  Esta acción eliminará <strong>todos los datos</strong> de la copropiedad (ocupaciones, gastos, incidencias, cesiones) y desvinculará a todos los usuarios. Esta acción <strong>no se puede deshacer</strong>.
                </p>
                <p className="text-sm text-red-700">
                  Para confirmar, escribe el nombre de la copropiedad: <strong>{nombrePropiedad}</strong>
                </p>
                <input
                  type="text"
                  value={textoConfirmacion}
                  onChange={e => { setTextoConfirmacion(e.target.value); setErrorBorrado(null) }}
                  placeholder={`Escribe "${nombrePropiedad}" para confirmar`}
                  className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  disabled={borrando}
                />
                {errorBorrado && <p className="text-red-600 text-sm">{errorBorrado}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={() => { setMostrarConfirmacion(false); setTextoConfirmacion(''); setErrorBorrado(null) }}
                    disabled={borrando}
                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleEliminarCopropiedad}
                    disabled={borrando || textoConfirmacion !== nombrePropiedad}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {borrando ? 'Eliminando...' : 'Eliminar definitivamente'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
