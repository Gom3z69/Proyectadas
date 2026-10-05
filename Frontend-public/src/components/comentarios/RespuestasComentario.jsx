import Icono from '../ui/Icono'
import Spinner from '../ui/Spinner'
import ComentarioItem from './ComentarioItem'

const plural = (cantidad, singular, varias) => `${cantidad} ${cantidad === 1 ? singular : varias}`

/** Hilo bajo un comentario principal: "Ver N respuestas", las respuestas y "Ocultar". */
export default function RespuestasComentario({
  raiz,
  hilo,
  autorVideoId,
  onAlternar,
  onCargarMas,
  onActualizar,
  onResponder,
  onEliminar,
}) {
  if (raiz.respuestasCount === 0 && hilo.items.length === 0) return null
  const restantes = Math.max(0, raiz.respuestasCount - hilo.items.length)
  const verMas = hilo.abierto ? restantes > 0 && hilo.hayMas : true

  return (
    <div className="mt-3 flex flex-col gap-3">
      {hilo.abierto &&
        hilo.items.map((respuesta) => (
          <ComentarioItem
            key={respuesta.id}
            comentario={respuesta}
            esRespuesta
            esDelCreador={respuesta.autor.id === autorVideoId}
            onActualizar={(cambios) => onActualizar(respuesta.id, cambios)}
            onResponder={onResponder}
            onEliminar={onEliminar}
          />
        ))}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-label-sm text-label-sm font-semibold text-on-surface-variant">
        {hilo.cargando && <Spinner tamano={14} />}
        {!hilo.cargando && verMas && (
          <button
            type="button"
            onClick={hilo.abierto ? onCargarMas : onAlternar}
            aria-expanded={hilo.abierto}
            className="flex items-center gap-2 transition-colors hover:text-on-surface"
          >
            <span className="h-px w-6 bg-outline-variant" aria-hidden="true" />
            {hilo.abierto
              ? `Ver ${plural(restantes, 'respuesta más', 'respuestas más')}`
              : `Ver ${plural(raiz.respuestasCount, 'respuesta', 'respuestas')}`}
            <Icono nombre="keyboard_arrow_down" className="text-base" />
          </button>
        )}
        {hilo.abierto && !hilo.cargando && (
          <button type="button" onClick={onAlternar} className="flex items-center gap-1 transition-colors hover:text-on-surface">
            Ocultar <Icono nombre="keyboard_arrow_up" className="text-base" />
          </button>
        )}
      </div>

      {hilo.error && !hilo.cargando && (
        <p className="text-body-sm text-error">
          {hilo.error}{' '}
          <button type="button" onClick={onCargarMas} className="font-bold underline">
            Reintentar
          </button>
        </p>
      )}
    </div>
  )
}
