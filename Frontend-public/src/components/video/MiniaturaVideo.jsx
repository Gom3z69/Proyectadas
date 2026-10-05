import { useState } from 'react'
import { urlArchivo } from '../../services/api'

/** Portada del video. Si no hay miniatura, muestra el primer fotograma del propio video. */
export default function MiniaturaVideo({ video, className = '' }) {
  const [falloImagen, setFalloImagen] = useState(false)

  if (video.miniatura && !falloImagen) {
    return (
      <img
        src={urlArchivo(video.miniatura)}
        alt={video.descripcion || `Proyectada de @${video.autor.username}`}
        loading="lazy"
        draggable={false}
        onError={() => setFalloImagen(true)}
        className={`h-full w-full object-cover ${className}`}
      />
    )
  }

  return (
    <video
      src={`${urlArchivo(video.url)}#t=0.1`}
      preload="metadata"
      muted
      playsInline
      tabIndex={-1}
      className={`pointer-events-none h-full w-full object-cover ${className}`}
    />
  )
}
