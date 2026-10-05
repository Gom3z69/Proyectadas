import { formatearDuracion, formatearNumero } from '../../utils/formato'
import { ESTILOS_INSIGNIA } from '../../utils/insignias'
import IconoInsignia from '../insignias/IconoInsignia'
import LeyendaInsignias from '../insignias/LeyendaInsignias'
import Icono from '../ui/Icono'
import MiniaturaVideo from '../video/MiniaturaVideo'

/** Siguientes videos del feed + leyenda del sistema de insignias (columna derecha del diseño). */
export default function ProximasProyectadas({ videos, indiceInicial, hayMas, onElegir }) {
  return (
    <div className="w-full space-y-4 rounded-3xl bg-surface-container-low p-5 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icono nombre="queue_play_next" className="text-lg text-secondary" />
          <span className="font-title-md text-title-md font-bold text-on-surface">Próximas Proyectadas</span>
        </div>
        <span className="font-label-sm text-label-sm text-on-surface-variant">Feed activo</span>
      </div>

      {videos.length === 0 && (
        <p className="rounded-2xl bg-surface-container px-4 py-5 text-center text-body-sm text-on-surface-variant">
          {hayMas ? 'Cargando más proyectadas...' : 'Llegaste al final del feed por ahora.'}
        </p>
      )}

      {videos.map((video, posicion) => {
        const estilo = ESTILOS_INSIGNIA[video.autor.insignia.nivel]
        return (
          <button
            key={video.id}
            type="button"
            onClick={() => onElegir(indiceInicial + posicion)}
            className="group/card flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-surface-container p-3 text-left transition-all duration-300 hover:bg-surface-container-high"
          >
            <span className="relative h-24 w-16 shrink-0 overflow-hidden rounded-xl shadow-md">
              <MiniaturaVideo video={video} className="transition-transform duration-500 group-hover/card:scale-105" />
              <span className="absolute right-1 bottom-1 rounded bg-surface-container-lowest/80 px-1 py-0.5 font-mono text-[10px] text-on-surface">
                {formatearDuracion(video.duracion)}
              </span>
            </span>
            <span className="flex min-w-0 flex-1 flex-col justify-between">
              <span>
                <span className="mb-1 flex items-center gap-1.5">
                  {estilo && <IconoInsignia nivel={video.autor.insignia.nivel} tamano={15} apagada={video.autor.insignia.estado === 'apagada'} />}
                  <span className="truncate font-label-md text-label-md font-bold text-on-surface">@{video.autor.username}</span>
                </span>
                <span className="line-clamp-1 font-body-md text-body-md text-on-surface-variant transition-colors group-hover/card:text-on-surface">
                  {video.descripcion || 'Proyectada sin descripción'}
                </span>
              </span>
              <span className="flex items-center gap-3 pt-2 font-label-sm text-label-sm text-outline">
                <span className="flex items-center gap-1">
                  <Icono nombre="visibility" className="text-xs" /> {formatearNumero(video.vistas)}
                </span>
                <span className="flex items-center gap-1">
                  <Icono nombre="favorite" className="text-xs" /> {formatearNumero(video.likesCount)}
                </span>
                {estilo && (
                  <span className="rounded bg-surface-container-highest px-1.5 py-0.5 text-[10px] font-bold">
                    <span className={estilo.claseTexto}>{estilo.nombre}</span>
                  </span>
                )}
              </span>
            </span>
          </button>
        )
      })}

      <LeyendaInsignias />
    </div>
  )
}
