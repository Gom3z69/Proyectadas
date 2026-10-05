import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import Icono from '../ui/Icono'
import Modal from '../ui/Modal'
import BuscadorUsuarios from './BuscadorUsuarios'

const claseItem = (activo) =>
  `flex min-w-14 flex-col items-center p-2 transition-colors ${activo ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`

/** Barra flotante inferior para pantallas pequeñas (como en el diseño de STITCH). */
export default function NavegacionMovil() {
  const [buscando, setBuscando] = useState(false)
  const { pathname } = useLocation()
  const [parametros] = useSearchParams()
  const enFeed = pathname === '/'
  const feed = parametros.get('feed')

  return (
    <>
      <nav
        aria-label="Navegación móvil"
        className="fixed right-4 bottom-4 left-4 z-40 flex items-center justify-around rounded-full bg-surface-container-high/90 p-2 shadow-2xl shadow-black/60 backdrop-blur-2xl md:hidden"
      >
        <Link to="/" className={claseItem(enFeed && feed !== 'siguiendo')}>
          <Icono nombre="play_circle" />
          <span className="font-label-sm text-[10px]">Para ti</span>
        </Link>
        <Link to="/?feed=siguiendo" className={claseItem(enFeed && feed === 'siguiendo')}>
          <Icono nombre="group" />
          <span className="font-label-sm text-[10px]">Siguiendo</span>
        </Link>
        <Link
          to="/mis-proyectadas"
          aria-label="Subir proyectada"
          className={`-mt-4 rounded-full bg-gradient-to-tr from-primary to-secondary p-2.5 text-on-primary-container shadow-lg shadow-primary-container/40 ${
            pathname === '/mis-proyectadas' ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface-container-high' : ''
          }`}
        >
          <Icono nombre="add" className="text-2xl font-bold" />
        </Link>
        <button type="button" onClick={() => setBuscando(true)} className={claseItem(false)}>
          <Icono nombre="search" />
          <span className="font-label-sm text-[10px]">Buscar</span>
        </button>
        <Link to="/perfil" className={claseItem(pathname === '/perfil')}>
          <Icono nombre="person" />
          <span className="font-label-sm text-[10px]">Perfil</span>
        </Link>
      </nav>

      <Modal abierto={buscando} onCerrar={() => setBuscando(false)} titulo="Buscar creadores">
        <div className="min-h-[50dvh] px-6 pt-2 pb-6">
          <BuscadorUsuarios autoFocus onElegir={() => setBuscando(false)} />
        </div>
      </Modal>
    </>
  )
}
