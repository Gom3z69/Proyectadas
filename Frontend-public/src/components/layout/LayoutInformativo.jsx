import { Suspense } from 'react'
import { Link, Outlet } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import CargandoPagina from '../ui/CargandoPagina'
import Logo from '../ui/Logo'
import PantallaCarga from '../ui/PantallaCarga'
import Resplandores from '../ui/Resplandores'
import Footer from './Footer'
import Layout from './Layout'

/**
 * Páginas informativas (privacidad, términos, insignias, soporte): se pueden leer sin sesión.
 * Con sesión usan el diseño normal de la app; sin ella, un encabezado con Iniciar sesión y Crear cuenta.
 */
export default function LayoutInformativo() {
  const { usuario, verificando } = useAuth()

  if (verificando) return <PantallaCarga />
  if (usuario) return <Layout />

  return (
    <div className="min-h-dvh overflow-x-clip">
      <Resplandores />
      <header className="fixed top-0 right-0 left-0 z-50 bg-surface/80 shadow-[0_1px_16px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <div className="flex h-20 w-full items-center justify-between gap-space-md px-space-lg lg:px-margin">
          <Logo />
          <nav className="flex shrink-0 items-center gap-space-xs" aria-label="Acceso">
            <Link
              to="/login"
              className="rounded-full px-4 py-2 font-label-md text-label-md text-on-surface-variant transition-all hover:bg-surface-container-high hover:text-on-surface"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/registro"
              className="hidden rounded-full bg-primary-container px-4 py-2 font-label-md text-label-md font-semibold text-on-primary-container shadow-[0_0_18px_rgba(160,120,255,0.35)] sm:inline-flex"
            >
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>
      <main className="w-full pt-20">
        <Suspense fallback={<CargandoPagina />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
