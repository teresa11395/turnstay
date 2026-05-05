import { createContext, useContext, useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { db, auth } from '../api/firebase'
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore'
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
  const creandoRef = useRef(false)

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
    if (creandoRef.current) throw new Error('Ya se está creando una copropiedad')

    creandoRef.current = true

    try {
      const copropiedadId = `cop_${Date.now()}`

      await setDoc(doc(db, 'copropiedades', copropiedadId), {
        nombre,
        creadaEn: new Date().toISOString(),
      })

      await setDoc(doc(db, 'copropiedades', copropiedadId, 'config', 'general'), {
        nombrePropiedad: nombre,
        familias,
        sistemaTurnos,
        tarifaDiaria: 0,
        cuotaAnual: 0,
        codigo: copropiedadId.slice(-6).toUpperCase(),
        creadaEn: new Date().toISOString(),
      })

      const perfilActualizado: PerfilUsuario = {
        ...perfil,
        copropiedadId,
        familia: familias[0] ?? 'Admin',
        rol: 'admin',
      }

      await setDoc(doc(db, 'usuarios', user.uid), perfilActualizado)
      setPerfil(perfilActualizado)

      return copropiedadId
    } finally {
      creandoRef.current = false
    }
  }

  const unirseACopropiedad = async (codigo: string, familia: string) => {
    // FIX: usar auth.currentUser directamente en lugar del user del contexto
    // El contexto puede no estar actualizado justo después del registro
    const currentUser = auth.currentUser
    if (!currentUser) throw new Error('No hay usuario autenticado')

    const codigoUpper = codigo.trim().toUpperCase()

    // Buscar la copropiedad por el campo 'codigo' en su config/general
    const snapshot = await getDocs(collection(db, 'copropiedades'))

    let copropiedadId: string | null = null
    for (const docSnap of snapshot.docs) {
      const configRef = doc(db, 'copropiedades', docSnap.id, 'config', 'general')
      const configSnap = await getDoc(configRef)
      if (configSnap.exists() && configSnap.data()?.codigo === codigoUpper) {
        copropiedadId = docSnap.id
        break
      }
    }

    if (!copropiedadId) {
      throw new Error('Código no válido')
    }

    const perfilActualizado: PerfilUsuario = {
      uid: currentUser.uid,
      email: currentUser.email ?? '',
      copropiedadId,
      familia,
      rol: 'copropietario',
    }

    await setDoc(doc(db, 'usuarios', currentUser.uid), perfilActualizado)
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
