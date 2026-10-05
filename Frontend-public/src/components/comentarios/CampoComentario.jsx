import { useRef, useState } from 'react'
import { useClicFuera } from '../../hooks/useClicFuera'
import { MAX_COMENTARIO } from '../../utils/comentarios'
import Icono from '../ui/Icono'
import Spinner from '../ui/Spinner'

const EMOJIS = ['🔥', '😍', '😂', '👏', '🎬', '✨', '💜', '😮', '🙌', '💯', '😎', '🥹', '❤️', '👀', '🤯', '🎧']

/**
 * Campo para comentar o responder (con selector de emojis). El texto lo controla el padre.
 * `onEnviar(texto)` devuelve true si se publicó, para limpiar el campo.
 */
export default function CampoComentario({ ref, idCampo, texto, onTexto, respondiendoA, onCancelarRespuesta, onEnviar }) {
  const [enviando, setEnviando] = useState(false)
  const [emojis, setEmojis] = useState(false)
  const selector = useRef(null)

  useClicFuera(selector, () => setEmojis(false), emojis)

  async function enviar(evento) {
    evento.preventDefault()
    const contenido = texto.trim()
    if (!contenido || enviando) return
    setEnviando(true)
    if (await onEnviar(contenido)) onTexto('')
    setEnviando(false)
  }

  function agregarEmoji(emoji) {
    onTexto((texto + emoji).slice(0, MAX_COMENTARIO))
    setEmojis(false)
    ref?.current?.focus()
  }

  function alPresionar(evento) {
    // Escape cancela la respuesta sin cerrar la ventana que contiene los comentarios.
    if (evento.key === 'Escape' && respondiendoA) {
      evento.stopPropagation()
      onCancelarRespuesta()
    }
  }

  return (
    <div className="mt-auto shrink-0 pt-3">
      {respondiendoA && (
        <div className="mb-2 flex animate-aparecer items-center justify-between gap-2 rounded-xl bg-surface-container px-3 py-1.5 font-label-sm text-label-sm text-on-surface-variant">
          <span className="flex min-w-0 items-center gap-1.5">
            <Icono nombre="reply" className="text-sm text-primary" />
            <span className="truncate">
              Respondiendo a <strong className="text-on-surface">@{respondiendoA.username}</strong>
            </span>
          </span>
          <button
            type="button"
            onClick={onCancelarRespuesta}
            aria-label="Cancelar respuesta"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-surface-container-highest hover:text-on-surface"
          >
            <Icono nombre="close" className="text-sm" />
          </button>
        </div>
      )}
      <form onSubmit={enviar} className="relative flex w-full items-center">
        <input
          ref={ref}
          id={idCampo}
          value={texto}
          onChange={(evento) => onTexto(evento.target.value)}
          onKeyDown={alPresionar}
          maxLength={MAX_COMENTARIO}
          placeholder={respondiendoA ? `Responde a @${respondiendoA.username}...` : 'Escribe un comentario o proyecta ideas...'}
          aria-label={respondiendoA ? `Responder a @${respondiendoA.username}` : 'Escribe un comentario'}
          className="w-full rounded-2xl bg-surface-container py-3 pr-24 pl-4 font-body-md text-body-md text-on-surface shadow-inner placeholder:text-outline focus:bg-surface-container-high focus:ring-1 focus:ring-primary/60 focus:outline-none"
        />
        <div ref={selector} className="absolute right-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setEmojis((valor) => !valor)}
            title="Insertar emoji"
            aria-expanded={emojis}
            className="p-1.5 text-on-surface-variant transition-colors hover:text-primary"
          >
            <Icono nombre="mood" className="text-xl" />
          </button>
          <button
            type="submit"
            title={respondiendoA ? 'Publicar respuesta' : 'Publicar comentario'}
            disabled={!texto.trim() || enviando}
            className="p-1.5 text-primary transition-colors hover:text-primary-fixed disabled:text-outline"
          >
            {enviando ? <Spinner tamano={18} /> : <Icono nombre="send" className="text-xl" />}
          </button>
          {emojis && (
            <div className="absolute right-0 bottom-full z-20 mb-2 grid w-56 animate-aparecer grid-cols-8 gap-0.5 rounded-2xl bg-surface-container-highest p-2 shadow-2xl shadow-black/60">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => agregarEmoji(emoji)}
                  className="rounded-lg p-1 text-lg transition-transform hover:scale-125 hover:bg-surface-bright"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
