import { formatearMesAnio, formatearNumero } from '../../utils/formato'
import { ESTILOS_INSIGNIA } from '../../utils/insignias'
import IconoInsignia from '../insignias/IconoInsignia'
import Avatar from '../ui/Avatar'
import BotonSeguir from '../ui/BotonSeguir'
import Icono from '../ui/Icono'

function Estadistica({ valor, etiqueta, color, onClick }) {
  const clase = 'flex flex-col items-center justify-center rounded-lg bg-surface-container p-3'
  const contenido = (
    <>
      <span className={`font-headline-md text-headline-md font-bold tracking-tight ${color}`}>{formatearNumero(valor)}</span>
      <span className="mt-1 font-label-sm text-label-sm tracking-wider text-outline uppercase">{etiqueta}</span>
    </>
  )
  return onClick ? (
    <button type="button" onClick={onClick} className={`${clase} transition-colors hover:bg-surface-container-high`}>
      {contenido}
    </button>
  ) : (
    <div className={clase}>{contenido}</div>
  )
}

/**
 * Tarjeta flotante con la identidad de otra persona: foto, nombre, rango, biografía, acciones y métricas.
 * `opciones` se muestra después del botón de compartir (el menú para reportar o bloquear).
 */
export default function IdentidadPerfil({ perfil, onCambioSeguimiento, onVerRelaciones, onCompartir, opciones }) {
  const { insignia, estadisticas } = perfil
  const estilo = ESTILOS_INSIGNIA[insignia.nivel]
  const apagada = insignia.estado === 'apagada'

  return (
    <div className="relative z-10 mx-auto -mt-16 w-full max-w-7xl px-space-lg md:-mt-20 lg:px-margin">
      <div className="flex flex-col justify-between gap-space-xl rounded-xl bg-surface-container/90 p-space-lg shadow-xl backdrop-blur-xl md:p-space-xl lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-space-lg sm:flex-row">
          <div className="relative mx-auto shrink-0 sm:mx-0">
            <div className="rounded-full bg-gradient-to-tr from-primary via-secondary to-tertiary p-1 shadow-[0_0_24px_rgba(160,120,255,0.5)]">
              <Avatar usuario={perfil} tamano={128} />
            </div>
            {estilo && (
              <div
                className="absolute -right-1 -bottom-2 flex items-center justify-center rounded-full bg-surface-container-highest p-2 shadow-lg"
                title={`Insignia ${estilo.nombre}${apagada ? ' (apagada)' : ''}`}
              >
                <IconoInsignia nivel={insignia.nivel} tamano={24} apagada={apagada} />
              </div>
            )}
          </div>

          <div className="flex w-full min-w-0 flex-1 flex-col text-center sm:text-left">
            <div className="mb-1.5 flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-tight break-words text-on-surface md:font-headline-lg md:text-headline-lg">
                {perfil.nombre}
              </h1>
              {estilo && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-container via-surface-container-high to-secondary-container px-3 py-1 text-on-surface shadow-[0_0_14px_rgba(208,188,255,0.35)] ${
                    apagada ? 'opacity-70 grayscale' : ''
                  }`}
                >
                  <IconoInsignia nivel={insignia.nivel} tamano={16} brillo={false} />
                  <span className="font-label-sm text-label-sm font-bold tracking-wider uppercase">{estilo.nombre}</span>
                </span>
              )}
            </div>
            <p className="mb-3 font-label-md text-label-md text-outline">
              @{perfil.username} • <span className="text-tertiary">En PROYECTADAS desde {formatearMesAnio(perfil.creadoEn)}</span>
            </p>
            <p className="mb-4 max-w-2xl font-body-lg text-body-lg leading-relaxed break-words whitespace-pre-line text-on-surface-variant">
              {perfil.bio || <span className="italic">Sin biografía.</span>}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-space-sm pt-1 sm:justify-start">
              <BotonSeguir
                variante="destacado"
                username={perfil.username}
                siguiendo={perfil.siguiendo}
                onCambio={onCambioSeguimiento}
              />
              <button
                type="button"
                onClick={onCompartir}
                title="Compartir perfil"
                aria-label="Compartir perfil"
                className="flex items-center justify-center rounded-full bg-surface-container-high p-2.5 text-on-surface shadow-sm transition-all hover:bg-surface-bright hover:text-secondary"
              >
                <Icono nombre="share" className="text-lg" />
              </button>
              {opciones}
            </div>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-space-md rounded-xl bg-surface-container-low p-space-md shadow-inner sm:grid-cols-4 lg:w-72 lg:grid-cols-2">
          <Estadistica valor={estadisticas.likes} etiqueta="Me gusta" color="text-primary" />
          <Estadistica
            valor={estadisticas.seguidores}
            etiqueta="Seguidores"
            color="text-secondary"
            onClick={() => onVerRelaciones('seguidores')}
          />
          <Estadistica valor={estadisticas.videos} etiqueta="Proyectadas" color="text-tertiary" />
          <Estadistica
            valor={estadisticas.seguidos}
            etiqueta="Seguidos"
            color="text-on-surface"
            onClick={() => onVerRelaciones('seguidos')}
          />
        </div>
      </div>
    </div>
  )
}
