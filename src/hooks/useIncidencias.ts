import { useState, useEffect } from 'react'
import { db } from '../api/firebase'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore'

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
  const [incidencias, setIncidencias] = useState<Incidencia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIncidencias = async () => {
    try {
      setLoading(true)
      setError(null)
      const q = query(collection(db, 'incidencias'), orderBy('fecha', 'desc'))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Incidencia[]
      setIncidencias(data)
    } catch (err) {
      setError('Error al cargar las incidencias')
    } finally {
      setLoading(false)
    }
  }

  const addIncidencia = async (incidencia: Omit<Incidencia, 'id'>) => {
    try {
      setError(null)
      await addDoc(collection(db, 'incidencias'), incidencia)
      await fetchIncidencias()
    } catch (err) {
      setError('Error al registrar la incidencia')
    }
  }

  const updateIncidencia = async (id: string, data: Partial<Incidencia>) => {
    try {
      setError(null)
      await updateDoc(doc(db, 'incidencias', id), data)
      await fetchIncidencias()
    } catch (err) {
      setError('Error al actualizar la incidencia')
    }
  }

  useEffect(() => {
    fetchIncidencias()
  }, [])

  return { incidencias, loading, error, addIncidencia, updateIncidencia, refetch: fetchIncidencias }
}
