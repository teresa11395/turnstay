import { useTurnos } from '../hooks/useTurnos'
import { useOcupaciones } from '../hooks/useOcupaciones'
import LoadingSpinner from '../components/LoadingSpinner'

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

const colorFamilia = (familia: string) =>
  COLORES_FAMILIA[familia] ?? { bg: 'bg-gray-300', text: 'text-gray-800' }

export default function CalendarioPage() {
  const { turnosBaja, turnosAlta, año, setAño } = useTurnos()
  const { ocupaciones, loading } = useOcupaciones()

  const ocupacionesAño = ocupaciones.filter(o =>
    o.fechaEntrada.startsWith(String(año)) || o.fechaSalida.startsWith(String(año))
  )

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-4 md:p-6 max-w-2xl">

      {/* Header con navegación de año */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Calendario {año}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAño(año - 1)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600"
          >
            ←
          </button>
          <span className="text-sm font-medium text-gray-700 w-12 text-center">{año}</span>
          <button
            onClick={() => setAño(año + 1)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600"
          >
            →
          </button>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <p className="text-xs font-medium text-gray-500 mb-3">Familias</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(COLORES_FAMILIA).map(([familia, color]) => (
            <span
              key={familia}
              className={`${color.bg} ${color.text} text-xs font-medium px-3 py-1 rounded-full`}
            >
              {familia}
            </span>
          ))}
        </div>
      </div>

      {/* Temporada baja */}
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Temporada baja — mes completo
        </h2>
        <div className="space-y-2">
          {turnosBaja.map((turno) => {
            const color = colorFamilia(turno.familia)
            return (
              <div
                key={turno.periodo}
                className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between"
              >
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
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Temporada alta — quincenas
        </h2>
        <div className="space-y-2">
          {turnosAlta.map((turno) => {
            const color = colorFamilia(turno.familia)
            return (
              <div
                key={turno.periodo}
                className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between"
              >
                <span className="text-sm text-gray-600 w-48">{turno.periodo}</span>
                <span className={`${color.bg} ${color.text} text-sm font-medium px-3 py-1 rounded-full`}>
                  {turno.familia}
                </span>
              </div>
            )
          })}
        </div>
      </div>

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
              const color = colorFamilia(o.familia)
              return (
                <div
                  key={o.id}
                  className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-gray-700 font-medium">{o.familia}</p>
                    <p className="text-xs text-gray-400">
                      {o.fechaEntrada} → {o.fechaSalida} · {o.dias} días · {o.personas} personas
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">{o.coste}€</span>
                    <span className={`${color.bg} ${color.text} text-xs font-medium px-2 py-1 rounded-full`}>
                      {o.familia}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
