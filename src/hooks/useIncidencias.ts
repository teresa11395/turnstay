import { useState, useEffect } from 'react'
import { db } from '../api/firebase'
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore'
import { useCopropiedad } from '../context/CopropiedadContext'

export interface Incidencia {
  id?: string
  titulo: string
  descripcion: string
  urgencia: 'baja' | 'media' | 'alta'
  estado: 'pendiente' | 'en progreso' | 'resuelta'
  familia: string
  fecha: string
  resolucion?: string
  costeReparacion?: number
}

export function useIncidencias() {
  const { perfil } = useCopropiedad()
  const copropiedadId = perfil?.copropiedadId
  const [incidencias, setIncidencias] = useState<Incidencia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIncidencias = async () => {
    if (!copropiedadId) return
    try {
      setLoading(true)
      setError(null)
      const q = query(collection(db, 'copropiedades', copropiedadId, 'incidencias'), orderBy('fecha', 'desc'))
      const snapshot = await getDocs(q)
      setIncidencias(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Incidencia[])
    } catch (err) {
      setError('Error al cargar las incidencias')
    } finally {
      setLoading(false)
    }
  }

  const addIncidencia = async (incidencia: Omit<Incidencia, 'id'>) => {
    if (!copropiedadId) return
    try {
      await addDoc(collection(db, 'copropiedades', copropiedadId, 'incidencias'), incidencia)
      await fetchIncidencias()
    } catch { setError('Error al registrar la incidencia') }
  }

  const updateIncidencia = async (id: string, data: Partial<Incidencia>) => {
    if (!copropiedadId) return
    try {
      await updateDoc(doc(db, 'copropiedades', copropiedadId, 'incidencias', id), data)
      await fetchIncidencias()
    } catch { setError('Error al actualizar la incidencia') }
  }

  useEffect(() => { if (copropiedadId) fetchIncidencias() }, [copropiedadId])

  return { incidencias, loading, error, addIncidencia, updateIncidencia, refetch: fetchIncidencias }
}
