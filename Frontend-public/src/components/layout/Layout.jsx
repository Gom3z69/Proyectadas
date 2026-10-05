import { Outlet, useLocation } from 'react-router'
import Resplandores from '../ui/Resplandores'
import Footer from './Footer'
import Header from './Header'
import NavegacionMovil from './NavegacionMovil'

export default function Layout() {
  const { pathname } = useLocation()
  // El feed ocupa exactamente la pantalla (como TikTok), sin pie de página.
  const esFeed = pathname === '/'

  return (
    // overflow-x-clip: ningún contenido puede ensanchar la página (en celular movería los elementos fijos).
    <div className="min-h-dvh overflow-x-clip">
      <Resplandores />
      <Header />
      <main className="w-full pt-20">
        <Outlet />
      </main>
      {!esFeed && <Footer sobreNavegacionMovil />}
      <NavegacionMovil />
    </div>
  )
}
