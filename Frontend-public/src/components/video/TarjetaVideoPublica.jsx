import { formatearDuracion, formatearNumero } from '../../utils/formato'
import Icono from '../ui/Icono'
import MiniaturaVideo from './MiniaturaVideo'

/** Tarjeta del perfil de otra persona: duración, título, reproducciones y me gusta. */
export default function TarjetaVideoPublica({ video, onAbrir }) {
  return (
    <button
      type="button"
      onClick={onAbrir}
      aria-label={`Ver proyectada: ${video.descripcion || 'sin descripción'}`}
      className="group relative block aspect-[9/16] w-full overflow-hidden rounded-xl bg-surface-container text-left shadow-lg transition-transform duration-300 hover:-translate-y-1.5"
    >
      <span className="absolute inset-0">
        <MiniaturaVideo video={video} />
      </span>
      <span className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/30 to-transparent" />
      <span className="absolute top-3 right-3 rounded-md bg-surface-container-lowest/80 px-2 py-0.5 font-label-sm text-label-sm text-on-surface backdrop-blur-sm">
        {formatearDuracion(video.duracion)}
      </span>
      <span className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-highest/80 text-primary opacity-0 shadow-[0_0_20px_rgba(208,188,255,0.4)] backdrop-blur-md transition-opacity group-hover:opacity-100">
        <Icono nombre="play_arrow" relleno className="ml-1 text-3xl" />
      </span>
      <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-3 sm:p-4">
        <span className="line-clamp-2 font-label-md text-label-md leading-snug font-semibold break-words text-on-surface drop-shadow-md">
          {video.descripcion || 'Proyectada sin descripción'}
        </span>
        <span className="flex items-center justify-between pt-1 font-label-sm text-label-sm text-on-surface">
          <span className="flex items-center gap-1">
            <Icono nombre="visibility" className="text-sm text-secondary" /> {formatearNumero(video.vistas)}
          </span>
          <span className="flex items-center gap-1">
            <Icono nombre="favorite" relleno className="text-sm text-error" /> {formatearNumero(video.likesCount)}
          </span>
        </span>
      </span>
    </button>
  )
}
