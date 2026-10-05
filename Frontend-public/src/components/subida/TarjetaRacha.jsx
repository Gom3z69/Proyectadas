import { useCuentaRegresiva } from '../../hooks/useCuentaRegresiva'
import { formatearDiaMes, formatearRestante } from '../../utils/formato'
import { ESTILOS_INSIGNIA } from '../../utils/insignias'
import Icono from '../ui/Icono'
import Spinner from '../ui/Spinner'

const DIA_MS = 24 * 60 * 60 * 1000

const ESTADOS = {
  activa: { etiqueta: 'ACTIVA', pildora: 'bg-tertiary-container/30 text-tertiary', icono: 'text-tertiary', barra: 'from-primary to-secondary' },
  apagada: { etiqueta: 'APAGADA', pildora: 'bg-error-container/40 text-error', icono: 'text-error', barra: 'from-[#E0115F] to-error' },
  sin_insignia: { etiqueta: 'SIN RACHA', pildora: 'bg-surface-container-highest text-outline', icono: 'text-outline', barra: 'from-primary to-secondary' },
}

/** Estado de la racha de publicación con su plazo, las vidas del mes y el botón para revivir. */
export default function TarjetaRacha({ insignia, onRevivir, reviviendo = false, onVencido }) {
  const restante = useCuentaRegresiva(insignia.venceEn, onVencido)
  const estado = ESTADOS[insignia.estado] ?? ESTADOS.sin_insignia
  const perdida = ESTILOS_INSIGNIA[insignia.ultimaPerdida?.nivel]

  let mensaje = perdida
    ? `Perdiste tu insignia ${perdida.nombre}. Publica una proyectada para empezar una nueva racha.`
    : 'Publica tu primera proyectada para ganar la insignia Bronce y empezar tu racha.'
  if (insignia.estado === 'activa') {
    mensaje = `Publica antes de que se acabe el plazo para mantener tu insignia encendida: quedan ${formatearRestante(restante)}.`
  } else if (insignia.estado === 'apagada') {
    mensaje = `Pasaron 24 h sin publicar. Revívela en las próximas ${formatearRestante(restante)} con 1 vida, o publica una proyectada.`
  }

  return (
    <div className="relative flex flex-col gap-space-sm overflow-hidden rounded-xl bg-surface-container-low p-space-md shadow-sm">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-label-md text-label-md font-semibold text-on-surface">
          <Icono nombre="local_fire_department" relleno className={`text-base ${estado.icono}`} />
          Racha de publicación
        </span>
        <span className={`rounded-full px-2 py-0.5 font-label-sm text-label-sm font-bold ${estado.pildora}`}>{estado.etiqueta}</span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant tabular-nums">{mensaje}</p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
        <div
          className={`h-full bg-gradient-to-r transition-[width] duration-1000 ${estado.barra}`}
          style={{ width: `${Math.min(100, ((restante ?? 0) / DIA_MS) * 100)}%` }}
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="flex items-center gap-0.5" aria-label={`${insignia.oportunidades} de ${insignia.oportunidadesPorMes} vidas`}>
          {Array.from({ length: insignia.oportunidadesPorMes }, (_, indice) => (
            <Icono
              key={indice}
              nombre="favorite"
              relleno={indice < insignia.oportunidades}
              className={`text-base ${indice < insignia.oportunidades ? 'text-tertiary' : 'text-surface-container-highest'}`}
            />
          ))}
        </span>
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          {insignia.oportunidades} de {insignia.oportunidadesPorMes} vidas · se reinician el {formatearDiaMes(insignia.proximoReinicio)}
        </span>
      </div>
      {insignia.estado === 'apagada' && onRevivir && (
        <button
          type="button"
          onClick={onRevivir}
          disabled={reviviendo}
          className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E0115F] to-primary-container px-4 py-2 font-label-md text-label-md font-bold text-white shadow-[0_0_20px_rgba(224,17,95,0.4)] transition-transform active:scale-95 disabled:opacity-60"
        >
          {reviviendo ? <Spinner tamano={14} colores="border-white/30 border-t-white" /> : <Icono nombre="bolt" relleno className="text-base" />}
          Revivir insignia
        </button>
      )}
    </div>
  )
}
