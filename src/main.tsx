import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { CopropiedadProvider } from './context/CopropiedadContext'
import { ConfigProvider } from './context/ConfigContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CopropiedadProvider>
        <ConfigProvider>
          <App />
        </ConfigProvider>
      </CopropiedadProvider>
    </AuthProvider>
  </StrictMode>,
)
