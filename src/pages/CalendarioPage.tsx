import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTurnos } from '../hooks/useTurnos'
import { useOcupaciones } from '../hooks/useOcupaciones'
import { useConfigContext } from '../context/ConfigContext'
import LoadingSpinner from '../components/LoadingSpinner'

// Colores para el sistema de rotación (familias fijas de Casa Playa)
const COLORES_FAMILIA: Record<string, { bg: string; text: string }> = {
  Charo:   { bg: 'bg-orange-400',  text: 'text-orange-900' },
  JManuel: { bg: 'bg-blue-600',    text: 'text-blue-50' },
  Carlos:  { bg: 'bg-emerald-500', text: 'text-emerald-950' },
  Javier:  { bg: 'bg-cyan-500',    text: 'text-cyan-950' },
  Tito:    { bg: 'bg-amber-500',   text: 'text-amber-950' },
  MTere:   { bg: 'bg-rose-400',    text: 'text-rose-950' },
  Sonso:   { bg: 'bg-purple-400',  text: 'text-purple-950' },
  Marisa:  { bg: 'bg-teal-500',    text: 'text-teal-950' },
}

const COLOR_FALLBACKS = [
  { bg: 'bg-orange-400', text: 'text-white' },
  { bg: 'bg-blue-500',   text: 'text-white' },
  { bg: 'bg-emerald-500',text: 'text-white' },
  { bg: 'bg-purple-500', text: 'text-white' },
  { bg: 'bg-rose-400',   text: 'text-white' },
  { bg: 'bg-amber-500',  text: 'text-white' },
  { bg: 'bg-cyan-500',   text: 'text-white' },
  { bg: 'bg-teal-500',   text: 'text-white' },
]

