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
  const [cesiones, setCesiones] = useState<Cesion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCesiones = async () => {
    try {
      setLoading(true)
      setError(null)
      const q = query(collection(db, 'cesiones'), orderBy('fecha', 'desc'))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Cesion[]
      setCesiones(data)
    } catch (err) {
      setError('Error al cargar las cesiones')
    } finally {
      setLoading(false)
    }
  }

  const addCesion = async (cesion: Omit<Cesion, 'id'>) => {
    try {
      setError(null)
      await addDoc(collection(db, 'cesiones'), cesion)
      await fetchCesiones()
    } catch (err) {
      setError('Error al registrar la cesión')
    }
  }

  const updateCesion = async (id: string, data: Partial<Cesion>) => {
    try {
      setError(null)
      await updateDoc(doc(db, 'cesiones', id), data)
      await fetchCesiones()
    } catch (err) {
      setError('Error al actualizar la cesión')
    }
  }

  useEffect(() => {
    fetchCesiones()
  }, [])

  return { cesiones, loading, error, addCesion, updateCesion, refetch: fetchCesiones }
}
