import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import Layout from '../components/layout/Layout'
import LayoutInformativo from '../components/layout/LayoutInformativo'
import PantallaCarga from '../components/ui/PantallaCarga'
import Dashboard from '../pages/Dashboard'
import Login from '../pages/Login'
import MisProyectadas from '../pages/MisProyectadas'
import NoEncontrado from '../pages/NoEncontrado'
import Perfil from '../pages/Perfil'
import PerfilUsuario from '../pages/PerfilUsuario'
import Registro from '../pages/Registro'
import RutaProtegida from './RutaProtegida'
import RutaPublica from './RutaPublica'

// Páginas poco visitadas: se descargan solo cuando se abren.
const Configuracion = lazy(() => import('../pages/Configuracion'))
const InsigniasCreadores = lazy(() => import('../pages/InsigniasCreadores'))
const Moderacion = lazy(() => import('../pages/Moderacion'))
const Privacidad = lazy(() => import('../pages/Privacidad'))
const RecuperarPassword = lazy(() => import('../pages/RecuperarPassword'))
const RestablecerPassword = lazy(() => import('../pages/RestablecerPassword'))
const Soporte = lazy(() => import('../pages/Soporte'))
const Terminos = lazy(() => import('../pages/Terminos'))

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PantallaCarga />}>
        <Routes>
          <Route element={<RutaPublica />}>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/recuperar" element={<RecuperarPassword />} />
          </Route>
          {/* El enlace del correo funciona con o sin una sesión abierta. */}
          <Route path="/restablecer" element={<RestablecerPassword />} />

          <Route element={<RutaProtegida />}>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="/mis-proyectadas" element={<MisProyectadas />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/configuracion" element={<Configuracion />} />
              <Route path="/moderacion" element={<Moderacion />} />
              {/* Perfil de otra persona: no está en el menú, se abre al tocar su nombre. */}
              <Route path="/u/:username" element={<PerfilUsuario />} />
            </Route>
          </Route>

          {/* Páginas del pie: se pueden leer con o sin sesión. */}
          <Route element={<LayoutInformativo />}>
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="/terminos" element={<Terminos />} />
            <Route path="/insignias" element={<InsigniasCreadores />} />
            <Route path="/soporte" element={<Soporte />} />
          </Route>

          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
