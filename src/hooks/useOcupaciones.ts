import { useState, useEffect } from 'react'
import { db } from '../api/firebase'
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore'

export interface Ocupacion {
  id?: string
  familia: string
  fechaEntrada: string
  fechaSalida: string
  personas: number
  dias: number
  coste: number
}

export function useOcupaciones() {
  const [ocupaciones, setOcupaciones] = useState<Ocupacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOcupaciones = async () => {
    try {
      setLoading(true)
      setError(null)
      const q = query(collection(db, 'ocupaciones'), orderBy('fechaEntrada', 'desc'))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ocupacion[]
      setOcupaciones(data)
    } catch (err) {
      setError('Error al cargar las ocupaciones')
    } finally {
      setLoading(false)
    }
  }

  const addOcupacion = async (ocupacion: Omit<Ocupacion, 'id'>) => {
    try {
      setError(null)
      await addDoc(collection(db, 'ocupaciones'), ocupacion)
      await fetchOcupaciones()
    } catch (err) {
      setError('Error al registrar la ocupación')
    }
  }

  const deleteOcupacion = async (id: string) => {
    try {
      setError(null)
      await deleteDoc(doc(db, 'ocupaciones', id))
      await fetchOcupaciones()
    } catch (err) {
      setError('Error al eliminar la ocupación')
    }
  }

  useEffect(() => {
    fetchOcupaciones()
  }, [])

  return { ocupaciones, loading, error, addOcupacion, deleteOcupacion, refetch: fetchOcupaciones }
}