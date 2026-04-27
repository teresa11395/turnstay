import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { db } from '../api/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useAuthContext } from './AuthContext'

export interface PerfilUsuario {
  uid: string
  email: string
  copropiedadId: string | null
  familia: string | null
  rol: 'admin' | 'copropietario'
}

interface CopropiedadContextType {
  perfil: PerfilUsuario | null
  loading: boolean
  error: string | null
  tieneCopropiedad: boolean
  crearCopropiedad: (nombre: string, familias: string[], sistemaTurnos: 'rotacion' | 'calendario' | 'mixto') => Promise<string>
  unirseACopropiedad: (codigo: string, familia: string) => Promise<void>
}

const CopropiedadContext = createContext<CopropiedadContextType | null>(null)

export function CopropiedadProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext()
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setPerfil(null)
      setLoading(false)
      return
    }

    const cargarPerfil = async () => {
      try {
        setLoading(true)
        setError(null)
        const docRef = doc(db, 'usuarios', user.uid)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setPerfil(docSnap.data() as PerfilUsuario)
        } else {
          // Usuario nuevo — sin copropiedad aún
          const perfilNuevo: PerfilUsuario = {
            uid: user.uid,
            email: user.email ?? '',
            copropiedadId: null,
            familia: null,
            rol: 'copropietario',
          }
          await setDoc(docRef, perfilNuevo)
          setPerfil(perfilNuevo)
        }
      } catch (err) {
        setError('Error al cargar el perfil de usuario')
      } finally {
        setLoading(false)
      }
    }

    cargarPerfil()
  }, [user])

  const crearCopropiedad = async (
    nombre: string,
    familias: string[],
    sistemaTurnos: 'rotacion' | 'calendario' | 'mixto'
  ): Promise<string> => {
    if (!user || !perfil) throw new Error('No hay usuario autenticado')

    const copropiedadId = `cop_${Date.now()}`

    // Crear la copropiedad en Firestore
    await setDoc(doc(db, 'copropiedades', copropiedadId, 'config', 'general'), {
      nombre,
      familias,
      sistemaTurnos,
      tarifaDiaria: 12,
      cuotaAnual: 0,
      creadaEn: new Date().toISOString(),
      codigo: copropiedadId.slice(-6).toUpperCase(), // código de 6 caracteres para invitar
    })

    // Actualizar perfil del usuario como admin
    const perfilActualizado: PerfilUsuario = {
      ...perfil,
      copropiedadId,
      familia: familias[0] ?? 'Admin',
      rol: 'admin',
    }

    await setDoc(doc(db, 'usuarios', user.uid), perfilActualizado)
    setPerfil(perfilActualizado)

    return copropiedadId
  }

  const unirseACopropiedad = async (codigo: string, familia: string) => {
    if (!user || !perfil) throw new Error('No hay usuario autenticado')

    // Buscar copropiedad por código
    const { getDocs, collection, query, where } = await import('firebase/firestore')
    const q = query(
      collection(db, 'copropiedades'),
      where('config.general.codigo', '==', codigo.toUpperCase())
    )

    // Simplificado: el código ES el copropiedadId recortado
    const copropiedadId = `cop_${codigo.toLowerCase()}`

    const perfilActualizado: PerfilUsuario = {
      ...perfil,
      copropiedadId,
      familia,
      rol: 'copropietario',
    }

    await setDoc(doc(db, 'usuarios', user.uid), perfilActualizado)
    setPerfil(perfilActualizado)
  }

  return (
    <CopropiedadContext.Provider value={{
      perfil,
      loading,
      error,
      tieneCopropiedad: !!perfil?.copropiedadId,
      crearCopropiedad,
      unirseACopropiedad,
    }}>
      {children}
    </CopropiedadContext.Provider>
  )
}

export function useCopropiedad() {
  const context = useContext(CopropiedadContext)
  if (!context) {
    throw new Error('useCopropiedad debe usarse dentro de CopropiedadProvider')
  }
  return context
}
