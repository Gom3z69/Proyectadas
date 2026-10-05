import { BrowserRouter, Route, Routes } from 'react-router'
import Layout from '../components/layout/Layout'
import LayoutInformativo from '../components/layout/LayoutInformativo'
import Dashboard from '../pages/Dashboard'
import InsigniasCreadores from '../pages/InsigniasCreadores'
import Login from '../pages/Login'
import MisProyectadas from '../pages/MisProyectadas'
import NoEncontrado from '../pages/NoEncontrado'
import Perfil from '../pages/Perfil'
import PerfilUsuario from '../pages/PerfilUsuario'
import Privacidad from '../pages/Privacidad'
import Registro from '../pages/Registro'
import Soporte from '../pages/Soporte'
import Terminos from '../pages/Terminos'
import RutaProtegida from './RutaProtegida'
import RutaPublica from './RutaPublica'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RutaPublica />}>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
        </Route>

        <Route element={<RutaProtegida />}>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/mis-proyectadas" element={<MisProyectadas />} />
            <Route path="/perfil" element={<Perfil />} />
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
    </BrowserRouter>
  )
}
