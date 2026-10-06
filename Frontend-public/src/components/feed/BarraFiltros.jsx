import { Link } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { useCuentaRegresiva } from '../../hooks/useCuentaRegresiva'
import { PESTANAS_FEED } from '../../utils/feed'
import { formatearRestante } from '../../utils/formato'
import InsigniaChip from '../insignias/InsigniaChip'
import Icono from '../ui/Icono'

function ChipRacha({ insignia }) {
  const { refrescarUsuario } = useAuth()
  // Al vencer el plazo se pide el estado nuevo (apagada o perdida) al servidor.
  const restante = useCuentaRegresiva(insignia.venceEn, () => refrescarUsuario().catch(() => {}))
  const estados = {
    activa: { punto: 'bg-tertiary', texto: `Racha activa · ${formatearRestante(restante)}` },
    apagada: { punto: 'bg-error', texto: `Insignia apagada · revívela en ${formatearRestante(restante)}` },
    sin_insignia: { punto: 'bg-outline', texto: 'Publica para ganar tu insignia' },
    permanente: { punto: 'bg-primary', texto: 'Insignia permanente · Admin' },
  }
  const estado = estados[insignia.permanente ? 'permanente' : insignia.estado] ?? estados.sin_insignia

  return (
    <Link
      to="/mis-proyectadas"
      className="flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 shadow-sm transition-colors hover:bg-surface-container"
    >
      <span className={`h-2.5 w-2.5 animate-pulse rounded-full ${estado.punto}`} />
      <span className="font-label-md text-label-md text-on-surface-variant tabular-nums">{estado.texto}</span>
    </Link>
  )
}

/** Pestañas del feed y el estado de la racha del usuario (parte superior del Dashboard). */
export default function BarraFiltros({ tipo, onCambiar }) {
  const { usuario } = useAuth()

  return (
    <div className="mx-auto flex w-full max-w-5xl shrink-0 items-center justify-between gap-4 pb-4 md:pb-6">
      <div
        className="sin-scrollbar flex max-w-full min-w-0 items-center gap-1 overflow-x-auto rounded-full bg-surface-container-high p-1 shadow-inner md:gap-1.5"
        role="tablist"
      >
        {PESTANAS_FEED.map((pestana) => {
          const activa = pestana.tipo === tipo
          return (
            <button
              key={pestana.tipo}
              type="button"
              role="tab"
              aria-selected={activa}
              onClick={() => onCambiar(pestana.tipo)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 font-label-md text-label-md whitespace-nowrap transition-all sm:gap-2 md:px-5 ${
                activa
                  ? 'bg-primary-container font-bold text-on-primary-container shadow-lg shadow-primary-container/30'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icono nombre={pestana.icono} className="text-sm" />
              <span className="sm:hidden">{pestana.corto}</span>
              <span className="hidden sm:inline">{pestana.texto}</span>
            </button>
          )
        })}
      </div>

      <div className="hidden items-center gap-3 md:flex">
        <ChipRacha insignia={usuario.insignia} />
        <div className="hidden items-center gap-2 rounded-full bg-surface-container-low px-3 py-2 lg:flex">
          <Icono nombre="military_tech" className="text-base text-secondary" />
          {usuario.insignia.nivel ? (
            <InsigniaChip insignia={usuario.insignia} tamano="sm" />
          ) : (
            <span className="font-label-md text-label-md text-on-surface-variant">Sin insignia</span>
          )}
        </div>
      </div>
    </div>
  )
}
