import { useCuentaRegresiva } from '../../hooks/useCuentaRegresiva'
import { formatearDiaMes, formatearFecha, formatearReloj } from '../../utils/formato'
import { ESTILOS_INSIGNIA } from '../../utils/insignias'
import Icono from '../ui/Icono'
import Spinner from '../ui/Spinner'

/** En lugar de la regla, para una cuenta administradora: su insignia no tiene plazos ni usa vidas. */
function InsigniaPermanente({ insignia, esPropio, username, className }) {
  return (
    <div className={`relative flex flex-col justify-between gap-space-md overflow-hidden rounded-xl bg-surface-container-high p-space-lg shadow-xl ${className}`}>
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary-container/25 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-space-xs">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm font-bold tracking-widest text-primary uppercase">Cuenta administradora</span>
          <Icono nombre="verified_user" className="text-lg text-primary" />
        </div>
        <h3 className="font-title-md text-title-md leading-snug font-bold text-on-surface">
          {esPropio ? 'Tu insignia nunca se apaga' : `La insignia de @${username} nunca se apaga`}
        </h3>
        <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
          {esPropio ? 'Conservas' : 'Conserva'} el rango {insignia.nombre} sin publicar cada 24 horas: la regla de la racha
          no aplica a la administración.
        </p>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center gap-1 rounded-lg bg-surface-container-lowest p-space-sm text-center shadow-inner">
        <span className="font-label-sm text-label-sm font-semibold text-outline uppercase">Vigencia</span>
        <div className="flex items-center gap-2 font-headline-md text-headline-md font-extrabold tracking-wider text-primary drop-shadow-[0_0_10px_rgba(208,188,255,0.35)]">
          <Icono nombre="all_inclusive" className="text-4xl" /> Permanente
        </div>
      </div>
    </div>
  )
}

/**
 * Tarjeta "Regla Vital 24H": tiempo para publicar (o para revivir la insignia apagada)
 * y vidas de reanimación del mes. `onVencido` se llama cuando el reloj llega a cero.
 */
export default function ReglaVital24h({ insignia, esPropio, username, onRevivir, reviviendo = false, onVencido, className = '' }) {
  const restante = useCuentaRegresiva(insignia.venceEn, onVencido)
  const total = insignia.oportunidadesPorMes
  const apagada = insignia.estado === 'apagada'

  let etiquetaReloj = 'Sin racha activa'
  if (insignia.estado === 'activa') etiquetaReloj = 'Tiempo restante para publicar'
  if (apagada) etiquetaReloj = 'Insignia apagada · tiempo para revivirla'

  const perdida = ESTILOS_INSIGNIA[insignia.ultimaPerdida?.nivel]
  let sinRacha = 'Aún no tiene una racha activa.'
  if (esPropio) {
    sinRacha = perdida
      ? `Perdiste tu insignia ${perdida.nombre} el ${formatearFecha(insignia.ultimaPerdida.fecha)}. Publica para empezar de nuevo.`
      : 'Publica tu primera proyectada para ganar la insignia Bronce.'
  }

  if (insignia.permanente) {
    return <InsigniaPermanente insignia={insignia} esPropio={esPropio} username={username} className={className} />
  }

  return (
    <div className={`relative flex flex-col justify-between gap-space-md overflow-hidden rounded-xl bg-surface-container-high p-space-lg shadow-xl ${className}`}>
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-error-container/20 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-space-xs">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm font-bold tracking-widest text-error uppercase">Regla vital 24H</span>
          <Icono nombre="timer" className="text-lg text-error" />
        </div>
        <h3 className="font-title-md text-title-md leading-snug font-bold text-on-surface">
          {esPropio ? 'Mantén tu insignia viva' : `Racha de @${username}`}
        </h3>
        <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
          {esPropio
            ? 'Debes publicar al menos 1 proyectada cada 24 horas para preservar el rango actual.'
            : 'Debe publicar al menos 1 proyectada cada 24 horas para conservar su rango.'}
        </p>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center gap-1 rounded-lg bg-surface-container-lowest p-space-sm text-center shadow-inner">
        <span className="font-label-sm text-label-sm font-semibold text-outline uppercase">{etiquetaReloj}</span>
        {restante != null ? (
          <div className="font-headline-md text-headline-md font-extrabold tracking-wider text-error tabular-nums drop-shadow-[0_0_10px_rgba(255,180,171,0.3)]">
            {formatearReloj(restante)}
          </div>
        ) : (
          <p className="px-2 py-1 font-body-sm text-body-sm text-on-surface-variant">{sinRacha}</p>
        )}
        {apagada && esPropio && onRevivir && (
          <button
            type="button"
            onClick={onRevivir}
            disabled={reviviendo}
            className="mt-1 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E0115F] to-primary-container px-5 py-2 font-label-md text-label-md font-bold text-white shadow-[0_0_20px_rgba(224,17,95,0.45)] transition-transform active:scale-95 disabled:opacity-60"
          >
            {reviviendo ? <Spinner tamano={14} colores="border-white/30 border-t-white" /> : <Icono nombre="bolt" relleno className="text-base" />}
            Revivir insignia (usa 1 vida)
          </button>
        )}
      </div>

      <div className="relative z-10 flex flex-col gap-space-xs">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm font-bold text-on-surface">Vidas de reanimación</span>
          <span className="font-label-sm text-label-sm font-bold text-tertiary">
            {insignia.oportunidades} / {total} Disponibles
          </span>
        </div>
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
          {Array.from({ length: total }, (_, indice) => {
            const disponible = indice < insignia.oportunidades
            return (
              <div
                key={indice}
                className={`flex flex-col items-center justify-center gap-1 rounded-lg bg-surface-container p-2 shadow-sm ${disponible ? '' : 'opacity-60'}`}
              >
                <Icono
                  nombre={disponible ? 'favorite' : 'heart_broken'}
                  relleno={disponible}
                  className={`text-xl ${disponible ? 'text-tertiary' : 'text-outline'}`}
                />
                <span className="font-label-sm text-[10px] text-on-surface-variant">{disponible ? 'Activa' : 'Usada'}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="relative z-10 rounded bg-surface-container/60 p-space-xs font-body-sm text-[11px] leading-relaxed text-outline">
        ⚠️ Si no se publica en 24 h, la insignia se apaga y hay 24 h más para revivirla con 1 vida: quedan 2, luego 1. Las vidas
        se reinician cada 01 de mes (próximo: {formatearDiaMes(insignia.proximoReinicio)}).
      </div>
    </div>
  )
}
