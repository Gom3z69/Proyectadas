import { formatearNumero, tiempoCorto } from '../../utils/formato'
import { ESTILOS_INSIGNIA } from '../../utils/insignias'
import IconoInsignia from '../insignias/IconoInsignia'
import Icono from '../ui/Icono'
import MiniaturaVideo from './MiniaturaVideo'

/**
 * Tarjeta del perfil propio: insignia con la que se publicó, reproducciones y antigüedad.
 * Un borrador se muestra atenuado y al tocarlo se continúa su edición.
 */
export default function TarjetaVideoPerfil({ video, onAbrir, onEditar }) {
  const estilo = ESTILOS_INSIGNIA[video.nivelInsignia]
  const borrador = video.estado === 'borrador'
  const titulo = video.descripcion || 'sin descripción'

  return (
    <button
      type="button"
      onClick={borrador ? onEditar : onAbrir}
      aria-label={borrador ? `Continuar edición del borrador: ${titulo}` : `Ver proyectada: ${titulo}`}
      className="group relative block aspect-[9/16] w-full cursor-pointer overflow-hidden rounded-xl bg-surface-container-low text-left shadow-md"
    >
      <span className={`absolute inset-0 ${borrador ? 'opacity-80' : ''}`}>
        <MiniaturaVideo video={video} className="transition-transform duration-500 group-hover:scale-105" />
      </span>
      <span className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-surface-container-lowest/20 to-transparent" />

      {borrador && (
        <>
          <span className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-surface-container-highest/90 px-2 py-1 shadow-sm backdrop-blur-md">
            <Icono nombre="edit_note" className="text-xs text-primary" />
            <span className="font-label-sm text-[10px] font-bold text-on-surface">BORRADOR</span>
          </span>
          <span className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-lg transition-opacity pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100">
            <Icono nombre="edit" className="text-2xl" />
          </span>
        </>
      )}
      {!borrador && estilo && (
        <span
          className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-surface-container/80 px-2 py-1 shadow-sm backdrop-blur-md"
          title={`Publicada con insignia ${estilo.nombre}`}
        >
          <IconoInsignia nivel={video.nivelInsignia} tamano={12} brillo={false} />
          <span className={`font-label-sm text-[10px] font-bold ${estilo.claseTexto}`}>{estilo.nombre}</span>
        </span>
      )}

      <span className="absolute right-2.5 bottom-2.5 left-2.5 flex items-center justify-between text-on-surface">
        {borrador ? (
          <span className="font-label-sm text-label-sm font-bold drop-shadow">Sin publicar</span>
        ) : (
          <span className="flex items-center gap-1 font-label-sm text-label-sm font-bold drop-shadow">
            <Icono nombre="play_arrow" className="text-sm" /> {formatearNumero(video.vistas)}
          </span>
        )}
        <span className="font-label-sm text-label-sm font-semibold text-outline">
          {tiempoCorto(borrador ? video.actualizadoEn : video.publicadoEn)}
        </span>
      </span>
    </button>
  )
}
