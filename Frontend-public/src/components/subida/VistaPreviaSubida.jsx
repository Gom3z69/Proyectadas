import { useEffect, useRef, useState } from 'react'
import { formatearDuracion } from '../../utils/formato'
import TextoConHashtags from '../feed/TextoConHashtags'
import IconoInsignia from '../insignias/IconoInsignia'
import Icono from '../ui/Icono'

/**
 * Vista previa vertical de la proyectada tal como se verá en el feed (con la descripción en vivo).
 * Mientras está en pausa muestra la portada elegida. Vuelve a montarla con key al cambiar de archivo.
 */
export default function VistaPreviaSubida({ archivo, analisis, portadaUrl, descripcion, usuario }) {
  const video = useRef(null)
  const [reproduciendo, setReproduciendo] = useState(false)
  const [silenciado, setSilenciado] = useState(true)
  const [progreso, setProgreso] = useState(0)

  useEffect(() => {
    if (video.current) video.current.muted = silenciado
  }, [silenciado])

  function alternar() {
    const reproductor = video.current
    if (!reproductor) return
    if (reproductor.paused) reproductor.play().catch(() => {})
    else reproductor.pause()
  }

  function alActualizarTiempo(evento) {
    const reproductor = evento.currentTarget
    const total = Number.isFinite(reproductor.duration) && reproductor.duration > 0 ? reproductor.duration : analisis?.duracion
    setProgreso(total ? Math.min(100, (reproductor.currentTime / total) * 100) : 0)
  }

  let resolucion = 'Analizando…'
  if (analisis?.ancho) resolucion = `${analisis.ancho}×${analisis.alto}`
  else if (analisis) resolucion = 'Video listo'

  return (
    <div className="group relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-surface-container-lowest shadow-xl">
      {archivo ? (
        <>
          <video
            ref={video}
            src={archivo.url}
            muted={silenciado}
            loop
            playsInline
            preload="auto"
            onPlay={() => setReproduciendo(true)}
            onPause={() => setReproduciendo(false)}
            onTimeUpdate={alActualizarTiempo}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {portadaUrl && !reproduciendo && (
            <img src={portadaUrl} alt="Portada elegida" className="absolute inset-0 h-full w-full object-cover" />
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-surface-container to-surface-container-lowest p-6 text-center">
          <Icono nombre="smart_display" className="text-5xl text-outline" />
          <span className="font-label-md text-label-md text-on-surface-variant">Aquí verás tu proyectada antes de publicarla</span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-surface-container-lowest/30" />

      {archivo && (
        <>
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-surface-container-lowest/80 px-2 py-0.5 font-label-sm text-label-sm font-bold text-secondary backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" /> {resolucion}
            </span>
            {analisis?.duracion > 0 && (
              <span className="rounded-full bg-surface-container-lowest/80 px-2 py-0.5 font-label-sm text-label-sm text-on-surface backdrop-blur-md">
                {formatearDuracion(analisis.duracion)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSilenciado((valor) => !valor)}
            aria-label={silenciado ? 'Activar sonido de la vista previa' : 'Silenciar la vista previa'}
            className="absolute top-2.5 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest/80 text-on-surface backdrop-blur-md"
          >
            <Icono nombre={silenciado ? 'volume_off' : 'volume_up'} className="text-base" />
          </button>
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              onClick={alternar}
              aria-label={reproduciendo ? 'Pausar vista previa' : 'Reproducir vista previa'}
              className={`flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-highest/70 text-on-surface shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-primary-container hover:text-on-primary-container ${
                reproduciendo ? 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100' : ''
              }`}
            >
              <Icono nombre={reproduciendo ? 'pause' : 'play_arrow'} className={`text-3xl ${reproduciendo ? '' : 'ml-1'}`} />
            </button>
          </div>
        </>
      )}

      <div className="pointer-events-none absolute right-3 bottom-4 left-3 flex flex-col gap-1 text-on-surface">
        <div className="flex items-center gap-1.5">
          <span className="font-label-md text-label-md font-bold text-primary">@{usuario.username}</span>
          {usuario.insignia.nivel && <IconoInsignia nivel={usuario.insignia.nivel} tamano={14} />}
        </div>
        <TextoConHashtags
          texto={descripcion.trim() || 'Sin descripción'}
          className="line-clamp-2 font-body-sm text-body-sm break-words text-on-surface/90"
        />
        <div className="mt-1 flex items-center gap-2">
          <Icono nombre="music_note" className="text-sm text-tertiary" />
          <span className="truncate font-label-sm text-label-sm text-on-surface-variant">Sonido original · @{usuario.username}</span>
        </div>
      </div>

      <div className="absolute right-0 bottom-0 left-0 h-1 bg-surface-container-high">
        <div className="h-full bg-primary" style={{ width: `${progreso}%` }} />
      </div>
    </div>
  )
}
