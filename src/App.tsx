import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { AdminRoute } from './features/auth/components/AdminRoute'
import { AuthProvider } from './features/auth/components/AuthProvider'
import { ProtectedRoute } from './features/auth/components/ProtectedRoute'
import { ModuloRoute } from './features/permisos/components/ModuloRoute'
import { lazy, Suspense } from 'react'
import { Spinner } from './components/ui/Spinner'
import { LoginPage } from './pages/LoginPage'

// Cada pantalla se descarga solo cuando se abre (carga inicial más rápida en el celular)
const pagina = <K extends string>(cargar: () => Promise<Record<K, React.ComponentType>>, nombre: K) =>
  lazy(() => cargar().then((m) => ({ default: m[nombre] })))

const ContactoDetallePage = pagina(() => import('./pages/ContactoDetallePage'), 'ContactoDetallePage')
const ContactoEditarPage = pagina(() => import('./pages/ContactoEditarPage'), 'ContactoEditarPage')
const ContactoNuevoPage = pagina(() => import('./pages/ContactoNuevoPage'), 'ContactoNuevoPage')
const ContactosPage = pagina(() => import('./pages/ContactosPage'), 'ContactosPage')
const DashboardPage = pagina(() => import('./pages/DashboardPage'), 'DashboardPage')
const NotFoundPage = pagina(() => import('./pages/NotFoundPage'), 'NotFoundPage')
const PermisosPage = pagina(() => import('./pages/PermisosPage'), 'PermisosPage')
const UsuariosPage = pagina(() => import('./pages/UsuariosPage'), 'UsuariosPage')
const CamarasPage = pagina(() => import('./pages/CamarasPage'), 'CamarasPage')
const GruposFamiliaresPage = pagina(() => import('./pages/GruposFamiliaresPage'), 'GruposFamiliaresPage')
const SeguimientoPage = pagina(() => import('./pages/SeguimientoPage'), 'SeguimientoPage')
const MiembrosPage = pagina(() => import('./pages/MiembrosPage'), 'MiembrosPage')
const InversionistasPage = pagina(() => import('./pages/InversionistasPage'), 'InversionistasPage')
const TciPage = pagina(() => import('./pages/TciPage'), 'TciPage')
const SalidaTciPage = pagina(() => import('./pages/TciPage'), 'SalidaTciPage')
const GrupoTciPage = pagina(() => import('./pages/TciPage'), 'GrupoTciPage')

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route element={<ModuloRoute modulo="inicio" />}>
                <Route index element={<DashboardPage />} />
              </Route>
              <Route element={<ModuloRoute modulo="registrar_contacto" />}>
                <Route path="contactos/nuevo" element={<ContactoNuevoPage />} />
              </Route>
              <Route element={<ModuloRoute modulo="contactos" />}>
                <Route path="contactos" element={<ContactosPage />} />
                <Route path="contactos/:id" element={<ContactoDetallePage />} />
                <Route path="contactos/:id/editar" element={<ContactoEditarPage />} />
              </Route>
              <Route element={<ModuloRoute modulo="seguimiento" />}>
                <Route path="seguimiento" element={<SeguimientoPage />} />
              </Route>
              <Route element={<ModuloRoute modulo="miembros" />}>
                <Route path="miembros" element={<MiembrosPage />} />
              </Route>
              <Route element={<ModuloRoute modulo="inversionistas" />}>
                <Route path="inversionistas" element={<InversionistasPage />} />
              </Route>
              <Route element={<ModuloRoute modulo="tci" />}>
                <Route path="tci" element={<TciPage />} />
                <Route path="tci/:salidaId" element={<SalidaTciPage />} />
                <Route path="tci/grupos/:grupoId" element={<GrupoTciPage />} />
              </Route>
              <Route element={<ModuloRoute modulo="grupos_familiares" />}>
                <Route path="grupos-familiares" element={<GruposFamiliaresPage />} />
              </Route>
              <Route element={<ModuloRoute modulo="camaras" />}>
                <Route path="camaras" element={<CamarasPage />} />
              </Route>
              <Route element={<AdminRoute />}>
                <Route path="usuarios" element={<UsuariosPage />} />
                <Route path="permisos" element={<PermisosPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
