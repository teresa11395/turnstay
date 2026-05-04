import { useState, useEffect } from 'react'
import { auth } from '../api/firebase'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import type { User } from 'firebase/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      setError('Email o contraseña incorrectos')
    }
  }

  // Nuevo: registrar usuario con email y contraseña
  const register = async (email: string, password: string) => {
    try {
      setError(null)
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Ese email ya está registrado')
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres')
      } else if (err.code === 'auth/invalid-email') {
        setError('El email no es válido')
      } else {
        setError('Error al crear la cuenta')
      }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      setError('Error al cerrar sesión')
    }
  }

  return { user, loading, error, login, register, logout }
}
