import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { db } from '../api/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useCopropiedad } from './CopropiedadContext'

export interface Periodo {
  nombre: string  // ej: "Enero", "Julio 1ª quincena", "Semana Santa"
}

export interface Config {
  nombrePropiedad: string
  familias: string[]
  tarifaDiaria: number
  cuotaAnual: number
  sistemaTurnos?: 'rotacion' | 'calendario' | 'mixto'
  periodos?: Periodo[]  // solo para copropiedades con sistemaTurnos === 'rotacion'
}

interface ConfigContextType {
  config: Config | null
  loading: boolean
  error: string | null
  updateConfig: (config: Config) => Promise<void>
}

const defaultConfig: Config = {
  nombrePropiedad: 'TurnStay',
  familias: ['Charo', 'JManuel', 'Carlos', 'Javier', 'Tito', 'MTere', 'Sonso', 'Marisa'],
  tarifaDiaria: 0,
  cuotaAnual: 0,
  sistemaTurnos: 'rotacion',
  // sin periodos → useTurnos usará el algoritmo clásico de Casa Playa
}

const ConfigContext = createContext<ConfigContextType | null>(null)

export function ConfigProvider({ children }: { children: ReactNode }) {
  // FIX: también leemos loading de CopropiedadContext para saber cuándo está listo el perfil
  const { perfil, loading: loadingPerfil } = useCopropiedad()
  const copropiedadId = perfil?.copropiedadId
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // FIX: esperar a que CopropiedadContext haya terminado de cargar el perfil
    // Si no esperamos, copropiedadId puede ser null aunque el usuario sí tenga copropiedad
    if (loadingPerfil) return

    if (!copropiedadId) {
      setConfig(defaultConfig)
      setLoading(false)
      return
    }

    const fetchConfig = async () => {
      try {
        setLoading(true)
        setError(null)
        const docRef = doc(db, 'copropiedades', copropiedadId, 'config', 'general')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setConfig(docSnap.data() as Config)
        } else {
          setConfig(defaultConfig)
        }
      } catch (err) {
        setError('Error al cargar la configuración')
        setConfig(defaultConfig)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [copropiedadId, loadingPerfil]) // FIX: loadingPerfil como dependencia

  const updateConfig = async (newConfig: Config) => {
    if (!copropiedadId) return
    try {
      setError(null)
      await setDoc(doc(db, 'copropiedades', copropiedadId, 'config', 'general'), newConfig)
      setConfig(newConfig)
    } catch (err) {
      setError('Error al guardar la configuración')
    }
  }

  return (
    <ConfigContext.Provider value={{ config, loading, error, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfigContext() {
  const context = useContext(ConfigContext)
  if (!context) {
    throw new Error('useConfigContext debe usarse dentro de ConfigProvider')
  }
  return context
}
