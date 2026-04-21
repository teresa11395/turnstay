import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { db } from '../api/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

interface Config {
  nombrePropiedad: string
  familias: string[]
  tarifaDiaria: number
  cuotaAnual: number
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
  tarifaDiaria: 12,
  cuotaAnual: 0,
}

const ConfigContext = createContext<ConfigContextType | null>(null)

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'config', 'general')
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
  }, [])

  const updateConfig = async (newConfig: Config) => {
    try {
      setError(null)
      await setDoc(doc(db, 'config', 'general'), newConfig)
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