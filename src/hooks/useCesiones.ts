import { useState, useEffect } from 'react'
import { db } from '../api/firebase'
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore'
import { useCopropiedad } from '../context/CopropiedadContext'

export interface Cesion {
  id?: string
  familiaSolicita: string
  familiaCede: string
  fechaInicio: string
  fechaFin: string
  mensaje?: string
  estado: 'pendiente' | 'aceptada' | 'rechazada'
  fecha: string
}

export function useCesiones() {
  const { perfil } = useCopropiedad()
  const copropiedadId = perfil?.copropiedadId
  const [cesiones, setCesiones] = useState<Cesion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCesiones = async () => {
    if (!copropiedadId) return
    try {
      setLoading(true)
      setError(null)
      const q = query(collection(db, 'copropiedades', copropiedadId, 'cesiones'), orderBy('fecha', 'desc'))
      const snapshot = await getDocs(q)
      setCesiones(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Cesion[])
    } catch (err) {
      setError('Error al cargar las cesiones')
    } finally {
      setLoading(false)
    }
  }

  const addCesion = async (cesion: Omit<Cesion, 'id'>) => {
    if (!copropiedadId) return
    try {
      await addDoc(collection(db, 'copropiedades', copropiedadId, 'cesiones'), cesion)
      await fetchCesiones()
    } catch { setError('Error al registrar la cesión') }
  }

  const updateCesion = async (id: string, data: Partial<Cesion>) => {
    if (!copropiedadId) return
    try {
      await updateDoc(doc(db, 'copropiedades', copropiedadId, 'cesiones', id), data)
      await fetchCesiones()
    } catch { setError('Error al actualizar la cesión') }
  }

  useEffect(() => { if (copropiedadId) fetchCesiones() }, [copropiedadId])

  return { cesiones, loading, error, addCesion, updateCesion, refetch: fetchCesiones }
}
