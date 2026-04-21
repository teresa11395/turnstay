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

export interface Gasto {
  id?: string
  concepto: string
  importe: number
  fecha: string
  familia: string
}

export function useGastos() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGastos = async () => {
    try {
      setLoading(true)
      setError(null)
      const q = query(collection(db, 'gastos'), orderBy('fecha', 'desc'))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Gasto[]
      setGastos(data)
    } catch (err) {
      setError('Error al cargar los gastos')
    } finally {
      setLoading(false)
    }
  }

  const addGasto = async (gasto: Omit<Gasto, 'id'>) => {
    try {
      setError(null)
      await addDoc(collection(db, 'gastos'), gasto)
      await fetchGastos()
    } catch (err) {
      setError('Error al registrar el gasto')
    }
  }

  const deleteGasto = async (id: string) => {
    try {
      setError(null)
      await deleteDoc(doc(db, 'gastos', id))
      await fetchGastos()
    } catch (err) {
      setError('Error al eliminar el gasto')
    }
  }

  const totalGastos = gastos.reduce((sum, g) => sum + g.importe, 0)

  useEffect(() => {
    fetchGastos()
  }, [])

  return { gastos, loading, error, addGasto, deleteGasto, totalGastos, refetch: fetchGastos }
}