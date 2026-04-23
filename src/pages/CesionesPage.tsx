import { useState } from 'react'
import { useCesiones } from '../hooks/useCesiones'
import { useConfigContext } from '../context/ConfigContext'
import { useTurnos } from '../hooks/useTurnos'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const COLORES_FAMILIA: Record<string, string> = {
  Charo:   'bg-orange-400 text-orange-900',
  JManuel: 'bg-blue-600 text-blue-50',
  Carlos:  'bg-emerald-500 text-emerald-950',
  Javier:  'bg-cyan-500 text-cyan-950',
  Tito:    'bg-amber-500 text-amber-950',
  MTere:   'bg-rose-400 text-rose-950',
  Sonso:   'bg-purple-400 text-purple-950',
  Marisa:  'bg-teal-500 text-teal-950',
}

const chipColor = (familia: string) =>
  COLORES_FAMILIA[familia] ?? 'bg-gray-300 text-gray-800'

const ESTADO_LABELS: Record<string, string> = {
  pendiente: '🕐 Pendiente',
  aceptada: '✅ Aceptada',
  rechazada: '❌ Rechazada',
}

const ESTADO_COLORS: Record<string, string> = {
  pendiente: 'text-amber-600 bg-amber-50 border-amber-200',
  aceptada: 'text-green-600 bg-green-50 border-green-200',
  rechazada: 'text-red-500 bg-red-50 border-red-200',
}

export default function CesionesPage() {
  const { cesiones, loading, error, addCesion, updateCesion, refetch } = useCesiones()
  const { config } = useConfigContext()
  const { turnosBaja, turnosAlta, año } = useTurnos()

  const [showForm, setShowForm] = useState(false)
  const [familiaSolicita, setFamiliaSolicita] = useState('')
  const [familiaCede, setFamiliaCede] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Calcular quién tiene el turno en una fecha dada
  const getTurnoFecha = (fecha: string): string | null => {
    if (!fecha) return null
    const d = new Date(fecha)
    const mes = d.getMonth() + 1
    const dia = d.getDate()

    // Temporada baja — mes completo
    const turnoBaja = turnosBaja.find(t => t.mes === mes)
    if (turnoBaja) return turnoBaja.familia

    // Temporada alta — quincenas
    const turnoAlta = turnosAlta.find(t => {
      if (t.mes !== mes) return false
      if (t.quincena === 1) return dia <= 15
      return dia > 15
    })
    return turnoAlta?.familia ?? null
  }

  const handleFechaInicioChange = (fecha: string) => {
    setFechaInicio(fecha)
    const familia = getTurnoFecha(fecha)
    if (familia) setFamiliaCede(familia)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!familiaSolicita) return setFormError('Selecciona la familia que solicita')
    if (!familiaCede) return setFormError('Selecciona la familia que cede')
    if (!fechaInicio || !fechaFin) return setFormError('Las fechas son obligatorias')
    if (fechaInicio > fechaFin) return setFormError('La fecha de inicio debe ser anterior a la de fin')
    if (familiaSolicita === familiaCede) return setFormError('No puedes cederte días a ti mismo')

    setSubmitting(true)
    setFormError(null)

    await addCesion({
      familiaSolicita,
      familiaCede,
      fechaInicio,
      fechaFin,
      mensaje: mensaje.trim(),
      estado: 'pendiente',
      fecha: new Date().toISOString().split('T')[0],
    })

    setSuccess(true)
    setSubmitting(false)
    setTimeout(() => {
      setShowForm(false)
      setSuccess(false)
      setFamiliaSolicita('')
      setFamiliaCede('')
      setFechaInicio('')
      setFechaFin('')
      setMensaje('')
    }, 1500)
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} onRetry={refetch} />

  const pendientes = cesiones.filter(c => c.estado === 'pendiente')
  const historial = cesiones.filter(c => c.estado !== 'pendiente')

  return (
    <div className="p-4 md:p-6 max-w-2xl">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cesiones de turnos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
        >
          + Solicitar
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Nueva solicitud de cesión</h2>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm">
              ✓ Solicitud enviada correctamente
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Familia que solicita
                </label>
                <select
                  value={familiaSolicita}
                  onChange={e => setFamiliaSolicita(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value="">Selecciona</option>
                  {config?.familias.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Familia que cede
                </label>
                <select
                  value={familiaCede}
                  onChange={e => setFamiliaCede(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value="">Selecciona</option>
                  {config?.familias.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha inicio
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={e => handleFechaInicioChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha fin
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={e => setFechaFin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
            </div>

            {/* Autodetección de familia que cede */}
            {fechaInicio && familiaCede && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                Según el calendario {año}, esas fechas corresponden a{' '}
                <span className="font-semibold">{familiaCede}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje (opcional)
              </label>
              <textarea
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                rows={2}
                placeholder="Ej: Queremos ir esa semana, ¿te va bien?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {formError && <p className="text-red-600 text-sm">{formError}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
              >
                {submitting ? 'Enviando...' : 'Enviar solicitud'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Solicitudes pendientes */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Pendientes de respuesta ({pendientes.length})
        </h2>
        {pendientes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-sm text-gray-400 text-center">
            No hay solicitudes pendientes
          </div>
        ) : (
          <div className="space-y-3">
            {pendientes.map(c => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${chipColor(c.familiaSolicita)}`}>
                    {c.familiaSolicita}
                  </span>
                  <span className="text-xs text-gray-400">solicita a</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${chipColor(c.familiaCede)}`}>
                    {c.familiaCede}
                  </span>
                </div>
                <p className="text-sm text-gray-700 font-medium mb-1">
                  {c.fechaInicio} → {c.fechaFin}
                </p>
                {c.mensaje && (
                  <p className="text-sm text-gray-500 mb-3 italic">"{c.mensaje}"</p>
                )}
                <p className="text-xs text-gray-400 mb-3">Solicitado el {c.fecha}</p>

                {/* Botones de respuesta — solo para la familia que cede */}
                <div className="flex gap-2">
                  <button
                    onClick={() => c.id && updateCesion(c.id, { estado: 'aceptada' })}
                    className="flex-1 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                  >
                    ✓ Aceptar
                  </button>
                  <button
                    onClick={() => c.id && updateCesion(c.id, { estado: 'rechazada' })}
                    className="flex-1 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                  >
                    ✗ Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Historial
        </h2>
        {historial.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-sm text-gray-400 text-center">
            Sin historial todavía
          </div>
        ) : (
          <div className="space-y-2">
            {historial.map(c => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${chipColor(c.familiaSolicita)}`}>
                      {c.familiaSolicita}
                    </span>
                    <span className="text-xs text-gray-400">→</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${chipColor(c.familiaCede)}`}>
                      {c.familiaCede}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${ESTADO_COLORS[c.estado]}`}>
                    {ESTADO_LABELS[c.estado]}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{c.fechaInicio} → {c.fechaFin}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
