import { useState } from 'react'
import { useConfigContext } from '../context/ConfigContext'

export interface Turno {
  familia: string
  periodo: string
  tipo: 'mensual' | 'quincena'
  mes: number
  quincena?: 1 | 2
}

// Algoritmo clásico de Casa Playa — solo se usa si la copropiedad no tiene periodos definidos
const FAMILIAS_DEFAULT = ['Charo', 'JManuel', 'Carlos', 'Javier', 'Tito', 'MTere', 'Sonso', 'Marisa']

const TEMPORADA_BAJA = [
  { mes: 1, nombre: 'Enero' },
  { mes: 2, nombre: 'Febrero' },
  { mes: 3, nombre: 'Marzo' },
  { mes: 4, nombre: 'Abril' },
  { mes: 5, nombre: 'Mayo' },
  { mes: 10, nombre: 'Octubre' },
  { mes: 11, nombre: 'Noviembre' },
  { mes: 12, nombre: 'Diciembre' },
]

const TEMPORADA_ALTA = [
  { mes: 6, nombre: 'Junio', quincena: 1 },
  { mes: 6, nombre: 'Junio', quincena: 2 },
  { mes: 7, nombre: 'Julio', quincena: 1 },
  { mes: 7, nombre: 'Julio', quincena: 2 },
  { mes: 8, nombre: 'Agosto', quincena: 1 },
  { mes: 8, nombre: 'Agosto', quincena: 2 },
  { mes: 9, nombre: 'Septiembre', quincena: 1 },
  { mes: 9, nombre: 'Septiembre', quincena: 2 },
]

const AÑO_BASE = 2020

export function useTurnos() {
  const [año, setAño] = useState(new Date().getFullYear())
  const { config } = useConfigContext()

  const familias = config?.familias ?? FAMILIAS_DEFAULT
  const periodosConfig = config?.periodos

  const calcularRotacion = (indiceBase: number, totalFamilias: number) => {
    const rotacion = (año - AÑO_BASE) % totalFamilias
    return (indiceBase - rotacion + totalFamilias) % totalFamilias
  }

  // Si la copropiedad tiene períodos definidos en Firestore → sistema genérico
  if (periodosConfig && periodosConfig.length > 0) {
    const turnosGenericos: Turno[] = periodosConfig.map((periodo, index) => ({
      familia: familias[calcularRotacion(index, familias.length) % familias.length],
      periodo: periodo.nombre,
      tipo: 'mensual',  // genérico, no distingue mes/quincena
      mes: index + 1,
    }))

    const getTurnoFamilia = (familia: string) => ({
      baja: turnosGenericos.filter(t => t.familia === familia),
      alta: [],
    })

    return {
      turnosBaja: turnosGenericos,
      turnosAlta: [],
      año,
      setAño,
      getTurnoFamilia,
      familias,
    }
  }

  // Fallback → algoritmo clásico de Casa Playa (8 familias, temporada baja + alta)
  const turnosBaja: Turno[] = TEMPORADA_BAJA.map((periodo, index) => ({
    familia: familias[calcularRotacion(index, familias.length)],
    periodo: periodo.nombre,
    tipo: 'mensual',
    mes: periodo.mes,
  }))

  const turnosAlta: Turno[] = TEMPORADA_ALTA.map((periodo, index) => ({
    familia: familias[calcularRotacion(index, familias.length)],
    periodo: `${periodo.nombre} ${periodo.quincena}ª quincena`,
    tipo: 'quincena',
    mes: periodo.mes,
    quincena: periodo.quincena as 1 | 2,
  }))

  const getTurnoFamilia = (familia: string) => ({
    baja: turnosBaja.filter(t => t.familia === familia),
    alta: turnosAlta.filter(t => t.familia === familia),
  })

  return { turnosBaja, turnosAlta, año, setAño, getTurnoFamilia, familias }
}