const colorFamilia = (familia: string, familias: string[]) => {
  if (COLORES_FAMILIA[familia]) return COLORES_FAMILIA[familia]
  const idx = familias.indexOf(familia)
  return COLOR_FALLBACKS[idx % COLOR_FALLBACKS.length]
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

// Genera todos los días de un mes
function getDiasMes(año: number, mes: number) {
  const diasEnMes = new Date(año, mes + 1, 0).getDate()
  const primerDia = new Date(año, mes, 1).getDay()
  // Ajustar para que la semana empiece en lunes (0=lunes)
  const offset = primerDia === 0 ? 6 : primerDia - 1
  return { diasEnMes, offset }
}

// Comprueba si una fecha está dentro de un rango de ocupación
function estaOcupado(fecha: string, ocupaciones: { fechaEntrada: string; fechaSalida: string; familia: string }[]) {
  return ocupaciones.find(o => fecha >= o.fechaEntrada && fecha <= o.fechaSalida)
}

export default function CalendarioPage() {
  const navigate = useNavigate()
  const { config, loading: loadingConfig } = useConfigContext()
  const { turnosBaja, turnosAlta, año, setAño } = useTurnos()
  const { ocupaciones, loading: loadingOcupaciones } = useOcupaciones()

  const [mesVisible, setMesVisible] = useState(new Date().getMonth())

  if (loadingConfig || loadingOcupaciones) return <LoadingSpinner />

  const sistemaTurnos = config?.sistemaTurnos ?? 'rotacion'
  const familias = config?.familias ?? []

  // ── VISTA ROTACIÓN ──────────────────────────────────────────────
  if (sistemaTurnos === 'rotacion' || sistemaTurnos === 'mixto') {
    const ocupacionesAño = ocupaciones.filter(o =>
      o.fechaEntrada.startsWith(String(año)) || o.fechaSalida.startsWith(String(año))
    )

    return (
      <div className="p-4 md:p-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Calendario {año}</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setAño(año - 1)} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600">←</button>
            <span className="text-sm font-medium text-gray-700 w-12 text-center">{año}</span>
            <button onClick={() => setAño(año + 1)} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600">→</button>
          </div>
        </div>

        {/* Leyenda */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
          <p className="text-xs font-medium text-gray-500 mb-3">Familias</p>
          <div className="flex flex-wrap gap-2">
            {familias.map(familia => {
              const color = colorFamilia(familia, familias)
              return (
                <span key={familia} className={`${color.bg} ${color.text} text-xs font-medium px-3 py-1 rounded-full`}>
                  {familia}
                </span>
              )
            })}
          </div>
        </div>

        {/* Temporada baja */}
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Temporada baja — mes completo
          </h2>
          <div className="space-y-2">
            {turnosBaja.map((turno) => {
              const color = colorFamilia(turno.familia, familias)
              return (
                <div key={turno.periodo} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-28">{turno.periodo}</span>
                  <span className={`${color.bg} ${color.text} text-sm font-medium px-3 py-1 rounded-full`}>
                    {turno.familia}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Temporada alta */}
        {turnosAlta.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Temporada alta — quincenas
            </h2>
            <div className="space-y-2">
              {turnosAlta.map((turno) => {
                const color = colorFamilia(turno.familia, familias)
                return (
                  <div key={turno.periodo} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between">
                    <span className="text-sm text-gray-600 w-48">{turno.periodo}</span>
                    <span className={`${color.bg} ${color.text} text-sm font-medium px-3 py-1 rounded-full`}>
                      {turno.familia}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Ocupaciones reales */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Ocupaciones registradas en {año}
          </h2>
          {ocupacionesAño.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-sm text-gray-400 text-center">
              Sin ocupaciones registradas este año
            </div>
          ) : (
            <div className="space-y-2">
              {ocupacionesAño.map((o) => {
                const color = colorFamilia(o.familia, familias)
                return (
                  <div key={o.id} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700 font-medium">{o.familia}</p>
                      <p className="text-xs text-gray-400">{o.fechaEntrada} → {o.fechaSalida} · {o.dias} días · {o.personas} personas</p>
                    </div>
                    <span className={`${color.bg} ${color.text} text-xs font-medium px-2 py-1 rounded-full`}>
                      {o.coste}€
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── VISTA CALENDARIO LIBRE ──────────────────────────────────────
  const { diasEnMes, offset } = getDiasMes(año, mesVisible)
  const totalCeldas = Math.ceil((diasEnMes + offset) / 7) * 7

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Calendario</h1>
        <button
          onClick={() => navigate('/ocupaciones')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + Reservar días
        </button>
      </div>

      {/* Navegación mes/año */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            if (mesVisible === 0) { setMesVisible(11); setAño(año - 1) }
            else setMesVisible(mesVisible - 1)
          }}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600"
        >
          ←
        </button>
        <h2 className="text-base font-semibold text-gray-800">
          {MESES[mesVisible]} {año}
        </h2>
        <button
          onClick={() => {
            if (mesVisible === 11) { setMesVisible(0); setAño(año + 1) }
            else setMesVisible(mesVisible + 1)
          }}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600"
        >
          →
        </button>
      </div>

      {/* Leyenda familias */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {familias.map(familia => {
            const color = colorFamilia(familia, familias)
            return (
              <span key={familia} className={`${color.bg} ${color.text} text-xs font-medium px-2 py-1 rounded-full`}>
                {familia}
              </span>
            )
          })}
          <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2 py-1 rounded-full">Libre</span>
        </div>
      </div>

      {/* Grid calendario */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {/* Cabecera días semana */}
        <div className="grid grid-cols-7 mb-2">
          {DIAS_SEMANA.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Días */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: totalCeldas }).map((_, i) => {
            const dia = i - offset + 1
            if (dia < 1 || dia > diasEnMes) {
              return <div key={i} />
            }

            const mes = String(mesVisible + 1).padStart(2, '0')
            const diaStr = String(dia).padStart(2, '0')
            const fecha = `${año}-${mes}-${diaStr}`
            const ocupacion = estaOcupado(fecha, ocupaciones)
            const hoy = new Date().toISOString().split('T')[0]
            const esHoy = fecha === hoy
            const color = ocupacion ? colorFamilia(ocupacion.familia, familias) : null

            return (
              <div
                key={i}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium
                  ${esHoy ? 'ring-2 ring-blue-500' : ''}
                  ${color ? `${color.bg} ${color.text}` : 'bg-gray-50 text-gray-600'}
                `}
                title={ocupacion ? `${ocupacion.familia}: ${ocupacion.fechaEntrada} → ${ocupacion.fechaSalida}` : 'Libre'}
              >
                <span>{dia}</span>
                {ocupacion && (
                  <span className="text-[9px] opacity-80 leading-none mt-0.5 truncate w-full text-center px-0.5">
                    {ocupacion.familia.slice(0, 4)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Ocupaciones del mes */}
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Reservas de {MESES[mesVisible]}
        </h3>
        {ocupaciones.filter(o => {
          const mes = String(mesVisible + 1).padStart(2, '0')
          return o.fechaEntrada.startsWith(`${año}-${mes}`) || o.fechaSalida.startsWith(`${año}-${mes}`)
        }).length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-sm text-gray-400 text-center">
            Sin reservas este mes —{' '}
            <button onClick={() => navigate('/ocupaciones')} className="text-blue-600 hover:underline">
              reservar días
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {ocupaciones
              .filter(o => {
                const mes = String(mesVisible + 1).padStart(2, '0')
                return o.fechaEntrada.startsWith(`${año}-${mes}`) || o.fechaSalida.startsWith(`${año}-${mes}`)
              })
              .map(o => {
                const color = colorFamilia(o.familia, familias)
                return (
                  <div key={o.id} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{o.familia}</p>
                      <p className="text-xs text-gray-400">{o.fechaEntrada} → {o.fechaSalida} · {o.dias} días</p>
                    </div>
                    <span className={`${color.bg} ${color.text} text-xs font-medium px-2 py-1 rounded-full`}>
                      {o.coste}€
                    </span>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
