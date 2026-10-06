import { urlArchivo } from '../../services/api'
import { ESTILOS_INSIGNIA } from '../../utils/insignias'

const ESTADOS_RACHA = {
  activa: { texto: 'Racha activa', punto: 'bg-tertiary shadow-[0_0_8px_#4edea3]' },
  apagada: { texto: 'Insignia apagada', punto: 'bg-error shadow-[0_0_8px_#ffb4ab]' },
  permanente: { texto: 'Insignia permanente', punto: 'bg-primary shadow-[0_0_8px_#d0bcff]' },
}

function Fondo({ portada }) {
  if (portada?.miniatura) {
    return <img src={urlArchivo(portada.miniatura)} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover blur-[3px]" />
  }
  if (portada?.url) {
    return (
      <video
        src={`${urlArchivo(portada.url)}#t=0.1`}
        preload="metadata"
        muted
        playsInline
        tabIndex={-1}
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover blur-[3px]"
      />
    )
  }
  // Sin videos todavía: fondo abstracto con los colores de la marca.
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-primary-container/35 via-surface-container to-secondary-container/25">
      <div className="absolute top-8 left-1/4 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute right-1/5 bottom-4 h-64 w-64 rounded-full bg-tertiary/15 blur-3xl" />
    </div>
  )
}

/** Banner cinematográfico del perfil de otra persona: su proyectada más popular como portada. */
export default function BannerPerfil({ perfil }) {
  const { insignia } = perfil
  const estadoRacha = ESTADOS_RACHA[insignia.permanente ? 'permanente' : insignia.estado]
  const estilo = ESTILOS_INSIGNIA[insignia.nivel]

  return (
    <div className="relative mx-auto w-full max-w-7xl px-space-lg lg:px-margin">
      <div className="relative h-64 w-full overflow-hidden rounded-xl bg-surface-container-lowest shadow-2xl md:h-80 lg:h-96">
        <Fondo portada={perfil.portada} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-surface-container-lowest/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-primary/10" />

        {estadoRacha && (
          <div className="absolute top-6 right-6 flex items-center gap-2 rounded-full bg-surface-container-lowest/80 px-3 py-1.5 shadow-md backdrop-blur-md">
            <span className={`h-2 w-2 animate-pulse rounded-full ${estadoRacha.punto}`} />
            <span className="font-label-sm text-label-sm tracking-widest text-on-surface uppercase">{estadoRacha.texto}</span>
          </div>
        )}

        <div className="absolute right-6 bottom-24 hidden flex-col items-end md:flex">
          <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase">Rango actual</span>
          <span
            className={`font-headline-sm text-headline-sm uppercase drop-shadow-[0_0_12px_rgba(208,188,255,0.4)] ${
              estilo && insignia.estado !== 'apagada' ? estilo.claseTexto : 'text-primary'
            }`}
          >
            {estilo?.nombre ?? 'Sin insignia'}
          </span>
        </div>
      </div>
    </div>
  )
}
