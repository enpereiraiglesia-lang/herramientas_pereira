import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ConfiguracionFaltante } from './components/ConfiguracionFaltante'
import { variablesFaltantes } from './lib/supabase'
import { registrarPwa } from './pwa/pwa'

registrarPwa()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {variablesFaltantes.length ? <ConfiguracionFaltante variables={variablesFaltantes} /> : <App />}
  </StrictMode>,
)
