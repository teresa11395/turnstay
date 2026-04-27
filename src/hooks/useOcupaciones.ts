import { useState, useEffect } from 'react'
import { db } from '../api/firebase'
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore'
import { useCopropiedad } from '../context/CopropiedadContext'

export interface EntregaTurno {
  casaLimpia: boolean
  jardinCuidado: boolean
  bañosLimpios: boolean
  cocinaLimpia: boolean
  observaciones?: string
  fecha: string
}

export interface Ocupacion {
  id?: string
  familia: string
  fechaEntrada: string
  fechaSalida: string
  personas: number
  dias: number
  coste: number
  entrega?: EntregaTurno
}

export function useOcupaciones() {
  const { perfil } = useCopropiedad()
  const copropiedadId = perfil?.copropiedadId
  const [ocupaciones, setOcupaciones] = useState<Ocupacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOcupaciones = async () => {
    if (!copropiedadId) return
    try {
      setLoading(true)
      setError(null)
      const q = query(collection(db, 'copropiedades', copropiedadId, 'ocupaciones'), orderBy('fechaEntrada', 'desc'))
      const snapshot = await getDocs(q)
      setOcupaciones(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Ocupacion[])
    } catch (err) {
      setError('Error al cargar las ocupaciones')
    } finally {
      setLoading(false)
    }
  }

  const addOcupacion = async (ocupacion: Omit<Ocupacion, 'id'>) => {
    if (!copropiedadId) return
    try {
      await addDoc(collection(db, 'copropiedades', copropiedadId, 'ocupaciones'), ocupacion)
      await fetchOcupaciones()
    } catch { setError('Error al registrar la ocupación') }
  }

  const updateOcupacion = async (id: string, data: Partial<Ocupacion>) => {
    if (!copropiedadId) return
    try {
      await updateDoc(doc(db, 'copropiedades', copropiedadId, 'ocupaciones', id), data)
      await fetchOcupaciones()
    } catch { setError('Error al actualizar la ocupación') }
  }

  const deleteOcupacion = async (id: string) => {
    if (!copropiedadId) return
    try {
      await deleteDoc(doc(db, 'copropiedades', copropiedadId, 'ocupaciones', id))
      await fetchOcupaciones()
    } catch { setError('Error al eliminar la ocupación') }
  }

  useEffect(() => { if (copropiedadId) fetchOcupaciones() }, [copropiedadId])

  return { ocupaciones, loading, error, addOcupacion, updateOcupacion, deleteOcupacion, refetch: fetchOcupaciones }
}
