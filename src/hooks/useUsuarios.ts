import { useState, useEffect } from 'react'
import { db } from '../api/firebase'
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore'
import { useCopropiedad } from '../context/CopropiedadContext'

export interface UsuarioCopropiedad {
  uid: string
  email: string
  familia: string | null
  rol: 'admin' | 'copropietario'
}

export function useUsuarios() {
  const { perfil } = useCopropiedad()
  const copropiedadId = perfil?.copropiedadId
  const [usuarios, setUsuarios] = useState<UsuarioCopropiedad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsuarios = async () => {
    if (!copropiedadId) return
    try {
      setLoading(true)
      setError(null)
      const q = query(
        collection(db, 'usuarios'),
        where('copropiedadId', '==', copropiedadId)
      )
      const snapshot = await getDocs(q)
      setUsuarios(snapshot.docs.map(d => d.data() as UsuarioCopropiedad))
    } catch (err) {
      setError('Error al cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  const cambiarRol = async (uid: string, nuevoRol: 'admin' | 'copropietario') => {
    try {
      await updateDoc(doc(db, 'usuarios', uid), { rol: nuevoRol })
      setUsuarios(prev => prev.map(u => u.uid === uid ? { ...u, rol: nuevoRol } : u))
    } catch (err) {
      setError('Error al cambiar el rol')
    }
  }

  useEffect(() => {
    if (copropiedadId) fetchUsuarios()
  }, [copropiedadId])

  return { usuarios, loading, error, cambiarRol }
}
