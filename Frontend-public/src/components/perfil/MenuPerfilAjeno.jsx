import { useRef, useState } from 'react'
import { useClicFuera } from '../../hooks/useClicFuera'
import ModalBloqueo from '../moderacion/ModalBloqueo'
import ModalReporte from '../moderacion/ModalReporte'
import Icono from '../ui/Icono'

const claseOpcion =
  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-label-lg text-label-lg text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-error'

/** "⋯" del perfil de otra persona: reportar la cuenta o bloquearla. */
export default function MenuPerfilAjeno({ perfil, onBloqueado }) {
  const [abierto, setAbierto] = useState(false)
  const [reportando, setReportando] = useState(false)
  const [bloqueando, setBloqueando] = useState(false)
  const menu = useRef(null)

  useClicFuera(menu, () => setAbierto(false), abierto)

  return (
    <div ref={menu} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        aria-label="Más opciones"
        aria-haspopup="menu"
        aria-expanded={abierto}
        className="flex items-center justify-center rounded-full bg-surface-container-high p-2.5 text-on-surface shadow-sm transition-all hover:bg-surface-bright"
      >
        <Icono nombre="more_horiz" className="text-lg" />
      </button>
      {abierto && (
        <div
          role="menu"
          className="absolute top-full right-0 z-30 mt-2 w-60 animate-aparecer rounded-2xl bg-surface-container-high p-1.5 text-left shadow-2xl shadow-black/60 ring-1 ring-outline-variant/40"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setAbierto(false)
              setReportando(true)
            }}
            className={claseOpcion}
          >
            <Icono nombre="flag" className="text-xl" /> Reportar cuenta
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setAbierto(false)
              setBloqueando(true)
            }}
            className={claseOpcion}
          >
            <Icono nombre="block" className="text-xl" /> Bloquear a @{perfil.username}
          </button>
        </div>
      )}

      <ModalReporte
        objetivo={reportando ? { tipo: 'usuario', id: perfil.id, titulo: `Reportar a @${perfil.username}` } : null}
        onCerrar={() => setReportando(false)}
        onReportado={() => setReportando(false)}
      />
      <ModalBloqueo
        username={bloqueando ? perfil.username : null}
        onCerrar={() => setBloqueando(false)}
        onBloqueado={() => {
          setBloqueando(false)
          onBloqueado()
        }}
      />
    </div>
  )
}
