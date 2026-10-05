import { NavLink } from 'react-router'
import Icono from '../ui/Icono'
import Logo from '../ui/Logo'
import BuscadorUsuarios from './BuscadorUsuarios'
import MenuUsuario from './MenuUsuario'
import Notificaciones from './Notificaciones'

const ENLACES = [
  { a: '/', texto: 'Para ti', icono: 'play_circle', exacto: true },
  { a: '/mis-proyectadas', texto: 'Mis Proyectadas', icono: 'video_library' },
  { a: '/perfil', texto: 'Mi Perfil', icono: 'person' },
]

function claseEnlace({ isActive }) {
  return `flex items-center gap-1.5 rounded-full px-3 py-2 font-label-md text-label-md transition-all lg:px-4 ${
    isActive
      ? 'bg-primary-container font-semibold text-on-primary-container shadow-[0_0_18px_rgba(160,120,255,0.35)]'
      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
  }`
}

export default function Header() {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-surface/80 shadow-[0_1px_16px_rgba(0,0,0,0.4)] backdrop-blur-xl">
      <div className="flex h-20 w-full items-center justify-between gap-space-md px-space-lg lg:px-margin">
        <Logo />

        <div className="mx-space-md hidden max-w-xl flex-1 items-center md:flex">
          <BuscadorUsuarios />
        </div>

        <div className="flex shrink-0 items-center gap-space-sm md:gap-space-md">
          <nav className="hidden items-center gap-space-xs md:flex" aria-label="Navegación principal">
            {ENLACES.map((enlace) => (
              <NavLink key={enlace.a} to={enlace.a} end={enlace.exacto} className={claseEnlace} title={enlace.texto}>
                <Icono nombre={enlace.icono} className="text-xl lg:hidden" />
                <span className="hidden lg:inline">{enlace.texto}</span>
              </NavLink>
            ))}
          </nav>
          <Notificaciones />
          <MenuUsuario />
        </div>
      </div>
      <span
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        aria-hidden="true"
      />
    </header>
  )
}
