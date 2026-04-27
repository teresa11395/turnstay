import { useState, useEffect } from 'react'
import { db } from '../api/firebase'
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { useCopropiedad } from '../context/CopropiedadContext'

export interface Gasto {
  id?: string
  concepto: string
  importe: number
  fecha: string
  familia: string
}

export function useGastos() {
  const { perfil } = useCopropiedad()
  const copropiedadId = perfil?.copropiedadId
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGastos = async () => {
    if (!copropiedadId) return
    try {
      setLoading(true)
      setError(null)
      const q = query(collection(db, 'copropiedades', copropiedadId, 'gastos'), orderBy('fecha', 'desc'))
      const snapshot = await getDocs(q)
      setGastos(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Gasto[])
    } catch (err) {
      setError('Error al cargar los gastos')
    } finally {
      setLoading(false)
    }
  }

  const addGasto = async (gasto: Omit<Gasto, 'id'>) => {
    if (!copropiedadId) return
    try {
      await addDoc(collection(db, 'copropiedades', copropiedadId, 'gastos'), gasto)
      await fetchGastos()
    } catch { setError('Error al registrar el gasto') }
  }

  const deleteGasto = async (id: string) => {
    if (!copropiedadId) return
    try {
      await deleteDoc(doc(db, 'copropiedades', copropiedadId, 'gastos', id))
      await fetchGastos()
    } catch { setError('Error al eliminar el gasto') }
  }

  const totalGastos = gastos.reduce((sum, g) => sum + g.importe, 0)

  useEffect(() => { if (copropiedadId) fetchGastos() }, [copropiedadId])

  return { gastos, loading, error, addGasto, deleteGasto, totalGastos, refetch: fetchGastos }
}
