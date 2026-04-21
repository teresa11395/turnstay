import { useState } from 'react'

export interface Turno {
  familia: string
  periodo: string
  tipo: 'mensual' | 'quincena'
  mes: number
  quincena?: 1 | 2
}

const FAMILIAS = ['Charo', 'JManuel', 'Carlos', 'Javier', 'Tito', 'MTere', 'Sonso', 'Marisa']

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

  const calcularRotacion = (indiceBase: number, año: number) => {
    const rotacion = (año - AÑO_BASE) % FAMILIAS.length
    return (indiceBase + rotacion) % FAMILIAS.length
  }

  const turnosBaja: Turno[] = TEMPORADA_BAJA.map((periodo, index) => ({
    familia: FAMILIAS[calcularRotacion(index, año)],
    periodo: periodo.nombre,
    tipo: 'mensual',
    mes: periodo.mes,
  }))

  const turnosAlta: Turno[] = TEMPORADA_ALTA.map((periodo, index) => ({
    familia: FAMILIAS[calcularRotacion(index, año)],
    periodo: `${periodo.nombre} ${periodo.quincena}ª quincena`,
    tipo: 'quincena',
    mes: periodo.mes,
    quincena: periodo.quincena as 1 | 2,
  }))

  const getTurnoFamilia = (familia: string) => {
    const baja = turnosBaja.filter(t => t.familia === familia)
    const alta = turnosAlta.filter(t => t.familia === familia)
    return { baja, alta }
  }

  return { turnosBaja, turnosAlta, año, setAño, getTurnoFamilia, familias: FAMILIAS }
}