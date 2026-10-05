import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { useClicFuera } from '../../hooks/useClicFuera'
import InsigniaChip from '../insignias/InsigniaChip'
import Avatar from '../ui/Avatar'
import Icono from '../ui/Icono'

const claseOpcion =
  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-label-lg text-label-lg text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-on-surface'

export default function MenuUsuario() {
  const { usuario, cerrarSesion } = useAuth()
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef(null)
  const navigate = useNavigate()

  useClicFuera(contenedor, () => setAbierto(false), abierto)

  function salir() {
    setAbierto(false)
    cerrarSesion()
    navigate('/login', { replace: true })
  }

  return (
    <div ref={contenedor} className="relative flex shrink-0 items-center">
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-label="Menú de la cuenta"
        className="relative rounded-full transition-transform active:scale-95"
      >
        <Avatar usuario={usuario} tamano={32} anillo="marca" />
        <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full bg-tertiary shadow-[0_0_6px_#4edea3]" />
      </button>

      {abierto && (
        <div
          role="menu"
          className="absolute top-full right-0 z-50 mt-3 w-64 animate-aparecer rounded-2xl bg-surface-container-high p-2 shadow-2xl shadow-black/60 ring-1 ring-outline-variant/40"
        >
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar usuario={usuario} tamano={40} anillo="insignia" />
            <div className="min-w-0">
              <p className="truncate font-title-md text-label-lg text-on-surface">{usuario.nombre}</p>
              <div className="flex items-center gap-1.5">
                <span className="truncate text-body-sm text-on-surface-variant">@{usuario.username}</span>
                <InsigniaChip insignia={usuario.insignia} tamano="sm" />
              </div>
            </div>
          </div>
          <div className="my-1 h-px bg-surface-container-highest" />
          <Link to="/perfil" role="menuitem" className={claseOpcion} onClick={() => setAbierto(false)}>
            <Icono nombre="person" className="text-xl" /> Mi perfil
          </Link>
          <Link to="/mis-proyectadas" role="menuitem" className={claseOpcion} onClick={() => setAbierto(false)}>
            <Icono nombre="video_library" className="text-xl" /> Mis proyectadas
          </Link>
          <Link to="/soporte" role="menuitem" className={claseOpcion} onClick={() => setAbierto(false)}>
            <Icono nombre="help" className="text-xl" /> Ayuda y soporte
          </Link>
          <button type="button" role="menuitem" className={`${claseOpcion} hover:text-error`} onClick={salir}>
            <Icono nombre="logout" className="text-xl" /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
