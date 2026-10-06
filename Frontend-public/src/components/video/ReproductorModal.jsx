import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useCapaModal } from '../../hooks/useCapaModal'
import PanelComentarios from '../comentarios/PanelComentarios'
import FeedVideo from '../feed/FeedVideo'
import Icono from '../ui/Icono'

const ESCRITORIO = '(min-width: 1024px)'
const claseBotonNavegacion =
  'flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high/80 text-on-surface shadow-lg backdrop-blur-md transition-transform hover:bg-surface-bright active:scale-95 disabled:opacity-30'

/**
 * Reproduce una proyectada a pantalla completa desde una cuadrícula, con anterior/siguiente.
 * `onActualizar(id, cambios)`, `onSeguirAutor(autorId, resultado)` y `onEliminado(id, respuesta)` sincronizan la lista.
 */
/** onOcultar({ videoId, autorId }): se reportó el video o se bloqueó a su autor; hay que quitarlo de la lista. */
export default function ReproductorModal({
  videos,
  indice,
  onCambiarIndice,
  onCerrar,
  onActualizar,
  onSeguirAutor,
  onEliminado,
  onOcultar,
}) {
  const capa = useRef(null)
  const [silenciado, setSilenciado] = useState(false)
  const [comentariosMovil, setComentariosMovil] = useState(false)
  useCapaModal(true, onCerrar, capa)

  const video = videos[indice]
  const hayAnterior = indice > 0
  const haySiguiente = indice < videos.length - 1

  useEffect(() => {
    const alPresionar = (evento) => {
      if (evento.target.closest?.('input, textarea, [role="slider"]')) return
      if ((evento.key === 'ArrowDown' || evento.key === 'ArrowRight') && haySiguiente) onCambiarIndice(indice + 1)
      if ((evento.key === 'ArrowUp' || evento.key === 'ArrowLeft') && hayAnterior) onCambiarIndice(indice - 1)
    }
    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [indice, hayAnterior, haySiguiente, onCambiarIndice])

  if (!video) return null

  function abrirComentarios() {
    if (window.matchMedia(ESCRITORIO).matches) document.getElementById('campo-comentario-modal')?.focus()
    else setComentariosMovil(true)
  }

  const actualizarConteo = (total) => onActualizar(video.id, { comentariosCount: total })

  return createPortal(
    <div
      ref={capa}
      role="dialog"
      aria-modal="true"
      aria-label={`Proyectada de @${video.autor.username}`}
      tabIndex={-1}
      className="fixed inset-0 z-[110] flex animate-aparecer items-center justify-center gap-6 bg-black/85 px-3 pt-16 pb-3 outline-none backdrop-blur-xl md:p-8"
    >
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar reproductor"
        className="absolute top-4 left-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-high/80 text-on-surface backdrop-blur-md transition-colors hover:bg-surface-bright"
      >
        <Icono nombre="close" className="text-2xl" />
      </button>

      <div className="h-full max-h-[860px] w-full max-w-[540px] min-w-0">
        <FeedVideo
          key={video.id}
          video={video}
          activo
          silenciado={silenciado}
          onCambiarSonido={setSilenciado}
          onActualizar={(cambios) => onActualizar(video.id, cambios)}
          onSeguirAutor={(resultado) => onSeguirAutor(video.autor.id, resultado)}
          onAbrirComentarios={abrirComentarios}
          onEliminado={(respuesta) => onEliminado(video.id, respuesta)}
          onOcultar={onOcultar}
        />
      </div>

      <div className="hidden h-full max-h-[820px] w-[400px] shrink-0 lg:block">
        <PanelComentarios
          key={video.id}
          video={video}
          idCampo="campo-comentario-modal"
          onConteo={actualizarConteo}
          className="h-full"
        />
      </div>

      {videos.length > 1 && (
        <div className="absolute top-1/2 right-4 z-30 hidden -translate-y-1/2 flex-col gap-3 md:flex">
          <button
            type="button"
            onClick={() => onCambiarIndice(indice - 1)}
            disabled={!hayAnterior}
            aria-label="Proyectada anterior"
            className={claseBotonNavegacion}
          >
            <Icono nombre="keyboard_arrow_up" className="text-2xl" />
          </button>
          <button
            type="button"
            onClick={() => onCambiarIndice(indice + 1)}
            disabled={!haySiguiente}
            aria-label="Proyectada siguiente"
            className={claseBotonNavegacion}
          >
            <Icono nombre="keyboard_arrow_down" className="text-2xl" />
          </button>
        </div>
      )}

      {comentariosMovil && (
        <div className="absolute inset-0 z-40 flex items-end lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Cerrar comentarios"
            onClick={() => setComentariosMovil(false)}
          />
          <div className="relative w-full animate-subir rounded-t-3xl bg-surface-container-low">
            <PanelComentarios
              key={video.id}
              video={video}
              plano
              onConteo={actualizarConteo}
              className="h-[72dvh]"
            />
          </div>
        </div>
      )}
    </div>,
    document.body,
  )
}
