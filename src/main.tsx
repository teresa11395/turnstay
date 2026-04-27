import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { CopropiedadProvider } from './context/CopropiedadContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CopropiedadProvider>
        <App />
      </CopropiedadProvider>
    </AuthProvider>
  </StrictMode>,
)
