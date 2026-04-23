import { useState } from 'react'
import { useOcupaciones } from '../hooks/useOcupaciones'
import { useGastos } from '../hooks/useGastos'
import { useIncidencias } from '../hooks/useIncidencias'
import LoadingSpinner from '../components/LoadingSpinner'

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

export default function HistoricoPage() {
  const { ocupaciones, loading: loadingOc } = useOcupaciones()
  const { gastos, loading: loadingGa } = useGastos()
  const { incidencias, loading: loadingIn } = useIncidencias()

  const añoActual = new Date().getFullYear()
  const [año, setAño] = useState(añoActual)

  if (loadingOc || loadingGa || loadingIn) return <LoadingSpinner />

  // Filtrar por año
  const ocupacionesAño = ocupaciones.filter(o =>
    o.fechaEntrada.startsWith(String(año))
  )
  const gastosAño = gastos.filter(g => g.fecha.startsWith(String(año)))
  const incidenciasAño = incidencias.filter(i => i.fecha.startsWith(String(año)))

  // Cálculos
  const totalRecaudado = ocupacionesAño.reduce((sum, o) => sum + o.coste, 0)
  const totalGastado = gastosAño.reduce((sum, g) => sum + g.importe, 0)
  const balance = totalRecaudado - totalGastado

  const incidenciasResueltas = incidenciasAño.filter(i => i.estado === 'resuelta').length
  const incidenciasPendientes = incidenciasAño.filter(i => i.estado !== 'resuelta').length

  // Resumen por familia
  const resumenFamilias = ocupacionesAño.reduce((acc, o) => {
    if (!acc[o.familia]) acc[o.familia] = { dias: 0, coste: 0, visitas: 0 }
    acc[o.familia].dias += o.dias
    acc[o.familia].coste += o.coste
    acc[o.familia].visitas += 1
    return acc
  }, {} as Record<string, { dias: number; coste: number; visitas: number }>)

  return (
    <div className="p-4 md:p-6 max-w-2xl">

      {/* Header con navegación */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Histórico {año}</h1>
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

      {/* Balance resumen */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Recaudado</p>
          <p className="text-lg font-bold text-green-600">{totalRecaudado}€</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Gastado</p>
          <p className="text-lg font-bold text-red-500">{totalGastado}€</p>
        </div>
        <div className={`rounded-xl border p-3 text-center ${balance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className="text-xs text-gray-400 mb-1">Balance</p>
          <p className={`text-lg font-bold ${balance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
            {balance >= 0 ? '+' : ''}{balance}€
          </p>
        </div>
      </div>

      {/* Ocupaciones por familia */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Ocupaciones — {ocupacionesAño.length} registros
        </h2>
        {ocupacionesAño.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-2">Sin ocupaciones este año</p>
        ) : (
          <>
            {/* Resumen por familia */}
            {Object.keys(resumenFamilias).length > 0 && (
              <div className="space-y-2 mb-4">
                {Object.entries(resumenFamilias)
                  .sort((a, b) => b[1].dias - a[1].dias)
                  .map(([familia, datos]) => (
                    <div key={familia} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${chipColor(familia)}`}>
                          {familia}
                        </span>
                        <span className="text-xs text-gray-400">
                          {datos.visitas} visita{datos.visitas !== 1 ? 's' : ''} · {datos.dias} días
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{datos.coste}€</span>
                    </div>
                  ))}
              </div>
            )}

            {/* Detalle */}
            <div className="border-t border-gray-100 pt-3 space-y-2">
              {ocupacionesAño.map(o => (
                <div key={o.id} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="text-gray-700">{o.fechaEntrada} → {o.fechaSalida}</p>
                    <p className="text-xs text-gray-400">{o.personas} personas · {o.dias} días</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-700">{o.coste}€</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${chipColor(o.familia)}`}>
                      {o.familia}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Gastos */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Gastos — {gastosAño.length} registros
        </h2>
        {gastosAño.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-2">Sin gastos este año</p>
        ) : (
          <div className="space-y-2">
            {gastosAño.map(g => (
              <div key={g.id} className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">{g.concepto}</p>
                  <p className="text-xs text-gray-400">{g.fecha} · {g.familia}</p>
                </div>
                <p className="text-sm font-semibold text-red-500">-{g.importe}€</p>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 flex justify-between">
              <p className="text-sm font-medium text-gray-600">Total gastado</p>
              <p className="text-sm font-bold text-red-500">{totalGastado}€</p>
            </div>
          </div>
        )}
      </div>

      {/* Incidencias */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Incidencias — {incidenciasAño.length} registros
        </h2>
        {incidenciasAño.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-2">Sin incidencias este año</p>
        ) : (
          <>
            <div className="flex gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"/>
                <span className="text-sm text-gray-600">{incidenciasResueltas} resueltas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>
                <span className="text-sm text-gray-600">{incidenciasPendientes} pendientes</span>
              </div>
            </div>
            <div className="space-y-2">
              {incidenciasAño.map(i => (
                <div key={i.id} className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-700">{i.titulo}</p>
                    <p className="text-xs text-gray-400">{i.fecha} · {i.familia} · {i.urgencia}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    i.estado === 'resuelta'
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : i.estado === 'en progreso'
                      ? 'bg-blue-50 text-blue-600 border-blue-200'
                      : 'bg-amber-50 text-amber-600 border-amber-200'
                  }`}>
                    {i.estado}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  )
}
